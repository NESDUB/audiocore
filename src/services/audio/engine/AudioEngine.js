// src/audio/engine/AudioEngine.js

import AudioEngineCore from './AudioEngineCore';
import BufferManager from './BufferManager';
import SourceManager from './SourceManager';
import AudioNodeFactory from './AudioNodeFactory';
import AudioGraph from './AudioGraph';
import EventBus from '../utils/EventBus';

/**
 * AudioEngine - Main facade for the Audio Domain
 * 
 * Coordinates all audio processing, playback, and analysis activities
 * across the AudioCore system, providing a unified API for other domains.
 */
class AudioEngine {
  /**
   * Creates the main audio engine instance
   * @param {Object} options - Configuration options
   */

  constructor(options = {}) {
    // Set up event handling first
    this.eventBus = options.eventBus || new EventBus();

    // Process and store configuration options
    this._options = this._validateOptions(options);

    // Set initial state
    this._isInitialized = false;
    this._initializationPromise = null;
    this._activeSourcesMap = new Map();
    this._activeEffectsMap = new Map();
    this._currentTrack = null;
    this._effectChainCreated = false;

    // Initialize components (dependencies will be injected or created)
    this._initComponents(options);
    
    // The setup of connections is now moved to happen after user interaction
    // in the handleUserInteraction method
  }

  /**
   * Initialize all required components
   * @param {Object} options - Component instances or configuration options
   * @private
   */
  _initComponents(options) {
    // Core audio engine (handles the AudioContext)
    this.audioEngineCore = options.audioEngineCore || new AudioEngineCore({
      sampleRate: this._options.sampleRate,
      latencyHint: this._options.latencyHint,
      volume: this._options.defaultVolume,
      eventBus: this.eventBus
    });

    // Start asynchronous initialization of other components
    // but don't immediately set up connections
    this._initializationPromise = this._initializeAudioComponents(options)
      .then(() => {
        // Don't try to set up connections yet - wait for user interaction
        // to resume the context first
        this._isInitialized = true;

        // Call the onInit callback if provided
        if (this._options.onInit && typeof this._options.onInit === 'function') {
          this._options.onInit();
        }

        // Emit ready event
        this.eventBus.emit('engine:ready', {
          timestamp: Date.now()
        });

        return true;
      })
      
    // Remove the promise chain from the constructor
    // We'll set up connections only after user interaction
  }

  /**
   * Validates and normalizes configuration options
   * @param {Object} options - User provided options
   * @returns {Object} - Validated options with defaults applied
   * @private
   */
  _validateOptions(options) {
    const defaults = {
      sampleRate: 44100,
      latencyHint: 'interactive',
      maxCacheSize: 104857600, // 100MB in bytes
      autoSuspend: true,
      suspendTimeout: 30, // seconds
      defaultVolume: 1.0,
      enableEffects: true,
      enableAnalysis: true,
      debugMode: false
    };

    return { ...defaults, ...options };
  }
  
  /**
   * Handle user interaction to start audio context
   * Called when a user interacts with the page
   */
  handleUserInteraction() {
    if (this.audioEngineCore && this.audioEngineCore.getState() === 'suspended') {
      this.audioEngineCore.resume().then(success => {
        if (success) {
          console.log('AudioContext successfully resumed after user interaction');
          
          // Now that the context is running, set up the component connections
          this._setupComponentConnections();
          this._registerEventHandlers();
        }
      });
    }
  }

