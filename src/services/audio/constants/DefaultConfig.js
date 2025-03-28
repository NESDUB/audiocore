// src/constants/DefaultConfig.js

/**
 * Default configuration values for the AudioDomain environment
 * These values are used as fallbacks when specific configurations
 * are not provided.
 */

// Core engine configuration
export const ENGINE_CONFIG = {
  // Audio context options
  audioContext: {
    sampleRate: 44100,     // Default sample rate in Hz
    latencyHint: 'interactive', // 'interactive', 'playback', or 'balanced'
    channels: 2,           // Default channel count
    bitDepth: 32,          // Float32 representation
    autoResume: true,      // Auto-resume context on user interaction
    autoSuspend: true,     // Auto-suspend on inactivity
    suspendTimeout: 30     // Seconds before auto-suspend
  },
  
  // Performance settings
  performance: {
    bufferSize: 1024,      // Default processing buffer size
    priorityMode: 'balanced', // 'latency', 'quality', or 'balanced'
    workletEnabled: true,  // Enable AudioWorklet when available
    offlineRendering: false, // Use offline rendering for processing
    threadPoolSize: 4      // Number of worker threads if supported
  },
  
  // Memory management
  memory: {
    maxBufferCache: 104857600, // 100 MB in bytes
    maxBufferDuration: 300,    // Maximum buffer duration in seconds
    garbageCollectionInterval: 60, // GC interval in seconds
    preloadStrategy: 'lazy'    // 'eager', 'lazy', or 'none'
  },
  
  // Error handling
  errors: {
    recoveryAttempts: 3,       // Max retry attempts for recoverable errors
    strictMode: false,         // Throw errors for non-critical issues
    silentFallback: true,      // Use fallbacks silently
    logLevel: 'warning'        // 'debug', 'info', 'warning', 'error'
  }
};

// Audio source configuration
export const SOURCE_CONFIG = {
  // Buffer management
  buffer: {
    maxLength: 600,        // Maximum buffer length in seconds
    normalizeOnLoad: false, // Auto-normalize audio on load
    channelCount: 2,       // Default channel count for loaded audio
    resampleQuality: 'medium' // 'low', 'medium', or 'high'
  },
  
  // Playback defaults
  playback: {
    defaultGain: 1.0,      // Default source gain (0.0 to 1.0)
    fadeInTime: 0.01,      // Default fade-in time in seconds
    fadeOutTime: 0.01,     // Default fade-out time in seconds
    defaultPlaybackRate: 1.0, // Default playback rate
    loopDefault: false,    // Default loop setting
    loopStart: 0,          // Default loop start point in seconds
    loopEnd: 0             // Default loop end point in seconds (0 = end of file)
  },
  
  // Format support
  formats: {
    preferredFormat: 'wav', // Preferred audio format
    supportedFormats: ['wav', 'mp3', 'ogg', 'flac', 'aac'],
    prioritizeQuality: true // Prefer quality over file size
  },
  
  // Source types
  sourceTypes: {
    file: true,           // Enable file sources
    microphone: true,     // Enable microphone input
    oscillator: true,     // Enable oscillator sources
    stream: true,         // Enable MediaStream sources
    lineIn: true          // Enable line-in sources
  }
};

// Signal processing configuration
export const SIGNAL_CONFIG = {
  // DSP settings
  dsp: {
    defaultBlockSize: 256, // Processing block size
    oversampling: 0,      // Oversampling factor (0 = disabled)
    denormalizationPrevention: true, // Prevent denormals
    dithering: true,      // Apply dithering
    ditherType: 'triangular' // 'rectangular', 'triangular', or 'gaussian'
  },
  
  // Effect defaults
  effects: {
    maxChainLength: 10,   // Maximum number of effects in a chain
    bypassOnError: true,  // Bypass effect on error
    defaultWetDry: 1.0,   // Default wet/dry mix (0.0 to 1.0)
    saveStateOnChange: true // Save effect state on parameter change
  },
  
  // Preset management
  presets: {
    autoSave: true,       // Auto-save parameter changes to preset
    presetStorageKey: 'audio_domain_presets', // LocalStorage key
    maxPresets: 100,      // Maximum number of stored presets
    presetCategories: ['User', 'Factory', 'Shared']
  }
};

