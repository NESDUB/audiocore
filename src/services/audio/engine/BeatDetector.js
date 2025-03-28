/**
 * BeatDetector.js
 * Specialized component that provides beat and rhythm detection capabilities,
 * identifying beats, tempo, and rhythmic patterns in audio signals.
 */
class BeatDetector {
  /**
   * Creates a new BeatDetector instance
   * @param {Object} options - Configuration options
   * @param {SignalProcessor} options.SignalProcessor - Reference to SignalProcessor component
   * @param {EventBus} options.EventBus - Reference to EventBus
   * @param {AudioEngineCore} [options.audioEngineCore] - Optional reference to AudioEngineCore
   * @param {Object} [options.config] - Additional configuration options
   */
  constructor(options = {}) {
    // Required dependencies
    if (!options.SignalProcessor) {
      throw new Error('BeatDetector requires SignalProcessor component');
    }
    
    this.SignalProcessor = options.SignalProcessor;
    this.EventBus = options.EventBus;
    this.audioEngineCore = options.audioEngineCore;
    
    // Get audio context
    if (this.audioEngineCore) {
      this.audioContext = this.audioEngineCore.getContext();
    } else if (this.SignalProcessor.audioContext) {
      this.audioContext = this.SignalProcessor.audioContext;
    } else {
      throw new Error('BeatDetector requires AudioContext access');
    }
    
    // Default configuration
    this.config = {
      sensitivity: options.config?.sensitivity || 1.2,
      minBeatInterval: options.config?.minBeatInterval || 0.2,
      historySize: options.config?.historySize || 43,
      enableSpectrumAnalysis: options.config?.enableSpectrumAnalysis !== false,
      genreDetection: options.config?.genreDetection !== false,
      minTempo: options.config?.minTempo || 60,
      maxTempo: options.config?.maxTempo || 180,
      tempoPrecision: options.config?.tempoPrecision || 0.1,
      beatEnergyThreshold: options.config?.beatEnergyThreshold || 0.15,
      beatVariance: options.config?.beatVariance || 0.3,
      adaptiveThreshold: options.config?.adaptiveThreshold !== false,
      ...options.config
    };
    
    // Beat detection state
    this.state = {
      isDetecting: false,
      energyHistory: [],
      beatHistory: [],
      intervalHistory: [],
      lastBeatTime: 0,
      beatConfidence: 0,
      currentTempo: 0,
      beatPhase: 0,
      beatCount: 0,
      predictedBeats: [],
      detectionInterval: null
    };
    
    // Initialize detector
    this._initialize();
  }

  /**
   * Initialize the beat detector
   * @private
   */
  _initialize() {
    try {
      // Initialize energy history with zeros
      this.state.energyHistory = new Array(this.config.historySize).fill(0);
      
      // Initialize interval history
      this.state.intervalHistory = [];
      
      // Initialize beat history
      this.state.beatHistory = [];
      
      // Automatically start detection if SignalProcessor is already analyzing
      if (this.SignalProcessor.state && this.SignalProcessor.state.isAnalyzing) {
        this.startDetection();
      }
      
      // Listen for SignalProcessor events
      this._setupEventListeners();
      
      this._emitEvent('beat:initialized', {
        sensitivity: this.config.sensitivity,
        minBeatInterval: this.config.minBeatInterval
      });
    } catch (error) {
      console.error('Failed to initialize BeatDetector:', error);
      this._emitEvent('beat:error', {
        error,
        operation: 'initialization'
      });
    }
  }

  /**
   * Set up event listeners for SignalProcessor events
   * @private
   */
  _setupEventListeners() {
    if (!this.EventBus) return;
    
    // Listen for SignalProcessor updates
    this.EventBus.on('analysis:updated', (data) => {
      if (this.state.isDetecting) {
        this.detectBeat();
      }
    });
  }

