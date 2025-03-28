/**
 * OutputManager.js
 * Handles audio output routing, device selection, and final signal processing before playback.
 * Provides a unified interface for controlling volume, channel mapping, and output device management.
 */
class OutputManager {
  /**
   * Creates a new OutputManager instance
   * @param {Object} options - Configuration options
   * @param {AudioEngineCore} options.audioEngineCore - Reference to AudioEngineCore
   * @param {EventBus} options.EventBus - Reference to EventBus
   * @param {DeviceManager} [options.deviceManager] - Optional reference to DeviceManager
   * @param {Object} [options.config] - Additional configuration
   */
  constructor(options = {}) {
    // Required dependencies
    if (!options.audioEngineCore) {
      throw new Error('OutputManager requires AudioEngineCore');
    }
    
    this.audioEngineCore = options.audioEngineCore;
    this.audioContext = this.audioEngineCore.getContext();
    this.EventBus = options.EventBus;
    this.deviceManager = options.deviceManager;
    
    // Initialize state
    this.state = {
      volume: options.config?.volume ?? 0.8,
      muted: options.config?.muted ?? false,
      previousVolume: 0.8, // For mute/unmute functionality
      clippingDetected: false,
      clippingCount: 0,
      peakLevel: -100,
      limiterActive: false
    };

    // Configuration
    this.config = {
      autoProtection: options.config?.autoProtection ?? true,
      channelMode: options.config?.channelMode ?? 'stereo',
      monitorLevels: options.config?.monitorLevels ?? true,
      deviceSwitchBehavior: options.config?.deviceSwitchBehavior ?? 'auto',
      limiterThreshold: options.config?.limiterThreshold ?? -1.0,
      limiterRatio: options.config?.limiterRatio ?? 20,
      limiterAttack: options.config?.limiterAttack ?? 0.003,
      limiterRelease: options.config?.limiterRelease ?? 0.01,
      ...options.config
    };
    
    // Initialize node chain for output processing
    this.outputChain = null;
    
    // Track current device
    this.currentDevice = null;
    
    // Initialize monitoring
    this.monitoringInterval = null;
    
    // Initialize
    this._initialize();
  }

  /**
   * Initialize the OutputManager
   * @private
   */
  _initialize() {
    try {
      // Create output processing chain
      this._setupOutputChain();
      
      // Set initial volume
      this.setVolume(this.state.volume, 0);
      
      // Start output monitoring if enabled
      if (this.config.monitorLevels) {
        this._startOutputMonitoring();
      }
      
      // Initialize device connection if DeviceManager provided
      if (this.deviceManager) {
        this._initializeDeviceConnection();
      }
      
      // Report initialization complete
      this._emitEvent('output:initialized', {
        volume: this.state.volume,
        channelMode: this.config.channelMode
      });
    } catch (error) {
      console.error('Failed to initialize OutputManager:', error);
      this._emitEvent('output:error', {
        error,
        component: 'OutputManager',
        operation: 'initialization'
      });
    }
  }

  /**
   * Setup the output processing chain
   * @private
   */
  _setupOutputChain() {
    if (!this.audioContext) return;
    
    try {
      // Create nodes for output chain
      this.outputChain = {
        // Input gain for volume control
        volumeNode: this.audioContext.createGain(),
        
        // Dynamics compressor acting as a limiter
        limiterNode: this.audioContext.createDynamicsCompressor(),
        
        // SignalProcessor for output level monitoring
        levelSignalProcessor: this.audioContext.createAnalyser()
      };
      
      // Configure limiter as a brick wall to prevent clipping
      const limiter = this.outputChain.limiterNode;
      limiter.threshold.value = this.config.limiterThreshold;
      limiter.ratio.value = this.config.limiterRatio;
      limiter.attack.value = this.config.limiterAttack;
      limiter.release.value = this.config.limiterRelease;
      limiter.knee.value = 0.0; // Hard knee for brick wall limiting
      
      // Configure SignalProcessor for level monitoring
      const SignalProcessor = this.outputChain.levelSignalProcessor;
      SignalProcessor.fftSize = 256; // Small size is sufficient for level monitoring
      SignalProcessor.smoothingTimeConstant = 0.3;
      
      // Connect the chain
      this.outputChain.volumeNode.connect(this.outputChain.limiterNode);
      this.outputChain.limiterNode.connect(this.outputChain.levelSignalProcessor);
      
      // Use the master gain node from AudioEngineCore as the final destination
      const masterNode = this.audioEngineCore.getMasterNode();
      if (masterNode) {
        this.outputChain.levelSignalProcessor.connect(masterNode);
      } else {
        // Fallback to direct connection to destination if no master node available
        this.outputChain.levelSignalProcessor.connect(this.audioContext.destination);
      }
      
      this._emitEvent('output:chain-created', {
        limiterActive: true
      });
    } catch (error) {
      console.error('Failed to setup output chain:', error);
      this._emitEvent('output:error', {
        error,
        component: 'OutputManager',
        operation: 'setupOutputChain'
      });
    }
  }

