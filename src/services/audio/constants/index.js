/**
 * /src/services/audio/constants/index.js
 * 
 * This file exports all audio system constants from a single location,
 * allowing for cleaner imports throughout the application.
 */

// Import all constants from individual files
import AudioParams, * as AudioParamsExports from './AudioParams';
import DefaultConfig, * as DefaultConfigExports from './DefaultConfig';
import TestSignals, * as TestSignalsExports from './TestSignals';

// Re-export default exports
export { default as AudioParams } from './AudioParams';
export { default as DefaultConfig } from './DefaultConfig';
export { default as TestSignals } from './TestSignals';

// Re-export named exports from AudioParams
export const {
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
} = AudioParamsExports;

// Re-export named exports from DefaultConfig
export const {
  ENGINE_CONFIG,
  SOURCE_CONFIG,
  SIGNAL_CONFIG,
  ANALYSIS_CONFIG,
  OUTPUT_CONFIG,
  UI_CONFIG,
  DEBUG_CONFIG
} = DefaultConfigExports;

// Re-export named exports from TestSignals
export const {
  TEST_FREQUENCIES,
  TEST_DURATIONS,
  TEST_AMPLITUDES,
  // FREQUENCY_BANDS is already exported from AudioParams
  SIGNAL_TYPES,
  TEST_PATTERNS,
  TEST_SCENARIOS,
  createSineWaveTestPattern,
  createSweepTestPattern,
  createMultitoneTestPattern
} = TestSignalsExports;

// Export a comprehensive object with all constants
export default {
  // Main parameter collections
  AudioParams,
  DefaultConfig,
  TestSignals,
  
  // Audio parameter constants
  SAMPLE_RATES,
  BIT_DEPTHS,
  CHANNEL_CONFIGS,
  LATENCY_HINTS,
  FREQUENCY_BANDS,
  NOTE_FREQUENCIES,
  AUDIO_EFFECTS,
  REFERENCE_FREQUENCIES,
  ENVELOPE_PRESETS,
  ANALYSIS_PARAMS,
  
  // Configuration constants
  ENGINE_CONFIG,
  SOURCE_CONFIG,
  SIGNAL_CONFIG,
  ANALYSIS_CONFIG,
  OUTPUT_CONFIG,
  UI_CONFIG,
  DEBUG_CONFIG,
  
  // Test signal constants
  TEST_FREQUENCIES,
  TEST_DURATIONS,
  TEST_AMPLITUDES,
  SIGNAL_TYPES,
  TEST_PATTERNS,
  TEST_SCENARIOS,
  
  // Test signal helper functions
  createSineWaveTestPattern,
  createSweepTestPattern,
  createMultitoneTestPattern
};