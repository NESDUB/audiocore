// src/components/Core/AudioNodeFactory.js

/**
 * AudioNodeFactory - Provides a unified interface for creating, configuring, and
 * optimizing various types of audio processing nodes. Handles cross-browser
 * compatibility and standardizes node configuration patterns.
 */
class AudioNodeFactory {
  /**
   * Create a new AudioNodeFactory instance
   * @param {Object} options - Configuration options
   * @param {AudioContext} options.audioContext - Web Audio API context 
   * @param {Object} [options.errorManager] - Error manager for handling errors
   * @param {string} [options.performanceProfile='auto'] - Performance profile
   * @param {function} [options.onEvent] - Event callback function
   */
  constructor(options = {}) {
    if (!options.audioContext) {
      throw new Error('AudioNodeFactory requires an AudioContext');
    }

    this.audioContext = options.audioContext;
    this.errorManager = options.errorManager;
    this.onEvent = options.onEvent || (() => {});

    // Configuration
    this.config = {
      performanceProfile: options.performanceProfile || 'auto',
      channelCount: options.channelCount || 2,
      channelCountMode: options.channelCountMode || 'explicit',
      channelInterpretation: options.channelInterpretation || 'speakers',
      maxPoolSize: options.maxPoolSize || 20,
      enablePooling: options.enablePooling !== false
    };

    // Node pools for reuse
    this.nodePools = new Map();
    
    // Node tracking
    this.activeNodes = new Map();
    
    // Performance profiles
    this.performanceProfiles = {
      high: { maxNodes: 200, recycleNodes: true, optimizeParameters: true },
      medium: { maxNodes: 100, recycleNodes: true, optimizeParameters: true },
      low: { maxNodes: 50, recycleNodes: false, optimizeParameters: false },
      auto: { maxNodes: 100, recycleNodes: true, optimizeParameters: true }
    };

    // Detect capabilities
    this.capabilities = this._detectCapabilities();

    // Setup presets
    this._initializePresets();

    // Stats tracking
    this.stats = {
      totalCreated: 0,
      activeNodes: 0,
      poolSize: 0,
      byType: {}
    };

    // Initialize
    this.initialized = true;
    this._emitEvent('initialized', { capabilities: this.capabilities });
  }

  /**
   * Detect capabilities of the Web Audio API implementation
   * @private
   */
  _detectCapabilities() {
    const capabilities = {
      standardNodes: {},
      extensionNodes: {},
      audioWorklet: false,
      offlineSupport: false,
      browser: this._detectBrowser(),
      sampleRate: this.audioContext.sampleRate
    };

    // Check for standard node types
    const standardNodes = [
      'Gain', 'Delay', 'BiquadFilter', 'SignalProcessor', 
      'Panner', 'StereoPanner', 'Convolver', 'DynamicsCompressor',
      'WaveShaper', 'IIRFilter', 'ConstantSource'
    ];

    for (const nodeType of standardNodes) {
      const methodName = `create${nodeType}`;
      capabilities.standardNodes[nodeType] = typeof this.audioContext[methodName] === 'function';
    }

    // Check for extended features
    capabilities.audioWorklet = 'audioWorklet' in this.audioContext;
    capabilities.offlineSupport = typeof OfflineAudioContext !== 'undefined';
    
    // Check for extended node types
    try {
      // Test StereoPanner which is not supported in older browsers
      if (typeof StereoPannerNode !== 'undefined') {
        capabilities.extensionNodes.stereoPanner = true;
      }
    } catch (e) {
      capabilities.extensionNodes.stereoPanner = false;
    }

    try {
      // Test for Web Audio API 2 nodes
      if (typeof IIRFilterNode !== 'undefined') {
        capabilities.extensionNodes.iirFilter = true;
      }
    } catch (e) {
      capabilities.extensionNodes.iirFilter = false;
    }

    return capabilities;
  }

