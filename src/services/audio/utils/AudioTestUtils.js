/**
 * Analyze audio data for testing/verification
 * @param {Float32Array} audioData - Audio data to analyze
 * @param {Object} [options={}] - Analysis options
 * @returns {Object} Analysis results
 */
export function analyzeAudioData(audioData, options = {}) {
  const results = {
    samples: audioData.length,
    duration: audioData.length / (options.sampleRate || 44100),
    peakAmplitude: 0,
    rmsAmplitude: 0,
    dcOffset: 0,
    zeroCrossings: 0,
    clippingSamples: 0
  };
  
  // Calculate statistics
  let sum = 0;
  let sumOfSquares = 0;
  
  for (let i = 0; i < audioData.length; i++) {
    const sample = audioData[i];
    
    // Update peak amplitude
    const absSample = Math.abs(sample);
    if (absSample > results.peakAmplitude) {
      results.peakAmplitude = absSample;
    }
    
    // Sum for average (DC offset)
    sum += sample;
    
    // Sum of squares for RMS
    sumOfSquares += sample * sample;
    
    // Count zero crossings
    if (i > 0 && ((audioData[i - 1] >= 0 && sample < 0) || 
                  (audioData[i - 1] < 0 && sample >= 0))) {
      results.zeroCrossings++;
    }
    
    // Count clipping samples
    if (absSample >= 0.99) {
      results.clippingSamples++;
    }
  }
  
  // Calculate derived statistics
  results.dcOffset = sum / audioData.length;
  results.rmsAmplitude = Math.sqrt(sumOfSquares / audioData.length);
  results.zeroCrossingRate = results.zeroCrossings / audioData.length;
  results.clippingPercentage = (results.clippingSamples / audioData.length) * 100;
  
  // Estimate fundamental frequency if requested
  if (options.estimateFrequency) {
    results.estimatedFrequency = estimateFundamentalFrequency(
      audioData, 
      options.sampleRate || 44100,
      options.minFrequency || 20,
      options.maxFrequency || 20000
    );
  }
  
  return results;
}

/**
 * Estimate the fundamental frequency of a signal
 * @param {Float32Array} audioData - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} [minFrequency=20] - Minimum frequency to detect
 * @param {number} [maxFrequency=20000] - Maximum frequency to detect
 * @returns {number} Estimated frequency in Hz
 */
export function estimateFundamentalFrequency(audioData, sampleRate, minFrequency = 20, maxFrequency = 20000) {
  // Simple zero-crossing method for frequency estimation
  // More accurate methods would use autocorrelation or FFT
  
  // Count zero crossings
  let zeroCrossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    if ((audioData[i - 1] >= 0 && audioData[i] < 0) || 
        (audioData[i - 1] < 0 && audioData[i] >= 0)) {
      zeroCrossings++;
    }
  }
  
  // Calculate frequency from zero crossing rate
  // Divide by 2 because each cycle has two zero crossings
  const estimatedFrequency = (zeroCrossings * sampleRate) / (2 * audioData.length);
  
  // Enforce min/max range
  if (estimatedFrequency < minFrequency) return minFrequency;
  if (estimatedFrequency > maxFrequency) return maxFrequency;
  
  return estimatedFrequency;
}

/**
 * Measure latency between two audio buffers (e.g., input and output)
 * @param {Float32Array} referenceBuffer - Reference buffer
 * @param {Float32Array} comparisonBuffer - Buffer to compare against reference
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {Object} Latency information
 */
export function measureLatency(referenceBuffer, comparisonBuffer, sampleRate) {
  // Use cross-correlation to find the offset with maximum correlation
  const maxLag = Math.min(referenceBuffer.length, comparisonBuffer.length);
  let maxCorrelation = 0;
  let lag = 0;
  
  for (let i = 0; i < maxLag; i++) {
    let correlation = 0;
    let validSamples = 0;
    
    for (let j = 0; j < maxLag - i; j++) {
      if (j < referenceBuffer.length && j + i < comparisonBuffer.length) {
        correlation += referenceBuffer[j] * comparisonBuffer[j + i];
        validSamples++;
      }
    }
    
    // Normalize by sample count
    correlation /= validSamples;
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      lag = i;
    }
  }
  
  return {
    delaySamples: lag,
    delaySeconds: lag / sampleRate,
    delayMilliseconds: (lag / sampleRate) * 1000,
    correlationStrength: maxCorrelation
  };
}

