/**
 * AudioEngineCore.js
 * Core component that manages the Web Audio API's AudioContext.
 * Serves as the foundation for all audio operations in the system.
 */

class AudioEngineCore {
  /**
   * Creates a new AudioEngineCore instance
   * @param {Object} options - Configuration options
   * @param {eventBus} options.eventBus - Event manager for handling events
   * @param {number} [options.sampleRate] - Custom sample rate (optional)
   * @param {string} [options.latencyHint] - Latency hint ('interactive', 'playback', 'balanced')
   * @param {number} [options.volume] - Initial volume (0.0-1.0)
   * @param {number} [options.channels] - Output channel count
   * @param {boolean} [options.autoResume] - Auto-resume context on user interaction
   * @param {boolean} [options.offlineSupport] - Enable offline context support
   */
  constructor(options = {}) {
    // Event Manager is required
    if (!options.eventBus) {
      throw new Error('AudioEngineCore requires an EventBus instance');
    }
    
    this.eventBus = options.eventBus;
    this._initOptions = this._validateOptions(options);
    this._context = null;
    this._state = 'closed';
    this._masterGainNode = null;
    this._signalprocessorNode = null;
    this._destinationNode = null;
    this._capabilities = {};
    
    // Initialize the core components
    this._setupAudioContext();
    this._setupMasterChain();
    this._detectCapabilities();
    this._bindEvents();
  }

  /**
   * Validate and merge provided options with defaults
   * @param {Object} options - Configuration options
   * @returns {Object} - Validated options
   */
  _validateOptions(options) {
    const defaults = {
      sampleRate: null, // Use device default if not specified
      latencyHint: 'interactive',
      volume: 1.0,
      channels: 2,
      autoResume: true,
      offlineSupport: true
    };

    const mergedOptions = { ...defaults, ...options };
    
    // Validate option values
    if (mergedOptions.volume < 0 || mergedOptions.volume > 1) {
      console.warn('AudioEngineCore: Volume must be between 0 and 1. Setting to default 1.0');
      mergedOptions.volume = 1.0;
    }
    
    if (![1, 2, 4, 6].includes(mergedOptions.channels)) {
      console.warn('AudioEngineCore: Unsupported channel count. Setting to stereo (2)');
      mergedOptions.channels = 2;
    }
    
    return mergedOptions;
  }

  /**
   * Create and initialize the AudioContext
   */
  _setupAudioContext() {
    try {
      // Handle browser prefixes for backward compatibility
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      const contextOptions = {};
      
      // Only add options that are explicitly set to avoid browser incompatibilities
      if (this._initOptions.latencyHint) {
        contextOptions.latencyHint = this._initOptions.latencyHint;
      }
      
      if (this._initOptions.sampleRate) {
        contextOptions.sampleRate = this._initOptions.sampleRate;
      }
      
      this._context = new AudioContextClass(contextOptions);
      this._state = this._context.state;
      
      // iOS and some browsers require user interaction before starting audio context
      if (this._state === 'suspended' && this._initOptions.autoResume) {
        this._setupAutoResume();
      }
      
      // Setup offline context if needed
      if (this._initOptions.offlineSupport) {
        this._setupOfflineContext();
      }
      
      this.eventBus.emit('context:created', { 
        state: this._state,
        sampleRate: this._context.sampleRate
      });
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
      this.eventBus.emit('context:error', { 
        error,
        operation: 'creation'
      });
    }
  }

