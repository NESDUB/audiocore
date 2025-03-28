/**
 * FrequencyMapper.js
 * Transforms raw frequency data into meaningful visualization parameters,
 * mapping audio characteristics to visual properties through configurable mapping strategies.
 */
class FrequencyMapper {
  /**
   * Creates a new FrequencyMapper instance
   * @param {Object} options - Configuration options
   * @param {SignalProcessor} options.SignalProcessor - Reference to SignalProcessor component
   * @param {BeatDetector} options.beatDetector - Reference to BeatDetector component
   * @param {EventBus} options.eventBus - Reference to EventBus
   * @param {AudioEngineCore} [options.audioEngineCore] - Optional reference to AudioEngineCore
   * @param {Object} [options.config] - Additional configuration options
   */
  constructor(options = {}) {
    this._validateDependencies(options);
    this._initializeServices(options);
    this._initializeConfig(options.config);
    this._initializeState();
    this._initializeStrategies();
    this._setupDefaultProfiles();
    this._initializeAdaptiveMapping();
    this._setDefaultProfile();
    
    this._emitEvent('mapper:initialized', {
      activeProfile: this.state.activeProfile,
      availableProfiles: Object.keys(this.state.mappingProfiles)
    });
  }
  
  // =========================================================================
  // PUBLIC API
  // =========================================================================
  
  /**
   * Set active mapping profile
   * @param {string|Object} profileNameOrObject - Profile name or object
   * @returns {boolean} Success status
   */
  setMappingProfile(profileNameOrObject) {
    try {
      const profile = this._resolveProfile(profileNameOrObject);
      this.state.activeProfile = profile.name;
      this.state.previousParameters = null; // Force recalculation
      
      this._emitEvent('mapper:profile-changed', {
        profile: this.state.activeProfile
      });
      
      return true;
    } catch (error) {
      this._handleError(error, 'setMappingProfile');
      return false;
    }
  }
  
  /**
   * Register a new mapping profile
   * @param {Object} profile - Mapping profile to register
   * @returns {boolean} Success status
   */
  registerMappingProfile(profile) {
    try {
      this._validateProfile(profile);
      this.state.mappingProfiles[profile.name] = profile;
      
      this._emitEvent('mapper:profile-registered', {
        profileName: profile.name,
        mappingCount: profile.mappings.length
      });
      
      return true;
    } catch (error) {
      this._handleError(error, 'registerMappingProfile');
      return false;
    }
  }
  
  /**
   * Get all available mapping profiles
   * @returns {Object} Mapping profiles
   */
  getAvailableProfiles() {
    const profiles = {};
    
    for (const [name, profile] of Object.entries(this.state.mappingProfiles)) {
      profiles[name] = {
        description: profile.description || '',
        mappingCount: profile.mappings.length
      };
    }
    
    return profiles;
  }
  
  /**
   * Get active profile name
   * @returns {string} Active profile name
   */
  getActiveProfile() {
    return this.state.activeProfile;
  }
  
  /**
   * Map frequency data to visualization parameters
   * @param {Object} [profile] - Optional mapping profile override
   * @returns {Object} Mapped parameters
   */
  mapToParameters(profile) {
    try {
      const profileName = profile || this.state.activeProfile;
      const mappingProfile = this.state.mappingProfiles[profileName];
      
      if (!mappingProfile) {
        throw new Error(`Mapping profile '${profileName}' not found`);
      }
      
      const analysisData = this._getAnalysisData();
      
      if (!analysisData) {
        return this.state.previousParameters || {};
      }
      
      const mappedParams = this._createParameterStructure(analysisData);
      
      // Apply each mapping in the profile
      for (const mapping of mappingProfile.mappings) {
        this._applyMapping(mappedParams, analysisData, mapping);
      }
      
      // Apply parameter smoothing if enabled
      if (this.config.smoothingEnabled && this.state.previousParameters) {
        this._smoothParameters(mappedParams);
      }
      
      // Update adaptive mapping if enabled
      if (this.config.adaptiveMappingEnabled) {
        this._updateAdaptiveMapping(mappedParams, analysisData);
      }
      
      // Store for smoothing
      this.state.previousParameters = { ...mappedParams };
      
      return mappedParams;
    } catch (error) {
      this._handleError(error, 'mapToParameters');
      return this.state.previousParameters || {};
    }
  }
  