  /**
   * Start monitoring output levels to detect clipping
   * @private
   */
  _startOutputMonitoring() {
    if (!this.outputChain || !this.outputChain.levelSignalProcessor) return;
    
    // Create buffer for SignalProcessor data
    const SignalProcessorBuffer = new Float32Array(this.outputChain.levelSignalProcessor.frequencyBinCount);
    
    // Setup monitoring interval (100ms is usually good enough for level monitoring)
    this.monitoringInterval = setInterval(() => {
      // Get frequency data (in dB scale)
      this.outputChain.levelSignalProcessor.getFloatFrequencyData(SignalProcessorBuffer);
      
      // Find peak level across all frequency bins
      let maxLevel = -100;
      for (let i = 0; i < SignalProcessorBuffer.length; i++) {
        if (SignalProcessorBuffer[i] > maxLevel) {
          maxLevel = SignalProcessorBuffer[i];
        }
      }
      
      // Update peak level
      this.state.peakLevel = maxLevel;
      
      // Check for levels approaching 0dB (potential clipping)
      if (maxLevel > -3.0) {
        this.state.clippingCount++;
        
        if (this.state.clippingCount > 3) {
          // Consider clipping detected after multiple high readings
          if (!this.state.clippingDetected) {
            this.state.clippingDetected = true;
            
            this._emitEvent('output:clipping-detected', {
              level: maxLevel,
              time: this.audioContext.currentTime
            });
            
            // Auto-reduce volume if enabled
            if (this.config.autoProtection && !this.state.muted) {
              // Reduce by 3dB
              const newVolume = Math.max(0.1, this.state.volume * 0.7);
              this.setVolume(newVolume, 0.1); // With slight fade
            }
          }
        }
      } else {
        // Reset clipping counter when levels are safe
        this.state.clippingCount = 0;
        
        if (this.state.clippingDetected) {
          this.state.clippingDetected = false;
          
          this._emitEvent('output:clipping-resolved', {
            level: maxLevel,
            time: this.audioContext.currentTime
          });
        }
      }
      
      // Emit level updates at lower frequency to avoid event flood
      if (this.monitoringInterval % 5 === 0) {
        this._emitEvent('output:levels', {
          peak: maxLevel,
          clipping: this.state.clippingDetected,
          reduction: this.outputChain.limiterNode.reduction || 0
        });
      }
    }, 100);
  }

  /**
   * Initialize connection with DeviceManager
   * @private
   */
  _initializeDeviceConnection() {
    if (!this.deviceManager) return;
    
    // Listen for device changes
    this.deviceManager.on('device:changed', (deviceInfo) => {
      this.currentDevice = deviceInfo.device;
      
      // Adjust settings for new device
      this._optimizeForDevice(deviceInfo.device);
      
      this._emitEvent('output:device-changed', {
        device: deviceInfo.device
      });
    });
    
    // Listen for device errors
    this.deviceManager.on('device:error', (error) => {
      this._emitEvent('output:device-error', error);
    });
  }

  /**
   * Optimize audio settings for the current device
   * @private
   * @param {Object} device - Device information
   */
  _optimizeForDevice(device) {
    if (!device) return;
    
    // Adjust channel configuration based on device capabilities
    if (device.maxChannels && this.audioContext.destination) {
      this.audioEngineCore.setChannelCount(
        Math.min(device.maxChannels, this.audioContext.destination.maxChannelCount)
      );
    }
    
    // Apply device-specific optimizations
    if (device.type === 'bluetooth') {
      // Bluetooth devices often need more aggressive limiting and higher latency
      this._adjustForBluetoothDevice();
    } else if (device.type === 'hdmi') {
      // HDMI may support surround sound
      this._adjustForSurroundSound(device.maxChannels);
    } else if (device.type === 'headphones') {
      // Headphones benefit from crossfeed for improved stereo image
      this._adjustForHeadphones();
    }
    
    this._emitEvent('output:device-optimized', {
      device,
      channelCount: this.audioContext.destination.channelCount,
      optimization: device.type || 'standard'
    });
  }