/**
 * Create a test suite for an audio component
 * @param {Object} audioComponent - Component to test
 * @param {AudioContext} audioContext - Web Audio API context
 * @returns {Object} Test suite methods
 */
export function createTestSuite(audioComponent, audioContext) {
  return {
    /**
     * Run frequency response test
     * @param {Object} options - Test options
     * @returns {Object} Test results
     */
    testFrequencyResponse: (options = {}) => {
      const defaults = {
        startFreq: 20,
        endFreq: 20000,
        duration: 5,
        amplitude: 0.8,
        measurePoints: 20
      };
      
      const config = { ...defaults, ...options };
      const results = {
        frequencies: [],
        amplitudes: [],
        phases: []
      };
      
      // Generate logarithmically spaced frequencies
      const frequencies = [];
      const logStart = Math.log10(config.startFreq);
      const logEnd = Math.log10(config.endFreq);
      const logStep = (logEnd - logStart) / (config.measurePoints - 1);
      
      for (let i = 0; i < config.measurePoints; i++) {
        frequencies.push(Math.pow(10, logStart + i * logStep));
      }
      
      // Test each frequency
      frequencies.forEach(frequency => {
        // Create test tone
        const testTone = createTestTone(audioContext, {
          frequency,
          duration: 0.5,
          gain: config.amplitude
        });
        
        // Connect to component and analyze output
        const SignalProcessor = audioContext.createAnalyser();
        SignalProcessor.fftSize = 2048;
        
        testTone.connect(audioComponent.input);
        audioComponent.output.connect(SignalProcessor);
        SignalProcessor.connect(audioContext.destination);
        
        // Start tone
        testTone.start();
        
        // Analyze after a short delay
        setTimeout(() => {
          const frequencyData = new Float32Array(SignalProcessor.frequencyBinCount);
          SignalProcessor.getFloatFrequencyData(frequencyData);
          
          // Find amplitude at test frequency
          const binIndex = Math.round(frequency * SignalProcessor.frequencyBinCount / (audioContext.sampleRate / 2));
          const amplitude = frequencyData[binIndex];
          
          // Store result
          results.frequencies.push(frequency);
          results.amplitudes.push(amplitude);
          
          // Cleanup
          testTone.stop();
          testTone.disconnect();
        }, 200);
      });
      
      return results;
    },
    
    /**
     * Test dynamic range and compression
     * @param {Object} options - Test options
     * @returns {Object} Test results
     */
    testDynamicRange: (options = {}) => {
      const defaults = {
        frequency: 1000,
        minAmplitude: 0.001,
        maxAmplitude: 1.0,
        steps: 10
      };
      
      const config = { ...defaults, ...options };
      const results = {
        inputLevels: [],
        outputLevels: [],
        ratio: []
      };
      
      // Test increasing amplitudes
      const amplitudes = [];
      const logStart = Math.log10(config.minAmplitude);
      const logEnd = Math.log10(config.maxAmplitude);
      const logStep = (logEnd - logStart) / (config.steps - 1);
      
      for (let i = 0; i < config.steps; i++) {
        amplitudes.push(Math.pow(10, logStart + i * logStep));
      }
      
      // Test each amplitude
      amplitudes.forEach(amplitude => {
        // Create test tone
        const testTone = createTestTone(audioContext, {
          frequency: config.frequency,
          duration: 0.5,
          gain: amplitude
        });
        
        // Create SignalProcessors for input and output
        const inputSignalProcessor = audioContext.createAnalyser();
        const outputSignalProcessor = audioContext.createAnalyser();
        inputSignalProcessor.fftSize = 2048;
        outputSignalProcessor.fftSize = 2048;
        
        // Connect the signal path
        testTone.connect(inputSignalProcessor);
        inputSignalProcessor.connect(audioComponent.input);
        audioComponent.output.connect(outputSignalProcessor);
        outputSignalProcessor.connect(audioContext.destination);
        
        // Start tone
        testTone.start();
        
        // Analyze after a short delay
        setTimeout(() => {
          const inputTimeDomain = new Float32Array(inputSignalProcessor.fftSize);
          const outputTimeDomain = new Float32Array(outputSignalProcessor.fftSize);
          
          inputSignalProcessor.getFloatTimeDomainData(inputTimeDomain);
          outputSignalProcessor.getFloatTimeDomainData(outputTimeDomain);
          
          // Analyze signals
          const inputAnalysis = analyzeAudioData(inputTimeDomain);
          const outputAnalysis = analyzeAudioData(outputTimeDomain);
          
          // Store results
          results.inputLevels.push(inputAnalysis.rmsAmplitude);
          results.outputLevels.push(outputAnalysis.rmsAmplitude);
          results.ratio.push(outputAnalysis.rmsAmplitude / inputAnalysis.rmsAmplitude);
          
          // Cleanup
          testTone.stop();
          testTone.disconnect();
          inputSignalProcessor.disconnect();
          outputSignalProcessor.disconnect();
        }, 200);
      });
      
      return results;
    },
    
    /**
     * Test response to transients
     * @param {Object} options - Test options
     * @returns {Object} Test results
     */
    testTransientResponse: (options = {}) => {
      const defaults = {
        duration: 1,
        impulsePosition: 0.5,
        amplitude: 1.0
      };
      
      const config = { ...defaults, ...options };
      
      // Create impulse signal
      const impulseData = generateImpulse(
        config.duration, 
        audioContext.sampleRate, 
        config.impulsePosition, 
        config.amplitude
      );
      
      // Create buffer
      const impulseBuffer = createAudioBuffer(audioContext, impulseData);
      
      // Create source
      const impulseSource = audioContext.createBufferSource();
      impulseSource.buffer = impulseBuffer;
      
      // Create SignalProcessors for input and output
      const inputSignalProcessor = audioContext.createAnalyser();
      const outputSignalProcessor = audioContext.createAnalyser();
      inputSignalProcessor.fftSize = 2048;
      outputSignalProcessor.fftSize = 2048;
      
      // Connect the signal path
      impulseSource.connect(inputSignalProcessor);
      inputSignalProcessor.connect(audioComponent.input);
      audioComponent.output.connect(outputSignalProcessor);
      outputSignalProcessor.connect(audioContext.destination);
      
      // Start impulse
      impulseSource.start();
      
      // Record and analyze
      const inputData = new Float32Array(inputSignalProcessor.fftSize);
      const outputData = new Float32Array(outputSignalProcessor.fftSize);
      
      // Capture data after a short delay
      setTimeout(() => {
        inputSignalProcessor.getFloatTimeDomainData(inputData);
        outputSignalProcessor.getFloatTimeDomainData(outputData);
        
        // Calculate response time and decay
        // More sophisticated analysis would be done in a real implementation
        const inputPeak = Math.max(...Array.from(inputData).map(Math.abs));
        const outputPeak = Math.max(...Array.from(outputData).map(Math.abs));
        
        // Cleanup
        impulseSource.stop();
        impulseSource.disconnect();
        inputSignalProcessor.disconnect();
        outputSignalProcessor.disconnect();
        
        return {
          inputPeak,
          outputPeak,
          ratio: outputPeak / inputPeak,
          // Further analysis results would be added here
        };
      }, 200);
    }
  };
}

