/**
 * src/constants/TestSignals.js
 * Standard test signals and patterns for audio development and testing.
 * 
 * This module provides constants and configurations for generating
 * standard test signals used in audio processing and analysis.
 */

// Standard test frequencies (in Hz)
export const TEST_FREQUENCIES = {
  // Sub-bass range (20-60 Hz)
  SUB_BASS_LOW: 20,
  SUB_BASS_MID: 40,
  SUB_BASS_HIGH: 60,
  
  // Bass range (60-250 Hz)
  BASS_LOW: 80,
  BASS_MID: 120,
  BASS_HIGH: 200,
  
  // Low midrange (250-500 Hz)
  LOW_MID_LOW: 250,
  LOW_MID_MID: 350,
  LOW_MID_HIGH: 500,
  
  // Midrange (500-2000 Hz)
  MID_LOW: 700,
  MID_MID: 1000,
  MID_HIGH: 1500,
  
  // Upper midrange (2-4 kHz)
  HIGH_MID_LOW: 2000,
  HIGH_MID_MID: 3000,
  HIGH_MID_HIGH: 4000,
  
  // Presence (4-6 kHz)
  PRESENCE_LOW: 4500,
  PRESENCE_MID: 5000,
  PRESENCE_HIGH: 6000,
  
  // Brilliance (6-20 kHz)
  BRILLIANCE_LOW: 8000,
  BRILLIANCE_MID: 12000,
  BRILLIANCE_HIGH: 16000,
  
  // Standard reference frequencies
  REFERENCE_LOW: 440,   // A4 - standard tuning reference
  REFERENCE_MID: 1000,  // Standard reference for audio measurements
  REFERENCE_HIGH: 10000 // High-frequency reference
};

// Standard test durations (in seconds)
export const TEST_DURATIONS = {
  VERY_SHORT: 0.1,
  SHORT: 0.5,
  MEDIUM: 1.0,
  LONG: 3.0,
  VERY_LONG: 10.0
};

// Standard amplitude values (0-1 scale)
export const TEST_AMPLITUDES = {
  VERY_LOW: 0.05,
  LOW: 0.1,
  MEDIUM_LOW: 0.3,
  MEDIUM: 0.5,
  MEDIUM_HIGH: 0.7,
  HIGH: 0.9,
  REFERENCE: 0.7071 // -3dB, standard reference level
};

// Frequency bands for testing
export const FREQUENCY_BANDS = {
  SUB_BASS: { min: 20, max: 60 },
  BASS: { min: 60, max: 250 },
  LOW_MID: { min: 250, max: 500 },
  MID: { min: 500, max: 2000 },
  HIGH_MID: { min: 2000, max: 4000 },
  PRESENCE: { min: 4000, max: 6000 },
  BRILLIANCE: { min: 6000, max: 20000 }
};

// Standard test signal types
export const SIGNAL_TYPES = {
  SINE: 'sine',
  SQUARE: 'square',
  SAWTOOTH: 'sawtooth',
  TRIANGLE: 'triangle',
  WHITE_NOISE: 'white_noise',
  PINK_NOISE: 'pink_noise',
  SWEEP: 'sweep',
  PULSE: 'pulse',
  IMPULSE: 'impulse',
  SILENCE: 'silence'
};

// Standard test patterns
export const TEST_PATTERNS = {
  // Frequency sweep patterns
  SINE_SWEEP_LINEAR: {
    type: SIGNAL_TYPES.SWEEP,
    startFreq: 20,
    endFreq: 20000,
    duration: TEST_DURATIONS.LONG,
    amplitude: TEST_AMPLITUDES.MEDIUM,
    sweepType: 'linear'
  },
  
  SINE_SWEEP_LOG: {
    type: SIGNAL_TYPES.SWEEP,
    startFreq: 20,
    endFreq: 20000,
    duration: TEST_DURATIONS.LONG,
    amplitude: TEST_AMPLITUDES.MEDIUM,
    sweepType: 'logarithmic'
  },
  
  // Multi-tone patterns
  MULTITONE_OCTAVES: {
    type: 'multitone',
    frequencies: [125, 250, 500, 1000, 2000, 4000, 8000, 16000],
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.MEDIUM
  },
  
  // Noise patterns
  WHITE_NOISE_BURST: {
    type: SIGNAL_TYPES.WHITE_NOISE,
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.MEDIUM
  },
  
  PINK_NOISE_BURST: {
    type: SIGNAL_TYPES.PINK_NOISE,
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.MEDIUM
  },
  
  // Impulse response test
  IMPULSE: {
    type: SIGNAL_TYPES.IMPULSE,
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.HIGH,
    position: 0.1 // Position of impulse as fraction of duration
  },
  
  // Step response test
  STEP: {
    type: 'step',
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.HIGH,
    position: 0.1 // Position of step as fraction of duration
  },
  
  // Pulse train
  PULSE_TRAIN: {
    type: SIGNAL_TYPES.PULSE,
    frequency: 10, // Pulses per second
    pulseWidth: 0.1, // Duty cycle (0-1)
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.HIGH
  },
  
  // Frequency steps - octave intervals
  FREQUENCY_STEPS: {
    type: 'frequency_steps',
    frequencies: [125, 250, 500, 1000, 2000, 4000, 8000],
    stepDuration: 0.5, // Duration of each frequency in seconds
    amplitude: TEST_AMPLITUDES.MEDIUM,
    fadeTime: 0.01 // Fade time between steps in seconds
  },
  
  // Square wave with harmonics
  SQUARE_WAVE: {
    type: SIGNAL_TYPES.SQUARE,
    frequency: TEST_FREQUENCIES.MID_LOW,
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.MEDIUM
  },
  
  // Sawtooth with rich harmonic content
  SAWTOOTH: {
    type: SIGNAL_TYPES.SAWTOOTH,
    frequency: TEST_FREQUENCIES.MID_LOW,
    duration: TEST_DURATIONS.MEDIUM,
    amplitude: TEST_AMPLITUDES.MEDIUM
  }
};

