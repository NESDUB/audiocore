/**
 * /src/services/audio/engine/index.js
 *
 * Centralized exports for the audio engine components.
 * This file provides a clean interface for importing audio engine
 * functionality throughout the application.
 */

// Import all components
import AudioEngineDefault from './AudioEngine';
import AudioEngineCoreDefault from './AudioEngineCore';
import AudioGraphDefault from './AudioGraph';
import AudioNodeFactoryDefault from './AudioNodeFactory';
import BufferManagerDefault from './BufferManager';
import DeviceManagerDefault from './DeviceManager';
import OutputManagerDefault from './OutputManager';
import SignalProcessorDefault from './SignalProcessor';
import SourceManagerDefault from './SourceManager';
import BeatDetectorDefault from './BeatDetector';

// Re-export AudioEngine as both default and named export
export default AudioEngineDefault;
export const AudioEngine = AudioEngineDefault;
export const AudioEngineCore = AudioEngineCoreDefault;
export const AudioGraph = AudioGraphDefault;
export const AudioNodeFactory = AudioNodeFactoryDefault;
export const BufferManager = BufferManagerDefault;
export const DeviceManager = DeviceManagerDefault;
export const OutputManager = OutputManagerDefault;
export const SignalProcessor = SignalProcessorDefault;
export const SourceManager = SourceManagerDefault;
export const BeatDetector = BeatDetectorDefault;

// Named grouped exports for organizational clarity
export const core = {
  AudioEngine,
  AudioEngineCore,
  AudioGraph
};

export const management = {
  BufferManager,
  SourceManager,
  DeviceManager,
  OutputManager
};

export const processing = {
  AudioNodeFactory,
  SignalProcessor,
  BeatDetector
};