/**
 * Standard test frequencies covering the audible spectrum
 */
export const TEST_FREQUENCIES = [
  20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000
];

/**
 * Common test signal patterns
 */
export const TEST_PATTERNS = {
  SINE: 'sine',
  SQUARE: 'square',
  SAWTOOTH: 'sawtooth',
  NOISE_WHITE: 'white_noise',
  NOISE_PINK: 'pink_noise',
  IMPULSE: 'impulse',
  SINE_SWEEP: 'sine_sweep'
};

/**
 * Generate a sine wave
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} frequency - Frequency in Hz
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateSineWave(duration, sampleRate, frequency, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const angularFrequency = 2 * Math.PI * frequency;
  
  for (let i = 0; i < length; i++) {
    buffer[i] = amplitude * Math.sin(angularFrequency * i / sampleRate);
  }
  
  return buffer;
}

/**
 * Generate a sine sweep (chirp)
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} startFreq - Start frequency in Hz
 * @param {number} endFreq - End frequency in Hz
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateSineSweep(duration, sampleRate, startFreq, endFreq, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  
  // Logarithmic frequency sweep
  const startLog = Math.log(startFreq);
  const endLog = Math.log(endFreq);
  const logSweepRate = (endLog - startLog) / duration;
  
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const instantFreq = startFreq * Math.exp(logSweepRate * t);
    const phase = 2 * Math.PI * startFreq * (Math.exp(logSweepRate * t) - 1) / logSweepRate;
    buffer[i] = amplitude * Math.sin(phase);
  }
  
  return buffer;
}

/**
 * Generate a square wave
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} frequency - Frequency in Hz
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateSquareWave(duration, sampleRate, frequency, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const period = sampleRate / frequency;
  
  for (let i = 0; i < length; i++) {
    const position = i % period;
    buffer[i] = position < period / 2 ? amplitude : -amplitude;
  }
  
  return buffer;
}

/**
 * Generate a sawtooth wave
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} frequency - Frequency in Hz
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateSawtoothWave(duration, sampleRate, frequency, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const period = sampleRate / frequency;
  
  for (let i = 0; i < length; i++) {
    const position = i % period;
    buffer[i] = amplitude * (2 * (position / period) - 1);
  }
  
  return buffer;
}

/**
 * Generate white noise
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateWhiteNoise(duration, sampleRate, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  
  for (let i = 0; i < length; i++) {
    buffer[i] = amplitude * (2 * Math.random() - 1);
  }
  
  return buffer;
}

/**
 * Generate pink noise (1/f noise)
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generatePinkNoise(duration, sampleRate, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  
  // Simple pink noise approximation with filtered white noise
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  
  for (let i = 0; i < length; i++) {
    const white = 2 * Math.random() - 1;
    
    // Filter white noise
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    
    buffer[i] = amplitude * (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) / 6;
  }
  
  return buffer;
}

/**
 * Generate impulse signal
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} [position=0.5] - Position of impulse (0-1)
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateImpulse(duration, sampleRate, position = 0.5, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const impulseIndex = Math.floor(position * length);
  
  // Set all samples to 0, except the impulse
  buffer[impulseIndex] = amplitude;
  
  return buffer;
}

/**
 * Generate stepped frequency test signal
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate in Hz
 * @param {Array<number>} frequencies - Frequencies to step through
 * @param {number} [amplitude=1] - Amplitude (0-1)
 * @returns {Float32Array} Audio data
 */
