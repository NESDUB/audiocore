// src/utils/AudioPolyfills.js
// Audio API polyfills and compatibility fixes

/**
 * This module provides polyfills and compatibility fixes for
 * the Web Audio API across different browsers. It detects available
 * features and provides fallbacks when necessary.
 */
(function() {
  'use strict';

  // Track which polyfills have been applied
  const appliedPolyfills = [];

  // AudioContext polyfill
  if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext || 
                          window.mozAudioContext || 
                          window.msAudioContext;
    
    if (window.AudioContext) {
      appliedPolyfills.push('AudioContext');
    } else {
      console.warn('AudioPolyfills: AudioContext not supported in this browser');
    }
  }

  // OfflineAudioContext polyfill
  if (!window.OfflineAudioContext) {
    window.OfflineAudioContext = window.webkitOfflineAudioContext || 
                                window.mozOfflineAudioContext;
    
    if (window.OfflineAudioContext) {
      appliedPolyfills.push('OfflineAudioContext');
    } else {
      console.warn('AudioPolyfills: OfflineAudioContext not supported in this browser');
    }
  }

  // AudioParam automation methods
  if (window.AudioContext) {
    const testContext = new AudioContext();
    const testParam = testContext.createGain().gain;
    
    // Test and polyfill setValueAtTime
    if (!testParam.setValueAtTime) {
      AudioParam.prototype.setValueAtTime = function(value, time) {
        this.value = value;
      };
      appliedPolyfills.push('setValueAtTime');
    }
    
    // Test and polyfill linearRampToValueAtTime
    if (!testParam.linearRampToValueAtTime) {
      AudioParam.prototype.linearRampToValueAtTime = function(value, time) {
        this.value = value;
      };
      appliedPolyfills.push('linearRampToValueAtTime');
    }
    
    // Test and polyfill exponentialRampToValueAtTime
    if (!testParam.exponentialRampToValueAtTime) {
      AudioParam.prototype.exponentialRampToValueAtTime = function(value, time) {
        this.value = value;
      };
      appliedPolyfills.push('exponentialRampToValueAtTime');
    }
    
    // Test and polyfill setTargetAtTime
    if (!testParam.setTargetAtTime) {
      AudioParam.prototype.setTargetAtTime = function(target, startTime, timeConstant) {
        this.value = target;
      };
      appliedPolyfills.push('setTargetAtTime');
    }
    
    // Alias for older method names
    if (testParam.setTargetAtTime && !testParam.setTargetValueAtTime) {
      AudioParam.prototype.setTargetValueAtTime = AudioParam.prototype.setTargetAtTime;
      appliedPolyfills.push('setTargetValueAtTime (alias)');
    }
    
    // Test and polyfill setValueCurveAtTime
    if (!testParam.setValueCurveAtTime) {
      AudioParam.prototype.setValueCurveAtTime = function(values, startTime, duration) {
        this.value = values[0];
      };
      appliedPolyfills.push('setValueCurveAtTime');
    }
    
    // Test and polyfill cancelScheduledValues
    if (!testParam.cancelScheduledValues) {
      AudioParam.prototype.cancelScheduledValues = function(startTime) {
        return;
      };
      appliedPolyfills.push('cancelScheduledValues');
    }
    
    // Clean up test context
    if (testContext.close) {
      testContext.close();
    }
  }

  // Ensure StereoPannerNode is available
  if (window.AudioContext && !window.StereoPannerNode) {
    // Check if createStereoPanner exists
    const testContext = new AudioContext();
    if (testContext.createStereoPanner) {
      // Method exists but node type doesn't, just use it
      appliedPolyfills.push('StereoPannerNode type');
    } else {
      // Need to implement stereo panner using gain nodes
      window.AudioContext.prototype.createStereoPanner = function() {
        const splitter = this.createChannelSplitter(2);
        const merger = this.createChannelMerger(2);
        const leftGain = this.createGain();
        const rightGain = this.createGain();
        
        // Connect the graph
        splitter.connect(leftGain, 0);
        splitter.connect(rightGain, 1);
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        
        // Create a pan property
        const pannerNode = splitter;
        
        // Add output node reference
        pannerNode._outputNode = merger;
        
        // Add connect/disconnect methods
        const originalConnect = pannerNode.connect;
        pannerNode.connect = function(target) {
          return this._outputNode.connect.apply(this._outputNode, arguments);
        };
        
        const originalDisconnect = pannerNode.disconnect;
        pannerNode.disconnect = function() {
          return this._outputNode.disconnect.apply(this._outputNode, arguments);
        };
        
        // Add pan parameter
        pannerNode.pan = {
          value: 0,
          setValueAtTime: function(value, time) {
            const v = Math.max(-1, Math.min(1, value));
            const x = (v + 1) / 2;
            const leftValue = Math.cos(x * Math.PI / 2);
            const rightValue = Math.sin(x * Math.PI / 2);
            
            leftGain.gain.setValueAtTime(leftValue, time);
            rightGain.gain.setValueAtTime(rightValue, time);
            this.value = v;
          }
        };
        
        // Initialize to center
        pannerNode.pan.setValueAtTime(0, 0);
        
        appliedPolyfills.push('createStereoPanner');
        return pannerNode;
      };
    }
    
    // Clean up test context
    if (testContext.close) {
      testContext.close();
    }
  }

  // Ensure SignalProcessorNode methods exist
    if (window.AudioContext) {
      // Add createAnalyser method to AudioContext prototype
      if (!AudioContext.prototype.createAnalyser) {
        // We can't polyfill this with itself - we should provide a fallback or log an error
        AudioContext.prototype.createAnalyser = function() {
          console.warn('createAnalyser polyfill called, but no implementation available');
          // Return a mock object or null
          return null;
        };
        appliedPolyfills.push('createAnalyser (stub)');
      }
      
      // Now create the test context and continue with existing code
      const testContext = new AudioContext();
      const signalprocessor = testContext.createAnalyser();

      // Test and polyfill getFloatTimeDomainData
      if (!signalprocessor.getFloatTimeDomainData) {
        // Make sure we're applying methods to the correct prototype
        AnalyserNode.prototype.getFloatTimeDomainData = function(array) {
          const uint8Array = new Uint8Array(array.length);
          this.getByteTimeDomainData(uint8Array);

          for (let i = 0; i < array.length; i++) {
            array[i] = (uint8Array[i] - 128) / 128;
          }
        };
        appliedPolyfills.push('getFloatTimeDomainData');
      }

      // Test and polyfill getFloatFrequencyData
      if (!signalprocessor.getFloatFrequencyData) {
        // Make sure we're applying methods to the correct prototype
        AnalyserNode.prototype.getFloatFrequencyData = function(array) {
          const uint8Array = new Uint8Array(array.length);
          this.getByteFrequencyData(uint8Array);

          for (let i = 0; i < array.length; i++) {
            array[i] = uint8Array[i] / 255 * (this.maxDecibels - this.minDecibels) + this.minDecibels;
          }
        };
        appliedPolyfills.push('getFloatFrequencyData');
      }

      // Add a reference to the SignalProcessorNode
      window.SignalProcessorNode = AnalyserNode;

      // Clean up test context
      if (testContext.close) {
        testContext.close();
      }
    }

  // RequestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                  window.mozRequestAnimationFrame || 
                                  window.msRequestAnimationFrame || 
                                  function(callback) {
                                    return window.setTimeout(function() {
                                      callback(Date.now());
                                    }, 1000 / 60);
                                  };
    appliedPolyfills.push('requestAnimationFrame');
  }

  // CancelAnimationFrame polyfill
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = window.webkitCancelAnimationFrame || 
                                 window.mozCancelAnimationFrame || 
                                 window.msCancelAnimationFrame || 
                                 function(id) {
                                   clearTimeout(id);
                                 };
    appliedPolyfills.push('cancelAnimationFrame');
  }

  // Add AudioNode.disconnect(destination) support where needed
  if (window.AudioContext) {
    const testContext = new AudioContext();
    const testNode = testContext.createGain();
    const destParam = testContext.createGain().gain;
    
    // Feature detect AudioNode.prototype.disconnect(AudioNode | AudioParam)
    try {
      // Modern browsers support selective disconnection
      testNode.disconnect(destParam);
      
      // If we get here, selective disconnect is supported
      // Therefore, no polyfill needed
    } catch (e) {
      if (e.name === 'TypeError') {
        // Selective disconnect not supported, need to polyfill
        
        // Save the original method
        const originalDisconnect = AudioNode.prototype.disconnect;
        
        // Override with polyfill
        AudioNode.prototype.disconnect = function(target) {
          if (target === undefined) {
            // No arguments - disconnect all
            originalDisconnect.apply(this);
            return;
          }
          
          // Since selective disconnection isn't supported,
          // we need to disconnect everything and reconnect
          // all except the target.
          
          // Not a proper implementation, just a warning
          console.warn('AudioPolyfills: Selective disconnect not supported in this browser');
          
          // Just do regular disconnect for now - this limitation
          // would need to be handled at app level
          originalDisconnect.apply(this);
        };
        
        appliedPolyfills.push('AudioNode.disconnect (limited)');
      }
    }
    
    // Clean up test context
    if (testContext.close) {
      testContext.close();
    }
  }

  // Log which polyfills were applied
  if (appliedPolyfills.length > 0) {
    console.log('Audio polyfills loaded: ' + appliedPolyfills.join(', '));
  } else {
    console.log('Audio polyfills loaded (none needed)');
  }
})();