/**
 * AudioService.js
 * Service for audio playback and audio context management
 * Integrates the modular audio engine components
 */

// Import engine components
import { AudioEngine, AudioEngineCore, SourceManager, BufferManager } from './audio/engine';

// Import utility components
import { AudioUtils, ErrorManager, EventBus } from './audio/utils';

// Import constants
import { ENGINE_CONFIG, SOURCE_CONFIG, OUTPUT_CONFIG } from './audio/constants';

class AudioService {
  constructor() {
    // Keep audioElement for compatibility with existing code
    this.audioElement = new Audio();
    
    // Initialize component references (will be set in initialize())
    this.audioEngine = null;
    this.engineCore = null;
    this.sourceManager = null;
    this.bufferManager = null;
    this.errorManager = null;
    this.eventBus = null;
    
    // Track state
    this.isInitialized = false;
    this.activeSource = null;
    this.trackCache = new Map(); // Cache for audio blob URLs
    
    // Config
    this.config = {
      ...ENGINE_CONFIG,
      ...SOURCE_CONFIG,
      ...OUTPUT_CONFIG
    };
  }

  /**
   * Initialize audio engine and connect components
   */
  initialize() {
    if (this.isInitialized) return;

    try {
      // Create event bus for communication between components
      this.eventBus = new EventBus();

      // Create error manager
      this.errorManager = new ErrorManager({
        onEvent: (event) => this.eventBus.emit(event.type, event.data)
      });

      // Create audio engine core
      this.engineCore = new AudioEngineCore({
        eventBus: this.eventBus,
        errorManager: this.errorManager,
        config: this.config
      });

      // Create buffer manager
      this.bufferManager = new BufferManager({
        audioContext: this.engineCore.getContext(),
        eventBus: this.eventBus
      });

      // Create source manager
      this.sourceManager = new SourceManager({
        audioContext: this.engineCore.getContext(),
        bufferManager: this.bufferManager,
        eventBus: this.eventBus
      });

      // Create full audio engine
      this.audioEngine = new AudioEngine({
        core: this.engineCore,
        bufferManager: this.bufferManager,
        sourceManager: this.sourceManager,
        eventBus: this.eventBus,
        errorManager: this.errorManager
      });

      // Setup event listeners for compatibility with audioElement
      this._setupCompatibilityEventBridge();

      // Get analyzer for visualizations - FIX HERE
      // Instead of calling a method that doesn't exist, check if it exists first
      this.analyser = this.engineCore.getAnalyser ? 
        this.engineCore.getAnalyser() : 
        this.engineCore.createAnalyser ? 
          this.engineCore.createAnalyser() : 
          null;

      this.isInitialized = true;
      console.log('Audio service initialized with audio engine');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  getAnalyser() {
    // FIX HERE: Check if the method exists before calling it
    if (this.engineCore && this.engineCore.getAnalyser) {
      return this.engineCore.getAnalyser();
    }
    // Fall back to the cached analyzer or null
    return this.analyser || null;
  }

  /**
   * Setup event bridging between engine events and audioElement events
   * for backward compatibility
   * @private
   */
  _setupCompatibilityEventBridge() {
    // Map engine events to audioElement events for compatibility
    const eventMap = {
      'source:play': 'play',
      'source:pause': 'pause',
      'source:ended': 'ended',
      'source:timeupdate': 'timeupdate',
      'source:error': 'error',
      'buffer:loaded': 'loadeddata',
      'buffer:loading': 'loadstart'
    };
    
    // Register listeners for engine events and dispatch equivalent audioElement events
    Object.entries(eventMap).forEach(([engineEvent, elementEvent]) => {
      this.eventBus.on(engineEvent, (data) => {
        const event = new Event(elementEvent);
        // Add relevant data from engine event
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value !== 'object' && typeof value !== 'function') {
              // Only copy primitive values
              event[key] = value;
            }
          });
        }
        this.audioElement.dispatchEvent(event);
      });
    });
  }

  /**
   * Load and play audio from a source URL or track object
   * @param {string|Object} track - URL or track object with src/path property
   * @returns {Promise} - Resolves when playback starts
   */
  async play(track) {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      // Resume audio context if suspended (browsers require user interaction)
      await this.engineCore.resume();
      
      // Get source URL from track object or use track directly if it's a string
      const src = typeof track === 'string' ? track : (track.src || track.path);
      
      // For compatibility, set audio element's src
      this.audioElement.src = src;
      
      // Create or get source through the source manager
      this.activeSource = await this.sourceManager.createSource({
        url: src,
        autoplay: true
      });
      
      // Return play promise
      return this.activeSource.play();
    } catch (error) {
      this.errorManager.handleError(error, { operation: 'play', context: { track } });
      throw error;
    }
  }

  /**
   * Pause audio playback
   */
  pause() {
    if (this.activeSource) {
      this.activeSource.pause();
    }
    
    // For compatibility
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  /**
   * Stop audio playback and reset position
   */
  stop() {
    if (this.activeSource) {
      this.activeSource.stop();
    }
    
    // For compatibility
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  /**
   * Set audio volume (0-100)
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    // Convert from percentage (0-100) to range (0-1)
    const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
    
    // Set volume on engine output
    if (this.engineCore) {
      this.engineCore.setVolume(normalizedVolume);
    }
    
    // For compatibility
    if (this.audioElement) {
      this.audioElement.volume = normalizedVolume;
    }
  }

  /**
   * Set muted state
   * @param {boolean} muted - Whether audio should be muted
   */
  setMuted(muted) {
    if (this.engineCore) {
      this.engineCore.setMuted(muted);
    }
    
    // For compatibility
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  /**
   * Seek to position in audio
   * @param {number} time - Time in seconds
   */
  seek(time) {
    if (this.activeSource) {
      this.activeSource.seek(time);
    }
    
    // For compatibility
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Get current playback state
   * @returns {Object} - Object with current audio state
   */
  getState() {
    // Get state from active source if available
    if (this.activeSource) {
      const sourceState = this.activeSource.getState();
      return {
        currentTime: sourceState.currentTime,
        duration: sourceState.duration || 0,
        isPlaying: sourceState.isPlaying,
        volume: this.engineCore.getVolume() * 100,
        muted: this.engineCore.isMuted()
      };
    }
    
    // Fall back to audioElement for compatibility
    if (this.audioElement) {
      return {
        currentTime: this.audioElement.currentTime,
        duration: this.audioElement.duration || 0,
        isPlaying: !this.audioElement.paused,
        volume: this.audioElement.volume * 100,
        muted: this.audioElement.muted
      };
    }
    
    // Default state if nothing is available
    return {
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      volume: 0,
      muted: false
    };
  }

  /**
   * Get analyzer node for visualizations
   * @returns {AnalyserNode|null} - Web Audio analyzer node
   */
  getAnalyser() {
    // Return engine analyzer if available
    if (this.engineCore) {
      return this.engineCore.getAnalyser();
    }
    return this.analyser;
  }

  /**
   * Add event listener to audio element (compatible with both audio element and engine)
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    // Register with audio element for backward compatibility
    if (this.audioElement) {
      this.audioElement.addEventListener(event, callback);
    }
    
    // Map to appropriate engine events
    const engineEvent = this._mapElementEventToEngine(event);
    if (engineEvent && this.eventBus) {
      return this.eventBus.on(engineEvent, callback);
    }
  }

  /**
   * Remove event listener from audio element
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    // Remove from audio element for backward compatibility
    if (this.audioElement) {
      this.audioElement.removeEventListener(event, callback);
    }
    
    // Map to appropriate engine events
    const engineEvent = this._mapElementEventToEngine(event);
    if (engineEvent && this.eventBus) {
      this.eventBus.off(engineEvent, callback);
    }
  }

  /**
   * Map standard HTMLMediaElement event to engine event
   * @private
   * @param {string} elementEvent - HTML Media Element event name
   * @returns {string|null} Corresponding engine event name
   */
  _mapElementEventToEngine(elementEvent) {
    const eventMap = {
      'play': 'source:play',
      'pause': 'source:pause',
      'ended': 'source:ended',
      'timeupdate': 'source:timeupdate',
      'error': 'source:error',
      'loadeddata': 'buffer:loaded',
      'loadstart': 'buffer:loading'
    };
    
    return eventMap[elementEvent] || null;
  }

  /**
   * Create a blob URL for a file
   * @param {File} file - File object
   * @returns {string} - Blob URL
   */
  createBlobURL(file) {
    const url = URL.createObjectURL(file);
    // Store reference to revoke later
    this.trackCache.set(url, { file, date: new Date() });
    return url;
  }

  /**
   * Revoke a previously created blob URL
   * @param {string} url - Blob URL to revoke
   */
  revokeBlobURL(url) {
    if (this.trackCache.has(url)) {
      URL.revokeObjectURL(url);
      this.trackCache.delete(url);
    }
  }

  /**
   * Cleanup resources and disconnect audio nodes
   */
  cleanup() {
    // Stop playback
    this.stop();
    
    // Dispose active source
    if (this.activeSource) {
      this.activeSource.dispose();
      this.activeSource = null;
    }
    
    // Cleanup audio engine
    if (this.audioEngine) {
      this.audioEngine.dispose();
    }
    
    // Remove event listeners from audio element
    if (this.audioElement) {
      this.audioElement.onended = null;
      this.audioElement.ontimeupdate = null;
      this.audioElement.onerror = null;
    }
    
    // Revoke all cached blob URLs
    this.trackCache.forEach((_, url) => {
      this.revokeBlobURL(url);
    });
    
    // Reset state
    this.isInitialized = false;
    console.log('Audio service cleaned up');
  }

  /**
   * Get advanced features from the audio engine
   * @returns {Object} Object with references to advanced audio engine components
   */
  getEngineComponents() {
    return {
      engine: this.audioEngine,
      core: this.engineCore,
      sourceManager: this.sourceManager,
      bufferManager: this.bufferManager,
      eventBus: this.eventBus,
      errorManager: this.errorManager
    };
  }
}

// Create and export singleton instance
const audioService = new AudioService();

export default audioService;