/**
 * SignalProcessor.js
 * Extracts and processes audio data to provide real-time analysis of audio signals,
 * including frequency spectrum analysis, waveform extraction, and feature detection.
 */
class SignalProcessor {
  /**
   * Creates a new SignalProcessor instance
   * @param {Object} options - Configuration options
   * @param {AudioEngineCore} options.audioEngineCore - Reference to AudioEngineCore
   * @param {EventBus} options.EventBus - Reference to EventBus
   * @param {Object} [options.config] - Additional configuration options
   */
  constructor(options = {}) {
    // Required dependencies
    if (!options.audioEngineCore) {
      throw new Error('SignalProcessor requires AudioEngineCore');
    }
    
    this.audioEngineCore = options.audioEngineCore;
    this.audioContext = this.audioEngineCore.getContext();
    this.EventBus = options.EventBus;
    
    // Default configuration
    this.config = {
      fftSize: options.config?.fftSize || 2048,
      smoothing: options.config?.smoothing || 0.8,
      minDecibels: options.config?.minDecibels || -80,
      maxDecibels: options.config?.maxDecibels || -20,
      updateInterval: options.config?.updateInterval || 100,
      enablePitchDetection: options.config?.enablePitchDetection || false,
      ...options.config
    };
    
    // Analysis state
    this.state = {
      isAnalyzing: false,
      lastUpdateTime: 0,
      energyHistory: [],
      peakHistory: [],
      frequencyData: null,
      waveformData: null,
      features: {},
      analysisInterval: null
    };
    
    // Audio nodes
    this.nodes = {
      inputNode: null,
      SignalProcessorNode: null,
      waveformSignalProcessor: null,
      scriptProcessor: null
    };
    
    // Setup frequency bands for analysis
    this.frequencyBands = this._setupFrequencyBands();
    
    // Initialize the SignalProcessor
    this._initialize();
  }

  /**
   * Initialize the SignalProcessor
   * @private
   */
  _initialize() {
    try {
      // Create SignalProcessor nodes
      this._createAnalyserNodes();
      
      // Create input node for external connections
      this.nodes.inputNode = this.audioContext.createGain();
      this.nodes.inputNode.gain.value = 1.0;
      
      // Connect input to SignalProcessors
      this.nodes.inputNode.connect(this.nodes.SignalProcessorNode);
      this.nodes.inputNode.connect(this.nodes.waveformSignalProcessor);
      
      // Create data arrays based on FFT size
      this._createDataArrays();
      
      // Emit initialization event
      this._emitEvent('SignalProcessor:initialized', {
        fftSize: this.config.fftSize,
        bands: Object.keys(this.frequencyBands).length
      });
    } catch (error) {
      console.error('Failed to initialize SignalProcessor:', error);
      this._emitEvent('SignalProcessor:error', {
        error,
        operation: 'initialization'
      });
    }
  }

  /**
   * Create SignalProcessor nodes
   * @private
   */
  _createAnalyserNodes() {
    // Main frequency SignalProcessor
    this.nodes.SignalProcessorNode = this.audioContext.createAnalyser();
    this.nodes.SignalProcessorNode.fftSize = this.config.fftSize;
    this.nodes.SignalProcessorNode.smoothingTimeConstant = this.config.smoothing;
    this.nodes.SignalProcessorNode.minDecibels = this.config.minDecibels;
    this.nodes.SignalProcessorNode.maxDecibels = this.config.maxDecibels;
    
    // Separate SignalProcessor for waveform with potentially different settings
    this.nodes.waveformSignalProcessor = this.audioContext.createAnalyser();
    this.nodes.waveformSignalProcessor.fftSize = this.config.fftSize;
    this.nodes.waveformSignalProcessor.smoothingTimeConstant = 0.3; // Less smoothing for waveform
    
    // Create ScriptProcessor for time-domain processing if needed
    // Note: ScriptProcessor is deprecated but still useful for certain analyses
    // In a production environment, consider using AudioWorklet instead
    if (this.config.enablePitchDetection) {
      const bufferSize = 4096;
      this.nodes.scriptProcessor = this.audioContext.createScriptProcessor(
        bufferSize, 1, 1
      );
      
      this.nodes.inputNode.connect(this.nodes.scriptProcessor);
      this.nodes.scriptProcessor.connect(this.audioContext.destination);
      
      // Set up processing function for script processor
      this.nodes.scriptProcessor.onaudioprocess = this._processAudioBuffer.bind(this);
    }
  }

