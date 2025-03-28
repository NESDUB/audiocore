// src/constants/AudioParams.js
/**
 * Constants and configuration values for audio parameters
 * throughout the AudioDomainDev system.
 */

// Common audio sample rates
export const SAMPLE_RATES = {
  CD_QUALITY: 44100,
  DVD_QUALITY: 48000,
  HIGH_RES: 96000,
  ULTRA_HIGH_RES: 192000
};

// Audio bit depths
export const BIT_DEPTHS = {
  CD_QUALITY: 16,
  HIGH_RES: 24,
  STUDIO: 32
};

// Standard channel configurations
export const CHANNEL_CONFIGS = {
  MONO: 1,
  STEREO: 2,
  QUAD: 4,
  SURROUND_5_1: 6,
  SURROUND_7_1: 8
};

// Web Audio API latency hints
export const LATENCY_HINTS = {
  INTERACTIVE: 'interactive', // (~0.01s - good for instrument control)
  BALANCED: 'balanced',       // (~0.05s - decent balance of latency and power)
  PLAYBACK: 'playback'        // (~0.1s+ - optimized for smooth playback)
};

// Frequency bands for audio processing
export const FREQUENCY_BANDS = {
  SUB_BASS: {
    name: 'Sub Bass',
    low: 20,
    high: 60,
    center: 40
  },
  BASS: {
    name: 'Bass',
    low: 60,
    high: 250,
    center: 120
  },
  LOW_MIDS: {
    name: 'Low Mids',
    low: 250,
    high: 500,
    center: 350
  },
  MIDS: {
    name: 'Mids',
    low: 500, 
    high: 2000,
    center: 1000
  },
  HIGH_MIDS: {
    name: 'High Mids',
    low: 2000,
    high: 4000,
    center: 3000
  },
  PRESENCE: {
    name: 'Presence',
    low: 4000,
    high: 6000,
    center: 5000
  },
  BRILLIANCE: {
    name: 'Brilliance',
    low: 6000, 
    high: 20000,
    center: 10000
  }
};

// Common musical note frequencies (A4 = 440Hz)
export const NOTE_FREQUENCIES = {
  'C0': 16.35,
  'C#0': 17.32,
  'D0': 18.35,
  'D#0': 19.45,
  'E0': 20.60,
  'F0': 21.83,
  'F#0': 23.12,
  'G0': 24.50,
  'G#0': 25.96,
  'A0': 27.50,
  'A#0': 29.14,
  'B0': 30.87,
  // Octave 1
  'C1': 32.70,
  'C#1': 34.65,
  'D1': 36.71,
  'D#1': 38.89,
  'E1': 41.20,
  'F1': 43.65,
  'F#1': 46.25,
  'G1': 49.00,
  'G#1': 51.91,
  'A1': 55.00,
  'A#1': 58.27,
  'B1': 61.74,
  // Octave 2
  'C2': 65.41,
  'C#2': 69.30,
  'D2': 73.42,
  'D#2': 77.78,
  'E2': 82.41,
  'F2': 87.31,
  'F#2': 92.50,
  'G2': 98.00,
  'G#2': 103.83,
  'A2': 110.00,
  'A#2': 116.54,
  'B2': 123.47,
  // Octave 3
  'C3': 130.81,
  'C#3': 138.59,
  'D3': 146.83,
  'D#3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'A3': 220.00,
  'A#3': 233.08,
  'B3': 246.94,
  // Octave 4 (middle C is C4)
  'C4': 261.63,
  'C#4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'A4': 440.00, // Concert A
  'A#4': 466.16,
  'B4': 493.88,
  // Octave 5
  'C5': 523.25,
  'C#5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'A5': 880.00,
  'A#5': 932.33,
  'B5': 987.77,
  // Octave 6
  'C6': 1046.50,
  'C#6': 1108.73,
  'D6': 1174.66,
  'D#6': 1244.51,
  'E6': 1318.51,
  'F6': 1396.91,
  'F#6': 1479.98,
  'G6': 1567.98,
  'G#6': 1661.22,
  'A6': 1760.00,
  'A#6': 1864.66,
  'B6': 1975.53,
  // Octave 7
  'C7': 2093.00,
  'C#7': 2217.46,
  'D7': 2349.32,
  'D#7': 2489.02,
  'E7': 2637.02,
  'F7': 2793.83,
  'F#7': 2959.96,
  'G7': 3135.96,
  'G#7': 3322.44,
  'A7': 3520.00,
  'A#7': 3729.31,
  'B7': 3951.07,
  // Octave 8
  'C8': 4186.01
};