  /**
   * Adjust settings for Bluetooth devices
   * @private
   */
  _adjustForBluetoothDevice() {
    // Bluetooth needs more aggressive limiting to prevent audio glitches
    if (this.outputChain && this.outputChain.limiterNode) {
      this.outputChain.limiterNode.threshold.value = -3.0; // More aggressive threshold
      this.outputChain.limiterNode.attack.value = 0.001; // Faster attack
    }
    
    // Bluetooth typically needs higher latency hint
    // This would ideally be done when creating the AudioContext, but we can inform
    // users about potential issues
    this._emitEvent('output:latency-adjustment', {
      deviceType: 'bluetooth',
      recommendedLatencyHint: 'playback',
      message: 'Bluetooth audio may have increased latency'
    });
  }

  /**
   * Adjust settings for surround sound
   * @private
   * @param {number} maxChannels - Maximum supported channels
   */
  _adjustForSurroundSound(maxChannels) {
    if (maxChannels > 2 && this.audioContext.destination) {
      // Configure for surround sound
      this.audioEngineCore.setChannelCount(maxChannels);
      
      // Emit event for any components that need to adjust for surround
      this._emitEvent('output:surround-enabled', {
        channels: maxChannels
      });
    }
  }

  /**
   * Adjust settings for headphones
   * @private
   */
  _adjustForHeadphones() {
    // Future implementation for headphone-specific processing
    // Such as crossfeed or specialized EQ
    this._emitEvent('output:headphones-optimized', {
      optimizations: ['crossfeed', 'stereo-enhancement']
    });
  }