  /**
   * Initialize audio components asynchronously
   * @param {Object} options - Configuration options
   * @returns {Promise} - Resolves when initialization is complete
   * @private
   */
  async _initializeAudioComponents(options) {
    try {
      // Don't try to auto-resume during initialization
      // The context will be resumed on user interaction through the handleUserInteraction method
      
      // Get the AudioContext from the core
      const context = this.audioEngineCore.getContext();
      
      // Initialize BufferManager for loading and caching audio
      this.bufferManager = options.bufferManager || new BufferManager(context, {
        maxCacheSize: this._options.maxCacheSize,
        eventBus: this.eventBus
      });

      // Initialize AudioNodeFactory for creating audio processing nodes
      this.audioNodeFactory = options.audioNodeFactory || new AudioNodeFactory({
        audioContext: context,
        eventBus: this.eventBus,
        onEvent: (event) => this.eventBus.emit(event.type, event.data)
      });

      // Initialize AudioGraph for audio routing
      this.audioGraph = options.audioGraph || new AudioGraph({
        audioContext: context,
        errorManager: this.errorManager,
        onEvent: (event) => this.eventBus.emit(event.type, event.data)
      });

      // Initialize SourceManager for playback control
      this.sourceManager = options.sourceManager || new SourceManager({
        audioContext: context,
        onEvent: (event) => this.eventBus.emit(event.type, event.data),
        defaultVolume: this._options.defaultVolume
      });

      // Initialize EffectsChain (if not provided, create a minimal implementation)
      this.effectsChain = options.effectsChain || {
        addEffect: (effect, options = {}) => {
          const effectId = `effect_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          return effectId;
        },
        removeEffect: (effectId) => true,
        updateEffect: (effectId, params = {}) => true
      };

      // Initialize SignalProcessor (if not provided, create a minimal implementation)
      this.SignalProcessor = options.SignalProcessor || {
        getFrequencyData: () => new Uint8Array(0),
        getWaveformData: () => new Uint8Array(0),
        getFeatures: () => ({})
      };

      // Initialize OutputManager (if not provided, create a minimal implementation)
      this.outputManager = options.outputManager || {
        getDevices: async () => [],
        setDevice: async (deviceId) => false,
        getCurrentDevice: () => null
      };

      return true;
    } catch (error) {
      console.error('[AudioEngine] Component initialization failed:', error);
      this.eventBus.emit('engine:error', {
        type: 'initialization',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Setup connections between components
   * @private
   */
  _setupComponentConnections() {
    if (this._options.debugMode) {
      console.log('[AudioEngine] Setting up component connections');
    }
    
    // Check if the context is in a valid state before proceeding
    if (!this.audioEngineCore || 
        !this.audioEngineCore.getContext() || 
        this.audioEngineCore.getState() === 'closed') {
      console.warn('[AudioEngine] Cannot set up component connections: AudioContext is closed or unavailable');
      return;
    }

    // Create SignalProcessor node and connect to master output
    if (this._options.enableAnalysis) {
      try {
        const SignalProcessorNode = this.audioNodeFactory.createNode('signalprocessor', {
          fftSize: 2048,
          smoothingTimeConstant: 0.8
        });

        if (SignalProcessorNode) {
          // Register in AudioGraph
          const SignalProcessorNodeId = this.audioGraph.registerNode(
            SignalProcessorNode,
            { type: 'SignalProcessor', purpose: 'visualization' }
          );

          // Connect master output to SignalProcessor
          this.audioGraph.connect(
            this.audioEngineCore.getMasterNode(),
            SignalProcessorNode,
            { metadata: { type: 'analysis-connection' } }
          );

          // Store SignalProcessor for later use
          this._SignalProcessorNode = SignalProcessorNode;
        }
      } catch (error) {
        console.warn('[AudioEngine] Failed to set up SignalProcessor:', error);
      }
    }

    // Emit event about component setup completing
    this.eventBus.emit('engine:connections-ready', {
      timestamp: Date.now()
    });
  }

  /**
   * Register event handlers for internal component events
   * @private
   */
  _registerEventHandlers() {
    // Handle context state changes
    this.audioEngineCore.on('context:statechange', (data) => {
      this.eventBus.emit('engine:statechange', data);
    });

    // Auto-suspend handling
    if (this._options.autoSuspend) {
      let suspendTimer = null;

      // Reset timer when audio is playing
      this.eventBus.on('playback:started', () => {
        if (suspendTimer) {
          clearTimeout(suspendTimer);
          suspendTimer = null;
        }
      });

      // Set timer when audio stops
      this.eventBus.on('playback:stopped', () => {
        if (suspendTimer) {
          clearTimeout(suspendTimer);
        }

        suspendTimer = setTimeout(() => {
          this.audioEngineCore.suspend()
            .then(() => {
              if (this._options.debugMode) {
                console.log('[AudioEngine] Auto-suspended after inactivity');
              }
            });
        }, this._options.suspendTimeout * 1000);
      });
    }

    // Handle source ended events
    this.eventBus.on('source:ended', (data) => {
      this._handleSourceEnded(data.sourceId);
    });
  }

  /**
   * Check if the engine is fully initialized
   * @returns {boolean} - Whether initialization is complete
   */
  isInitialized() {
    return this._isInitialized;
  }

  /**
   * Wait for engine to initialize completely
   * @returns {Promise<boolean>} - Resolves when initialization is complete
   */
  async waitForInitialization() {
    if (this._isInitialized) return true;
    return this._initializationPromise;
  }

  /**
   * Initialize the audio engine
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      await this.waitForInitialization();

      // Resume the audio context to ensure it's running
      const success = await this.audioEngineCore.resume();

      if (success) {
        this.eventBus.emit('engine:ready', {
          sampleRate: this.audioEngineCore.getContext().sampleRate
        });
      }

      return success;
    } catch (error) {
      console.error('[AudioEngine] Initialization failed:', error);
      this.eventBus.emit('engine:error', {
        type: 'initialization',
        error: error.message
      });
      return false;
    }
  }

  /**
   * Load and play audio from the given URL
   * @param {string} trackUrl - URL of the audio track to play
   * @param {Object} options - Playback options
   * @returns {Promise<string|null>} - ID of the played source or null if failed
   */
  async play(trackUrl, options = {}) {
    if (!this._isInitialized) {
      await this.initialize();
    }

    try {
      // Ensure the context is running
      await this.audioEngineCore.resume();

      // Stop current playback if requested
      if (options.stopCurrent !== false && this._currentTrack) {
        this.stop();
      }

      // Load the audio buffer
      const buffer = await this.bufferManager.loadAudio(trackUrl);

      if (!buffer) {
        throw new Error(`Failed to load audio from ${trackUrl}`);
      }

      // Create an audio source
      const source = this.sourceManager.createSource(buffer, {
        loop: options.loop || false,
        volume: options.volume !== undefined ? options.volume : 1,
        playbackRate: options.playbackRate || 1
      });

      if (!source) {
        throw new Error('Failed to create audio source');
      }

      // Store the active source
      this._activeSourcesMap.set(source.id, {
        source,
        url: trackUrl,
        startTime: this.audioEngineCore.getCurrentTime(),
        options
      });

      // Register source in the AudioGraph
      this.audioGraph.registerNode(
        source.gainNode, 
        { 
          type: 'source', 
          sourceId: source.id,
          trackUrl
        }
      );

      // Connect source to output chain
      if (this._options.enableEffects && this._effectChainCreated) {
        // Connect through effects chain
        this.audioGraph.connect(
          source.gainNode, 
          this._effectsInput,
          { metadata: { type: 'source-to-effects', trackUrl } }
        );
      } else {
        // Connect directly to master
        this.audioGraph.connect(
          source.gainNode, 
          this.audioEngineCore.getMasterNode(),
          { metadata: { type: 'playback-connection', trackUrl } }
        );
      }

      // Start playback
      const startPosition = options.startPosition || 0;
      source.play(0, startPosition);

      // Set as current track
      this._currentTrack = {
        sourceId: source.id,
        url: trackUrl,
        startTime: this.audioEngineCore.getCurrentTime(),
        options
      };

      // Emit playback started event
      this.eventBus.emit('playback:started', {
        sourceId: source.id,
        url: trackUrl,
        timestamp: Date.now()
      });

      return source.id;
    } catch (error) {
      console.error('[AudioEngine] Playback failed:', error);
      this.eventBus.emit('playback:error', {
        url: trackUrl,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Pause current playback
   * @returns {boolean} - Whether pause was successful
   */
  pause() {
    if (!this._currentTrack) {
      return false;
    }

    try {
      const sourceData = this._activeSourcesMap.get(this._currentTrack.sourceId);

      if (!sourceData) {
        return false;
      }

      // Pause the source
      const result = sourceData.source.pause();

      if (result) {
        // Store pause state in current track
        this._currentTrack.isPaused = true;
        
        // Get current position before cleaning up
        const sourceState = sourceData.source.getState();
        this._currentTrack.pausePosition = sourceState.position;

        // Remove from active sources map
        this._activeSourcesMap.delete(this._currentTrack.sourceId);

        // Emit pause event
        this.eventBus.emit('playback:paused', {
          sourceId: this._currentTrack.sourceId,
          position: this._currentTrack.pausePosition,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      console.error('[AudioEngine] Pause failed:', error);
      return false;
    }
  }

  /**
   * Resume playback of a paused track
   * @returns {Promise<boolean>} - Whether resume was successful
   */
  async resume() {
    if (!this._currentTrack || !this._currentTrack.isPaused) {
      return false;
    }

    try {
      // Play from the pause position
      const sourceId = await this.play(this._currentTrack.url, {
        ...this._currentTrack.options,
        startPosition: this._currentTrack.pausePosition,
        stopCurrent: false
      });

      if (!sourceId) {
        throw new Error('Failed to resume playback');
      }

      // Update current track info
      this._currentTrack.isPaused = false;
      this._currentTrack.sourceId = sourceId;

      // Emit resume event
      this.eventBus.emit('playback:resumed', {
        sourceId,
        position: this._currentTrack.pausePosition,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('[AudioEngine] Resume failed:', error);
      return false;
    }
  }

  /**
   * Stop all playback
   * @returns {boolean} - Whether stop was successful
   */
  stop() {
    try {
      // Stop all active sources
      for (const [sourceId, sourceData] of this._activeSourcesMap.entries()) {
        if (sourceData.source) {
          sourceData.source.stop();
        }
        this._activeSourcesMap.delete(sourceId);
      }

      // Clear current track
      const previousTrack = this._currentTrack;
      this._currentTrack = null;

      // Emit stop event if there was a track playing
      if (previousTrack) {
        this.eventBus.emit('playback:stopped', {
          sourceId: previousTrack.sourceId,
          timestamp: Date.now()
        });
      }

      return true;
    } catch (error) {
      console.error('[AudioEngine] Stop failed:', error);
      return false;
    }
  }

  /**
   * Seek to a position in the current track
   * @param {number} position - Position in seconds
   * @returns {Promise<boolean>} - Whether seek was successful
   */
  async seek(position) {
    if (!this._currentTrack) {
      return false;
    }

    try {
      const wasPaused = this._currentTrack?.isPaused;

      // Stop current playback
      const currentSourceId = this._currentTrack.sourceId;
      const sourceData = this._activeSourcesMap.get(currentSourceId);

      if (sourceData && sourceData.source) {
        sourceData.source.stop();
        this._activeSourcesMap.delete(currentSourceId);
      }

      // Start playback from the new position
      const sourceId = await this.play(this._currentTrack.url, {
        ...this._currentTrack.options,
        startPosition: position,
        stopCurrent: false
      });

      if (!sourceId) {
        throw new Error('Failed to seek');
      }

      // If it was paused, pause it again
      if (wasPaused) {
        this.pause();
      }

      // Emit seek event
      this.eventBus.emit('playback:seeked', {
        sourceId,
        position,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('[AudioEngine] Seek failed:', error);
      return false;
    }
  }

  /**
   * Set the master volume
   * @param {number} level - Volume level (0.0 to 1.0)
   * @returns {boolean} - Whether volume change was successful
   */
  setVolume(level) {
    try {
      const success = this.audioEngineCore.setVolume(level);

      if (success) {
        this.eventBus.emit('volume:changed', {
          level,
          timestamp: Date.now()
        });
      }

      return success;
    } catch (error) {
      console.error('[AudioEngine] Volume change failed:', error);
      return false;
    }
  }

  /**
   * Get the current master volume
   * @returns {number} - Current volume level (0.0 to 1.0)
   */
  getVolume() {
    return this.audioEngineCore.getVolume();
  }

  /**
   * Apply an audio effect to the current playback
   * @param {string} effectType - Type of effect to apply
   * @param {Object} params - Effect parameters
   * @returns {string|null} - ID of the created effect or null if failed
   */
  applyEffect(effectType, params = {}) {
    if (!this._options.enableEffects) {
      console.warn('[AudioEngine] Effects are disabled');
      return null;
    }

    try {
      // Create the effect node
      const effectNode = this.audioNodeFactory.createNode(effectType, params);

      if (!effectNode) {
        throw new Error(`Failed to create ${effectType} effect`);
      }

      // Create effect chain if needed
      if (!this._effectChainCreated) {
        // Create a routing structure for effects
        const inputNode = this.audioNodeFactory.createNode('gain', { gain: 1.0 });
        const outputNode = this.audioNodeFactory.createNode('gain', { gain: 1.0 });
        
        // Register nodes in the graph
        this.audioGraph.registerNode(inputNode, { type: 'effects-input' });
        this.audioGraph.registerNode(outputNode, { type: 'effects-output' });
        
        // Connect to master
        this.audioGraph.connect(outputNode, this.audioEngineCore.getMasterNode());
        
        // Store for future use
        this._effectsInput = inputNode;
        this._effectsOutput = outputNode;
        this._effectChainCreated = true;
      }

      // Register effect node in the graph
      const nodeId = this.audioGraph.registerNode(effectNode, { 
        type: effectType,
        params
      });

      // Generate unique effect ID
      const effectId = `effect_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // Get existing connections to reroute
      const currentChain = this._getEffectChain();
      let outputConnectionId;

      // Insert the new effect in the chain
      if (currentChain.length === 0) {
        // First effect - connect input and output directly
        this.audioGraph.connect(this._effectsInput, effectNode);
        outputConnectionId = this.audioGraph.connect(effectNode, this._effectsOutput);
      } else {
        // Insert between the last effect and the output
        const lastEffect = currentChain[currentChain.length - 1];
        
        // Disconnect last effect from output
        this.audioGraph.disconnect(lastEffect.outputConnectionId);
        
        // Connect last effect to new effect
        const newConnectionId = this.audioGraph.connect(lastEffect.node, effectNode);
        
        // Connect new effect to output
        outputConnectionId = this.audioGraph.connect(effectNode, this._effectsOutput);
        
        // Update connections
        lastEffect.outputConnectionId = newConnectionId;
      }

      // Store effect data
      this._activeEffectsMap.set(effectId, {
        type: effectType,
        node: effectNode,
        nodeId,
        params,
        outputConnectionId,
        createdAt: Date.now()
      });

      // Emit effect added event
      this.eventBus.emit('effect:added', {
        effectId,
        type: effectType,
        timestamp: Date.now()
      });

      return effectId;
    } catch (error) {
      console.error('[AudioEngine] Apply effect failed:', error);
      return null;
    }
  }

  /**
   * Get the current effect chain in order
   * @private
   */
  _getEffectChain() {
    // Extract and sort effects by creation time
    const effects = Array.from(this._activeEffectsMap.values());
    return effects.sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Remove an audio effect
   * @param {string} effectId - ID of the effect to remove
   * @returns {boolean} - Whether removal was successful
   */
  removeEffect(effectId) {
    if (!this._options.enableEffects) {
      return false;
    }

    try {
      const effectData = this._activeEffectsMap.get(effectId);
      if (!effectData) {
        return false;
      }

      // Get the effect chain to reroute connections
      const chain = this._getEffectChain();
      const effectIndex = chain.findIndex(e => e.nodeId === effectData.nodeId);
      
      if (effectIndex !== -1) {
        // Handle reconnection of the chain
        if (chain.length === 1) {
          // This is the only effect, just disconnect it
          this.audioGraph.disconnect(effectData.outputConnectionId);
          
          // Connect input directly to output
          this.audioGraph.connect(this._effectsInput, this._effectsOutput);
        } else if (effectIndex === 0) {
          // This is the first effect in the chain
          // Connect input to the next effect
          const nextEffect = chain[1];
          this.audioGraph.connect(this._effectsInput, nextEffect.node);
        } else if (effectIndex === chain.length - 1) {
          // This is the last effect in the chain
          // Connect previous effect to output
          const prevEffect = chain[effectIndex - 1];
          this.audioGraph.disconnect(prevEffect.outputConnectionId);
          prevEffect.outputConnectionId = this.audioGraph.connect(prevEffect.node, this._effectsOutput);
        } else {
          // This is a middle effect
          // Connect previous effect to next effect
          const prevEffect = chain[effectIndex - 1];
          const nextEffect = chain[effectIndex + 1];
          
          this.audioGraph.disconnect(prevEffect.outputConnectionId);
          prevEffect.outputConnectionId = this.audioGraph.connect(prevEffect.node, nextEffect.node);
        }
      }

      // Remove from active effects map
      this._activeEffectsMap.delete(effectId);

      // Emit effect removed event
      this.eventBus.emit('effect:removed', {
        effectId,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('[AudioEngine] Remove effect failed:', error);
      return false;
    }
  }

  /**
   * Update an audio effect's parameters
   * @param {string} effectId - ID of the effect to update
   * @param {Object} params - New effect parameters
   * @returns {boolean} - Whether update was successful
   */
  updateEffect(effectId, params = {}) {
    if (!this._options.enableEffects) {
      return false;
    }

    try {
      // Get effect data
      const effectData = this._activeEffectsMap.get(effectId);
      if (!effectData) {
        return false;
      }

      // Update parameters on the node
      for (const [param, value] of Object.entries(params)) {
        if (effectData.node[param] instanceof AudioParam) {
          // For AudioParams (e.g., frequency, Q, gain)
          effectData.node[param].setValueAtTime(value, this.audioEngineCore.getCurrentTime());
        } else if (param in effectData.node) {
          // For regular properties (e.g., type)
          effectData.node[param] = value;
        }
      }

      // Update in active effects map
      effectData.params = { ...effectData.params, ...params };

      // Emit effect updated event
      this.eventBus.emit('effect:updated', {
        effectId,
        params,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('[AudioEngine] Update effect failed:', error);
      return false;
    }
  }

  /**
   * Get frequency analysis data
   * @returns {Uint8Array} - Frequency data
   */
  getFrequencyData() {
    if (!this._options.enableAnalysis) {
      return new Uint8Array(0);
    }

    return this.SignalProcessor.getFrequencyData();
  }

  /**
   * Get waveform analysis data
   * @returns {Uint8Array} - Waveform data
   */
  getWaveformData() {
    if (!this._options.enableAnalysis) {
      return new Uint8Array(0);
    }

    return this.SignalProcessor.getWaveformData();
  }

  /**
   * Get audio feature analysis
   * @param {string} featureType - Type of feature to analyze
   * @returns {Object} - Analysis results
   */
  getAnalysisData(featureType = null) {
    if (!this._options.enableAnalysis) {
      return {};
    }

    return this.SignalProcessor.getFeatures(featureType);
  }

  /**
   * Get a visual representation of the audio graph
   * @returns {Object} - Graph representation for visualization
   */
  getAudioGraph() {
    return this.audioGraph.getGraphRepresentation();
  }

  /**
   * Handle a source ending (either naturally or through stopping)
   * @param {string} sourceId - ID of the source that ended
   * @private
   */
  _handleSourceEnded(sourceId) {
    // Ignore if not our current source
    if (!this._currentTrack || this._currentTrack.sourceId !== sourceId) {
      return;
    }

    // Get the track info
    const trackInfo = { ...this._currentTrack };
    
    // Clear current track
    this._currentTrack = null;
    
    // Emit playback ended event
    this.eventBus.emit('playback:ended', {
      sourceId,
      url: trackInfo.url,
      timestamp: Date.now()
    });
    
    // Handle auto-advance logic here if needed
    // (would integrate with a queue service)
  }

  /**
   * Get information about the current playback
   * @returns {Object|null} - Playback information or null if nothing playing
   */
  getPlaybackInfo() {
    if (!this._currentTrack) {
      return null;
    }

    const sourceData = this._activeSourcesMap.get(this._currentTrack.sourceId);

    let currentTime = 0;
    let state = 'stopped';
    
    if (sourceData && sourceData.source) {
      const sourceState = sourceData.source.getState();
      currentTime = sourceState.position;
      state = sourceState.isPlaying ? 'playing' : 'stopped';
    } else if (this._currentTrack.isPaused) {
      currentTime = this._currentTrack.pausePosition;
      state = 'paused';
    }

    return {
      url: this._currentTrack.url,
      state,
      currentTime,
      isPlaying: state === 'playing',
      isPaused: state === 'paused',
      options: { ...this._currentTrack.options }
    };
  }

  /**
   * Get available output devices
   * @returns {Promise<Array>} - List of available output devices
   */
  async getOutputDevices() {
    return this.outputManager.getDevices();
  }

  /**
   * Set the output device
   * @param {string} deviceId - ID of the device to use
   * @returns {Promise<boolean>} - Whether device change was successful
   */
  async setOutputDevice(deviceId) {
    try {
      const success = await this.outputManager.setDevice(deviceId);

      if (success) {
        this.eventBus.emit('output:deviceChanged', {
          deviceId,
          timestamp: Date.now()
        });
      }

      return success;
    } catch (error) {
      console.error('[AudioEngine] Change output device failed:', error);
      return false;
    }
  }

  /**
   * Release resources and shut down the audio engine
   * @returns {Promise<boolean>} - Whether disposal was successful
   */
  async dispose() {
    try {
      // Stop all playback
      this.stop();

      // Close the audio context
      await this.audioEngineCore.close();

      // Clear caches
      if (this.bufferManager) {
        this.bufferManager.clearCache();
      }

      // Release sources
      if (this.sourceManager) {
        this.sourceManager.releaseAllSources();
      }

      // Dispose node factory if available
      if (this.audioNodeFactory) {
        this.audioNodeFactory.dispose();
      }

      // Dispose the AudioGraph
      if (this.audioGraph && typeof this.audioGraph.dispose === 'function') {
        this.audioGraph.dispose();
      }

      // Clear maps
      this._activeSourcesMap.clear();
      this._activeEffectsMap.clear();
      this._currentTrack = null;

      // Emit disposal event
      this.eventBus.emit('engine:disposed', {
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('[AudioEngine] Disposal failed:', error);
      return false;
    }
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - Event type to listen for
   * @param {Function} callback - Event callback
   * @returns {Function} Unsubscribe function
   */
  on(eventType, callback) {
    return this.eventBus.on(eventType, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventType - Event type
   * @param {Function|string} listener - Listener or ID
   * @returns {boolean} Whether unsubscription was successful
   */
  off(eventType, listener) {
    return this.eventBus.off(eventType, listener);
  }
}

export default AudioEngine;