  /**
   * Create data arrays based on FFT size
   * @private
   */
  _createDataArrays() {
    // Frequency domain data arrays
    this.state.frequencyData = {
      // Unsigned byte array (0-255) for visualization
      uint8: new Uint8Array(this.nodes.SignalProcessorNode.frequencyBinCount),
      // Float32 array (in dB) for more precise calculations
      float32: new Float32Array(this.nodes.SignalProcessorNode.frequencyBinCount)
    };
    
    // Time domain data arrays
    this.state.waveformData = {
      // Unsigned byte array (0-255) for visualization
      uint8: new Uint8Array(this.nodes.waveformSignalProcessor.fftSize),
      // Float32 array (-1 to 1) for calculations
      float32: new Float32Array(this.nodes.waveformSignalProcessor.fftSize)
    };
    
    // Create energy history buffer
    this.state.energyHistory = new Array(8).fill(0);
  }

  /**
   * Setup frequency band ranges for analysis
   * @private
   * @returns {Object} Frequency bands configuration
   */
  _setupFrequencyBands() {
    // Default frequency bands (Hz)
    return {
      // Sub-bass
      subBass: {
        min: 20,
        max: 60,
        energy: 0,
        peak: 0,
        weight: 1.0
      },
      // Bass
      bass: {
        min: 60,
        max: 250,
        energy: 0,
        peak: 0,
        weight: 0.8
      },
      // Low midrange
      lowMid: {
        min: 250,
        max: 500,
        energy: 0,
        peak: 0,
        weight: 0.6
      },
      // Midrange
      mid: {
        min: 500,
        max: 2000,
        energy: 0,
        peak: 0,
        weight: 0.5
      },
      // Upper midrange
      highMid: {
        min: 2000,
        max: 4000,
        energy: 0,
        peak: 0,
        weight: 0.4
      },
      // Presence
      presence: {
        min: 4000,
        max: 6000,
        energy: 0,
        peak: 0,
        weight: 0.3
      },
      // Brilliance
      brilliance: {
        min: 6000,
        max: 20000,
        energy: 0,
        peak: 0,
        weight: 0.3
      }
    };
  }