export function generateFrequencySteps(duration, sampleRate, frequencies, amplitude = 1) {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const stepLength = Math.floor(length / frequencies.length);
  
  for (let i = 0; i < frequencies.length; i++) {
    const frequency = frequencies[i];
    const stepStart = i * stepLength;
    const stepEnd = (i + 1) * stepLength;
    
    // Generate sine wave for this step
    for (let j = stepStart; j < stepEnd && j < length; j++) {
      const t = j / sampleRate;
      buffer[j] = amplitude * Math.sin(2 * Math.PI * frequency * t);
    }
  }
  
  return buffer;
}

/**
 * Create an AudioBuffer from Float32Array data
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {Float32Array} data - Audio data
 * @param {number} [channels=1] - Number of channels
 * @returns {AudioBuffer} Audio buffer
 */
export function createAudioBuffer(audioContext, data, channels = 1) {
  const buffer = audioContext.createBuffer(channels, data.length, audioContext.sampleRate);
  
  // Fill first channel with data
  const channelData = buffer.getChannelData(0);
  channelData.set(data);
  
  // Duplicate to other channels if needed
  for (let i = 1; i < channels; i++) {
    buffer.getChannelData(i).set(channelData);
  }
  
  return buffer;
}

/**
 * Create an oscillator as a test tone generator
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {Object} [options={}] - Test tone options
 * @returns {OscillatorNode} Oscillator node
 */
export function createTestTone(audioContext, options = {}) {
  const defaults = {
    frequency: 1000,
    type: 'sine',
    duration: 1,
    gain: 0.5
  };
  
  const config = { ...defaults, ...options };
  
  const oscillator = audioContext.createOscillator();
  oscillator.type = config.type;
  oscillator.frequency.value = config.frequency;
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = config.gain;
  
  oscillator.connect(gainNode);
  
  return {
    connect: (destination) => {
      gainNode.connect(destination);
    },
    disconnect: () => {
      gainNode.disconnect();
    },
    start: (when = 0) => {
      oscillator.start(when);
      if (config.duration) {
        oscillator.stop(when + config.duration);
      }
    },
    stop: (when = 0) => {
      oscillator.stop(when);
    }
  };
}

/**
 * Create mock audio nodes for testing
 * @param {AudioContext} audioContext - Web Audio API context
 * @returns {Object} Mock nodes
 */
