/**
 * AudioUtils.js
 * Provides a collection of utility functions and algorithms for audio processing,
 * manipulation, and conversion. Centralizes common audio operations used
 * throughout the Audio Domain to ensure consistency, performance, and code reuse.
 */

// Utility class for audio operations
class AudioUtils {
  /**
   * Convert between various audio data formats
   * @param {ArrayBuffer|Float32Array|Int16Array} buffer - Source buffer
   * @param {Object} options - Conversion options
   * @param {string} options.fromType - Source type ('float32', 'int16', 'arraybuffer')
   * @param {string} options.toType - Target type ('float32', 'int16', 'arraybuffer')
   * @param {number} [options.channelCount] - Number of channels
   * @param {number} [options.sampleRate] - Sample rate
   * @returns {ArrayBuffer|Float32Array|Int16Array} - Converted buffer
   */
  static convertAudioBuffer(buffer, options) {
    const { fromType, toType, channelCount, sampleRate } = options;
    
    // Handle Float32Array to Int16Array conversion (common for file output)
    if (fromType === 'float32' && toType === 'int16') {
      const floatData = buffer;
      const intData = new Int16Array(floatData.length);
      
      // Convert normalized float (-1.0 to 1.0) to int16 (-32768 to 32767)
      for (let i = 0; i < floatData.length; i++) {
        // Apply dithering to reduce quantization noise
        const dither = AudioUtils._generateTriangularDither() / 32768.0;
        // Convert with clipping protection
        const sample = Math.max(-1.0, Math.min(1.0, floatData[i] + dither));
        intData[i] = Math.floor(sample * 32767);
      }
      
      return intData;
    }
    
    // Handle Int16Array to Float32Array conversion (common for processing)
    if (fromType === 'int16' && toType === 'float32') {
      const intData = buffer;
      const floatData = new Float32Array(intData.length);
      
      // Convert int16 (-32768 to 32767) to normalized float (-1.0 to 1.0)
      for (let i = 0; i < intData.length; i++) {
        floatData[i] = intData[i] / 32768.0;
      }
      
      return floatData;
    }
    
    // Handle ArrayBuffer to Float32Array conversion (common after fetch)
    if (fromType === 'arraybuffer' && toType === 'float32') {
      // Assume 16-bit PCM by default if not specified
      const view = new Int16Array(buffer);
      const floatData = new Float32Array(view.length);
      
      // Convert int16 to float
      for (let i = 0; i < view.length; i++) {
        floatData[i] = view[i] / 32768.0;
      }
      
      return floatData;
    }
    
    // Handle Float32Array to ArrayBuffer conversion
    if (fromType === 'float32' && toType === 'arraybuffer') {
      const floatData = buffer;
      const intData = new Int16Array(floatData.length);
      
      // Convert float to int16
      for (let i = 0; i < floatData.length; i++) {
        const dither = AudioUtils._generateTriangularDither() / 32768.0;
        const sample = Math.max(-1.0, Math.min(1.0, floatData[i] + dither));
        intData[i] = Math.floor(sample * 32767);
      }
      
      return intData.buffer;
    }
    
    // Default case - return original buffer if conversion not supported
    console.warn(`AudioUtils: Unsupported conversion from ${fromType} to ${toType}`);
    return buffer;
  }
  
  /**
   * Generate triangular dither for audio conversion
   * @private
   * @returns {number} Dither value
   */
  static _generateTriangularDither() {
    // Triangular dither is the sum of two uniform random values
    const r1 = Math.random() * 2 - 1;
    const r2 = Math.random() * 2 - 1;
    return r1 + r2;
  }
  
  /**
   * Extract specific channel from multi-channel buffer
   * @param {AudioBuffer} buffer - Audio buffer
   * @param {number} channelIndex - Channel index
   * @returns {Float32Array} Channel data
   */
  static extractChannel(buffer, channelIndex) {
    if (buffer.numberOfChannels === undefined) {
      throw new Error('Not an AudioBuffer');
    }
    
    if (channelIndex >= buffer.numberOfChannels) {
      throw new Error(`Channel index ${channelIndex} out of range`);
    }
    
    // Get the channel data as Float32Array
    return buffer.getChannelData(channelIndex);
  }
  
