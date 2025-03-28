/**
 * Audio Utils Index
 * 
 * This file exports all utilities from the audio utils folder,
 * providing a centralized entry point for audio processing,
 * analysis, and system management utilities.
 */

// Core Audio Utilities
import AudioUtils from './AudioHelpers';

// Event and Error Management
import ErrorManager from './ErrorManager';
import EventBus from './EventBus';

// Audio Analysis and Visualization
import FrequencyMapper from './FrequencyMapper';

// Testing Utilities
import * as AudioTestUtils from './AudioTestUtils';

// Browser Compatibility
// Note: AudioPolyfills is self-executing and doesn't need to be explicitly imported

// Initialize polyfills (this will self-execute on import)
import './AudioPolyfills';

// Named exports for specific utilities
export {
  AudioUtils,
  ErrorManager,
  EventBus,
  FrequencyMapper,
  AudioTestUtils
};

// Default export for easier importing
export default {
  AudioUtils,
  ErrorManager,
  EventBus,
  FrequencyMapper,
  AudioTestUtils
};