  /**
   * Detect browser for compatibility adaptations
   * @private
   */
  _detectBrowser() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    
    return 'unknown';
  }

  /**
   * Initialize effect presets
   * @private
   */
  _initializePresets() {
    // Compressor presets
    this.compressorPresets = {
      vocal: {
        threshold: -24,
        knee: 30,
        ratio: 4,
        attack: 0.003,
        release: 0.25
      },
      drum: {
        threshold: -18,
        knee: 10,
        ratio: 5,
        attack: 0.002, 
        release: 0.1
      },
      master: {
        threshold: -12,
        knee: 15,
        ratio: 3,
        attack: 0.05,
        release: 0.4
      },
      limiter: {
        threshold: -3,
        knee: 0,
        ratio: 20,
        attack: 0.001,
        release: 0.1
      }
    };

    // Filter presets
    this.filterPresets = {
      lowpass: {
        type: 'lowpass',
        frequency: 1000,
        Q: 1.0,
        gain: 0
      },
      highpass: {
        type: 'highpass',
        frequency: 500,
        Q: 0.7,
        gain: 0
      },
      bandpass: {
        type: 'bandpass',
        frequency: 1500,
        Q: 2.0,
        gain: 0
      },
      lowShelf: {
        type: 'lowshelf',
        frequency: 300,
        Q: 0,
        gain: 6
      },
      highShelf: {
        type: 'highshelf',
        frequency: 3000,
        Q: 0,
        gain: 6
      },
      peaking: {
        type: 'peaking',
        frequency: 1000,
        Q: 1.0,
        gain: 0
      },
      notch: {
        type: 'notch',
        frequency: 1000,
        Q: 5.0,
        gain: 0
      }
    };
  }

  /**
   * Create a node of any type with unified error handling
   * @param {string} type - Type of node to create
   * @param {Object} [options={}] - Node options
   * @returns {AudioNode|null} Created node or null if failed
   */
  createNode(type, options = {}) {
    try {
      // Convert type to method name format
      const methodName = `create${type.charAt(0).toUpperCase() + type.slice(1)}Node`;
      
      // Check if method exists
      if (typeof this[methodName] === 'function') {
        return this[methodName](options);
      }
      
      // Try direct AudioContext creation if method not found
      return this._createStandardNode(type, options);
    } catch (error) {
      this._handleError(error, {
        operation: 'createNode',
        type,
        options
      });
      return null;
    }
  }

  /**
   * Create a standard Web Audio API node
   * @private
   */
  _createStandardNode(type, options = {}) {
    try {
      // Format the method name for AudioContext
      let methodName;
      if (type.toLowerCase() === 'signalprocessor') {
        methodName = 'createAnalyser';
      } else {
        methodName = `create${type.charAt(0).toUpperCase() + type.slice(1)}`;
      }
      
      // Remove 'Node' suffix if it was included in type
      if (methodName.endsWith('NodeNode')) {
        methodName = methodName.slice(0, -4);
      }
      
      // Check if method exists on AudioContext
      if (typeof this.audioContext[methodName] !== 'function') {
        throw new Error(`Unsupported node type: ${type}`);
      }
      
      // Create the node with proper arguments
      let node;
      switch (type.toLowerCase()) {
        case 'oscillator':
        case 'biquadfilter':
        case 'iirfilter':
        case 'signalprocessor':
        case 'panner':
        case 'stereopanner':
        case 'convolver':
        case 'delay':
        case 'dynamicscompressor':
        case 'waveshaper':
          // Nodes that may have constructor arguments
          node = this._createWithArgs(methodName, options);
          break;
        default:
          // Nodes with no constructor arguments
          node = this.audioContext[methodName]();
      }
      
      // Apply common configurations
      this._applyCommonSettings(node, options);
      
      // Update stats
      this._updateNodeStats(type, 'create');
      
      return this._finalizeNode(node, type, options);
    } catch (error) {
      this._handleError(error, {
        operation: '_createStandardNode',
        type,
        options
      });
      return null;
    }
  }

  /**
   * Create node with appropriate constructor arguments
   * @private
   */
  _createWithArgs(methodName, options) {
    switch (methodName) {
      case 'createDelay':
      case 'createDelayNode': // For older browsers
        return this.audioContext[methodName](options.maxDelayTime || 1.0);
      
      case 'createBiquadFilter':
        const node = this.audioContext[methodName]();
        if (options.type) node.type = options.type;
        return node;
        
      case 'createOscillator':
        const osc = this.audioContext[methodName]();
        if (options.type) osc.type = options.type;
        return osc;
        
      case 'createIIRFilter':
        if (options.feedforward && options.feedback) {
          return this.audioContext[methodName](options.feedforward, options.feedback);
        }
        throw new Error('IIRFilter requires feedforward and feedback coefficients');
        
      case 'createConvolver':
        const convolver = this.audioContext[methodName]();
        if (options.buffer) convolver.buffer = options.buffer;
        if (options.normalize !== undefined) convolver.normalize = options.normalize;
        return convolver;
        
      default:
        return this.audioContext[methodName]();
    }
  }

  /**
   * Apply common settings to any audio node
   * @private
   */
  _applyCommonSettings(node, options) {
    // Apply channel configurations if available on this node
    if ('channelCount' in node) {
      if (options.channelCount !== undefined) {
        node.channelCount = options.channelCount;
      } else if (this.config.channelCount) {
        node.channelCount = this.config.channelCount;
      }
    }
    
    if ('channelCountMode' in node) {
      if (options.channelCountMode !== undefined) {
        node.channelCountMode = options.channelCountMode;
      } else if (this.config.channelCountMode) {
        node.channelCountMode = this.config.channelCountMode;
      }
    }
    
    if ('channelInterpretation' in node) {
      if (options.channelInterpretation !== undefined) {
        node.channelInterpretation = options.channelInterpretation;
      } else if (this.config.channelInterpretation) {
        node.channelInterpretation = this.config.channelInterpretation;
      }
    }
  }

  /**
   * Finalize a node with tracking and additional methods
   * @private
   */
  _finalizeNode(node, type, options) {
    // Add to active nodes
    const nodeId = `${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    this.activeNodes.set(nodeId, {
      node,
      type,
      options,
      createdAt: Date.now()
    });
    
    // Add convenient methods for parameter control
    this._addParameterMethods(node);
    
    // Update stats
    this.stats.activeNodes = this.activeNodes.size;
    
    return node;
  }

  /**
   * Add convenient parameter control methods to the node
   * @private
   */
  _addParameterMethods(node) {
    // Only proceed if we can add properties
    if (!node) return node;
    
    // Add setParam method if it doesn't exist
    if (!node.setParam) {
      node.setParam = (paramName, value, timeConstant = 0) => {
        if (paramName in node && node[paramName] instanceof AudioParam) {
          this._setAudioParam(node[paramName], value, timeConstant);
          return true;
        }
        return false;
      };
    }
    
    // Add linearRamp method if it doesn't exist
    if (!node.linearRamp) {
      node.linearRamp = (paramName, value, duration = 0.1) => {
        if (paramName in node && node[paramName] instanceof AudioParam) {
          const now = this.audioContext.currentTime;
          node[paramName].linearRampToValueAtTime(value, now + duration);
          return true;
        }
        return false;
      };
    }
    
    return node;
  }

  /**
   * Set a value for an AudioParam with proper timing
   * @param {AudioParam} param - The audio parameter
   * @param {number} value - Value to set
   * @param {number} [timeConstant=0] - Time constant for transition (0 for immediate)
   * @private
   */
  _setAudioParam(param, value, timeConstant = 0) {
    // Skip if parameter or value is not provided
    if (!param || value === undefined || value === null) return;
    
    try {
      const now = this.audioContext.currentTime;
      
      if (timeConstant <= 0) {
        // Immediate change
        param.setValueAtTime(value, now);
      } else {
        // Exponential approach for smoother change
        param.setTargetAtTime(value, now, timeConstant);
      }
    } catch (error) {
      this._handleError(error, {
        operation: '_setAudioParam',
        value,
        timeConstant
      });
    }
  }

  // =============================================
  // Basic Node Creation Methods
  // =============================================

  /**
   * Create a gain node
   * @param {Object} [options={}] - Gain options
   * @param {number} [options.gain=1] - Initial gain value
   * @returns {GainNode} Configured gain node
   */
  createGainNode(options = {}) {
    const gainValue = options.gain !== undefined ? options.gain : 1;
    
    // Check pool first if enabled
    const node = this._getFromPool('gain') || this.audioContext.createGain();
    
    // Set gain with proper timing
    this._setAudioParam(node.gain, gainValue, options.timeConstant || 0);
    
    return this._finalizeNode(node, 'gain', options);
  }

  /**
   * Create a delay node
   * @param {Object} [options={}] - Delay options 
   * @param {number} [options.delayTime=0] - Initial delay time in seconds
   * @param {number} [options.maxDelayTime=1] - Maximum delay time in seconds
   * @returns {DelayNode} Configured delay node
   */
  createDelayNode(options = {}) {
    const maxDelay = options.maxDelayTime || 1.0;
    
    // Use compatible method (different in older browsers)
    const node = this.audioContext.createDelay 
      ? this.audioContext.createDelay(maxDelay)
      : this.audioContext.createDelayNode(maxDelay);
    
    // Set delay time
    const delayTime = options.delayTime !== undefined ? options.delayTime : 0;
    this._setAudioParam(node.delayTime, delayTime, options.timeConstant || 0);
    
    return this._finalizeNode(node, 'delay', options);
  }

  /**
   * Create a distortion node (using WaveShaper internally)
   * @param {Object} [options={}] - Distortion options
   * @param {number} [options.amount=0.5] - Distortion amount (0-1)
   * @param {string} [options.distortionType='soft'] - Type of distortion ('soft', 'hard', 'fuzz')
   * @param {string} [options.oversample='4x'] - Oversampling ('none', '2x', '4x')
   * @returns {WaveShaperNode} Configured distortion node
   */
  createDistortionNode(options = {}) {
    // Default options
    const distortionType = options.distortionType || 'soft';
    const amount = options.amount !== undefined ? options.amount : 0.5;
    const oversample = options.oversample || '4x';

    // Create a wave shaper node for the distortion effect
    const node = this.audioContext.createWaveShaper();
    
    // Generate distortion curve based on type and amount
    node.curve = this._generateDistortionCurve(distortionType, amount);
    node.oversample = oversample;
    
    return this._finalizeNode(node, 'distortion', options);
  }
  
  /**
   * Create an oscillator node
   * @param {Object} [options={}] - Oscillator options
   * @param {string} [options.type='sine'] - Oscillator type 
   * @param {number} [options.frequency=440] - Frequency in Hz
   * @param {number} [options.detune=0] - Detune in cents
   * @returns {OscillatorNode} Configured oscillator node
   */
  createOscillatorNode(options = {}) {
    const node = this.audioContext.createOscillator();
    
    // Set oscillator type
    if (options.type) {
      node.type = options.type;
    }
    
    // Set frequency
    if (options.frequency !== undefined) {
      this._setAudioParam(node.frequency, options.frequency);
    }
    
    // Set detune
    if (options.detune !== undefined) {
      this._setAudioParam(node.detune, options.detune);
    }
    
    // Auto-start if specified
    if (options.autoStart) {
      node.start(options.startTime || 0);
    }
    
    return this._finalizeNode(node, 'oscillator', options);
  }

  /**
   * Create a buffer source node
   * @param {Object} [options={}] - Buffer source options
   * @param {AudioBuffer} [options.buffer] - Audio buffer to use
   * @param {boolean} [options.loop=false] - Whether to loop playback
   * @param {number} [options.playbackRate=1] - Playback rate
   * @returns {AudioBufferSourceNode} Configured buffer source node
   */
  createBufferSourceNode(options = {}) {
    const node = this.audioContext.createBufferSource();
    
    // Set buffer if provided
    if (options.buffer) {
      node.buffer = options.buffer;
    }
    
    // Set loop state
    if (options.loop !== undefined) {
      node.loop = options.loop;
    }
    
    // Set playback rate
    if (options.playbackRate !== undefined) {
      this._setAudioParam(node.playbackRate, options.playbackRate);
    }
    
    // Auto-start if specified
    if (options.autoStart) {
      const startDelay = options.startDelay || 0;
      const offset = options.offset || 0;
      const duration = options.duration;
      
      if (duration !== undefined) {
        node.start(this.audioContext.currentTime + startDelay, offset, duration);
      } else {
        node.start(this.audioContext.currentTime + startDelay, offset);
      }
    }
    
    return this._finalizeNode(node, 'bufferSource', options);
  }

  // =============================================
  // Effect Node Creation Methods
  // =============================================

  /**
   * Create a biquad filter node
   * @param {Object} [options={}] - Filter options
   * @param {string} [options.type='lowpass'] - Filter type
   * @param {number} [options.frequency=350] - Filter frequency
   * @param {number} [options.Q=1] - Q factor
   * @param {number} [options.gain=0] - Gain (for some filter types)
   * @param {string} [options.preset] - Named preset to apply
   * @returns {BiquadFilterNode} Configured filter node
   */
  createFilterNode(options = {}) {
    // Apply preset if specified
    if (options.preset && this.filterPresets[options.preset]) {
      options = {
        ...this.filterPresets[options.preset],
        ...options
      };
    }
    
    // Create the node
    const node = this.audioContext.createBiquadFilter();
    
    // Set filter type
    if (options.type) {
      node.type = options.type;
    }
    
    // Set parameters
    if (options.frequency !== undefined) {
      this._setAudioParam(node.frequency, options.frequency);
    }
    
    if (options.Q !== undefined) {
      this._setAudioParam(node.Q, options.Q);
    }
    
    if (options.gain !== undefined) {
      this._setAudioParam(node.gain, options.gain);
    }
    
    return this._finalizeNode(node, 'filter', options);
  }

  /**
   * Create a compressor node with optional presets
   * @param {Object} [options={}] - Compressor options
   * @param {number} [options.threshold=-24] - Threshold in dB
   * @param {number} [options.knee=30] - Knee width in dB
   * @param {number} [options.ratio=12] - Compression ratio
   * @param {number} [options.attack=0.003] - Attack time in seconds
   * @param {number} [options.release=0.25] - Release time in seconds
   * @param {string} [options.preset] - Named preset to apply
   * @returns {DynamicsCompressorNode} Configured compressor node
   */
  createCompressorNode(options = {}) {
    // Apply preset if specified
    if (options.preset && this.compressorPresets[options.preset]) {
      options = {
        ...this.compressorPresets[options.preset],
        ...options
      };
    }
    
    // Create the node
    const node = this.audioContext.createDynamicsCompressor();
    
    // Set parameters
    if (options.threshold !== undefined) {
      this._setAudioParam(node.threshold, options.threshold);
    }
    
    if (options.knee !== undefined) {
      this._setAudioParam(node.knee, options.knee);
    }
    
    if (options.ratio !== undefined) {
      this._setAudioParam(node.ratio, options.ratio);
    }
    
    if (options.attack !== undefined) {
      this._setAudioParam(node.attack, options.attack);
    }
    
    if (options.release !== undefined) {
      this._setAudioParam(node.release, options.release);
    }
    
    return this._finalizeNode(node, 'compressor', options);
  }

  /**
   * Create a convolver node (for reverb and impulse responses)
   * @param {Object} [options={}] - Convolver options
   * @param {AudioBuffer} [options.buffer] - Impulse response buffer
   * @param {boolean} [options.normalize=true] - Whether to normalize the impulse response
   * @returns {ConvolverNode} Configured convolver node
   */
  createConvolverNode(options = {}) {
    const node = this.audioContext.createConvolver();
    
    // Set buffer if provided
    if (options.buffer) {
      node.buffer = options.buffer;
    }
    
    // Set normalize property
    if (options.normalize !== undefined) {
      node.normalize = options.normalize;
    }
    
    return this._finalizeNode(node, 'convolver', options);
  }

  /**
   * Create a panner node
   * @param {Object} [options={}] - Panner options
   * @returns {PannerNode} Configured panner node
   */
  createPannerNode(options = {}) {
    const node = this.audioContext.createPanner();
    
    // Configure panner properties
    if (options.panningModel) {
      node.panningModel = options.panningModel;
    }
    
    if (options.distanceModel) {
      node.distanceModel = options.distanceModel;
    }
    
    // Position
    if (options.positionX !== undefined) {
      node.positionX.value = options.positionX;
    } else if (options.position && options.position[0] !== undefined) {
      node.positionX.value = options.position[0];
    }
    
    if (options.positionY !== undefined) {
      node.positionY.value = options.positionY;
    } else if (options.position && options.position[1] !== undefined) {
      node.positionY.value = options.position[1];
    }
    
    if (options.positionZ !== undefined) {
      node.positionZ.value = options.positionZ;
    } else if (options.position && options.position[2] !== undefined) {
      node.positionZ.value = options.position[2];
    }
    
    // Orientation
    if (options.orientationX !== undefined) {
      node.orientationX.value = options.orientationX;
    } else if (options.orientation && options.orientation[0] !== undefined) {
      node.orientationX.value = options.orientation[0];
    }
    
    if (options.orientationY !== undefined) {
      node.orientationY.value = options.orientationY;
    } else if (options.orientation && options.orientation[1] !== undefined) {
      node.orientationY.value = options.orientation[1];
    }
    
    if (options.orientationZ !== undefined) {
      node.orientationZ.value = options.orientationZ;
    } else if (options.orientation && options.orientation[2] !== undefined) {
      node.orientationZ.value = options.orientation[2];
    }
    
    // Advanced parameters
    if (options.refDistance !== undefined) {
      node.refDistance = options.refDistance;
    }
    
    if (options.maxDistance !== undefined) {
      node.maxDistance = options.maxDistance;
    }
    
    if (options.rolloffFactor !== undefined) {
      node.rolloffFactor = options.rolloffFactor;
    }
    
    if (options.coneInnerAngle !== undefined) {
      node.coneInnerAngle = options.coneInnerAngle;
    }
    
    if (options.coneOuterAngle !== undefined) {
      node.coneOuterAngle = options.coneOuterAngle;
    }
    
    if (options.coneOuterGain !== undefined) {
      node.coneOuterGain = options.coneOuterGain;
    }
    
    return this._finalizeNode(node, 'panner', options);
  }

  /**
   * Create a stereo panner node with fallback for older browsers
   * @param {Object} [options={}] - Stereo panner options
   * @param {number} [options.pan=0] - Pan position (-1 to 1)
   * @returns {StereoPannerNode|GainNode[]} Configured panner node or gain node array for fallback
   */
  createStereoPannerNode(options = {}) {
    const pan = options.pan !== undefined ? options.pan : 0;
    
    try {
      // Try to use native StereoPannerNode
      if (this.capabilities.extensionNodes.stereoPanner) {
        const node = this.audioContext.createStereoPanner();
        this._setAudioParam(node.pan, pan);
        return this._finalizeNode(node, 'stereoPanner', options);
      } else {
        // Fallback implementation using gain nodes
        return this._createFallbackStereoPanner(pan, options);
      }
    } catch (error) {
      // Fallback if there was an error
      return this._createFallbackStereoPanner(pan, options);
    }
  }

  /**
   * Fallback stereo panner using gain nodes
   * @private
   */
  _createFallbackStereoPanner(pan, options) {
    // Create splitter for stereo separation
    const splitter = this.audioContext.createChannelSplitter(2);
    
    // Create gains for left and right channels
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();
    
    // Create merger to combine channels
    const merger = this.audioContext.createChannelMerger(2);
    
    // Calculate gain values for equal power panning
    const normalizedPan = Math.max(-1, Math.min(1, pan));
    const leftGainValue = Math.cos((normalizedPan + 1) * Math.PI / 4);
    const rightGainValue = Math.sin((normalizedPan + 1) * Math.PI / 4);
    
    // Set gain values
    leftGain.gain.value = leftGainValue;
    rightGain.gain.value = rightGainValue;
    
    // Connect the nodes
    splitter.connect(leftGain, 0);    // Connect left channel
    splitter.connect(rightGain, 1);   // Connect right channel
    leftGain.connect(merger, 0, 0);   // Connect to left output
    rightGain.connect(merger, 0, 1);  // Connect to right output
    
    // Create a custom object that wraps the nodes
    const pannerFallback = {
      input: splitter,
      output: merger,
      pan: {
        value: normalizedPan,
        setValueAtTime: (value, time) => {
          const p = Math.max(-1, Math.min(1, value));
          const l = Math.cos((p + 1) * Math.PI / 4);
          const r = Math.sin((p + 1) * Math.PI / 4);
          leftGain.gain.setValueAtTime(l, time);
          rightGain.gain.setValueAtTime(r, time);
          pannerFallback.pan.value = p;
        }
      },
      connect: (destination) => {
        merger.connect(destination);
        return destination;
      },
      disconnect: () => {
        merger.disconnect();
        leftGain.disconnect();
        rightGain.disconnect();
        splitter.disconnect();
      }
    };
    
    // Add to active nodes for tracking
    const nodeId = `stereoPannerFallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this.activeNodes.set(nodeId, {
      node: pannerFallback,
      type: 'stereoPannerFallback',
      options,
      createdAt: Date.now()
    });
    
    // Update stats
    this._updateNodeStats('stereoPannerFallback', 'create');
    this.stats.activeNodes = this.activeNodes.size;
    
    return pannerFallback;
  }

  /**
   * Create a wave shaper node for distortion effects
   * @param {Object} [options={}] - Wave shaper options
   * @param {Float32Array} [options.curve] - Distortion curve
   * @param {string} [options.distortionType] - Predefined distortion type
   * @param {number} [options.amount=0] - Distortion amount (0-1) if using predefined type
   * @returns {WaveShaperNode} Configured wave shaper node
   */
  createWaveShaperNode(options = {}) {
    const node = this.audioContext.createWaveShaper();
    
    // Set provided curve
    if (options.curve) {
      node.curve = options.curve;
      node.oversample = options.oversample || 'none';
    }
    // Or generate curve based on distortion type
    else if (options.distortionType) {
      const amount = options.amount !== undefined ? options.amount : 0.5;
      node.curve = this._generateDistortionCurve(options.distortionType, amount);
      node.oversample = options.oversample || 'none';
    }
    
    return this._finalizeNode(node, 'waveShaper', options);
  }

  /**
   * Generate a distortion curve for wave shaper
   * @param {string} type - Type of distortion
   * @param {number} amount - Amount of distortion (0-1)
   * @returns {Float32Array} Distortion curve
   * @private
   */
  _generateDistortionCurve(type, amount) {
    // Normalize amount to 0-1 range
    const k = Math.max(0, Math.min(1, amount)) * 100;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; ++i) {
      const x = i * 2 / samples - 1;
      
      switch (type) {
        case 'soft':
          // Soft clipping distortion
          curve[i] = (Math.atan(k * x)) / (Math.atan(k));
          break;
          
        case 'hard':
          // Hard clipping distortion
          curve[i] = x < -0.5 / k ? -0.5 : (x > 0.5 / k ? 0.5 : k * x);
          break;
          
        case 'fuzz':
          // Fuzzy distortion
          curve[i] = x < 0 ? 
            -1 * Math.pow(1 - Math.pow(Math.abs(x), k), 1/k) : 
            Math.pow(1 - Math.pow(Math.abs(x), k), 1/k);
          break;
          
        case 'square':
          // Square wave distortion
          curve[i] = x < 0 ? -1 : 1;
          break;
          
        case 'sine':
          // Sine wave distortion
          curve[i] = Math.sin(x * k * Math.PI / 2);
          break;
          
        default:
          // Default to no distortion
          curve[i] = x;
      }
    }
    
    return curve;
  }

  // =============================================
  // Analysis Node Creation Methods
  // =============================================

  /**
   * Create an SignalProcessor node for audio visualization
   * @param {Object} [options={}] - SignalProcessor options
   * @param {number} [options.fftSize=2048] - FFT size (must be power of 2)
   * @param {number} [options.smoothingTimeConstant=0.8] - Smoothing value (0-1)
   * @param {number} [options.minDecibels=-100] - Minimum decibel value
   * @param {number} [options.maxDecibels=-30] - Maximum decibel value
   * @returns {SignalProcessorNode} Configured SignalProcessor node
   */
  createAnalyserNode(options = {}) {
    const node = this.audioContext.createAnalyser();
    
    // Set FFT size (must be power of 2)
    if (options.fftSize) {
      // Ensure it's a power of 2
      const validFFTSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
      if (validFFTSizes.includes(options.fftSize)) {
        node.fftSize = options.fftSize;
      } else {
        console.warn('FFT size must be a power of 2. Using default value.');
      }
    }
    
    // Set smoothing
    if (options.smoothingTimeConstant !== undefined) {
      node.smoothingTimeConstant = Math.max(0, Math.min(1, options.smoothingTimeConstant));
    }
    
    // Set decibel range
    if (options.minDecibels !== undefined) {
      node.minDecibels = options.minDecibels;
    }
    
    if (options.maxDecibels !== undefined) {
      node.maxDecibels = options.maxDecibels;
    }
    
    return this._finalizeNode(node, 'signalprocessor', options);
  }

  // =============================================
  // Node Pooling and Management
  // =============================================

  /**
   * Get a node from the pool if available
   * @param {string} type - Type of node
   * @returns {AudioNode|null} Node from pool or null if none available
   * @private
   */
  _getFromPool(type) {
    // Skip if pooling is disabled
    if (!this.config.enablePooling) return null;
    
    // Get the pool for this type
    const pool = this.nodePools.get(type);
    if (!pool || pool.length === 0) return null;
    
    // Get a node from the pool
    const node = pool.pop();
    
    // Update stats
    this.stats.poolSize = Array.from(this.nodePools.values())
      .reduce((total, pool) => total + pool.length, 0);
      
    return node;
  }

  /**
   * Return a node to the pool for reuse
   * @param {AudioNode} node - Node to return to pool
   * @param {string} type - Type of node
   * @private
   */
  _returnToPool(node, type) {
    // Skip if pooling is disabled or maximum pool size reached
    if (!this.config.enablePooling) return false;
    
    // Check if this node type can be pooled
    const canPool = [
      'gain', 
      'delay', 
      'biquadfilter',
      'signalprocessor'
    ].includes(type.toLowerCase());
    
    if (!canPool) return false;
    
    // Initialize pool for this type if it doesn't exist
    if (!this.nodePools.has(type)) {
      this.nodePools.set(type, []);
    }
    
    const pool = this.nodePools.get(type);
    
    // Check pool size limit
    if (pool.length >= this.config.maxPoolSize) {
      return false;
    }
    
    // Reset node to default state
    try {
      // Disconnect node
      node.disconnect();
      
      // Reset parameters based on node type
      if (type === 'gain') {
        node.gain.value = 1;
      } else if (type === 'delay') {
        node.delayTime.value = 0;
      } else if (type === 'biquadfilter') {
        node.frequency.value = 350;
        node.Q.value = 1;
        node.gain.value = 0;
        node.type = 'lowpass';
      }
      
      // Add to pool
      pool.push(node);
      
      // Update stats
      this.stats.poolSize = Array.from(this.nodePools.values())
        .reduce((total, pool) => total + pool.length, 0);
        
      return true;
    } catch (error) {
      // If there's an error resetting the node, don't pool it
      return false;
    }
  }

  /**
   * Update node statistics
   * @param {string} type - Node type
   * @param {string} operation - Operation performed
   * @private
   */
  _updateNodeStats(type, operation) {
    // Initialize type counter if needed
    if (!this.stats.byType[type]) {
      this.stats.byType[type] = { created: 0, active: 0, pooled: 0 };
    }
    
    // Update appropriate counter
    if (operation === 'create') {
      this.stats.totalCreated++;
      this.stats.byType[type].created++;
    } else if (operation === 'release') {
      this.stats.byType[type].active--;
    } else if (operation === 'pool') {
      this.stats.byType[type].pooled++;
    }
  }

  /**
   * Handle errors through ErrorManager if available
   * @private
   */
  _handleError(error, context = {}) {
    // Use error manager if available
    if (this.errorManager) {
      return this.errorManager.handleError(error, {
        component: 'AudioNodeFactory',
        ...context
      });
    }
    
    // Fallback to console
    console.error('[AudioNodeFactory]', error, context);
    return error;
  }

  /**
   * Emit an event through the callback
   * @private
   */
  _emitEvent(type, data) {
    this.onEvent({
      type,
      data,
      timestamp: Date.now(),
      component: 'AudioNodeFactory'
    });
  }

  /**
   * Get factory statistics and status
   * @returns {Object} Factory statistics
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.stats.poolSize,
      capabilities: {
        ...this.capabilities
      }
    };
  }

  /**
   * Release a node (disconnect and possibly return to pool)
   * @param {AudioNode} node - Node to release
   * @param {string} [type] - Node type (if known)
   * @returns {boolean} Success status
   */
  releaseNode(node, type) {
    if (!node) return false;
    
    try {
      // Disconnect the node
      node.disconnect();
      
      // Determine node type if not provided
      let nodeType = type;
      if (!nodeType) {
        // Find node in active nodes
        for (const [id, data] of this.activeNodes.entries()) {
          if (data.node === node) {
            nodeType = data.type;
            this.activeNodes.delete(id);
            break;
          }
        }
      }
      
      // Try to pool the node if type is known
      if (nodeType) {
        this._returnToPool(node, nodeType);
        this._updateNodeStats(nodeType, 'release');
      }
      
      // Update stats
      this.stats.activeNodes = this.activeNodes.size;
      
      return true;
    } catch (error) {
      this._handleError(error, {
        operation: 'releaseNode',
        nodeType: type
      });
      return false;
    }
  }

  /**
   * Clean up and dispose all resources
   */
  dispose() {
    try {
      // Release all tracked nodes
      for (const [id, data] of this.activeNodes.entries()) {
        try {
          const node = data.node;
          node.disconnect && node.disconnect();
        } catch (e) {
          // Ignore errors during disconnect
        }
      }
      
      // Clear pools
      this.nodePools.clear();
      
      // Clear node tracking
      this.activeNodes.clear();
      
      // Reset stats
      this.stats = {
        totalCreated: 0,
        activeNodes: 0,
        poolSize: 0,
        byType: {}
      };
      
      this.initialized = false;
      this._emitEvent('disposed', {});
      
      return true;
    } catch (error) {
      this._handleError(error, { operation: 'dispose' });
      return false;
    }
  }
}

export default AudioNodeFactory;