// Analysis configuration
export const ANALYSIS_CONFIG = {
  // SignalProcessor settings
  SignalProcessor: {
    fftSize: 2048,        // Default FFT size
    smoothingTimeConstant: 0.8, // Time constant for smoothing
    minDecibels: -100,    // Minimum value in dB
    maxDecibels: -30,     // Maximum value in dB
    refreshRate: 30       // Analysis refresh rate in fps
  },
  
  // Feature extraction
  features: {
    extractPitch: true,   // Extract fundamental frequency
    extractRMS: true,     // Extract RMS amplitude
    extractZeroCrossings: true, // Extract zero-crossing rate
    extractSpectralCentroid: true, // Extract spectral centroid
    extractSpectralFlatness: true // Extract spectral flatness
  },
  
  // Visualization
  visualization: {
    defaultType: 'waveform', // 'waveform', 'spectrum', 'sonogram'
    colorScheme: 'rainbow',  // 'rainbow', 'grayscale', 'heat'
    resolution: 'medium',    // 'low', 'medium', 'high'
    showAxes: true,          // Show coordinate axes
    showGrid: true,          // Show grid lines
    showLabels: true         // Show data labels
  }
};

// Output configuration
export const OUTPUT_CONFIG = {
  // Output routing
  routing: {
    defaultDestination: 'system', // 'system', 'file', or 'stream'
    channelMapping: [0, 1],    // Default output channel mapping
    monitorInput: false,       // Enable input monitoring
    directMonitoring: false    // Direct monitoring (hardware)
  },
  
  // Master output
  master: {
    gain: 0.8,                // Default master gain (0.0 to 1.0)
    enableLimiter: true,      // Enable output limiter
    limiterThreshold: -1.0,   // Limiter threshold in dB
    limiterRelease: 0.1,      // Limiter release time in seconds
    enableDithering: true,    // Enable output dithering
    meterPeakHold: 2000,      // Peak meter hold time in ms
    meterFalloff: 24          // Meter falloff in dB/s
  },
  
  // Device management
  devices: {
    preferredDeviceId: '',    // Preferred output device ID
    fallbackToDefault: true,  // Fallback to default device if preferred unavailable
    requiredChannels: 2,      // Minimum required output channels
    lowLatencyMode: false,    // Request low latency mode if available
    exclusiveMode: false      // Request exclusive mode if available
  }
};

// UI Configuration
export const UI_CONFIG = {
  // Theme settings
  theme: {
    colorMode: 'dark',        // 'dark' or 'light'
    accentColor: '#4080ff',   // Primary accent color
    fontSize: 'medium',       // 'small', 'medium', or 'large'
    fontFamily: 'Inter, system-ui, sans-serif',
    spacing: 'compact',       // 'compact', 'comfortable', or 'spacious'
    animationsEnabled: true   // Enable UI animations
  },
  
  // Controls
  controls: {
    showTooltips: true,       // Show tooltips on hover
    tooltipDelay: 500,        // Tooltip delay in ms
    knobSensitivity: 1.0,     // Rotary control sensitivity
    sliderSnap: false,        // Snap sliders to grid
    doubleClickReset: true,   // Reset control on double-click
    scrollWheelEnabled: true  // Enable scroll wheel for controls
  },
  
  // Layout
  layout: {
    showDebugConsole: true,   // Show debug console
    showStatusBar: true,      // Show status bar
    panelLayout: 'tabs',      // 'tabs', 'grid', or 'stack'
    rememberPanelState: true, // Remember panel collapsed/expanded state
    showTooltips: true,       // Show tooltips
    enableFullscreen: true    // Allow fullscreen mode
  },
  
  // Keyboard shortcuts
  shortcuts: {
    enabled: true,            // Enable keyboard shortcuts
    togglePlay: ' ',          // Space
    stop: 'Escape',           // Esc
    toggleFullscreen: 'F',    // F
    toggleConsole: '`',       // Backtick
    navigatePrevious: '[',    // Left bracket
    navigateNext: ']'         // Right bracket
  }
};

// Debug and development configuration
export const DEBUG_CONFIG = {
  // Debug features
  features: {
    debugMode: false,         // Enable debug mode
    verboseLogging: false,    // Enable verbose logging
    showPerformanceMetrics: false, // Show FPS and performance metrics
    developerTools: false,    // Show developer tools
    stressTest: false         // Enable stress testing
  },
  
  // Console settings
  console: {
    maxLogEntries: 100,       // Maximum console entries
    filterLevel: 'info',      // 'debug', 'info', 'warning', 'error'
    showTimestamps: true,     // Show timestamps in console
    groupSimilar: true,       // Group similar messages
    autoScroll: true,         // Auto-scroll to latest entry
    saveLogs: true            // Save logs to localStorage
  },
  
  // Test automation
  testing: {
    autoRunTests: false,      // Run tests on startup
    mockAudioContext: false,  // Use mock audio context for testing
    simulateLatency: false,   // Simulate processing latency
    latencyAmount: 100,       // Simulated latency in ms
    randomErrors: false       // Randomly inject errors for testing
  }
};

// Export all configurations as a single default object
export default {
  ENGINE_CONFIG,
  SOURCE_CONFIG,
  SIGNAL_CONFIG,
  ANALYSIS_CONFIG,
  OUTPUT_CONFIG,
  UI_CONFIG,
  DEBUG_CONFIG
};