// Common audio effects and their default parameters
export const AUDIO_EFFECTS = {
  COMPRESSOR: {
    name: 'Compressor',
    params: {
      threshold: {
        default: -24,
        min: -100,
        max: 0,
        unit: 'dB'
      },
      knee: {
        default: 30,
        min: 0,
        max: 40,
        unit: 'dB'
      },
      ratio: {
        default: 4,
        min: 1,
        max: 20,
        unit: 'ratio'
      },
      attack: {
        default: 0.003,
        min: 0,
        max: 1,
        unit: 'sec'
      },
      release: {
        default: 0.25,
        min: 0,
        max: 1,
        unit: 'sec'
      }
    },
    presets: {
      VOCAL: {
        threshold: -24,
        knee: 30,
        ratio: 4,
        attack: 0.003,
        release: 0.25
      },
      DRUM: {
        threshold: -18,
        knee: 10,
        ratio: 5,
        attack: 0.002,
        release: 0.1
      },
      MASTER: {
        threshold: -12,
        knee: 15,
        ratio: 3,
        attack: 0.05,
        release: 0.4
      },
      LIMITER: {
        threshold: -3,
        knee: 0,
        ratio: 20,
        attack: 0.001,
        release: 0.1
      }
    }
  },
  
  REVERB: {
    name: 'Reverb',
    params: {
      roomSize: {
        default: 0.7,
        min: 0,
        max: 1,
        unit: 'ratio'
      },
      dampening: {
        default: 3000,
        min: 100,
        max: 10000,
        unit: 'Hz'
      },
      wet: {
        default: 0.5,
        min: 0,
        max: 1,
        unit: 'ratio'
      },
      dry: {
        default: 0.5,
        min: 0,
        max: 1,
        unit: 'ratio'
      }
    },
    presets: {
      SMALL_ROOM: {
        roomSize: 0.3,
        dampening: 4000,
        wet: 0.2,
        dry: 0.8
      },
      LARGE_HALL: {
        roomSize: 0.9,
        dampening: 2500,
        wet: 0.5,
        dry: 0.6
      },
      PLATE: {
        roomSize: 0.6,
        dampening: 6000,
        wet: 0.3,
        dry: 0.7
      },
      AMBIENT: {
        roomSize: 0.8,
        dampening: 1000,
        wet: 0.6,
        dry: 0.4
      }
    }
  },
  
  DELAY: {
    name: 'Delay',
    params: {
      delayTime: {
        default: 0.25,
        min: 0,
        max: 5,
        unit: 'sec'
      },
      feedback: {
        default: 0.5,
        min: 0,
        max: 0.99,
        unit: 'ratio'
      },
      wet: {
        default: 0.5,
        min: 0,
        max: 1,
        unit: 'ratio'
      },
      dry: {
        default: 0.5,
        min: 0,
        max: 1,
        unit: 'ratio'
      }
    },
    presets: {
      SLAP: {
        delayTime: 0.1,
        feedback: 0.2,
        wet: 0.3,
        dry: 0.8
      },
      ECHO: {
        delayTime: 0.25,
        feedback: 0.4,
        wet: 0.4,
        dry: 0.6
      },
      LONG: {
        delayTime: 0.75,
        feedback: 0.6,
        wet: 0.5,
        dry: 0.5
      }
    }
  },
  
  FILTER: {
    name: 'Filter',
    params: {
      type: {
        default: 'lowpass',
        options: ['lowpass', 'highpass', 'bandpass', 'notch', 'lowshelf', 'highshelf', 'peaking', 'allpass']
      },
      frequency: {
        default: 1000,
        min: 20,
        max: 20000,
        unit: 'Hz'
      },
      Q: {
        default: 1,
        min: 0.1,
        max: 20,
        unit: 'Q'
      },
      gain: {
        default: 0,
        min: -40,
        max: 40,
        unit: 'dB'
      }
    },
    presets: {
      LOWPASS: {
        type: 'lowpass',
        frequency: 1000,
        Q: 1,
        gain: 0
      },
      HIGHPASS: {
        type: 'highpass',
        frequency: 500,
        Q: 0.7,
        gain: 0
      },
      BANDPASS: {
        type: 'bandpass',
        frequency: 1500,
        Q: 2.0,
        gain: 0
      },
      LOW_SHELF: {
        type: 'lowshelf',
        frequency: 300,
        Q: 0,
        gain: 6
      },
      HIGH_SHELF: {
        type: 'highshelf',
        frequency: 3000,
        Q: 0,
        gain: 6
      },
      PEAKING: {
        type: 'peaking',
        frequency: 1000,
        Q: 1.0,
        gain: 0
      },
      NOTCH: {
        type: 'notch',
        frequency: 1000,
        Q: 5.0,
        gain: 0
      }
    }
  },
  
  DISTORTION: {
    name: 'Distortion',
    params: {
      amount: {
        default: 0.5,
        min: 0,
        max: 1,
        unit: 'ratio'
      },
      type: {
        default: 'soft',
        options: ['soft', 'hard', 'fuzz', 'square', 'sine']
      },
      oversample: {
        default: 'none',
        options: ['none', '2x', '4x']
      }
    },
    presets: {
      WARM: {
        amount: 0.2,
        type: 'soft',
        oversample: '2x'
      },
      OVERDRIVE: {
        amount: 0.5,
        type: 'soft',
        oversample: '4x'
      },
      DISTORTION: {
        amount: 0.7,
        type: 'hard',
        oversample: '4x'
      },
      FUZZ: {
        amount: 0.8,
        type: 'fuzz',
        oversample: '4x'
      }
    }
  }
};