export function createMockNodes(audioContext) {
  return {
    /**
     * Create a mock gain node
     * @param {number} [initialGain=1] - Initial gain value
     * @returns {Object} Mock gain node
     */
    createMockGain: (initialGain = 1) => {
      const realGain = audioContext.createGain();
      realGain.gain.value = initialGain;
      
      return {
        input: realGain,
        output: realGain,
        gain: realGain.gain,
        setGain: (value) => {
          realGain.gain.value = value;
        },
        connect: (destination) => {
          realGain.connect(destination);
        },
        disconnect: () => {
          realGain.disconnect();
        }
      };
    },

    /**
     * Create a mock filter node
     * @param {string} [type='lowpass'] - Filter type
     * @param {number} [frequency=1000] - Filter frequency
     * @param {number} [Q=1] - Filter Q factor
     * @returns {Object} Mock filter node
     */
    createMockFilter: (type = 'lowpass', frequency = 1000, Q = 1) => {
      const realFilter = audioContext.createBiquadFilter();
      realFilter.type = type;
      realFilter.frequency.value = frequency;
      realFilter.Q.value = Q;
      
      return {
        input: realFilter,
        output: realFilter,
        type: realFilter.type,
        frequency: realFilter.frequency,
        Q: realFilter.Q,
        setType: (value) => {
          realFilter.type = value;
        },
        setFrequency: (value) => {
          realFilter.frequency.value = value;
        },
        setQ: (value) => {
          realFilter.Q.value = value;
        },
        connect: (destination) => {
          realFilter.connect(destination);
        },
        disconnect: () => {
          realFilter.disconnect();
        }
      };
    },
    
    /**
     * Create a mock SignalProcessor node
     * @param {number} [fftSize=2048] - FFT size
     * @returns {Object} Mock SignalProcessor node
     */
    createMockSignalProcessor: (fftSize = 2048) => {
      const realSignalProcessor = audioContext.createAnalyser();
      realSignalProcessor.fftSize = fftSize;
      
      return {
        input: realSignalProcessor,
        output: realSignalProcessor,
        getFrequencyData: () => {
          const data = new Float32Array(realSignalProcessor.frequencyBinCount);
          realSignalProcessor.getFloatFrequencyData(data);
          return data;
        },
        getWaveformData: () => {
          const data = new Float32Array(realSignalProcessor.fftSize);
          realSignalProcessor.getFloatTimeDomainData(data);
          return data;
        },
        connect: (destination) => {
          realSignalProcessor.connect(destination);
        },
        disconnect: () => {
          realSignalProcessor.disconnect();
        }
      };
    }
  };
}

/**
 * Create a logger for audio tests
 * @param {Function} [callback] - Log callback
 * @returns {Object} Logger methods
 */
export function createAudioTestLogger(callback) {
  const logCallback = callback || console.log;
  const logs = [];
  
  return {
    /**
     * Log a message
     * @param {string} message - Log message
     * @param {Object} [data] - Additional data
     */
    log: (message, data) => {
      const logEntry = {
        timestamp: Date.now(),
        message,
        data,
        level: 'info'
      };
      
      logs.push(logEntry);
      logCallback(`[${new Date(logEntry.timestamp).toISOString()}] ${message}`, data);
    },
    
    /**
     * Log an error
     * @param {string} message - Error message
     * @param {Error|Object} [error] - Error object or data
     */
    error: (message, error) => {
      const logEntry = {
        timestamp: Date.now(),
        message,
        error,
        level: 'error'
      };
      
      logs.push(logEntry);
      logCallback(`[${new Date(logEntry.timestamp).toISOString()}] ERROR: ${message}`, error);
    },
    
    /**
     * Log a warning
     * @param {string} message - Warning message
     * @param {Object} [data] - Additional data
     */
    warn: (message, data) => {
      const logEntry = {
        timestamp: Date.now(),
        message,
        data,
        level: 'warning'
      };
      
      logs.push(logEntry);
      logCallback(`[${new Date(logEntry.timestamp).toISOString()}] WARNING: ${message}`, data);
    },
    
    /**
     * Get all logs
     * @returns {Array} Log entries
     */
    getLogs: () => {
      return [...logs];
    },
    
    /**
     * Clear all logs
     */
    clearLogs: () => {
      logs.length = 0;
    }
  };
}

// Export default object with all utilities
export default {
  TEST_FREQUENCIES,
  TEST_PATTERNS,
  generateSineWave,
  generateSineSweep,
  generateSquareWave,
  generateSawtoothWave,
  generateWhiteNoise,
  generatePinkNoise,
  generateImpulse,
  generateFrequencySteps,
  createAudioBuffer,
  createTestTone,
  analyzeAudioData,
  estimateFundamentalFrequency,
  measureLatency,
  createTestSuite,
  createMockNodes,
  createAudioTestLogger
};