  /**
   * Setup the master gain node and signalprocessor for central audio control
   */
  _setupMasterChain() {
    if (!this._context) return;
    
    try {
      // Create master gain node
      this._masterGainNode = this._context.createGain();
      this._masterGainNode.gain.value = this._initOptions.volume;
      
      // Create signalprocessor node for visualization
      this._signalprocessorNode = this._context.createAnalyser();
      this._signalprocessorNode.fftSize = 2048;
      this._signalprocessorNode.smoothingTimeConstant = 0.8;
      
      // Create destination node (system output)
      this._destinationNode = this._context.destination;
      
      // Connect the master chain
      this._masterGainNode.connect(this._signalprocessorNode);
      this._signalprocessorNode.connect(this._destinationNode);
      
      this.eventBus.emit('master:created', { 
        volume: this._initOptions.volume,
        fftSize: this._signalprocessorNode.fftSize
      });
    } catch (error) {
      console.error('Failed to setup master chain:', error);
      this.eventBus.emit('master:error', { 
        error,
        operation: 'setup'
      });
    }
  }

  /**
   * Detect audio capabilities of the current environment
   */
  _detectCapabilities() {
    if (!this._context) return;
    
    this._capabilities = {
      sampleRate: this._context.sampleRate,
      maxChannels: this._context.destination.maxChannelCount,
      currentChannels: this._context.destination.channelCount,
      baseLatency: this._context.baseLatency || null,
      outputLatency: this._context.outputLatency || null,
      extensions: {
        audioWorklet: typeof this._context.audioWorklet !== 'undefined',
        signalprocessorNode: typeof AnalyserNode !== 'undefined',
        dynamicsCompressor: typeof DynamicsCompressorNode !== 'undefined',
        stereoPanner: typeof StereoPannerNode !== 'undefined',
        waveShaper: typeof WaveShaperNode !== 'undefined'
      }
    };
    
    this.eventBus.emit('capabilities:detected', this._capabilities);
  }

  /**
   * Add event listeners for context state changes
   */
  _bindEvents() {
    if (!this._context) return;
    
    // Modern browsers support onstatechange event
    if (this._context.onstatechange !== undefined) {
      this._context.onstatechange = () => {
        const oldState = this._state;
        // Update our internal state to match the actual context state
        this._state = this._context.state;
        
        this.eventBus.emit('context:statechange', {
          oldState,
          newState: this._state,
          time: this._context.currentTime
        });
        
        // If context was closed externally, make sure we clean up
        if (this._state === 'closed') {
          this._masterGainNode = null;
          this._signalprocessorNode = null;
        }
      };
    }
    
    // Handle page visibility changes - with safety checks
    document.addEventListener('visibilitychange', () => {
      // Don't try to manipulate a closed context
      if (this._state === 'closed' || !this._context) return;
      
      if (document.hidden && this._state === 'running') {
        // Optionally suspend when page is hidden
        // this.suspend();
      } else if (!document.hidden && this._state === 'suspended' && this._initOptions.autoResume) {
        this.resume().catch(err => {
          console.warn('Failed to auto-resume on visibility change:', err);
        });
      }
    });
  }

  /**
   * Setup auto-resuming of audio context on user interaction
   */
  _setupAutoResume() {
    if (!this._context || !this._initOptions.autoResume || this._state === 'closed') return;

    const resumeEvents = ['click', 'touchstart', 'keydown'];
    const resumeFunc = async () => {
      // Check context state before attempting resume
      if (this._context && this._state !== 'running' && this._state !== 'closed') {
        try {
          await this._context.resume();
          this._state = this._context.state;
          
          // Only remove event listeners if we successfully resumed
          if (this._state === 'running') {
            resumeEvents.forEach(event => {
              document.removeEventListener(event, resumeFunc);
            });
            
            this.eventBus.emit('context:auto-resumed', {
              time: this._context.currentTime
            });
            
            console.log('AudioContext successfully resumed after user interaction');
          }
        } catch (error) {
          console.error('Failed to auto-resume AudioContext:', error);
        }
      }
    };

    // Add event listeners for user interaction
    resumeEvents.forEach(event => {
      document.addEventListener(event, resumeFunc, { once: true, capture: true });
    });
  }