  /**
   * Start continuous parameter mapping
   * @param {number} [updateRate=60] - Updates per second
   * @returns {boolean} Success status
   */
  startMapping(updateRate = this.config.updateRate) {
    if (this.state.isMapping) return true;
    
    try {
      const interval = Math.max(16, 1000 / updateRate);
      
      this.state.mappingInterval = setInterval(() => {
        const mappedParams = this.mapToParameters();
        
        this._emitEvent('mapper:parameters-updated', {
          profile: this.state.activeProfile,
          parameters: mappedParams
        });
      }, interval);
      
      this.state.isMapping = true;
      this.state.lastUpdateTime = performance.now();
      
      this._emitEvent('mapper:started', {
        updateRate,
        interval
      });
      
      return true;
    } catch (error) {
      this._handleError(error, 'startMapping');
      return false;
    }
  }
  
  /**
   * Stop continuous parameter mapping
   * @returns {boolean} Success status
   */
  stopMapping() {
    if (!this.state.isMapping) return true;
    
    try {
      if (this.state.mappingInterval) {
        clearInterval(this.state.mappingInterval);
        this.state.mappingInterval = null;
      }
      
      this.state.isMapping = false;
      
      this._emitEvent('mapper:stopped', {
        duration: performance.now() - this.state.lastUpdateTime
      });
      
      return true;
    } catch (error) {
      this._handleError(error, 'stopMapping');
      return false;
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
    this.stopMapping();
    
    this._emitEvent('mapper:disposed', {
      time: Date.now()
    });
  }
  
  // =========================================================================
  // INITIALIZATION METHODS
  // =========================================================================
  
  /**
   * Validate required dependencies
   * @private
   * @param {Object} options - Component options
   */
  _validateDependencies(options) {
    if (!options.SignalProcessor) {
      throw new Error('FrequencyMapper requires SignalProcessor component');
    }
    
    if (!options.beatDetector) {
      throw new Error('FrequencyMapper requires BeatDetector component');
    }
  }
  
  /**
   * Initialize service dependencies
   * @private
   * @param {Object} options - Component options
   */
  _initializeServices(options) {
    this.SignalProcessor = options.SignalProcessor;
    this.beatDetector = options.beatDetector;
    this.eventBus = options.eventBus;
    this.audioEngineCore = options.audioEngineCore;
    
    // Get audio context
    if (this.audioEngineCore) {
      this.audioContext = this.audioEngineCore.getContext();
    } else if (this.SignalProcessor.audioContext) {
      this.audioContext = this.SignalProcessor.audioContext;
    } else {
      throw new Error('FrequencyMapper requires AudioContext access');
    }
  }
  
  /**
   * Initialize configuration
   * @private
   * @param {Object} config - Configuration options
   */
  _initializeConfig(config = {}) {
    this.config = {
      bandRanges: config?.bandRanges || this._defaultBandRanges(),
      bandWeights: config?.bandWeights || { bass: 1.0, mid: 0.8, high: 0.6 },
      smoothingEnabled: config?.smoothingEnabled !== false,
      smoothingFactor: config?.smoothingFactor || 0.3,
      defaultProfile: config?.defaultProfile || 'standard',
      adaptiveMappingEnabled: config?.adaptiveMappingEnabled !== false,
      updateRate: config?.updateRate || 60, // Hz
      ...config
    };
  }
  
  /**
   * Initialize state
   * @private
   */
  _initializeState() {
    this.state = {
      activeProfile: '',
      mappingProfiles: {},
      previousParameters: null,
      mappedValues: {},
      lastUpdateTime: 0,
      isMapping: false,
      adaptiveState: null
    };
  }
  
  /**
   * Initialize mapping strategies
   * @private
   */
  _initializeStrategies() {
    // Define mapping strategies using a strategy pattern
    this.mappingStrategies = {
      linear: this._applyLinearMapping.bind(this),
      exponential: this._applyExponentialMapping.bind(this),
      logarithmic: this._applyLogarithmicMapping.bind(this),
      custom: this._applyCustomMapping.bind(this)
    };
    
    // Define array mapping strategies
    this.arrayMappingStrategies = {
      linear: this._mapFrequencyBandsLinear.bind(this),
      logarithmic: this._mapFrequencyBandsLogarithmic.bind(this),
      exponential: this._mapFrequencyBandsExponential.bind(this)
    };
  }
  
  /**
   * Initialize adaptive mapping state
   * @private
   */
  _initializeAdaptiveMapping() {
    this.state.adaptiveState = {
      energyHistory: new Array(30).fill(0),
      peakHistory: { low: 0.1, mid: 0.1, high: 0.1 },
      rangeAdjustments: {}
    };
  }
  
  /**
   * Set default profile
   * @private
   */
  _setDefaultProfile() {
    this.setMappingProfile(this.config.defaultProfile);
  }
  
  // =========================================================================
  // MAPPING PROFILES
  // =========================================================================
  
  /**
   * Set up default mapping profiles
   * @private
   */
  _setupDefaultProfiles() {
    const standardProfile = this._createStandardProfile();
    const spectrumProfile = this._createSpectrumProfile();
    const particleProfile = this._createParticleProfile();
    
    this.state.mappingProfiles = {
      standard: standardProfile,
      spectrum: spectrumProfile,
      particles: particleProfile
    };
  }
  
  /**
   * Create standard mapping profile
   * @private
   * @returns {Object} Standard profile
   */
  _createStandardProfile() {
    return {
      name: 'standard',
      description: 'Standard mapping for general visualizations',
      mappings: [
        {
          sourceParameter: 'energy.bass',
          targetParameter: 'size.base',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.5, outputMax: 1.5 }
        },
        {
          sourceParameter: 'energy.total',
          targetParameter: 'intensity',
          strategy: 'exponential',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.2, outputMax: 1 },
          options: { exponent: 1.5 }
        },
        {
          sourceParameter: 'spectral.centroid',
          targetParameter: 'color.hue',
          strategy: 'linear',
          range: { inputMin: 200, inputMax: 8000, outputMin: 0, outputMax: 1 }
        },
        {
          sourceParameter: 'energy.high',
          targetParameter: 'color.brightness',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.4, outputMax: 1 }
        },
        {
          sourceParameter: 'beat.phase',
          targetParameter: 'pulse.phase',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0, outputMax: 1 }
        },
        {
          sourceParameter: 'beat.confidence',
          targetParameter: 'pulse.intensity',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0, outputMax: 1 }
        }
      ]
    };
  }
  
  /**
   * Create spectrum mapping profile
   * @private
   * @returns {Object} Spectrum profile
   */
  _createSpectrumProfile() {
    return {
      name: 'spectrum',
      description: 'Maps frequency bands to spectrum visualization',
      mappings: [
        {
          sourceParameter: 'rawFrequency',
          targetParameter: 'barHeights',
          strategy: 'logarithmic',
          range: { inputMin: -100, inputMax: 0, outputMin: 0, outputMax: 1 },
          options: { normalization: 'perBand' }
        },
        {
          sourceParameter: 'energy.bass',
          targetParameter: 'color.hue',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.5, outputMax: 0.7 }
        },
        {
          sourceParameter: 'energy.mid',
          targetParameter: 'color.saturation',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.5, outputMax: 1 }
        },
        {
          sourceParameter: 'energy.high',
          targetParameter: 'color.brightness',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.5, outputMax: 1 }
        }
      ]
    };
  }
  
  /**
   * Create particle mapping profile
   * @private
   * @returns {Object} Particle profile
   */
  _createParticleProfile() {
    return {
      name: 'particles',
      description: 'Mapping for particle-based visualizations',
      mappings: [
        {
          sourceParameter: 'energy.total',
          targetParameter: 'emissionRate',
          strategy: 'exponential',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.1, outputMax: 1 },
          options: { exponent: 2 }
        },
        {
          sourceParameter: 'energy.bass',
          targetParameter: 'particleSize',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0.5, outputMax: 2 }
        },
        {
          sourceParameter: 'spectral.centroid',
          targetParameter: 'particleColor',
          strategy: 'linear',
          range: { inputMin: 200, inputMax: 10000, outputMin: 0, outputMax: 1 }
        },
        {
          sourceParameter: 'beat.energy',
          targetParameter: 'forcePulse',
          strategy: 'exponential',
          range: { inputMin: 0, inputMax: 1, outputMin: 0, outputMax: 10 },
          options: { exponent: 3 }
        },
        {
          sourceParameter: 'spectral.spread',
          targetParameter: 'turbulence',
          strategy: 'linear',
          range: { inputMin: 0, inputMax: 1, outputMin: 0, outputMax: 2 }
        }
      ]
    };
  }
  
  /**
   * Resolve profile from name or object
   * @private
   * @param {string|Object} profileNameOrObject - Profile name or object
   * @returns {Object} Profile object
   */
  _resolveProfile(profileNameOrObject) {
    if (typeof profileNameOrObject === 'string') {
      const profile = this.state.mappingProfiles[profileNameOrObject];
      
      if (!profile) {
        throw new Error(`Mapping profile '${profileNameOrObject}' not found`);
      }
      
      return profile;
    }
    
    if (typeof profileNameOrObject === 'object') {
      this._validateProfile(profileNameOrObject);
      
      if (!this.state.mappingProfiles[profileNameOrObject.name]) {
        this.registerMappingProfile(profileNameOrObject);
      }
      
      return profileNameOrObject;
    }
    
    throw new Error('Profile must be a string name or profile object');
  }
  
  /**
   * Validate profile structure
   * @private
   * @param {Object} profile - Profile to validate
   */
  _validateProfile(profile) {
    if (!profile.name || !Array.isArray(profile.mappings)) {
      throw new Error('Invalid mapping profile structure');
    }
    
    for (const mapping of profile.mappings) {
      if (!mapping.sourceParameter || !mapping.targetParameter || !mapping.strategy) {
        throw new Error('Invalid mapping definition in profile');
      }
      
      if (!mapping.range || mapping.range.inputMin === undefined || 
          mapping.range.inputMax === undefined || 
          mapping.range.outputMin === undefined || 
          mapping.range.outputMax === undefined) {
        throw new Error('Invalid range definition in mapping');
      }
      
      if (mapping.strategy === 'custom' && typeof mapping.options?.customFunction !== 'function') {
        throw new Error('Custom mapping strategy requires a customFunction option');
      }
    }
  }
  
  // =========================================================================
  // MAPPING LOGIC
  // =========================================================================
  
  /**
   * Create parameter structure
   * @private
   * @param {Object} analysisData - Analysis data
   * @returns {Object} Parameter structure
   */
  _createParameterStructure(analysisData) {
    return {
      // Basic audio energy parameters
      energy: {
        total: analysisData.energy.total || 0,
        bass: analysisData.energy.bass || 0,
        mid: analysisData.energy.mid || 0,
        high: analysisData.energy.high || 0
      },
      
      // Beat information
      beat: {
        phase: analysisData.beat.phase || 0,
        confidence: analysisData.beat.confidence || 0,
        tempo: analysisData.beat.tempo || 0,
        energy: analysisData.beat.energy || 0,
        isBeat: analysisData.beat.isBeat || false
      },
      
      // Spectral characteristics
      spectral: {
        centroid: analysisData.spectral.centroid || 0,
        spread: analysisData.spectral.spread || 0,
        flatness: analysisData.spectral.flatness || 0
      },
      
      // Mapped values based on profile
      mapped: {},
      
      // Raw frequency and waveform data references
      raw: {
        frequencyData: analysisData.frequency,
        waveformData: analysisData.waveform
      },
      
      // Timestamp of this mapping
      timestamp: performance.now()
    };
  }
  
  /**
   * Apply a single mapping definition
   * @private
   * @param {Object} mappedParams - Target mapped parameters object
   * @param {Object} analysisData - Source analysis data
   * @param {Object} mapping - Mapping definition
   */
  _applyMapping(mappedParams, analysisData, mapping) {
    const { sourceParameter, targetParameter, strategy, range, options = {} } = mapping;
    
    // Get source value based on parameter path
    const sourceValue = this._getParameterByPath(analysisData, sourceParameter);
    
    // If source value is not available, skip this mapping
    if (sourceValue === undefined || sourceValue === null) {
      return;
    }
    
    // Apply specific handling for array data (frequency bands)
    if (Array.isArray(sourceValue) && sourceParameter === 'rawFrequency') {
      const arrayStrategy = this.arrayMappingStrategies[strategy] || this.arrayMappingStrategies.linear;
      const mappedValue = arrayStrategy(sourceValue, range, options);
      this._setParameterByPath(mappedParams.mapped, targetParameter, mappedValue);
      return;
    }
    
    // Apply the mapping strategy for scalar values
    const strategyFn = this.mappingStrategies[strategy] || this.mappingStrategies.linear;
    const mappedValue = strategyFn(sourceValue, range, options);
    
    // Store the mapped value at the specified path
    this._setParameterByPath(mappedParams.mapped, targetParameter, mappedValue);
  }
  
  /**
   * Apply linear mapping from input range to output range
   * @private
   * @param {number} value - Input value
   * @param {Object} range - Range object with inputMin, inputMax, outputMin, outputMax
   * @param {Object} options - Additional options
   * @returns {number} Mapped value
   */
  _applyLinearMapping(value, range, options = {}) {
    // Handle array inputs
    if (Array.isArray(value)) {
      return value.map(v => this._applyLinearMapping(v, range, options));
    }
    
    // Normalize input to 0-1 range (with possible clamping)
    let normalizedValue;
    
    if (options.clamp !== false) {
      normalizedValue = Math.max(0, Math.min(1,
        (value - range.inputMin) / (range.inputMax - range.inputMin)
      ));
    } else {
      normalizedValue = (value - range.inputMin) / (range.inputMax - range.inputMin);
    }
    
    // Map to output range
    return range.outputMin + normalizedValue * (range.outputMax - range.outputMin);
  }
  
  /**
   * Apply exponential mapping (emphasizes smaller or larger values)
   * @private
   * @param {number} value - Input value
   * @param {Object} range - Range object with inputMin, inputMax, outputMin, outputMax
   * @param {Object} options - Additional options
   * @returns {number} Mapped value
   */
  _applyExponentialMapping(value, range, options = {}) {
    // Handle array inputs
    if (Array.isArray(value)) {
      return value.map(v => this._applyExponentialMapping(v, range, options));
    }
    
    const exponent = options.exponent || 2;
    
    // First normalize to 0-1
    let normalizedValue;
    
    if (options.clamp !== false) {
      normalizedValue = Math.max(0, Math.min(1,
        (value - range.inputMin) / (range.inputMax - range.inputMin)
      ));
    } else {
      normalizedValue = (value - range.inputMin) / (range.inputMax - range.inputMin);
    }
    
    // Apply power curve
    let exponentialValue;
    
    if (exponent >= 0) {
      // Emphasis on lower values (e.g., exponent = 2)
      exponentialValue = Math.pow(normalizedValue, exponent);
    } else {
      // Emphasis on higher values (e.g., exponent = -2)
      exponentialValue = 1 - Math.pow(1 - normalizedValue, -exponent);
    }
    
    // Map to output range
    return range.outputMin + exponentialValue * (range.outputMax - range.outputMin);
  }
  
  /**
   * Apply logarithmic mapping (better for audio levels)
   * @private
   * @param {number} value - Input value
   * @param {Object} range - Range object with inputMin, inputMax, outputMin, outputMax
   * @param {Object} options - Additional options
   * @returns {number} Mapped value
   */
  _applyLogarithmicMapping(value, range, options = {}) {
    // Handle array inputs
    if (Array.isArray(value)) {
      return value.map(v => this._applyLogarithmicMapping(v, range, options));
    }
    
    // Handle special case of dB values
    let normalizedValue;
    
    if (options.isDecibels) {
      // For decibels (typical range like -100 to 0 dB)
      // Normalize to 0-1 with log scaling already applied
      normalizedValue = Math.max(0, Math.min(1,
        (value - range.inputMin) / (range.inputMax - range.inputMin)
      ));
    } else {
      // For linear values, apply log scaling
      // Ensure value is positive (log of negative is undefined)
      const positiveValue = Math.max(1e-10, value);
      const positiveMin = Math.max(1e-10, range.inputMin);
      const positiveMax = Math.max(positiveMin * 1.001, range.inputMax);
      
      // Log base doesn't matter for normalization
      normalizedValue = Math.log(positiveValue / positiveMin) / Math.log(positiveMax / positiveMin);
      
      // Clamp if requested
      if (options.clamp !== false) {
        normalizedValue = Math.max(0, Math.min(1, normalizedValue));
      }
    }
    
    // Map to output range
    return range.outputMin + normalizedValue * (range.outputMax - range.outputMin);
  }
  
  /**
   * Apply custom mapping function
   * @private
   * @param {number} value - Input value
   * @param {Object} range - Range object with inputMin, inputMax, outputMin, outputMax
   * @param {Object} options - Additional options
   * @returns {number} Mapped value
   */
  _applyCustomMapping(value, range, options = {}) {
    if (typeof options.customFunction === 'function') {
      return options.customFunction(value, range, options);
    }
    
    // Fall back to linear mapping
    return this._applyLinearMapping(value, range, options);
  }
  
  /**
   * Map frequency bands with linear scaling
   * @private
   * @param {Float32Array|Uint8Array} frequencyData - Frequency data
   * @param {Object} range - Range object
   * @param {Object} options - Additional options
   * @returns {Array} Mapped band values
   */
  _mapFrequencyBandsLinear(frequencyData, range, options = {}) {
    const bandsResult = [];
    const binSize = this.audioContext.sampleRate / (2 * frequencyData.length);
    
    // Process each pre-defined frequency band
    for (const [bandName, bandRange] of Object.entries(this.config.bandRanges)) {
      const startBin = Math.floor(bandRange.min / binSize);
      const endBin = Math.min(Math.ceil(bandRange.max / binSize), frequencyData.length - 1);
      
      // Create array slice for this band
      const bandData = frequencyData.slice(startBin, endBin + 1);
      
      // Apply linear mapping to each value in this band
      const mappedBandData = Array.from(bandData).map(value =>
        this._applyLinearMapping(value, range, options)
      );
      
      // Add mapped band data to result
      bandsResult.push({
        name: bandName,
        range: bandRange,
        values: mappedBandData
      });
    }
    
    return bandsResult;
  }
  
  /**
   * Map frequency bands with logarithmic scaling
   * @private
   * @param {Float32Array|Uint8Array} frequencyData - Frequency data
   * @param {Object} range - Range object
   * @param {Object} options - Additional options
   * @returns {Array} Mapped band values
   */
  _mapFrequencyBandsLogarithmic(frequencyData, range, options = {}) {
    const bandsResult = [];
    const binSize = this.audioContext.sampleRate / (2 * frequencyData.length);
    const isFloat = frequencyData instanceof Float32Array;
    
    // Set up logarithmic mapping options
    const logOptions = {
      ...options,
      isDecibels: isFloat // Float data from SignalProcessor is already in dB
    };
    
    // Process each pre-defined frequency band
    for (const [bandName, bandRange] of Object.entries(this.config.bandRanges)) {
      const startBin = Math.floor(bandRange.min / binSize);
      const endBin = Math.min(Math.ceil(bandRange.max / binSize), frequencyData.length - 1);
      
      // Create array slice for this band
      const bandData = frequencyData.slice(startBin, endBin + 1);
      
      // Apply logarithmic mapping to each value in this band
      const mappedBandData = Array.from(bandData).map(value =>
        this._applyLogarithmicMapping(value, range, logOptions)
      );
      
      // Add mapped band data to result
      bandsResult.push({
        name: bandName,
        range: bandRange,
        values: mappedBandData
      });
    }
    
    return bandsResult;
  }
  
  /**
   * Map frequency bands with exponential scaling
   * @private
   * @param {Float32Array|Uint8Array} frequencyData - Frequency data
   * @param {Object} range - Range object
   * @param {Object} options - Additional options
   * @returns {Array} Mapped band values
   */
  _mapFrequencyBandsExponential(frequencyData, range, options = {}) {
    const bandsResult = [];
    const binSize = this.audioContext.sampleRate / (2 * frequencyData.length);
    const exponent = options.exponent || 2;
    
    // Process each pre-defined frequency band
    for (const [bandName, bandRange] of Object.entries(this.config.bandRanges)) {
      const startBin = Math.floor(bandRange.min / binSize);
      const endBin = Math.min(Math.ceil(bandRange.max / binSize), frequencyData.length - 1);
      
      // Create array slice for this band
      const bandData = frequencyData.slice(startBin, endBin + 1);
      
      // Apply exponential mapping to each value in this band
      const mappedBandData = Array.from(bandData).map(value =>
        this._applyExponentialMapping(value, range, options)
      );
      
      // Add mapped band data to result
      bandsResult.push({
        name: bandName,
        range: bandRange,
        values: mappedBandData
      });
    }
    
    return bandsResult;
  }
  
  // =========================================================================
  // PARAMETER PROCESSING
  // =========================================================================
  
  /**
   * Smooth parameters between updates
   * @private
   * @param {Object} currentParams - Current parameters
   */
  _smoothParameters(currentParams) {
    const previousParams = this.state.previousParameters;
    if (!previousParams) return;
    
    const smoothingFactor = this.config.smoothingFactor;
    
    // Smooth energy values
    this._smoothObjectValues(currentParams.energy, previousParams.energy, smoothingFactor);
    
    // Smooth spectral values
    this._smoothObjectValues(currentParams.spectral, previousParams.spectral, smoothingFactor);
    
    // Smooth mapped parameters
    if (currentParams.mapped && previousParams.mapped) {
      this._smoothObjectValues(currentParams.mapped, previousParams.mapped, smoothingFactor);
    }
  }
  
  /**
   * Smooth values in an object
   * @private
   * @param {Object} current - Current values
   * @param {Object} previous - Previous values
   * @param {number} factor - Smoothing factor (0-1)
   */
  _smoothObjectValues(current, previous, factor) {
    if (!current || !previous) return;
    
    for (const key in current) {
      if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
        // Apply smoothing formula: newValue = prevValue * factor + currentValue * (1-factor)
        current[key] = previous[key] * factor + current[key] * (1 - factor);
      } else if (typeof current[key] === 'object' && typeof previous[key] === 'object') {
        // Recurse for nested objects
        this._smoothObjectValues(current[key], previous[key], factor);
      }
      // Skip non-numeric, non-object properties
    }
  }
  
  /**
   * Update adaptive mapping state
   * @private
   * @param {Object} mappedParams - Current mapped parameters
   * @param {Object} analysisData - Current analysis data
   */
  _updateAdaptiveMapping(mappedParams, analysisData) {
    // Skip if adaptive mapping is disabled
    if (!this.config.adaptiveMappingEnabled) return;
    
    // Update energy history
    this.state.adaptiveState.energyHistory.push(analysisData.energy.total || 0);
    if (this.state.adaptiveState.energyHistory.length > 30) {
      this.state.adaptiveState.energyHistory.shift();
    }
    
    // Update peak values for each band
    for (const band of ['bass', 'mid', 'high']) {
      const energy = analysisData.energy[band] || 0;
      if (energy > this.state.adaptiveState.peakHistory[band]) {
        this.state.adaptiveState.peakHistory[band] = energy;
      } else {
        // Slowly decay peak value
        this.state.adaptiveState.peakHistory[band] *= 0.9999;
      }
    }
  }
  
  // =========================================================================
  // DATA PROCESSING & UTILITIES
  // =========================================================================
  
  /**
   * Get all analysis data from components
   * @private
   * @returns {Object} Combined analysis data
   */
  _getAnalysisData() {
    // Get data from SignalProcessor
    const frequencyData = this.SignalProcessor.getFrequencyData(true);
    const waveformData = this.SignalProcessor.getWaveformData(true);
    const bands = this.SignalProcessor.analyzeFrequencyBands ? 
      this.SignalProcessor.analyzeFrequencyBands() : null;
    const features = this.SignalProcessor.getFeatures ? 
      this.SignalProcessor.getFeatures() : {};
    
    // Get data from beat detector
    const beatState = this.beatDetector.getCurrentState ? 
      this.beatDetector.getCurrentState() : {};
    const tempoData = this.beatDetector.getDetectedTempo ? 
      this.beatDetector.getDetectedTempo() : { tempo: 0, confidence: 0 };
    
    // If no frequency data is available, return null
    if (!frequencyData) return null;
    
    // Build combined analysis data
    return {
      frequency: frequencyData,
      waveform: waveformData,
      
      // Energy values
      energy: {
        // Band energy from SignalProcessor if available, otherwise calculate from raw data
        bass: bands?.bass?.energy || 0,
        mid: (bands?.mid?.energy + (bands?.lowMid?.energy || 0)) / 2 || 0,
        high: (bands?.high?.energy + (bands?.highMid?.energy || 0)) / 2 || 0,
        
        // Overall energy (weighted average)
        total: this._calculateOverallEnergy(bands)
      },
      
      // Beat information
      beat: {
        phase: beatState.beatPhase || 0,
        confidence: beatState.confidence || tempoData.confidence || 0,
        tempo: beatState.currentTempo || tempoData.tempo || 0,
        isBeat: beatState.isBeat || false,
        energy: features.energy || 0
      },
      
      // Spectral characteristics
      spectral: {
        centroid: features.spectral?.centroid || 0,
        spread: features.spectral?.rolloff ? 
          features.spectral.rolloff / 20000 : 0,
        flatness: features.spectral?.flatness || 0
      }
    };
  }
  
  /**
   * Default frequency band ranges
   * @private
   * @returns {Object} Default band ranges
   */
  _defaultBandRanges() {
    return {
      bass: { min: 20, max: 250 },
      lowMid: { min: 250, max: 500 },
      mid: { min: 500, max: 2000 },
      highMid: { min: 2000, max: 4000 },
      high: { min: 4000, max: 20000 }
    };
  }
  
  /**
   * Calculate overall audio energy
   * @private
   * @param {Object} bands - Frequency bands data
   * @returns {number} Overall energy level (0-1)
   */
  _calculateOverallEnergy(bands) {
    if (!bands) return 0;
    
    // Calculate weighted average of all bands
    let totalEnergy = 0;
    let totalWeight = 0;
    
    // Process each band that exists
    if (bands.bass && bands.bass.energy !== undefined) {
      totalEnergy += bands.bass.energy * this.config.bandWeights.bass;
      totalWeight += this.config.bandWeights.bass;
    }
    
    if (bands.mid && bands.mid.energy !== undefined) {
      totalEnergy += bands.mid.energy * this.config.bandWeights.mid;
      totalWeight += this.config.bandWeights.mid;
    } else if (bands.lowMid && bands.lowMid.energy !== undefined &&
               bands.highMid && bands.highMid.energy !== undefined) {
      // Average of low and high mid if available
      const midEnergy = (bands.lowMid.energy + bands.highMid.energy) / 2;
      totalEnergy += midEnergy * this.config.bandWeights.mid;
      totalWeight += this.config.bandWeights.mid;
    }
    
    if (bands.high && bands.high.energy !== undefined) {
      totalEnergy += bands.high.energy * this.config.bandWeights.high;
      totalWeight += this.config.bandWeights.high;
    }
    
    return totalWeight > 0 ? totalEnergy / totalWeight : 0;
  }
  
  /**
   * Get parameter value by path
   * @private
   * @param {Object} obj - Source object
   * @param {string} path - Parameter path (e.g., 'energy.bass')
   * @returns {*} Parameter value
   */
  _getParameterByPath(obj, path) {
    // Special case for raw frequency data
    if (path === 'rawFrequency' && obj.frequency) {
      return obj.frequency;
    }
    
    // Handle nested properties with dot notation
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
  
  /**
   * Set parameter value by path
   * @private
   * @param {Object} obj - Target object
   * @param {string} path - Parameter path (e.g., 'size.base')
   * @param {*} value - Value to set
   */
  _setParameterByPath(obj, path, value) {
    // Handle nested properties with dot notation
    const parts = path.split('.');
    const lastPart = parts.pop();
    
    let target = obj;
    
    // Navigate to the correct nesting level
    for (const part of parts) {
      if (target[part] === undefined) {
        target[part] = {};
      }
      target = target[part];
    }
    
    // Set the value
    target[lastPart] = value;
  }
  
  /**
   * Emit an event through EventBus
   * @private
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  _emitEvent(type, data) {
    if (this.eventBus && typeof this.eventBus.emit === 'function') {
      this.eventBus.emit(type, {
        ...data,
        source: 'FrequencyMapper',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Handle error and emit error event
   * @private
   * @param {Error} error - Error object
   * @param {string} operation - Operation name
   */
  _handleError(error, operation) {
    console.error(`FrequencyMapper error in ${operation}:`, error);
    
    this._emitEvent('mapper:error', {
      error: error.message,
      operation,
      stack: error.stack
    });
    
    return error;
  }
}

export default FrequencyMapper;