  /**
   * Mix multiple channels down to mono
   * @param {AudioBuffer} buffer - Audio buffer
   * @returns {Float32Array} Mono data
   */
  static mixToMono(buffer) {
    const channels = buffer.numberOfChannels;
    const length = buffer.length;
    const monoData = new Float32Array(length);
    
    // For each sample, average across all channels
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let c = 0; c < channels; c++) {
        sum += buffer.getChannelData(c)[i];
      }
      monoData[i] = sum / channels;
    }
    
    return monoData;
  }
  
  /**
   * Interleave separate channel data into single buffer
   * @param {Array<Float32Array>} channelData - Array of channel data
   * @returns {Float32Array} Interleaved data
   */
  static interleaveChannels(channelData) {
    const channels = channelData.length;
    const length = channelData[0].length;
    const interleavedData = new Float32Array(channels * length);
    
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < channels; c++) {
        interleavedData[i * channels + c] = channelData[c][i];
      }
    }
    
    return interleavedData;
  }
  
  /**
   * De-interleave a buffer into separate channel data
   * @param {Float32Array} interleavedData - Interleaved data
   * @param {number} channels - Number of channels
   * @returns {Array<Float32Array>} Array of channel data
   */
  static deinterleaveChannels(interleavedData, channels) {
    const length = Math.floor(interleavedData.length / channels);
    const channelData = [];
    
    for (let c = 0; c < channels; c++) {
      channelData[c] = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        channelData[c][i] = interleavedData[i * channels + c];
      }
    }
    
    return channelData;
  }
  
  /**
   * Resample audio data to a new sample rate
   * @param {Float32Array} data - Audio data
   * @param {number} originalSampleRate - Original sample rate
   * @param {number} targetSampleRate - Target sample rate
   * @returns {Float32Array} Resampled data
   */
  static resampleAudio(data, originalSampleRate, targetSampleRate) {
    // Simple linear interpolation resampling
    // For production use, consider a more sophisticated algorithm
    
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.floor(data.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const fraction = position - index;
      
      if (index + 1 < data.length) {
        result[i] = data[index] * (1 - fraction) + data[index + 1] * fraction;
      } else {
        result[i] = data[index];
      }
    }
    
    return result;
  }
  
  // =============== ANALYSIS UTILITIES ===============
  
  /**
   * Calculate RMS (Root Mean Square) volume of buffer
   * @param {Float32Array} buffer - Audio buffer
   * @returns {number} RMS value
   */
  static calculateRMS(buffer) {
    if (!buffer || !buffer.length) return 0;
    
    let sum = 0;
    const length = buffer.length;
    
    // Sum of squares
    for (let i = 0; i < length; i++) {
      sum += buffer[i] * buffer[i];
    }
    
    // Return RMS value
    return Math.sqrt(sum / length);
  }
  
  /**
   * Calculate frequency band energy
   * @param {Float32Array|Uint8Array} frequencyData - Frequency data
   * @param {number} lowFreq - Low frequency bound (Hz)
   * @param {number} highFreq - High frequency bound (Hz)
   * @param {number} sampleRate - Sample rate (Hz)
   * @param {number} fftSize - FFT size
   * @returns {number} Energy in band (0-1)
   */
  static calculateBandEnergy(frequencyData, lowFreq, highFreq, sampleRate, fftSize) {
    // Calculate bin indices for frequency range
    const binCount = frequencyData.length;
    const nyquist = sampleRate / 2;
    
    const lowBin = Math.floor(lowFreq / nyquist * binCount);
    const highBin = Math.ceil(highFreq / nyquist * binCount);
    
    // Ensure bins are in valid range
    const startBin = Math.max(0, Math.min(binCount - 1, lowBin));
    const endBin = Math.max(startBin, Math.min(binCount - 1, highBin));
    
    // Sum energy in the specified frequency range
    let sum = 0;
    let count = 0;
    
    // Check if we're dealing with Float32Array (in dB scale) or Uint8Array (0-255)
    const isFloat = frequencyData instanceof Float32Array;
    
    for (let i = startBin; i <= endBin; i++) {
      if (isFloat) {
        // Convert from dB to linear scale
        sum += Math.pow(10, frequencyData[i] / 20);
      } else {
        // Normalize 0-255 to 0-1
        sum += frequencyData[i] / 255;
      }
      count++;
    }
    
    if (count === 0) return 0;
    
    // Return average energy (normalized)
    const avgEnergy = sum / count;
    
    // For float data, convert back to normalized scale
    if (isFloat) {
      // Normalize typical dB range (-100 to 0) to 0-1
      const dbEnergy = 20 * Math.log10(avgEnergy);
      return Math.max(0, Math.min(1, (dbEnergy + 100) / 100));
    }
    
    return avgEnergy;
  }
  
  /**
   * Find peaks in frequency data
   * @param {Float32Array|Uint8Array} frequencyData - Frequency data
   * @param {number} [minPeakHeight=0.5] - Minimum peak height (0-1)
   * @param {number} [minPeakDistance=3] - Minimum bins between peaks
   * @returns {Array<Object>} Array of peak objects with bin and value properties
   */
  static findPeaks(frequencyData, minPeakHeight = 0.5, minPeakDistance = 3) {
    const peaks = [];
    const isFloat = frequencyData instanceof Float32Array;
    
    // Normalize minimum peak height based on data type
    let normalizedMinHeight;
    if (isFloat) {
      // Convert from 0-1 to dB scale
      normalizedMinHeight = 20 * Math.log10(minPeakHeight);
    } else {
      // Convert from 0-1 to 0-255 scale
      normalizedMinHeight = minPeakHeight * 255;
    }
    
    // Find local maxima in the frequency data
    for (let i = 1; i < frequencyData.length - 1; i++) {
      if (frequencyData[i] > frequencyData[i - 1] && 
          frequencyData[i] > frequencyData[i + 1] && 
          frequencyData[i] > normalizedMinHeight) {
        // Found a peak
        peaks.push({
          bin: i,
          value: frequencyData[i]
        });
      }
    }
    
    // Filter peaks by minimum distance
    if (minPeakDistance > 1) {
      const filteredPeaks = [];
      peaks.sort((a, b) => b.value - a.value); // Sort by value (descending)
      
      const usedBins = new Set();
      
      for (const peak of peaks) {
        // Check if this peak is too close to an already selected peak
        let tooClose = false;
        for (let bin = peak.bin - minPeakDistance; bin <= peak.bin + minPeakDistance; bin++) {
          if (usedBins.has(bin)) {
            tooClose = true;
            break;
          }
        }
        
        if (!tooClose) {
          filteredPeaks.push(peak);
          usedBins.add(peak.bin);
        }
      }
      
      // Sort by bin for return
      return filteredPeaks.sort((a, b) => a.bin - b.bin);
    }
    
    return peaks;
  }
  
  /**
   * Create a window function for signal processing
   * @param {number} length - Window length
   * @param {string} [type='hann'] - Window type ('hann', 'hamming', 'blackman', 'rectangular')
   * @returns {Float32Array} Window function
   */
  static createWindowFunction(length, type = 'hann') {
    const window = new Float32Array(length);
    
    switch (type.toLowerCase()) {
      case 'hamming':
        // Hamming window: 0.54 - 0.46 * cos(2π * n / (N-1))
        for (let i = 0; i < length; i++) {
          window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (length - 1));
        }
        break;
        
      case 'blackman':
        // Blackman window: 0.42 - 0.5 * cos(2π * n / (N-1)) + 0.08 * cos(4π * n / (N-1))
        for (let i = 0; i < length; i++) {
          window[i] = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (length - 1)) + 
                     0.08 * Math.cos(4 * Math.PI * i / (length - 1));
        }
        break;
        
      case 'rectangular':
        // Rectangular window: all 1s
        for (let i = 0; i < length; i++) {
          window[i] = 1.0;
        }
        break;
        
      case 'hann':
      default:
        // Hann window: 0.5 * (1 - cos(2π * n / (N-1)))
        for (let i = 0; i < length; i++) {
          window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
        }
        break;
    }
    
    return window;
  }
  
  /**
   * Apply a window function to a signal
   * @param {Float32Array} signal - Input signal
   * @param {Float32Array|string} window - Window function or window type string
   * @returns {Float32Array} Windowed signal
   */
  static applyWindow(signal, window) {
    // If window is a string, create the window function
    let windowFunction;
    if (typeof window === 'string') {
      windowFunction = AudioUtils.createWindowFunction(signal.length, window);
    } else {
      windowFunction = window;
    }
    
    if (windowFunction.length !== signal.length) {
      throw new Error('Window length must match signal length');
    }
    
    // Apply window
    const result = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
      result[i] = signal[i] * windowFunction[i];
    }
    
    return result;
  }
  
  // =============== PARAMETER CONVERSION UTILITIES ===============
  
  /**
   * Convert linear amplitude to decibels
   * @param {number} value - Linear amplitude value
   * @param {number} [minDb=-100] - Minimum dB value
   * @returns {number} Value in decibels
   */
  static linearToDecibels(value, minDb = -100) {
    // Avoid log(0)
    if (value <= 0) {
      return minDb;
    }
    
    // 20 * log10(value)
    return Math.max(minDb, 20 * Math.log10(value));
  }
  
  /**
   * Convert decibels to linear amplitude
   * @param {number} db - Decibel value
   * @returns {number} Linear amplitude
   */
  static decibelsToLinear(db) {
    // 10^(db/20)
    return Math.pow(10, db / 20);
  }
  
  /**
   * Convert frequency to MIDI note number
   * @param {number} frequency - Frequency in Hz
   * @returns {number} MIDI note number
   */
  static frequencyToMidi(frequency) {
    // A4 = 69, 440Hz
    // MIDI note = 69 + 12 * log2(frequency / 440)
    return 69 + 12 * Math.log2(frequency / 440);
  }
  
  /**
   * Convert MIDI note number to frequency
   * @param {number} midi - MIDI note number
   * @returns {number} Frequency in Hz
   */
  static midiToFrequency(midi) {
    // Frequency = 440 * 2^((midi - 69) / 12)
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  
  /**
   * Calculate semitone ratio for pitch shifting
   * @param {number} semitones - Number of semitones (positive or negative)
   * @returns {number} Pitch ratio
   */
  static calculateSemitoneRatio(semitones) {
    // Each semitone is 2^(1/12) ratio
    return Math.pow(2, semitones / 12);
  }
  
  /**
   * Convert BPM to milliseconds per beat
   * @param {number} bpm - Tempo in beats per minute
   * @returns {number} Milliseconds per beat
   */
  static bpmToMs(bpm) {
    return 60000 / bpm;
  }
  
  /**
   * Convert BPM to seconds per beat
   * @param {number} bpm - Tempo in beats per minute
   * @returns {number} Seconds per beat
   */
  static bpmToSeconds(bpm) {
    return 60 / bpm;
  }
  
  // =============== AUDIO CONTEXT UTILITIES ===============
  
  /**
   * Safely create AudioParam automation
   * @param {AudioParam} audioParam - Audio parameter to automate
   * @param {number} value - Target value
   * @param {number} [timeConstant=0.001] - Time constant for transition
   * @returns {AudioParam} The audio parameter
   */
  static setParamValue(audioParam, value, timeConstant = 0.001) {
    if (!audioParam || !audioParam.setTargetAtTime) {
      console.warn('Invalid AudioParam provided to setParamValue');
      return audioParam;
    }
    
    const now = audioParam.context.currentTime;
    
    if (timeConstant <= 0) {
      // Immediate change
      audioParam.setValueAtTime(value, now);
    } else {
      // Smooth transition
      audioParam.setTargetAtTime(value, now, timeConstant);
    }
    
    return audioParam;
  }
  
  /**
   * Schedule a sequence of parameter changes
   * @param {AudioParam} audioParam - Audio parameter to automate
   * @param {Array<Object>} points - Array of time-value points
   * @returns {AudioParam} The audio parameter
   */
  static scheduleParameterCurve(audioParam, points) {
    if (!audioParam || !audioParam.setValueCurveAtTime || !points.length) {
      return audioParam;
    }
    
    const now = audioParam.context.currentTime;
    
    // Cancel any scheduled changes
    audioParam.cancelScheduledValues(now);
    
    // First point should be setValueAtTime
    audioParam.setValueAtTime(points[0].value, now + points[0].time);
    
    // Schedule remaining points
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const time = now + point.time;
      const prevTime = now + points[i - 1].time;
      
      // Determine curve type (defaults to linear)
      switch (point.curve || 'linear') {
        case 'exponential':
          // Avoid zero values with exponential ramps
          if (point.value === 0) {
            audioParam.linearRampToValueAtTime(0.00001, time);
            audioParam.setValueAtTime(0, time);
          } else {
            audioParam.exponentialRampToValueAtTime(point.value, time);
          }
          break;
        case 'target':
          audioParam.setTargetAtTime(
            point.value, 
            prevTime, 
            point.timeConstant || 0.1
          );
          break;
        case 'step':
          audioParam.setValueAtTime(point.value, time);
          break;
        case 'linear':
        default:
          audioParam.linearRampToValueAtTime(point.value, time);
          break;
      }
    }
    
    return audioParam;
  }
  
  /**
   * Safely connect Web Audio nodes with error handling
   * @param {AudioNode} source - Source node
   * @param {AudioNode|AudioParam} destination - Destination node or param
   * @param {number} [outputIndex=0] - Output index on source
   * @param {number} [inputIndex=0] - Input index on destination (if AudioNode)
   * @returns {boolean} Success status
   */
  static connectNodes(source, destination, outputIndex = 0, inputIndex = 0) {
    if (!source || !destination) {
      console.error('Invalid nodes provided to connectNodes');
      return false;
    }
    
    try {
      // Check if destination is AudioParam
      if (destination instanceof AudioParam) {
        source.connect(destination, outputIndex);
      } else {
        // Assume AudioNode
        source.connect(destination, outputIndex, inputIndex);
      }
      return true;
    } catch (error) {
      console.error('Error connecting audio nodes:', error);
      return false;
    }
  }
  
  /**
   * Safely disconnect Web Audio nodes with error handling
   * @param {AudioNode} source - Source node
   * @param {AudioNode|AudioParam} [destination] - Optional destination to disconnect
   * @returns {boolean} Success status
   */
  static disconnectNodes(source, destination) {
    if (!source) {
      console.error('Invalid source node provided to disconnectNodes');
      return false;
    }
    
    try {
      if (destination) {
        // Disconnect specific destination
        if (destination instanceof AudioParam) {
          source.disconnect(destination);
        } else {
          source.disconnect(destination);
        }
      } else {
        // Disconnect all
        source.disconnect();
      }
      return true;
    } catch (error) {
      console.error('Error disconnecting audio nodes:', error);
      return false;
    }
  }
  
  // =============== FORMAT DETECTION UTILITIES ===============
  
  /**
   * Detect MIME type from file header
   * @param {ArrayBuffer} buffer - File data
   * @returns {string} MIME type
   */
  static detectMimeType(buffer) {
    // Check file signatures in header
    const header = new Uint8Array(buffer.slice(0, 12));
    
    // WAVE format starts with "RIFF" and contains "WAVE"
    if (header[0] === 0x52 && header[1] === 0x49 && 
        header[2] === 0x46 && header[3] === 0x46 &&
        header[8] === 0x57 && header[9] === 0x41 && 
        header[10] === 0x56 && header[11] === 0x45) {
      return 'audio/wav';
    }
    
    // MP3 starts with ID3 or MPEG frame sync
    if ((header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) ||
        ((header[0] & 0xFF) === 0xFF && (header[1] & 0xE0) === 0xE0)) {
      return 'audio/mpeg';
    }
    
    // Ogg starts with "OggS"
    if (header[0] === 0x4F && header[1] === 0x67 && 
        header[2] === 0x67 && header[3] === 0x53) {
      return 'audio/ogg';
    }
    
    // FLAC starts with "fLaC"
    if (header[0] === 0x66 && header[1] === 0x4C && 
        header[2] === 0x61 && header[3] === 0x43) {
      return 'audio/flac';
    }
    
    // AAC/M4A starts with ftyp
    if (header[4] === 0x66 && header[5] === 0x74 && 
        header[6] === 0x79 && header[7] === 0x70) {
      return 'audio/aac';
    }
    
    // Unknown format
    return 'application/octet-stream';
  }
  
  /**
   * Get supported audio formats for current browser
   * @returns {Object} Object with format support information
   */
  static getSupportedFormats() {
    const audio = document.createElement('audio');
    
    // Check support for various formats
    const formats = {
      mp3: {
        mimeType: 'audio/mpeg',
        supported: audio.canPlayType('audio/mpeg') !== ''
      },
      wav: {
        mimeType: 'audio/wav',
        supported: audio.canPlayType('audio/wav') !== ''
      },
      ogg: {
        mimeType: 'audio/ogg; codecs="vorbis"',
        supported: audio.canPlayType('audio/ogg; codecs="vorbis"') !== ''
      },
      opus: {
        mimeType: 'audio/ogg; codecs="opus"',
        supported: audio.canPlayType('audio/ogg; codecs="opus"') !== ''
      },
      flac: {
        mimeType: 'audio/flac',
        supported: audio.canPlayType('audio/flac') !== ''
      },
      aac: {
        mimeType: 'audio/aac',
        supported: audio.canPlayType('audio/aac') !== ''
      }
    };
    
    return formats;
  }
  
  /**
   * Check if Web Audio API is supported
   * @returns {boolean} Support status
   */
  static isWebAudioSupported() {
    return typeof AudioContext !== 'undefined' || 
           typeof webkitAudioContext !== 'undefined';
  }
  
  /**
   * Check if AudioWorklet is supported
   * @returns {boolean} Support status
   */
  static isAudioWorkletSupported() {
    if (!AudioUtils.isWebAudioSupported()) {
      return false;
    }
    
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    
    const isSupported = Boolean(ctx.audioWorklet);
    
    // Clean up
    ctx.close();
    
    return isSupported;
  }
  
  // =============== WAVEFORM GENERATION UTILITIES ===============
  
  /**
   * Generate sine wave data
   * @param {number} length - Buffer length
   * @param {number} frequency - Frequency in Hz
   * @param {number} sampleRate - Sample rate in Hz
   * @param {number} [amplitude=1] - Amplitude (0-1)
   * @returns {Float32Array} Sine wave data
   */
  static generateSineWave(length, frequency, sampleRate, amplitude = 1) {
    const buffer = new Float32Array(length);
    const angularFrequency = 2 * Math.PI * frequency / sampleRate;
    
    for (let i = 0; i < length; i++) {
      buffer[i] = amplitude * Math.sin(angularFrequency * i);
    }
    
    return buffer;
  }
  
  /**
   * Generate square wave data
   * @param {number} length - Buffer length
   * @param {number} frequency - Frequency in Hz
   * @param {number} sampleRate - Sample rate in Hz
   * @param {number} [amplitude=1] - Amplitude (0-1)
   * @param {number} [dutyCycle=0.5] - Duty cycle (0-1)
   * @returns {Float32Array} Square wave data
   */
  static generateSquareWave(length, frequency, sampleRate, amplitude = 1, dutyCycle = 0.5) {
    const buffer = new Float32Array(length);
    const period = sampleRate / frequency;
    
    for (let i = 0; i < length; i++) {
      const phase = (i % period) / period;
      buffer[i] = phase < dutyCycle ? amplitude : -amplitude;
    }
    
    return buffer;
  }
  
  /**
   * Generate sawtooth wave data
   * @param {number} length - Buffer length
   * @param {number} frequency - Frequency in Hz
   * @param {number} sampleRate - Sample rate in Hz
   * @param {number} [amplitude=1] - Amplitude (0-1)
   * @returns {Float32Array} Sawtooth wave data
   */
  static generateSawtoothWave(length, frequency, sampleRate, amplitude = 1) {
    const buffer = new Float32Array(length);
    const period = sampleRate / frequency;
    
    for (let i = 0; i < length; i++) {
      const phase = (i % period) / period;
      buffer[i] = amplitude * (2 * phase - 1);
    }
    
    return buffer;
  }
  
  /**
   * Generate triangle wave data
   * @param {number} length - Buffer length
   * @param {number} frequency - Frequency in Hz
   * @param {number} sampleRate - Sample rate in Hz
   * @param {number} [amplitude=1] - Amplitude (0-1)
   * @returns {Float32Array} Triangle wave data
   */
  static generateTriangleWave(length, frequency, sampleRate, amplitude = 1) {
    const buffer = new Float32Array(length);
    const period = sampleRate / frequency;
    
    for (let i = 0; i < length; i++) {
      const phase = (i % period) / period;
      // Triangle wave is 2 * |2 * (phase - floor(phase + 0.5))| - 1
      buffer[i] = amplitude * (2 * Math.abs(2 * phase - 1) - 1);
    }
    
    return buffer;
  }
  
  /**
   * Generate white noise data
   * @param {number} length - Buffer length
   * @param {number} [amplitude=1] - Amplitude (0-1)
   * @returns {Float32Array} Noise data
   */
  static generateWhiteNoise(length, amplitude = 1) {
    const buffer = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      buffer[i] = amplitude * (Math.random() * 2 - 1);
    }
    
    return buffer;
  }
  
  /**
   * Generate pink noise data
   * @param {number} length - Buffer length
   * @param {number} [amplitude=1] - Amplitude (0-1)
   * @returns {Float32Array} Pink noise data
   */
  static generatePinkNoise(length, amplitude = 1) {
    const buffer = new Float32Array(length);
    
    // Pink noise filter coefficients (Paul Kellet's algorithm)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < length; i++) {
      // White noise
      const white = Math.random() * 2 - 1;
      
      // Filter white noise to get pink noise
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      // Mix outputs
      buffer[i] = amplitude * (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362);
      buffer[i] *= 0.11; // Normalize to roughly -1 to 1
      
      // Shift registers
      b6 = white * 0.115926;
    }
    
    return buffer;
  }
  
  /**
   * Apply a fade to an audio buffer
   * @param {Float32Array} buffer - Audio buffer
   * @param {string} type - Fade type ('in', 'out', 'both')
   * @param {number} duration - Fade duration in samples
   * @returns {Float32Array} Processed buffer
   */
  static applyFade(buffer, type, duration) {
    const result = new Float32Array(buffer);
    
    if (type === 'in' || type === 'both') {
      // Apply fade in
      const fadeIn = Math.min(duration, buffer.length);
      for (let i = 0; i < fadeIn; i++) {
        const gain = i / fadeIn; // Linear fade
        result[i] *= gain;
      }
    }
    
    if (type === 'out' || type === 'both') {
      // Apply fade out
      const fadeOut = Math.min(duration, buffer.length);
      for (let i = 0; i < fadeOut; i++) {
        const gain = (fadeOut - i) / fadeOut; // Linear fade
        result[buffer.length - 1 - i] *= gain;
      }
    }
    
    return result;
  }
  
  // =============== TIME/FREQUENCY DOMAIN CONVERSION ===============
  
  /**
   * Calculate Zero Crossing Rate of a signal
   * @param {Float32Array} buffer - Audio buffer
   * @returns {number} Zero crossing rate (0-1)
   */
  static calculateZeroCrossingRate(buffer) {
    if (!buffer || buffer.length < 2) return 0;
    
    let crossings = 0;
    
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i] >= 0 && buffer[i - 1] < 0) || 
          (buffer[i] < 0 && buffer[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / (buffer.length - 1);
  }
  
  /**
   * Calculate spectral centroid of a frequency array
   * @param {Float32Array} frequencyData - Frequency domain data
   * @param {number} sampleRate - Sample rate
   * @returns {number} Spectral centroid in Hz
   */
  static calculateSpectralCentroid(frequencyData, sampleRate) {
    let numerator = 0;
    let denominator = 0;
    const binSize = sampleRate / (2 * frequencyData.length);
    
    for (let i = 0; i < frequencyData.length; i++) {
      // Convert from dB to magnitude
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      const frequency = i * binSize;
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }
  
  /**
   * Calculate spectral flatness (tonal vs. noise)
   * @param {Float32Array} frequencyData - Frequency domain data
   * @returns {number} Spectral flatness (0-1)
   */
  static calculateSpectralFlatness(frequencyData) {
    // Convert from dB to magnitude
    const magnitudes = new Float32Array(frequencyData.length);
    for (let i = 0; i < frequencyData.length; i++) {
      magnitudes[i] = Math.pow(10, frequencyData[i] / 20);
    }
    
    // Calculate geometric mean
    let logSum = 0;
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      // Skip bins with zero or very low values
      if (magnitudes[i] <= 1e-10) continue;
      
      logSum += Math.log(magnitudes[i]);
      sum += magnitudes[i];
      count++;
    }
    
    if (count === 0 || sum === 0) return 0;
    
    const geometricMean = Math.exp(logSum / count);
    const arithmeticMean = sum / count;
    
    // Ratio of geometric mean to arithmetic mean
    return geometricMean / arithmeticMean;
  }
}

export default AudioUtils;