  /**
   * Setup offline audio context for non-realtime rendering
   */
  _setupOfflineContext() {
    try {
      this._offlineContext = null; // Will be created on demand
      this._offlineCapable = typeof OfflineAudioContext !== 'undefined' ||
                             typeof webkitOfflineAudioContext !== 'undefined';
                             
      this.eventBus.emit('offline:status', { 
        offlineCapable: this._offlineCapable 
      });
    } catch (error) {
      console.error('Failed to initialize offline context support:', error);
      this._offlineCapable = false;
    }
  }

  /**
   * Creates an offline context with the specified parameters
   * @param {number} duration - Duration in seconds
   * @param {number} sampleRate - Sample rate (defaults to main context sample rate)
   * @param {number} channels - Number of channels
   * @returns {OfflineAudioContext|null} - The created offline context or null if failed
   */
  createOfflineContext(duration, sampleRate, channels) {
    if (!this._offlineCapable) return null;
    
    try {
      const OfflineContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      
      return new OfflineContextClass(
        channels || this._initOptions.channels,
        Math.ceil(duration * (sampleRate || this._context.sampleRate)),
        sampleRate || this._context.sampleRate
      );
    } catch (error) {
      console.error('Failed to create offline context:', error);
      this.eventBus.emit('offline:error', { 
        error,
        operation: 'create'
      });
      return null;
    }
  }

  /**
   * Resume the audio context
   * @returns {Promise<boolean>} - Whether resume was successful
   */
  async resume() {
    // First check if context exists and is not closed
    if (!this._context || this._state === 'closed') {
      console.warn('Cannot resume AudioContext: context is null or closed');
      return false;
    }

    // Only attempt to resume if it's suspended
    if (this._state === 'suspended') {
      try {
        // Log helpful message about browser requirements
        console.info('AudioContext requires user interaction before it can start. Waiting for user gesture...');
        await this._context.resume();
        // Update internal state immediately after operation
        this._state = this._context.state;

        this.eventBus.emit('context:resumed', {
          state: this._state,
          time: this._context.currentTime
        });

        return this._state === 'running';
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        this.eventBus.emit('context:error', {
          error,
          operation: 'resume'
        });
        return false;
      }
    }

    // If already running, just return true
    if (this._state === 'running') {
      return true;
    }

    return false;
  }

  /**
   * Suspend the audio context
   * @returns {Promise<boolean>} - Whether suspend was successful
   */
  async suspend() {
    if (!this._context || this._state === 'suspended') {
      return true;
    }
    
    try {
      await this._context.suspend();
      this._state = this._context.state;
      this.eventBus.emit('context:suspended', { 
        state: this._state,
        time: this._context.currentTime
      });
      return this._state === 'suspended';
    } catch (error) {
      console.error('Failed to suspend AudioContext:', error);
      this.eventBus.emit('context:error', { 
        error, 
        operation: 'suspend' 
      });
      return false;
    }
  }