  /**
   * Start beat detection
   * @returns {boolean} Success status
   */
  startDetection() {
    if (this.state.isDetecting) return true;
    
    try {
      this.state.isDetecting = true;
      
      // Start SignalProcessor if not already running
      if (this.SignalProcessor.startAnalysis) {
        this.SignalProcessor.startAnalysis();
      }
      
      this._emitEvent('beat:detection-started', {
        time: this.audioContext.currentTime
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start beat detection:', error);
      this._emitEvent('beat:error', {
        error,
        operation: 'startDetection'
      });
      
      return false;
    }
  }

  /**
   * Stop beat detection
   * @returns {boolean} Success status
   */
  stopDetection() {
    if (!this.state.isDetecting) return true;
    
    try {
      this.state.isDetecting = false;
      
      this._emitEvent('beat:detection-stopped', {
        time: this.audioContext.currentTime
      });
      
      return true;
    } catch (error) {
      console.error('Failed to stop beat detection:', error);
      this._emitEvent('beat:error', {
        error,
        operation: 'stopDetection'
      });
      
      return false;
    }
  }

  /**
   * Main beat detection algorithm
   * @returns {Object} Beat detection result
   */
  detectBeat() {
    try {
      // Skip if not active
      if (!this.state.isDetecting) return null;
      
      // Get current time
      const now = this.audioContext.currentTime;
      
      // Check minimum interval between beats
      const timeSinceLastBeat = now - this.state.lastBeatTime;
      if (timeSinceLastBeat < this.config.minBeatInterval) {
        return {
          isBeat: false,
          energy: 0,
          confidence: this.state.beatConfidence,
          tempo: this.state.currentTempo
        };
      }
      
      // Get frequency and waveform data
      const freqData = this.SignalProcessor.getFrequencyData(true);
      const waveformData = this.SignalProcessor.getWaveformData(true);
      
      if (!freqData || !waveformData) {
        return null;
      }
      
      // Get frequency bands from SignalProcessor if available
      const bands = this.SignalProcessor.analyzeFrequencyBands ? 
        this.SignalProcessor.analyzeFrequencyBands() :
        this._analyzeFrequencyBands(freqData);
      
      // Use energy-based detection as primary method
      const energyResult = this._detectBeatByEnergy(bands);
      
      // Use spectral flux as secondary detection method if enabled
      let fluxResult = { isBeat: false, energy: 0 };
      if (this.config.enableSpectrumAnalysis) {
        fluxResult = this._detectBeatBySpectralFlux(freqData);
      }
      
      // Combine results with weighted decision
      const isBeat = energyResult.isBeat || 
                     (fluxResult.isBeat && energyResult.energy > this.config.beatEnergyThreshold / 2);
      
      // Process the beat if detected
      if (isBeat) {
        this._processBeat(now, Math.max(energyResult.energy, fluxResult.energy));
        
        // Return beat data
        return {
          isBeat: true,
          energy: energyResult.energy,
          confidence: this.state.beatConfidence,
          tempo: this.state.currentTempo,
          phase: this.state.beatPhase
        };
      }
      
      // Update beat phase even if no beat detected
      this._updateBeatPhase(now);
      
      // Return non-beat data
      return {
        isBeat: false,
        energy: energyResult.energy,
        confidence: this.state.beatConfidence,
        tempo: this.state.currentTempo,
        phase: this.state.beatPhase
      };
    } catch (error) {
      console.error('Beat detection error:', error);
      return {
        isBeat: false,
        error: error.message
      };
    }
  }

  /**
   * Energy-based beat detection
   * @private
   * @param {Object} bands - Frequency bands data
   * @returns {Object} Detection result
   */
  _detectBeatByEnergy(bands) {
    // Focus primarily on bass and low-mid frequency bands for beat detection
    // These bands typically contain the most rhythmic information
    let bassEnergy = 0;
    let midEnergy = 0;
    
    if (bands.bass && bands.bass.energy !== undefined) {
      bassEnergy = bands.bass.energy;
    }
    
    if (bands.lowMid && bands.lowMid.energy !== undefined) {
      midEnergy = bands.lowMid.energy;
    }
    
    // Weight bass more heavily for beat detection
    const instantEnergy = (bassEnergy * 0.8) + (midEnergy * 0.2);
    
    // Update energy history
    this.state.energyHistory.push(instantEnergy);
    if (this.state.energyHistory.length > this.config.historySize) {
      this.state.energyHistory.shift();
    }
    
    // Calculate local and long-term energy averages
    const localAverage = this._calculateLocalAverage(this.state.energyHistory, 5);
    const longTermAverage = this._calculateAverage(this.state.energyHistory);
    
    // Calculate adaptive threshold with sensitivity control
    const variance = this._calculateVariance(this.state.energyHistory, longTermAverage);
    const threshold = longTermAverage * this.config.sensitivity + 
                     (variance * this.config.beatVariance);
    
    // Beat is detected when energy exceeds threshold
    const isBeat = instantEnergy > threshold && instantEnergy > this.config.beatEnergyThreshold;
    
    return {
      isBeat,
      energy: instantEnergy,
      threshold,
      localAverage,
      longTermAverage
    };
  }

  /**
   * Spectral flux based beat detection
   * @private
   * @param {Float32Array} frequencyData - Frequency data
   * @returns {Object} Detection result
   */
  _detectBeatBySpectralFlux(frequencyData) {
    // Check for valid previous data
    if (!this._prevFrequencyData || this._prevFrequencyData.length !== frequencyData.length) {
      this._prevFrequencyData = new Float32Array(frequencyData);
      return { isBeat: false, energy: 0 };
    }
    
    // Calculate spectral flux (changes in frequency content)
    let flux = 0;
    let fluxCount = 0;
    
    // We'll focus on bass and low-mid range (approx. 20-500Hz)
    // assuming ~43Hz per bin at 44.1kHz sample rate with 2048 FFT
    const maxBin = Math.min(Math.floor(500 / 43), frequencyData.length - 1);
    
    for (let i = 1; i <= maxBin; i++) {
      // Convert from dB to linear scale
      const current = Math.pow(10, frequencyData[i] / 20);
      const prev = Math.pow(10, this._prevFrequencyData[i] / 20);
      
      // Only count increases in energy (half-wave rectification)
      const diff = Math.max(0, current - prev);
      flux += diff;
      fluxCount++;
    }
    
    // Normalize flux
    const avgFlux = flux / fluxCount;
    
    // Store current data for next comparison
    this._prevFrequencyData.set(frequencyData);
    
    // Detect beat based on flux threshold
    // This is a simplified version of the full spectral flux algorithm
    const isBeat = avgFlux > this._fluxThreshold;
    
    // Adaptive threshold adjustment
    this._fluxThreshold = 0.8 * this._fluxThreshold + 0.2 * Math.max(avgFlux * 1.5, 0.01);
    
    return {
      isBeat,
      energy: avgFlux
    };
  }

  /**
   * Process a detected beat
   * @private
   * @param {number} now - Current time
   * @param {number} energy - Beat energy level
   */
  _processBeat(now, energy) {
    // Calculate interval since last beat
    const interval = now - this.state.lastBeatTime;
    
    // Update last beat time
    this.state.lastBeatTime = now;
    this.state.beatCount++;
    
    // Record interval in history (if within reasonable range)
    if (interval > 0.1 && interval < 2.0) {
      this.state.intervalHistory.push(interval);
      
      // Keep history at reasonable size
      if (this.state.intervalHistory.length > 12) {
        this.state.intervalHistory.shift();
      }
      
      // Record beat in history
      this.state.beatHistory.push({
        time: now,
        energy,
        interval
      });
      
      // Keep beat history trimmed
      if (this.state.beatHistory.length > 24) {
        this.state.beatHistory.shift();
      }
      
      // Update tempo estimate
      this._updateTempoEstimate();
    }
    
    // Update beat prediction
    this._predictNextBeats();
    
    // Update beat phase
    this.state.beatPhase = 0;
    
    // Emit beat event
    this._emitEvent('beat:detected', {
      time: now,
      energy,
      interval,
      beatCount: this.state.beatCount,
      tempo: this.state.currentTempo,
      confidence: this.state.beatConfidence
    });
  }

  /**
   * Update tempo estimate based on interval history
   * @private
   */
  _updateTempoEstimate() {
    // Need at least a few intervals for reliable tempo estimation
    if (this.state.intervalHistory.length < 3) {
      return;
    }
    
    // Calculate intervals and their consistency
    const averageInterval = this._calculateAverageInterval();
    
    // Calculate tempo in BPM
    const tempo = 60 / averageInterval;
    
    // Check if tempo is within valid range
    if (tempo >= this.config.minTempo && tempo <= this.config.maxTempo) {
      // If we already have a tempo estimate, perform smoothing
      if (this.state.currentTempo > 0) {
        // More weight to new estimate if confidence is high
        const weight = this.state.beatConfidence * 0.5 + 0.1;
        this.state.currentTempo = (1 - weight) * this.state.currentTempo + weight * tempo;
      } else {
        // First estimate
        this.state.currentTempo = tempo;
      }
      
      // Calculate beat confidence based on consistency of intervals
      const variance = this._calculateVariance(this.state.intervalHistory, averageInterval);
      const intervalConsistency = Math.max(0, 1 - (variance / averageInterval));
      
      // Update confidence (combination of interval consistency and beat strength)
      this.state.beatConfidence = intervalConsistency * 0.7 + 0.3;
      
      // Round tempo to nearest precision unit for display
      const displayTempo = Math.round(this.state.currentTempo / this.config.tempoPrecision) * 
                          this.config.tempoPrecision;
      
      // Emit tempo event if significant change or first estimate
      this._emitEvent('tempo:updated', {
        tempo: displayTempo,
        rawTempo: this.state.currentTempo,
        confidence: this.state.beatConfidence,
        averageInterval
      });
    }
  }

  /**
   * Calculate average beat interval
   * @private
   * @returns {number} Average interval in seconds
   */
  _calculateAverageInterval() {
    // If we have few samples, simple average is fine
    if (this.state.intervalHistory.length <= 4) {
      return this._calculateAverage(this.state.intervalHistory);
    }
    
    // With more samples, use weighted average
    // Recent intervals get higher weight
    const intervals = [...this.state.intervalHistory];
    let weightSum = 0;
    let valueSum = 0;
    
    intervals.forEach((interval, index) => {
      // Linear weight: newer entries get higher weight
      const weight = (index + 1) / intervals.length;
      valueSum += interval * weight;
      weightSum += weight;
    });
    
    return valueSum / weightSum;
  }

  /**
   * Predict when next beats will occur
   * @private
   */
  _predictNextBeats() {
    // Need tempo information to predict beats
    if (this.state.currentTempo <= 0) {
      this.state.predictedBeats = [];
      return;
    }
    
    // Calculate beat interval in seconds
    const beatInterval = 60 / this.state.currentTempo;
    
    // Predict the next several beats
    const now = this.audioContext.currentTime;
    const predictions = [];
    
    for (let i = 1; i <= 8; i++) {
      const nextBeatTime = this.state.lastBeatTime + (beatInterval * i);
      if (nextBeatTime > now) {
        predictions.push({
          beatNumber: this.state.beatCount + i,
          time: nextBeatTime,
          confidence: Math.max(0, this.state.beatConfidence - (i * 0.1))
        });
      }
    }
    
    this.state.predictedBeats = predictions;
  }

  /**
   * Update the current phase within the beat cycle
   * @private
   * @param {number} now - Current time
   */
  _updateBeatPhase(now) {
    // Skip if no tempo information
    if (this.state.currentTempo <= 0 || this.state.lastBeatTime === 0) {
      return;
    }
    
    // Calculate time since last beat
    const timeSinceLastBeat = now - this.state.lastBeatTime;
    
    // Calculate beat duration in seconds
    const beatDuration = 60 / this.state.currentTempo;
    
    // Calculate phase (0-1 representing position within beat)
    this.state.beatPhase = (timeSinceLastBeat % beatDuration) / beatDuration;
  }

  /**
   * Analyze frequency bands from raw frequency data
   * Used as a fallback if SignalProcessor doesn't provide band data
   * @private
   * @param {Float32Array} frequencyData - Frequency data
   * @returns {Object} Frequency bands
   */
  _analyzeFrequencyBands(frequencyData) {
    const binSize = this.audioContext.sampleRate / (frequencyData.length * 2);
    
    // Define bands (Hz)
    const bands = {
      bass: { min: 60, max: 250 },
      lowMid: { min: 250, max: 500 },
      mid: { min: 500, max: 2000 },
      highMid: { min: 2000, max: 4000 },
      high: { min: 4000, max: 20000 }
    };
    
    // Calculate energy in each band
    const result = {};
    
    for (const [name, range] of Object.entries(bands)) {
      const minBin = Math.floor(range.min / binSize);
      const maxBin = Math.min(Math.ceil(range.max / binSize), frequencyData.length - 1);
      
      let sum = 0;
      let count = 0;
      
      for (let i = minBin; i <= maxBin; i++) {
        // Convert dB to linear scale
        sum += Math.pow(10, frequencyData[i] / 20);
        count++;
      }
      
      // Calculate average energy
      const avgEnergy = sum / count;
      
      // Calculate energy level (0-1)
      // Simple mapping of reasonable energy levels to 0-1 range
      const energy = Math.min(1, Math.max(0, (20 * Math.log10(avgEnergy) + 60) / 60));
      
      result[name] = {
        energy,
        range
      };
    }
    
    return result;
  }

  /**
   * Calculate local average of an array
   * @private
   * @param {Array} array - Input array
   * @param {number} windowSize - Size of local window
   * @returns {number} Local average
   */
  _calculateLocalAverage(array, windowSize) {
    if (!array.length) return 0;
    
    const start = Math.max(0, array.length - windowSize);
    let sum = 0;
    
    for (let i = start; i < array.length; i++) {
      sum += array[i];
    }
    
    return sum / (array.length - start);
  }

  /**
   * Calculate average of an array
   * @private
   * @param {Array} array - Input array
   * @returns {number} Average value
   */
  _calculateAverage(array) {
    if (!array.length) return 0;
    
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    
    return sum / array.length;
  }

  /**
   * Calculate variance of an array
   * @private
   * @param {Array} array - Input array
   * @param {number} [mean] - Mean value (optional, calculated if not provided)
   * @returns {number} Variance
   */
  _calculateVariance(array, mean) {
    if (!array.length) return 0;
    
    const avg = mean !== undefined ? mean : this._calculateAverage(array);
    let sum = 0;
    
    for (let i = 0; i < array.length; i++) {
      const diff = array[i] - avg;
      sum += diff * diff;
    }
    
    return sum / array.length;
  }

  /**
   * Configure for specific music genres
   * @param {string} genre - Music genre ('electronic', 'rock', 'jazz', etc.)
   * @returns {Object} Applied configuration
   */
  configureForGenre(genre) {
    let genreConfig = {};
    
    switch (genre.toLowerCase()) {
      case 'electronic':
      case 'dance':
      case 'techno':
      case 'house':
        genreConfig = {
          sensitivity: 1.3,
          minBeatInterval: 0.2,
          beatEnergyThreshold: 0.1,
          beatVariance: 0.2
        };
        break;
        
      case 'rock':
      case 'metal':
      case 'punk':
        genreConfig = {
          sensitivity: 1.4,
          minBeatInterval: 0.25,
          beatEnergyThreshold: 0.2,
          beatVariance: 0.4
        };
        break;
        
      case 'jazz':
      case 'blues':
      case 'soul':
        genreConfig = {
          sensitivity: 1.1,
          minBeatInterval: 0.15,
          beatEnergyThreshold: 0.12,
          beatVariance: 0.5
        };
        break;
        
      case 'classical':
      case 'orchestral':
      case 'ambient':
        genreConfig = {
          sensitivity: 0.9,
          minBeatInterval: 0.1,
          beatEnergyThreshold: 0.08,
          beatVariance: 0.3
        };
        break;
        
      case 'hip-hop':
      case 'rap':
      case 'trap':
        genreConfig = {
          sensitivity: 1.5,
          minBeatInterval: 0.22,
          beatEnergyThreshold: 0.15,
          beatVariance: 0.3
        };
        break;
        
      default:
        // Default config
        genreConfig = {
          sensitivity: 1.2,
          minBeatInterval: 0.2,
          beatEnergyThreshold: 0.15,
          beatVariance: 0.3
        };
    }
    
    // Apply configuration
    Object.assign(this.config, genreConfig);
    
    this._emitEvent('beat:genre-configured', {
      genre,
      config: genreConfig
    });
    
    return genreConfig;
  }

  /**
   * Set detector parameters
   * @param {Object} params - Detector parameters
   * @returns {boolean} Success status
   */
  setParameters(params) {
    try {
      // Update config with new parameters
      Object.assign(this.config, params);
      
      this._emitEvent('beat:parameters-changed', {
        parameters: params
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set beat detector parameters:', error);
      this._emitEvent('beat:error', {
        error,
        operation: 'setParameters'
      });
      
      return false;
    }
  }

  /**
   * Get current detector state
   * @returns {Object} Detector state
   */
  getCurrentState() {
    return {
      isDetecting: this.state.isDetecting,
      isBeat: (this.audioContext.currentTime - this.state.lastBeatTime) < 0.05,
      beatCount: this.state.beatCount,
      lastBeatTime: this.state.lastBeatTime,
      currentTempo: this.state.currentTempo,
      beatPhase: this.state.beatPhase,
      confidence: this.state.beatConfidence
    };
  }

  /**
   * Get predicted beats
   * @param {number} [count=4] - Number of beats to predict
   * @returns {Array} Predicted beats
   */
  getPredictedBeats(count = 4) {
    return this.state.predictedBeats.slice(0, count);
  }

  /**
   * Get detected tempo
   * @returns {Object} Tempo data
   */
  getDetectedTempo() {
    return {
      tempo: Math.round(this.state.currentTempo * 10) / 10,
      confidence: this.state.beatConfidence,
      averageInterval: this.state.intervalHistory.length > 0 ? 
        this._calculateAverageInterval() : 0
    };
  }

  /**
   * Get beat phase (0-1 position in beat cycle)
   * @returns {number} Beat phase
   */
  getBeatPhase() {
    // Update phase calculation
    this._updateBeatPhase(this.audioContext.currentTime);
    return this.state.beatPhase;
  }

  /**
   * Reset detector state
   */
  reset() {
    // Reset energy history
    this.state.energyHistory = new Array(this.config.historySize).fill(0);
    
    // Reset interval history
    this.state.intervalHistory = [];
    
    // Reset beat history
    this.state.beatHistory = [];
    
    // Reset detection state
    this.state.lastBeatTime = 0;
    this.state.beatConfidence = 0;
    this.state.currentTempo = 0;
    this.state.beatPhase = 0;
    this.state.beatCount = 0;
    
    // Spectral flux detection reset
    this._prevFrequencyData = null;
    this._fluxThreshold = 0.05;
    
    this._emitEvent('beat:reset', {
      time: this.audioContext.currentTime
    });
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
        source: 'BeatDetector',
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
    // Stop detection
    this.stopDetection();
    
    // Remove event listeners
    if (this.EventBus) {
      this.EventBus.off('analysis:updated');
    }
    
    this._emitEvent('beat:disposed', {
      time: Date.now()
    });
  }
}

export default BeatDetector;