  /**
   * Master volume control with optional fade
   * @param {number} level - Volume level (0.0-1.0)
   * @param {number} [fadeTime=0] - Fade time in seconds
   * @returns {boolean} Success status
   */
  setVolume(level, fadeTime = 0) {
    if (!this.outputChain || !this.outputChain.volumeNode) return false;
    
    try {
      // Clamp volume to valid range
      const safeLevel = Math.max(0, Math.min(1, level));
      
      // Apply volume change
      const now = this.audioContext.currentTime;
      const volumeGain = this.outputChain.volumeNode.gain;
      
      if (fadeTime > 0) {
        // With fade - start from current value
        volumeGain.cancelScheduledValues(now);
        volumeGain.setValueAtTime(volumeGain.value, now);
        volumeGain.linearRampToValueAtTime(safeLevel, now + fadeTime);
      } else {
        // Immediate change with tiny smoothing to avoid clicks
        volumeGain.setTargetAtTime(safeLevel, now, 0.003);
      }
      
      // Update state
      this.state.volume = safeLevel;
      
      // Emit volume change event
      this._emitEvent('output:volume-changed', {
        volume: safeLevel,
        fadeTime,
        previousVolume: this.state.previousVolume,
        muted: this.state.muted
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set volume:', error);
      this._emitEvent('output:error', {
        error,
        component: 'OutputManager',
        operation: 'setVolume'
      });
      
      return false;
    }
  }

  /**
   * Get current volume level
   * @returns {number} Current volume (0.0-1.0)
   */
  getVolume() {
    return this.state.volume;
  }

  /**
   * Toggle mute state
   * @param {boolean} [muted] - If specified, set to this state, otherwise toggle
   * @param {number} [fadeTime=0.03] - Fade time in seconds
   * @returns {boolean} New mute state
   */
  setMute(muted, fadeTime = 0.03) {
    try {
      // Determine target mute state
      const newMuteState = (muted !== undefined) ? muted : !this.state.muted;
      
      if (newMuteState === this.state.muted) {
        return newMuteState; // No change
      }
      
      if (newMuteState) {
        // Muting - store current volume for restoration
        this.state.previousVolume = this.state.volume;
        this.setVolume(0, fadeTime);
      } else {
        // Unmuting - restore previous volume
        this.setVolume(this.state.previousVolume, fadeTime);
      }
      
      // Update state
      this.state.muted = newMuteState;
      
      // Emit mute changed event
      this._emitEvent('output:mute-changed', {
        muted: newMuteState
      });
      
      return newMuteState;
    } catch (error) {
      console.error('Failed to set mute state:', error);
      this._emitEvent('output:error', {
        error,
        component: 'OutputManager',
        operation: 'setMute'
      });
      
      return this.state.muted; // Return current state on error
    }
  }

  /**
   * Check if audio is currently muted
   * @returns {boolean} Mute state
   */
  isMuted() {
    return this.state.muted;
  }

  /**
   * Select output device (delegate to DeviceManager)
   * @param {string} deviceId - Device ID to select
   * @returns {Promise<boolean>} Success status
   */
  async selectDevice(deviceId) {
    if (!this.deviceManager) {
      console.warn('OutputManager: DeviceManager not available for device selection');
      return false;
    }
    
    try {
      // Delegate device selection to DeviceManager
      const result = await this.deviceManager.selectDevice(deviceId);
      
      if (result) {
        // Device manager will emit events which we listen for
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to select output device:', error);
      this._emitEvent('output:error', {
        error,
        component: 'OutputManager',
        operation: 'selectDevice',
        deviceId
      });
      
      return false;
    }
  }

  /**
   * Get input node for routing audio into the output chain
   * @returns {AudioNode|null} Input node
   */
  getInputNode() {
    if (!this.outputChain) return null;
    return this.outputChain.volumeNode;
  }

  /**
   * Get all output nodes in the chain
   * @returns {Object|null} Output chain nodes
   */
  getOutputChain() {
    return this.outputChain;
  }

  /**
   * Get current device information
   * @returns {Object|null} Current device
   */
  getCurrentDevice() {
    return this.currentDevice;
  }

  /**
   * Get available output devices (delegate to DeviceManager)
   * @returns {Promise<Array>} List of available devices
   */
  async getAvailableDevices() {
    if (!this.deviceManager) {
      return [{ id: 'default', label: 'System Default', isDefault: true }];
    }
    
    try {
      return await this.deviceManager.getDevices();
    } catch (error) {
      console.error('Failed to get available devices:', error);
      return [{ id: 'default', label: 'System Default', isDefault: true }];
    }
  }

  /**
   * Get meter data for visualization
   * @returns {Object} Meter data
   */
  getMeterData() {
    return {
      peak: this.state.peakLevel,
      clipping: this.state.clippingDetected,
      reduction: this.outputChain?.limiterNode?.reduction || 0
    };
  }

  /**
   * Bypass processing (for performance optimization)
   * @param {boolean} bypass - Whether to bypass
   * @returns {boolean} Success status
   */
  setBypass(bypass) {
    if (!this.outputChain) return false;
    
    try {
      if (bypass) {
        // Bypass processing by connecting volume directly to output
        this.outputChain.volumeNode.disconnect();
        this.outputChain.volumeNode.connect(this.audioEngineCore.getMasterNode());
      } else {
        // Restore normal processing chain
        this.outputChain.volumeNode.disconnect();
        this.outputChain.volumeNode.connect(this.outputChain.limiterNode);
      }
      
      this._emitEvent('output:bypass-changed', {
        bypassed: bypass
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set bypass state:', error);
      return false;
    }
  }

  /**
   * Emit an event through EventBus
   * @private
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  _emitEvent(type, data) {
    if (this.EventBus && typeof this.EventBus.emit === 'function') {
      this.EventBus.emit(type, {
        ...data,
        source: 'OutputManager',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Register an event listener
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   * @returns {*} - Subscription identifier from EventBus
   */
  on(event, callback) {
    if (this.EventBus && typeof this.EventBus.on === 'function') {
      return this.EventBus.on(event, callback);
    }
    return null;
  }

  /**
   * Remove an event listener
   * @param {string} event - Event type
   * @param {*} subscription - Subscription identifier
   * @returns {boolean} - Success status
   */
  off(event, subscription) {
    if (this.EventBus && typeof this.EventBus.off === 'function') {
      return this.EventBus.off(event, subscription);
    }
    return false;
  }

  /**
   * Clean up and dispose of resources
   */
  dispose() {
    // Stop monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Disconnect nodes
    if (this.outputChain) {
      try {
        this.outputChain.volumeNode.disconnect();
        this.outputChain.limiterNode.disconnect();
        this.outputChain.levelSignalProcessor.disconnect();
      } catch (error) {
        console.warn('Error disconnecting output nodes:', error);
      }
    }
    
    // Clean up event listeners
    if (this.deviceManager) {
      // Remove device change listeners
      this.deviceManager.off('device:changed');
      this.deviceManager.off('device:error');
    }
    
    // Signal disposal
    this._emitEvent('output:disposed', {
      time: Date.now()
    });
  }
}

export default OutputManager;