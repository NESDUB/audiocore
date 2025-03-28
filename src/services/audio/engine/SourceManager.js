// src/components/Core/SourceManager.js

/**
 * SourceManager - Manages the creation, control, and lifecycle of audio sources.
 * Provides a bridge between decoded audio buffers and actual playback.
 */
class SourceManager {
  /**
   * Creates a new SourceManager instance
   * @param {Object} options - Configuration options
   * @param {AudioContext} options.audioContext - Web Audio API context
   * @param {Object} [options.errorManager] - Error manager for handling errors
   * @param {Object} [options.audioGraph] - AudioGraph for routing connections
   * @param {function} [options.onEvent] - Event callback function
   */
  constructor(options = {}) {
    if (!options.audioContext) {
      throw new Error('SourceManager requires an AudioContext');
    }

    this.audioContext = options.audioContext;
    this.errorManager = options.errorManager;
    this.audioGraph = options.audioGraph;
    this.onEvent = options.onEvent || (() => {});

    // Source tracking
    this.activeSources = new Map(); // sourceId -> source object
    this.sourcePool = []; // Recycled source nodes
    
    // Configuration
    this.config = {
      maxPoolSize: options.maxPoolSize || 20,
      defaultFadeTime: options.defaultFadeTime || 0.005,
      schedulingLookahead: options.schedulingLookahead || 0.1,
      crossfadeOverlap: options.crossfadeOverlap || 0.05,
      defaultVolume: options.defaultVolume || 1.0
    };

    // Performance metrics
    this.stats = {
      totalCreated: 0,
      activeCount: 0,
      poolSize: 0,
      playCount: 0,
      stopCount: 0,
      errorCount: 0
    };

    // Initialize
    this.initialized = true;
    this._emitEvent('initialized', {});
  }