// Common frequency values for reference
export const REFERENCE_FREQUENCIES = {
  SUBWOOFER_CROSSOVER: 80,
  TELEPHONE_BAND_LOW: 300,
  TELEPHONE_BAND_HIGH: 3400,
  FUNDAMENTALS_UPPER_LIMIT: 1000,
  HARMONICS_RANGE_LOW: 1000,
  HUMAN_HEARING_LOW: 20,
  HUMAN_HEARING_HIGH: 20000,
  FEMALE_VOICE_FUNDAMENTAL: 300,
  MALE_VOICE_FUNDAMENTAL: 120,
  DOG_HEARING_HIGH: 45000,
  BAT_HEARING_HIGH: 200000
};

// Audio envelope presets (ADSR)
export const ENVELOPE_PRESETS = {
  PAD: {
    attack: 0.5,
    decay: 0.5,
    sustain: 0.8,
    release: 1.5
  },
  PLUCK: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0.3,
    release: 0.2
  },
  STRINGS: {
    attack: 0.2,
    decay: 0.3,
    sustain: 0.8,
    release: 0.6
  },
  BRASS: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3
  },
  PERCUSSION: {
    attack: 0.001,
    decay: 0.5,
    sustain: 0,
    release: 0.1
  }
};

// Analysis parameters
export const ANALYSIS_PARAMS = {
  FFT_SIZES: [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768],
  DEFAULT_FFT_SIZE: 2048,
  DEFAULT_SMOOTHING: 0.8,
  MIN_DECIBELS: -100,
  MAX_DECIBELS: -30,
  
  BEAT_DETECTION: {
    SENSITIVITY: 0.5,
    MIN_INTERVAL: 0.25, // seconds
    ENERGY_THRESHOLD: 0.15,
    HISTORY_SIZE: 43
  },
  
  RMS: {
    FRAME_SIZE: 1024,
    OVERLAP: 0.5
  }
};

// Export all parameters as a default object
export default {
  SAMPLE_RATES,
  BIT_DEPTHS,
  CHANNEL_CONFIGS,
  LATENCY_HINTS,
  FREQUENCY_BANDS,
  NOTE_FREQUENCIES,
  AUDIO_EFFECTS,
  REFERENCE_FREQUENCIES,
  ENVELOPE_PRESETS,
  ANALYSIS_PARAMS
};