  /**
   * Start continuous analysis
   * @param {number} [interval=100] - Analysis interval in milliseconds
   * @returns {boolean} Success status
   */
  startAnalysis(interval = this.config.updateInterval) {
    if (this.state.isAnalyzing) return true;
    
    try {
      // Set analysis interval (minimum 16ms ~ 60fps)
      const safeInterval = Math.max(16, interval);
      
      // Start analysis loop
      this.state.analysisInterval = setInterval(() => {
        this._performAnalysis();
      }, safeInterval);
      
      this.state.isAnalyzing = true;
      this.state.lastUpdateTime = performance.now();
      
      this._emitEvent('SignalProcessor:started', {
        interval: safeInterval
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start analysis:', error);
      this._emitEvent('SignalProcessor:error', {
        error,
        operation: 'startAnalysis'
      });
      
      return false;
    }
  }

  /**
   * Stop continuous analysis
   * @returns {boolean} Success status
   */
  stopAnalysis() {
    if (!this.state.isAnalyzing) return true;
    
    try {
      // Clear analysis interval
      if (this.state.analysisInterval) {
        clearInterval(this.state.analysisInterval);
        this.state.analysisInterval = null;
      }
      
      this.state.isAnalyzing = false;
      
      this._emitEvent('SignalProcessor:stopped', {
        duration: performance.now() - this.state.lastUpdateTime
      });
      
      return true;
    } catch (error) {
      console.error('Failed to stop analysis:', error);
      this._emitEvent('SignalProcessor:error', {
        error,
        operation: 'stopAnalysis'
      });
      
      return false;
    }
  }

  /**
   * Perform a single analysis cycle
   * @private
   */
  _performAnalysis() {
    // Skip if audio context is not running
    if (this.audioContext.state !== 'running') return;
    
    // Get frequency data
    this.analyzeFrequency();
    
    // Get waveform data
    this.getWaveform();
    
    // Analyze frequency bands
    this.analyzeFrequencyBands();
    
    // Extract features periodically (less frequently)
    if (performance.now() - this.state.lastUpdateTime > 500) {
      this.extractFeatures();
      this.state.lastUpdateTime = performance.now();
    }
    
    // Emit analysis update event (throttled by EventBus)
    this._emitEvent('analysis:updated', {
      energy: this._calculateOverallEnergy(),
      peak: this._findPeakFrequency(),
      bands: this._getFrequencyBandsData()
    });
  }

  /**
   * Analyze frequency spectrum
   * @returns {Object} Frequency analysis data
   */
  analyzeFrequency() {
    try {
      // Get frequency data in both formats
      this.nodes.SignalProcessorNode.getByteFrequencyData(this.state.frequencyData.uint8);
      this.nodes.SignalProcessorNode.getFloatFrequencyData(this.state.frequencyData.float32);
      
      return {
        uint8: this.state.frequencyData.uint8,
        float32: this.state.frequencyData.float32,
        binCount: this.nodes.SignalProcessorNode.frequencyBinCount,
        binSize: this.audioContext.sampleRate / (this.nodes.SignalProcessorNode.fftSize * 2)
      };
    } catch (error) {
      console.error('Failed to analyze frequency:', error);
      return null;
    }
  }

  /**
   * Get current waveform data
   * @param {boolean} [normalized=false] - Whether to normalize waveform
   * @returns {Object} Waveform data
   */
  getWaveform(normalized = false) {
    try {
      // Get time domain data in both formats
      this.nodes.waveformSignalProcessor.getByteTimeDomainData(this.state.waveformData.uint8);
      this.nodes.waveformSignalProcessor.getFloatTimeDomainData(this.state.waveformData.float32);
      
      let result = {
        uint8: this.state.waveformData.uint8,
        float32: this.state.waveformData.float32,
        size: this.nodes.waveformSignalProcessor.fftSize
      };
      
      // Normalize the waveform if requested
      if (normalized) {
        result = this._normalizeWaveform(result);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get waveform:', error);
      return null;
    }
  }

  /**
   * Normalize waveform data for easier visualization
   * @private
   * @param {Object} waveform - Raw waveform data
   * @returns {Object} Normalized waveform data
   */
  _normalizeWaveform(waveform) {
    const float32 = waveform.float32;
    const length = float32.length;
    
    // Find min and max values
    let min = Infinity;
    let max = -Infinity;
    
    for (let i = 0; i < length; i++) {
      const value = float32[i];
      if (value < min) min = value;
      if (value > max) max = value;
    }
    
    // Create normalized array
    const normalized = new Float32Array(length);
    const range = max - min;
    
    if (range > 0) {
      for (let i = 0; i < length; i++) {
        normalized[i] = (float32[i] - min) / range;
      }
    }
    
    return {
      ...waveform,
      normalized,
      min,
      max,
      range
    };
  }

  /**
   * Analyze energy in defined frequency bands
   * @returns {Object} Frequency band energy data
   */
  analyzeFrequencyBands() {
    if (!this.state.frequencyData.float32) return null;
    
    const binSize = this.audioContext.sampleRate / (this.nodes.SignalProcessorNode.fftSize * 2);
    
    // Calculate energy for each frequency band
    for (const [bandName, band] of Object.entries(this.frequencyBands)) {
      const energy = this._calculateBandEnergy(
        this.state.frequencyData.float32,
        band.min,
        band.max,
        binSize
      );
      
      // Store current energy
      band.energy = energy;
      
      // Update peak if current energy is higher
      if (energy > band.peak) {
        band.peak = energy;
      }
    }
    
    return this._getFrequencyBandsData();
  }

  /**
   * Calculate energy in a specific frequency band
   * @private
   * @param {Float32Array} frequencyData - Frequency data array
   * @param {number} minFreq - Minimum frequency in Hz
   * @param {number} maxFreq - Maximum frequency in Hz
   * @param {number} binSize - Frequency bin size in Hz
   * @returns {number} Energy level (0-1)
   */
  _calculateBandEnergy(frequencyData, minFreq, maxFreq, binSize) {
    // Convert frequencies to bin indices
    const minBin = Math.floor(minFreq / binSize);
    const maxBin = Math.min(Math.ceil(maxFreq / binSize), frequencyData.length - 1);
    
    // Sum energy in the band
    let sum = 0;
    let count = 0;
    
    for (let i = minBin; i <= maxBin; i++) {
      // Convert dB to linear scale and add to sum
      // Note: frequency data is in dB, typically -100 to 0
      sum += Math.pow(10, frequencyData[i] / 20);
      count++;
    }
    
    // Return average energy normalized to 0-1
    // Using non-linear scaling to make it more perceptually relevant
    if (count === 0) return 0;
    
    // Get average, convert to dB, then normalize to 0-1
    const averageEnergy = sum / count;
    const dbEnergy = 20 * Math.log10(averageEnergy);
    
    // Normalize from dB range to 0-1
    // Assuming typical range from -60dB to 0dB
    const normalizedEnergy = Math.max(0, Math.min(1, (dbEnergy + 60) / 60));
    
    return normalizedEnergy;
  }

  /**
   * Calculate overall audio energy
   * @private
   * @returns {number} Overall energy level (0-1)
   */
  _calculateOverallEnergy() {
    // Calculate weighted average of all bands
    let totalEnergy = 0;
    let totalWeight = 0;
    
    for (const band of Object.values(this.frequencyBands)) {
      totalEnergy += band.energy * band.weight;
      totalWeight += band.weight;
    }
    
    const overallEnergy = totalWeight > 0 ? totalEnergy / totalWeight : 0;
    
    // Update energy history
    this.state.energyHistory.push(overallEnergy);
    if (this.state.energyHistory.length > 8) {
      this.state.energyHistory.shift();
    }
    
    return overallEnergy;
  }

  /**
   * Find peak frequency in the spectrum
   * @private
   * @returns {Object} Peak frequency data
   */
  _findPeakFrequency() {
    if (!this.state.frequencyData.float32) return null;
    
    const float32 = this.state.frequencyData.float32;
    const binSize = this.audioContext.sampleRate / (this.nodes.SignalProcessorNode.fftSize * 2);
    
    // Find the bin with maximum energy
    let maxBin = 0;
    let maxValue = -Infinity;
    
    for (let i = 0; i < float32.length; i++) {
      if (float32[i] > maxValue) {
        maxValue = float32[i];
        maxBin = i;
      }
    }
    
    // Convert bin to frequency
    const peakFrequency = maxBin * binSize;
    
    return {
      frequency: peakFrequency,
      magnitude: maxValue,
      bin: maxBin
    };
  }

  /**
   * Get formatted frequency bands data
   * @private
   * @returns {Object} Frequency bands data
   */
  _getFrequencyBandsData() {
    const result = {};
    
    for (const [bandName, band] of Object.entries(this.frequencyBands)) {
      result[bandName] = {
        energy: band.energy,
        peak: band.peak,
        range: {
          min: band.min,
          max: band.max
        }
      };
    }
    
    return result;
  }

  /**
   * Extract audio features from current signal
   * @returns {Object} Extracted audio features
   */
  extractFeatures() {
    try {
      // Skip if no data available
      if (!this.state.frequencyData.float32 || !this.state.waveformData.float32) {
        return null;
      }
      
      // Calculate spectral features
      const spectralCentroid = this._calculateSpectralCentroid();
      const spectralFlatness = this._calculateSpectralFlatness();
      const spectralRolloff = this._calculateSpectralRolloff();
      
      // Calculate amplitude features
      const rms = this._calculateRMS(this.state.waveformData.float32);
      const crest = this._calculateCrestFactor(this.state.waveformData.float32);
      
      // Combine features
      this.state.features = {
        spectral: {
          centroid: spectralCentroid,
          flatness: spectralFlatness,
          rolloff: spectralRolloff
        },
        amplitude: {
          rms,
          crestFactor: crest
        },
        energy: this._calculateOverallEnergy(),
        timestamp: this.audioContext.currentTime
      };
      
      this._emitEvent('analysis:features-extracted', {
        features: this.state.features
      });
      
      return this.state.features;
    } catch (error) {
      console.error('Failed to extract features:', error);
      return null;
    }
  }

  /**
   * Calculate spectral centroid (brightness)
   * @private
   * @returns {number} Spectral centroid in Hz
   */
  _calculateSpectralCentroid() {
    const float32 = this.state.frequencyData.float32;
    const binSize = this.audioContext.sampleRate / (this.nodes.SignalProcessorNode.fftSize * 2);
    
    let numerator = 0;
    let denominator = 0;
    
    // Convert from dB to magnitude scale for calculation
    for (let i = 0; i < float32.length; i++) {
      const magnitude = Math.pow(10, float32[i] / 20);
      const frequency = i * binSize;
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }

  /**
   * Calculate spectral flatness (tonal vs. noisy)
   * @private
   * @returns {number} Spectral flatness (0-1)
   */
  _calculateSpectralFlatness() {
    const float32 = this.state.frequencyData.float32;
    
    // Convert from dB to linear scale
    const magnitudes = new Float32Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      magnitudes[i] = Math.pow(10, float32[i] / 20);
    }
    
    // Calculate geometric mean
    let logSum = 0;
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      // Skip bins with zero or negative values
      if (magnitudes[i] <= 0) continue;
      
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

  /**
   * Calculate spectral rolloff (frequency below which 85% of energy exists)
   * @private
   * @returns {number} Spectral rolloff in Hz
   */
  _calculateSpectralRolloff() {
    const float32 = this.state.frequencyData.float32;
    const binSize = this.audioContext.sampleRate / (this.nodes.SignalProcessorNode.fftSize * 2);
    
    // Convert from dB to magnitude
    const magnitudes = new Float32Array(float32.length);
    let totalEnergy = 0;
    
    for (let i = 0; i < float32.length; i++) {
      magnitudes[i] = Math.pow(10, float32[i] / 20);
      totalEnergy += magnitudes[i];
    }
    
    if (totalEnergy === 0) return 0;
    
    // Find bin where cumulative energy reaches 85% of total
    const threshold = totalEnergy * 0.85;
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
      cumulativeEnergy += magnitudes[i];
      if (cumulativeEnergy >= threshold) {
        return i * binSize;
      }
    }
    
    return (magnitudes.length - 1) * binSize;
  }

  /**
   * Calculate Root Mean Square (RMS) of a signal
   * @private
   * @param {Float32Array} signal - Audio signal
   * @returns {number} RMS value
   */
  _calculateRMS(signal) {
    let sum = 0;
    
    for (let i = 0; i < signal.length; i++) {
      sum += signal[i] * signal[i];
    }
    
    return Math.sqrt(sum / signal.length);
  }

  /**
   * Calculate crest factor (peak / RMS ratio)
   * @private
   * @param {Float32Array} signal - Audio signal
   * @returns {number} Crest factor
   */
  _calculateCrestFactor(signal) {
    let peak = 0;
    
    for (let i = 0; i < signal.length; i++) {
      const abs = Math.abs(signal[i]);
      if (abs > peak) {
        peak = abs;
      }
    }
    
    const rms = this._calculateRMS(signal);
    
    if (rms === 0) return 0;
    
    return peak / rms;
  }

  /**
   * Process raw audio buffer for advanced analysis
   * @private
   * @param {AudioProcessingEvent} event - Audio processing event
   */
  _processAudioBuffer(event) {
    // Skip if pitch detection is disabled or not analyzing
    if (!this.config.enablePitchDetection || !this.state.isAnalyzing) return;
    
    // Get input buffer
    const inputBuffer = event.inputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    
    // Perform zero-crossing rate analysis for rough pitch estimation
    const zeroCrossingRate = this._calculateZeroCrossingRate(inputData);
    
    // Rough pitch estimation based on zero crossing rate
    // Pitch ≈ (ZCR * sampleRate) / 2
    const estimatedPitch = (zeroCrossingRate * this.audioContext.sampleRate) / 2;
    
    if (estimatedPitch > 0) {
      this._emitEvent('analysis:pitch-detected', {
        pitch: estimatedPitch,
        zeroCrossingRate,
        confidence: 0.5 // Low confidence for this simple method
      });
    }
  }

  /**
   * Calculate zero crossing rate of a signal
   * @private
   * @param {Float32Array} signal - Audio signal
   * @returns {number} Zero crossing rate (0-1)
   */
  _calculateZeroCrossingRate(signal) {
    let crossings = 0;
    
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i] >= 0 && signal[i - 1] < 0) || 
          (signal[i] < 0 && signal[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / (signal.length - 1);
  }

  /**
   * Get SignalProcessor node for external connections
   * @returns {AudioNode} Input node
   */
  getInputNode() {
    return this.nodes.inputNode;
  }

  /**
   * Get current frequency data
   * @param {boolean} [asFloat=false] - Get as Float32Array instead of Uint8Array
   * @returns {Uint8Array|Float32Array} Frequency data
   */
  getFrequencyData(asFloat = false) {
    return asFloat 
      ? this.state.frequencyData.float32 
      : this.state.frequencyData.uint8;
  }

  /**
   * Get current waveform data
   * @param {boolean} [asFloat=false] - Get as Float32Array instead of Uint8Array
   * @returns {Uint8Array|Float32Array} Waveform data
   */
  getWaveformData(asFloat = false) {
    return asFloat 
      ? this.state.waveformData.float32 
      : this.state.waveformData.uint8;
  }

  /**
   * Get latest extracted features
   * @returns {Object} Audio features
   */
  getFeatures() {
    return { ...this.state.features };
  }

  /**
   * Set SignalProcessor node parameters
   * @param {Object} params - SignalProcessor parameters
   * @returns {boolean} Success status
   */
  setParameters(params) {
    try {
      // Update FFT size if specified
      if (params.fftSize) {
        const fftSize = params.fftSize;
        
        // FFT size must be a power of 2 between 32 and 32768
        if (fftSize >= 32 && fftSize <= 32768 && (fftSize & (fftSize - 1)) === 0) {
          this.nodes.SignalProcessorNode.fftSize = fftSize;
          this.nodes.waveformSignalProcessor.fftSize = fftSize;
          
          // Update data arrays for new FFT size
          this._createDataArrays();
        }
      }
      
      // Update smoothing if specified
      if (params.smoothing !== undefined) {
        this.nodes.SignalProcessorNode.smoothingTimeConstant = Math.max(0, Math.min(1, params.smoothing));
      }
      
      // Update dB range if specified
      if (params.minDecibels !== undefined) {
        this.nodes.SignalProcessorNode.minDecibels = params.minDecibels;
      }
      
      if (params.maxDecibels !== undefined) {
        this.nodes.SignalProcessorNode.maxDecibels = params.maxDecibels;
      }
      
      // Update config object
      Object.assign(this.config, params);
      
      this._emitEvent('SignalProcessor:parameters-changed', {
        fftSize: this.nodes.SignalProcessorNode.fftSize,
        smoothing: this.nodes.SignalProcessorNode.smoothingTimeConstant,
        minDecibels: this.nodes.SignalProcessorNode.minDecibels,
        maxDecibels: this.nodes.SignalProcessorNode.maxDecibels
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set SignalProcessor parameters:', error);
      this._emitEvent('SignalProcessor:error', {
        error,
        operation: 'setParameters'
      });
      
      return false;
    }
  }

  /**
   * Reset analysis history and peaks
   */
  resetAnalysis() {
    // Reset energy history
    this.state.energyHistory = new Array(8).fill(0);
    
    // Reset frequency band peaks
    for (const band of Object.values(this.frequencyBands)) {
      band.peak = 0;
    }
    
    this._emitEvent('SignalProcessor:reset', {
      time: this.audioContext.currentTime
    });
  }

  /**
   * Get SignalProcessor configuration
   * @returns {Object} Current configuration
   */
  getConfiguration() {
    return { ...this.config };
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
        source: 'SignalProcessor',
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
    // Stop analysis
    this.stopAnalysis();
    
    // Disconnect nodes
    if (this.nodes.inputNode) {
      this.nodes.inputNode.disconnect();
    }
    
    if (this.nodes.SignalProcessorNode) {
      this.nodes.SignalProcessorNode.disconnect();
    }
    
    if (this.nodes.waveformSignalProcessor) {
      this.nodes.waveformSignalProcessor.disconnect();
    }
    
    if (this.nodes.scriptProcessor) {
      this.nodes.scriptProcessor.disconnect();
      this.nodes.scriptProcessor.onaudioprocess = null;
    }
    
    this._emitEvent('SignalProcessor:disposed', {
      time: Date.now()
    });
  }
}

export default SignalProcessor;