  /**
   * Close the audio context (irreversible)
   * @returns {Promise<boolean>} - Whether close was successful
   */
  async close() {
    if (!this._context || this._state === 'closed') {
      return true;
    }
    
    try {
      await this._context.close();
      this._state = 'closed';
      this.eventBus.emit('context:closed', {
        time: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Failed to close AudioContext:', error);
      this.eventBus.emit('context:error', { 
        error, 
        operation: 'close' 
      });
      return false;
    }
  }

  /**
   * Set the master volume
   * @param {number} value - Volume level (0.0 to 1.0)
   * @param {number} [timeConstant] - Time constant for exponential ramp (seconds)
   */
  setVolume(value, timeConstant = 0.01) {
    if (!this._masterGainNode) return false;
    
    // Validate volume range
    const safeValue = Math.max(0, Math.min(1, value));
    
    try {
      const currentTime = this._context.currentTime;
      
      // Use exponential ramp for smoother volume changes
      this._masterGainNode.gain.setTargetAtTime(safeValue, currentTime, timeConstant);
      
      this.eventBus.emit('volume:changed', { 
        volume: safeValue,
        time: currentTime
      });
      return true;
    } catch (error) {
      console.error('Failed to set volume:', error);
      this.eventBus.emit('volume:error', { 
        error,
        operation: 'setVolume'
      });
      return false;
    }
  }

  /**
   * Get current master volume
   * @returns {number} - Current volume level
   */
  getVolume() {
    return this._masterGainNode ? this._masterGainNode.gain.value : 0;
  }

  /**
   * Get the current time from audio context (crucial for precise scheduling)
   * @returns {number} - Current audio context time in seconds
   */
  getCurrentTime() {
    return this._context ? this._context.currentTime : 0;
  }

  /**
   * Get the raw AudioContext instance
   * @returns {AudioContext|null} - The audio context instance
   */
  getContext() {
    return this._context;
  }

  /**
   * Get the master gain node
   * @returns {GainNode|null} - The master gain node
   */
  getMasterNode() {
    return this._masterGainNode;
  }

  /**
   * Get the signalprocessor node
   * @returns {SignalProcessorNode|null} - The signalprocessor node
   */
  getSignalProcessorNode() {
    return this._signalprocessorNode;
  }

  /**
   * Get the analyzer node for visualizations (alias for getSignalProcessorNode)
   * @returns {AnalyserNode|null} - The analyzer node
   */
  getAnalyser() {
    return this.getSignalProcessorNode();
  }

  /**
   * Get the destination node
   * @returns {AudioDestinationNode|null} - The destination node
   */
  getDestinationNode() {
    return this._destinationNode;
  }

  /**
   * Get the current audio context state
   * @returns {string} - Context state ('running', 'suspended', or 'closed')
   */
  getState() {
    return this._state;
  }

  /**
   * Get detected audio capabilities
   * @returns {Object} - Object containing capability information
   */
  getCapabilities() {
    return { ...this._capabilities };
  }

  /**
   * Configure output channel count
   * @param {number} channelCount - Number of output channels
   * @returns {boolean} - Whether operation was successful
   */
  setChannelCount(channelCount) {
    if (!this._context || !this._destinationNode) return false;
    
    try {
      // Check if requested channel count is supported
      if (channelCount > this._destinationNode.maxChannelCount) {
        console.warn(`Requested ${channelCount} channels, but device only supports ${this._destinationNode.maxChannelCount}`);
        channelCount = this._destinationNode.maxChannelCount;
      }
      
      this._destinationNode.channelCount = channelCount;
      this._capabilities.currentChannels = this._destinationNode.channelCount;
      
      this.eventBus.emit('channels:changed', { 
        channels: this._destinationNode.channelCount 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set channel count:', error);
      this.eventBus.emit('channels:error', { 
        error,
        operation: 'setChannelCount'
      });
      return false;
    }
  }

  /**
   * Create an audio node using the current context
   * @param {string} type - Type of node to create
   * @param {Object} options - Options for node creation
   * @returns {AudioNode|null} - Created audio node or null if failed
   */
  createNode(type, options = {}) {
    if (!this._context) return null;
    
    try {
      const methodName = `create${type.charAt(0).toUpperCase() + type.slice(1)}`;
      
      if (typeof this._context[methodName] !== 'function') {
        console.error(`Unsupported node type: ${type}`);
        return null;
      }
      
      return this._context[methodName](options);
    } catch (error) {
      console.error(`Failed to create ${type} node:`, error);
      return null;
    }
  }

  /**
   * Register an event handler (delegates to eventBus)
   * @param {string} event - Event name
   * @param {Function} callback - Event callback function
   * @returns {string|null} - Listener ID for removal
   */
  on(event, callback) {
    return this.eventBus.on(event, callback);
  }

  /**
   * Remove an event handler (delegates to eventBus)
   * @param {string} event - Event name
   * @param {string|Function} listener - Listener ID or callback function
   * @returns {boolean} - Whether removal was successful
   */
  off(event, listener) {
    return this.eventBus.off(event, listener);
  }
}

export default AudioEngineCore;