// Standard test scenarios
export const TEST_SCENARIOS = {
  // Basic signal test with reference frequency
  REFERENCE_TONE: {
    name: 'Reference Tone Test',
    description: 'Standard 1kHz reference tone for calibration',
    signals: [
      {
        type: SIGNAL_TYPES.SINE,
        frequency: TEST_FREQUENCIES.REFERENCE_MID,
        duration: TEST_DURATIONS.MEDIUM,
        amplitude: TEST_AMPLITUDES.REFERENCE
      }
    ]
  },
  
  // Frequency response test across spectrum
  FREQUENCY_RESPONSE: {
    name: 'Frequency Response Test',
    description: 'Tests system response across the audible frequency spectrum',
    signals: [
      {
        ...TEST_PATTERNS.SINE_SWEEP_LOG
      }
    ]
  },
  
  // Dynamic range test
  DYNAMIC_RANGE: {
    name: 'Dynamic Range Test',
    description: 'Tests system response at different amplitude levels',
    signals: [
      {
        type: SIGNAL_TYPES.SINE,
        frequency: TEST_FREQUENCIES.REFERENCE_MID,
        duration: TEST_DURATIONS.SHORT,
        amplitude: TEST_AMPLITUDES.VERY_LOW
      },
      {
        type: SIGNAL_TYPES.SINE,
        frequency: TEST_FREQUENCIES.REFERENCE_MID,
        duration: TEST_DURATIONS.SHORT,
        amplitude: TEST_AMPLITUDES.LOW
      },
      {
        type: SIGNAL_TYPES.SINE,
        frequency: TEST_FREQUENCIES.REFERENCE_MID,
        duration: TEST_DURATIONS.SHORT,
        amplitude: TEST_AMPLITUDES.MEDIUM
      },
      {
        type: SIGNAL_TYPES.SINE,
        frequency: TEST_FREQUENCIES.REFERENCE_MID,
        duration: TEST_DURATIONS.SHORT,
        amplitude: TEST_AMPLITUDES.HIGH
      }
    ]
  },
  
  // Transient response test
  TRANSIENT_RESPONSE: {
    name: 'Transient Response Test',
    description: 'Tests system response to rapid changes in signal',
    signals: [
      {
        ...TEST_PATTERNS.IMPULSE
      },
      {
        ...TEST_PATTERNS.STEP
      }
    ]
  },
  
  // Harmonic content test
  HARMONIC_CONTENT: {
    name: 'Harmonic Content Test',
    description: 'Tests system response to signals with rich harmonic content',
    signals: [
      {
        ...TEST_PATTERNS.SQUARE_WAVE
      },
      {
        ...TEST_PATTERNS.SAWTOOTH
      }
    ]
  },
  
  // Pink and white noise
  NOISE_TEST: {
    name: 'Noise Response Test',
    description: 'Tests system response to noise signals',
    signals: [
      {
        ...TEST_PATTERNS.WHITE_NOISE_BURST
      },
      {
        ...TEST_PATTERNS.PINK_NOISE_BURST
      }
    ]
  }
};

// Function to create a sine wave test pattern
export function createSineWaveTestPattern(frequency = 1000, duration = 1, amplitude = 0.5) {
  return {
    type: SIGNAL_TYPES.SINE,
    frequency,
    duration,
    amplitude
  };
}

// Function to create a frequency sweep test pattern
export function createSweepTestPattern(startFreq = 20, endFreq = 20000, duration = 3, 
                                      amplitude = 0.5, logarithmic = true) {
  return {
    type: SIGNAL_TYPES.SWEEP,
    startFreq,
    endFreq,
    duration,
    amplitude,
    sweepType: logarithmic ? 'logarithmic' : 'linear'
  };
}

// Function to create a multitone test pattern
export function createMultitoneTestPattern(frequencies = [250, 500, 1000, 2000, 4000], 
                                          duration = 1, amplitude = 0.5) {
  return {
    type: 'multitone',
    frequencies,
    duration,
    amplitude
  };
}

// Default export with all test signals
export default {
  TEST_FREQUENCIES,
  TEST_DURATIONS,
  TEST_AMPLITUDES,
  FREQUENCY_BANDS,
  SIGNAL_TYPES,
  TEST_PATTERNS,
  TEST_SCENARIOS,
  createSineWaveTestPattern,
  createSweepTestPattern,
  createMultitoneTestPattern
};