  /**
   * Create and configure a source for playback
   * @param {AudioBuffer} buffer - Decoded audio buffer to play
   * @param {Object} [options={}] - Source configuration options
   * @param {boolean} [options.loop=false] - Whether to loop playback
   * @param {number} [options.volume=1] - Initial volume (0-1)
   * @param {number} [options.playbackRate=1] - Playback speed
   * @param {boolean} [options.connect=true] - Whether to auto-connect to output
   * @returns {Object} Source interface with control methods
   */
  createSource(buffer, options = {}) {
    try {
      if (!buffer || !(buffer instanceof AudioBuffer)) {
        throw new Error('Valid AudioBuffer required');
      }

      // Generate a unique ID for this source
      const sourceId = `source_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // Get or create source node
      const sourceNode = this._createSourceNode();

      // Configure the source node
      sourceNode.buffer = buffer;
      sourceNode.loop = options.loop || false;

      // Set playback rate if specified
      if (options.playbackRate !== undefined) {
        sourceNode.playbackRate.value = options.playbackRate;
      }

      // Create gain node for volume control and fades
      const gainNode = this.audioContext.createGain();
      const volumeValue = options.volume !== undefined ? 
        Math.max(0, Math.min(1, options.volume)) : this.config.defaultVolume;
      gainNode.gain.value = volumeValue;

      // Connect source to gain node
      sourceNode.connect(gainNode);

      // Connect to output if requested and audioGraph available
      if (options.connect !== false && this.audioGraph) {
        this.audioGraph.registerNode(gainNode, { type: 'source-gain', sourceId });
      }

      // Create source object
      const source = {
        id: sourceId,
        sourceNode,
        gainNode,
        buffer,
        startTime: null,
        endTime: null,
        offset: 0,
        isPlaying: false,
        isPaused: false,
        pausePosition: 0,
        options: { ...options },
        created: Date.now()
      };

      // Setup cleanup when source ends
      sourceNode.onended = () => {
        this._handleSourceEnded(source);
      };

      // Store in active sources
      this.activeSources.set(sourceId, source);

      // Update metrics
      this.stats.totalCreated++;
      this.stats.activeCount = this.activeSources.size;

      // Emit event
      this._emitEvent('source:created', {
        sourceId,
        duration: buffer.duration,
        channels: buffer.numberOfChannels
      });

      // Return playback control interface
      return {
        id: sourceId,
        play: (when, offset, duration) => this.play(sourceId, when, offset, duration),
        stop: (when) => this.stop(sourceId, when),
        pause: () => this.pause(sourceId),
        resume: () => this.resume(sourceId),
        seek: (position) => this.seek(sourceId, position),
        setVolume: (volume, fadeTime) => this.setVolume(sourceId, volume, fadeTime),
        setPlaybackRate: (rate) => this.setPlaybackRate(sourceId, rate),
        getState: () => this.getSourceState(sourceId),
        getDuration: () => buffer.duration
      };
    } catch (error) {
      this._handleError(error, {
        operation: 'createSource',
        bufferLength: buffer?.length,
        bufferChannels: buffer?.numberOfChannels
      });
      return null;
    }
  }

  /**
   * Play a source
   * @param {string} sourceId - ID of source to play
   * @param {number} [when=0] - Time to delay start in seconds
   * @param {number} [offset=0] - Start position in seconds
   * @param {number} [duration] - Duration to play in seconds
   * @returns {boolean} Success status
   */
  play(sourceId, when = 0, offset = 0, duration) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source) return false;

      // Ensure not already playing
      if (source.isPlaying) {
        this.stop(sourceId);
        
        // Create a new source node for the same buffer
        return this._recreateAndPlay(source, when, offset, duration);
      }

      // Calculate absolute start time
      const startTime = this.audioContext.currentTime + Math.max(0, when);

      // Normalize offset and duration
      const safeOffset = Math.max(0, Math.min(offset, source.buffer.duration));
      let safeDuration;
      
      if (duration !== undefined) {
        // Ensure duration doesn't exceed buffer length from offset
        safeDuration = Math.min(duration, source.buffer.duration - safeOffset);
      }

      // Start the source
      try {
        // If we have a specific duration, use it
        if (safeDuration !== undefined) {
          source.sourceNode.start(startTime, safeOffset, safeDuration);
          source.endTime = startTime + safeDuration;
        } else {
          source.sourceNode.start(startTime, safeOffset);
          if (!source.sourceNode.loop) {
            source.endTime = startTime + (source.buffer.duration - safeOffset);
          } else {
            source.endTime = null; // Looping has no end time
          }
        }

        // Update source state
        source.startTime = startTime;
        source.offset = safeOffset;
        source.isPlaying = true;
        source.isPaused = false;

        // Update stats
        this.stats.playCount++;

        // Emit event
        this._emitEvent('source:started', {
          sourceId,
          when,
          offset: safeOffset,
          duration: safeDuration,
          startTime
        });

        return true;
      } catch (error) {
        // Handle start error (likely already started)
        this._handleError(error, {
          operation: 'play',
          sourceId
        });
        
        return false;
      }
    } catch (error) {
      this._handleError(error, {
        operation: 'play',
        sourceId
      });
      return false;
    }
  }

  /**
   * Stop a source
   * @param {string} sourceId - ID of source to stop
   * @param {number} [when=0] - Time to delay stop in seconds
   * @returns {boolean} Success status
   */
  stop(sourceId, when = 0) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source || !source.isPlaying) return false;

      const stopTime = this.audioContext.currentTime + Math.max(0, when);

      // Apply quick fade out to avoid clicks
      this._applyFade(source.gainNode.gain, 0, when, this.config.defaultFadeTime);

      try {
        // Schedule stop slightly after fade completes
        source.sourceNode.stop(stopTime + this.config.defaultFadeTime);
        
        // Update state
        source.isPlaying = false;
        source.endTime = stopTime;

        // Update stats
        this.stats.stopCount++;

        // Emit event
        this._emitEvent('source:stopped', {
          sourceId,
          stopTime
        });

        return true;
      } catch (error) {
        // Handle stop error (likely already stopped)
        this._handleError(error, {
          operation: 'stop',
          sourceId
        });
        
        return false;
      }
    } catch (error) {
      this._handleError(error, {
        operation: 'stop',
        sourceId
      });
      return false;
    }
  }

  /**
   * Pause playback (stop with position memory)
   * @param {string} sourceId - ID of source to pause
   * @returns {boolean} Success status
   */
  pause(sourceId) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source || !source.isPlaying) return false;

      // Calculate current position
      const currentTime = this.audioContext.currentTime;
      const elapsedTime = Math.max(0, currentTime - source.startTime);
      const position = source.offset + elapsedTime;

      // Store position for resume
      source.pausePosition = position;
      source.isPaused = true;

      // Stop the source
      const result = this.stop(sourceId, 0);
      
      if (result) {
        // Emit pause event
        this._emitEvent('source:paused', {
          sourceId,
          position
        });
      }

      return result;
    } catch (error) {
      this._handleError(error, {
        operation: 'pause',
        sourceId
      });
      return false;
    }
  }

  /**
   * Resume paused playback
   * @param {string} sourceId - ID of source to resume
   * @returns {boolean} Success status
   */
  resume(sourceId) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source || !source.isPaused) return false;

      // Get the stored position
      const position = source.pausePosition;
      
      // Play from the paused position
      const result = this.play(sourceId, 0, position);
      
      if (result) {
        // No longer paused
        source.isPaused = false;
        
        // Emit resume event
        this._emitEvent('source:resumed', {
          sourceId,
          position
        });
      }
      
      return result;
    } catch (error) {
      this._handleError(error, {
        operation: 'resume',
        sourceId
      });
      return false;
    }
  }

  /**
   * Seek to a new position (stop and restart at position)
   * @param {string} sourceId - ID of source to seek
   * @param {number} position - Position in seconds
   * @returns {boolean} Success status
   */
  seek(sourceId, position) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source) return false;

      // Normalize position to valid range
      const safePosition = Math.max(0, Math.min(position, source.buffer.duration));
      
      // Check if source is currently playing
      const wasPlaying = source.isPlaying;

      // If playing, stop first
      if (wasPlaying) {
        this.stop(sourceId);
      }
      
      if (wasPlaying) {
        // If it was playing, restart from new position
        return this.play(sourceId, 0, safePosition);
      } else {
        // If it was paused, just update pause position
        source.pausePosition = safePosition;
        
        // Emit position change event
        this._emitEvent('source:position-changed', {
          sourceId,
          position: safePosition
        });
        
        return true;
      }
    } catch (error) {
      this._handleError(error, {
        operation: 'seek',
        sourceId,
        position
      });
      return false;
    }
  }

  /**
   * Set volume for a source
   * @param {string} sourceId - ID of source
   * @param {number} volume - Volume level (0-1)
   * @param {number} [fadeTime=0] - Fade time in seconds
   * @returns {boolean} Success status
   */
  setVolume(sourceId, volume, fadeTime = 0) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source) return false;

      // Normalize volume to valid range
      const safeVolume = Math.max(0, Math.min(1, volume));
      
      // Apply volume change with optional fade
      this._applyFade(source.gainNode.gain, safeVolume, 0, fadeTime);
      
      // Update options
      source.options.volume = safeVolume;
      
      // Emit event
      this._emitEvent('source:volume-changed', {
        sourceId,
        volume: safeVolume,
        fadeTime
      });
      
      return true;
    } catch (error) {
      this._handleError(error, {
        operation: 'setVolume',
        sourceId,
        volume
      });
      return false;
    }
  }

  /**
   * Set playback rate for a source
   * @param {string} sourceId - ID of source
   * @param {number} rate - Playback rate (0.25-4.0 typical range)
   * @returns {boolean} Success status
   */
  setPlaybackRate(sourceId, rate) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source) return false;

      // Apply rate change
      source.sourceNode.playbackRate.value = rate;
      
      // Update options
      source.options.playbackRate = rate;
      
      // Emit event
      this._emitEvent('source:rate-changed', {
        sourceId,
        rate
      });
      
      return true;
    } catch (error) {
      this._handleError(error, {
        operation: 'setPlaybackRate',
        sourceId,
        rate
      });
      return false;
    }
  }

  /**
   * Check if a source is playing
   * @param {string} sourceId - ID of source
   * @returns {boolean} True if playing
   */
  isPlaying(sourceId) {
    const source = this.activeSources.get(sourceId);
    return source ? source.isPlaying : false;
  }

  /**
   * Check if a source is paused
   * @param {string} sourceId - ID of source
   * @returns {boolean} True if paused
   */
  isPaused(sourceId) {
    const source = this.activeSources.get(sourceId);
    return source ? source.isPaused : false;
  }

  /**
   * Get detailed state information for a source
   * @param {string} sourceId - ID of source
   * @returns {Object|null} Source state or null if not found
   */
  getSourceState(sourceId) {
    const source = this.activeSources.get(sourceId);
    if (!source) return null;

    // Calculate current position
    let position = 0;
    
    if (source.isPlaying) {
      const elapsed = Math.max(0, this.audioContext.currentTime - source.startTime);
      position = source.offset + elapsed;
      
      // Handle looping
      if (source.sourceNode.loop && position > source.buffer.duration) {
        position = position % source.buffer.duration;
      }
    } else if (source.isPaused) {
      position = source.pausePosition;
    }

    return {
      sourceId: source.id,
      isPlaying: source.isPlaying,
      isPaused: source.isPaused,
      position,
      duration: source.buffer.duration,
      volume: source.gainNode.gain.value,
      playbackRate: source.sourceNode.playbackRate.value,
      loop: source.sourceNode.loop
    };
  }

  /**
   * Get current performance metrics
   * @returns {Object} Performance statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Apply fade to an AudioParam
   * @private
   */
  _applyFade(audioParam, targetValue, delayTime = 0, fadeTime = 0.005) {
    const now = this.audioContext.currentTime;
    const startTime = now + delayTime;
    
    if (fadeTime <= 0) {
      // Immediate change
      audioParam.setValueAtTime(targetValue, startTime);
    } else {
      // Get current value at start time
      audioParam.setValueAtTime(audioParam.value, startTime);
      
      // Apply linear ramp
      audioParam.linearRampToValueAtTime(targetValue, startTime + fadeTime);
    }
  }

  /**
   * Create a source node (from pool if available)
   * @private
   */
  _createSourceNode() {
    // Check pool first
    if (this.sourcePool.length > 0) {
      const node = this.sourcePool.pop();
      this.stats.poolSize = this.sourcePool.length;
      return node;
    }
    
    // Create new node
    return this.audioContext.createBufferSource();
  }

  /**
   * Add a node to the pool for reuse
   * @private
   */
  _recycleSourceNode() {
    // Only pool if under limit
    if (this.sourcePool.length < this.config.maxPoolSize) {
      const node = this.audioContext.createBufferSource();
      this.sourcePool.push(node);
      this.stats.poolSize = this.sourcePool.length;
    }
  }

  /**
   * Handle source ended event
   * @private
   */
  _handleSourceEnded(source) {
    if (!source) return;
    
    // Check if it was explicitly stopped or naturally ended
    const wasNaturalEnd = source.isPlaying;
    
    // Update state
    source.isPlaying = false;
    
    // Emit appropriate event
    if (wasNaturalEnd) {
      this._emitEvent('source:ended', {
        sourceId: source.id
      });
    }
    
    // Clean up connections
    this._cleanupSource(source);
  }

  /**
   * Clean up a source and its connections
   * @private
   */
  _cleanupSource(source) {
    if (!source) return;
    
    try {
      // Disconnect nodes
      source.sourceNode.disconnect();
      source.gainNode.disconnect();
      
      // Remove event listener
      source.sourceNode.onended = null;
      
      // Reset state but keep in active sources map
      // (only remove when explicitly released)
      source.isPlaying = false;
      source.endTime = this.audioContext.currentTime;
      
      // Recycle a node for future use
      this._recycleSourceNode();
    } catch (error) {
      console.warn('Error during source cleanup:', error);
    }
  }

  /**
   * Recreate a source and play it
   * @private
   */
  _recreateAndPlay(oldSource, when, offset, duration) {
    // Create new source with same settings
    const newSource = this.createSource(oldSource.buffer, {
      ...oldSource.options,
      volume: oldSource.gainNode.gain.value,
      playbackRate: oldSource.sourceNode.playbackRate.value
    });
    
    // Play with specified parameters
    if (newSource) {
      return this.play(newSource.id, when, offset, duration);
    }
    
    return false;
  }

  /**
   * Release a source completely (remove from tracking)
   * @param {string} sourceId - ID of source to release
   * @returns {boolean} Success status
   */
  releaseSource(sourceId) {
    try {
      const source = this.activeSources.get(sourceId);
      if (!source) return false;
      
      // Stop if playing
      if (source.isPlaying) {
        this.stop(sourceId);
      }
      
      // Clean up
      this._cleanupSource(source);
      
      // Remove from tracking
      this.activeSources.delete(sourceId);
      
      // Update stats
      this.stats.activeCount = this.activeSources.size;
      
      // Emit event
      this._emitEvent('source:released', {
        sourceId
      });
      
      return true;
    } catch (error) {
      this._handleError(error, {
        operation: 'releaseSource',
        sourceId
      });
      return false;
    }
  }

  /**
   * Release all sources
   * @returns {number} Number of sources released
   */
  releaseAllSources() {
    let count = 0;
    
    // Get all source IDs first to avoid iterator issues
    const sourceIds = Array.from(this.activeSources.keys());
    
    // Release each source
    for (const sourceId of sourceIds) {
      if (this.releaseSource(sourceId)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Handle errors through ErrorManager if available
   * @private
   */
  _handleError(error, context = {}) {
    // Update error count
    this.stats.errorCount++;
    
    // Use error manager if available
    if (this.errorManager) {
      return this.errorManager.handleError(error, {
        component: 'SourceManager',
        ...context
      });
    }
    
    // Fallback to console
    console.error('[SourceManager]', error, context);
    return error;
  }

  /**
   * Emit an event through the callback
   * @private
   */
  _emitEvent(type, data) {
    this.onEvent({
      type,
      data,
      timestamp: Date.now(),
      component: 'SourceManager'
    });
  }

  /**
   * Clean up and dispose all resources
   */
  dispose() {
    // Release all sources
    this.releaseAllSources();
    
    // Clear the source pool
    this.sourcePool = [];
    
    // Reset stats
    this.stats = {
      totalCreated: 0,
      activeCount: 0,
      poolSize: 0,
      playCount: 0,
      stopCount: 0,
      errorCount: 0
    };
    
    this.initialized = false;
    this._emitEvent('disposed', {});
  }
}

export default SourceManager;