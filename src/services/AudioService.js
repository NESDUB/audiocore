/**
 * AudioService.js
 * Service for audio playback and audio context management
 */

class AudioService {
  constructor() {
    this.audioElement = new Audio();
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.isInitialized = false;
    this.trackCache = new Map(); // Cache for audio blob URLs
  }

  /**
   * Initialize audio context and connect nodes
   */
  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Create Audio Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create analyser node for visualizations
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      // Connect audio element to audio context
      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Setup basic event listeners
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
      
      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
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
    
    // Resume audio context if suspended (browsers require user interaction)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    try {
      // Get source URL from track object or use track directly if it's a string
      let src = typeof track === 'string' ? track : (track.src || track.path);
      
      // Set audio source
      this.audioElement.src = src;
      
      // Start playback
      return this.audioElement.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Pause audio playback
   */
  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  /**
   * Stop audio playback and reset position
   */
  stop() {
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
    if (this.audioElement) {
      // Convert from percentage (0-100) to range (0-1)
      this.audioElement.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }

  /**
   * Set muted state
   * @param {boolean} muted - Whether audio should be muted
   */
  setMuted(muted) {
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  /**
   * Seek to position in audio
   * @param {number} time - Time in seconds
   */
  seek(time) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Get current playback state
   * @returns {Object} - Object with current audio state
   */
  getState() {
    if (!this.audioElement) {
      return {
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        volume: 0,
        muted: false
      };
    }
    
    return {
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration || 0,
      isPlaying: !this.audioElement.paused,
      volume: this.audioElement.volume * 100,
      muted: this.audioElement.muted
    };
  }

  /**
   * Get analyzer node for visualizations
   * @returns {AnalyserNode|null} - Web Audio analyzer node
   */
  getAnalyser() {
    return this.analyser;
  }

  /**
   * Add event listener to audio element
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (this.audioElement) {
      this.audioElement.addEventListener(event, callback);
    }
  }

  /**
   * Remove event listener from audio element
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (this.audioElement) {
      this.audioElement.removeEventListener(event, callback);
    }
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
    
    // Remove event listeners
    if (this.audioElement) {
      this.audioElement.onended = null;
      this.audioElement.ontimeupdate = null;
      this.audioElement.onerror = null;
    }
    
    // Disconnect audio nodes
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {
        // Ignore disconnection errors
      }
    }
    
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        // Ignore disconnection errors
      }
    }
    
    // Revoke all cached blob URLs
    this.trackCache.forEach((_, url) => {
      this.revokeBlobURL(url);
    });
    
    // Reset state
    this.isInitialized = false;
    console.log('Audio service cleaned up');
  }
}

// Create and export singleton instance
const audioService = new AudioService();

export default audioService;