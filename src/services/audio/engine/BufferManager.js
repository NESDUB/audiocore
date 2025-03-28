// audio/engine/BufferManager.js
class BufferManager {
  /**
   * Creates a new BufferManager instance
   * @param {AudioContext} audioContext - The Web Audio API context
   * @param {Object} options - Configuration options
   * @param {number} options.maxCacheSize - Maximum cache size in MB (default: 100)
   * @param {boolean} options.preloadCommonFormats - Whether to preload common formats
   */
  constructor(audioContext, options = {}) {
    this.context = audioContext;
    this.options = {
      maxCacheSize: options?.maxCacheSize ?? 100, // Default 100MB
      preloadCommonFormats: options?.preloadCommonFormats ?? false,
      autoGC: options?.autoGC ?? true,
      retryAttempts: options?.retryAttempts ?? 3
    };
    
    // Buffer cache storage
    this.bufferCache = new Map();
    this.cacheMetadata = {
      totalSize: 0,
      hits: 0,
      misses: 0,
      lastAccessed: {}
    };
    
    // Stats and status
    this.status = {
      initialized: true,
      isProcessing: false,
      pendingLoads: 0
    };
    
    // Error handling
    this.errorHandler = null;
  }

  /**
   * Load audio from a URL and decode it into an AudioBuffer
   * @param {string} url - URL to the audio file
   * @returns {Promise<AudioBuffer>} Decoded audio buffer
   */
  async loadAudio(url) {
    try {
      // Check cache first
      if (this.bufferCache.has(url)) {
        this.cacheMetadata.hits++;
        this.cacheMetadata.lastAccessed[url] = Date.now();
        return this.bufferCache.get(url);
      }
      
      this.cacheMetadata.misses++;
      this.status.pendingLoads++;
      this.status.isProcessing = true;
      
      // Fetch the audio file
      const response = await fetch(url);
      if (!response?.ok) {
        throw new Error(`Failed to load audio: ${response?.status} ${response?.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode the audio data
      const buffer = await this.context?.decodeAudioData?.(arrayBuffer);
      
      // Store in cache
      if (buffer) {
        this._addToCache(url, buffer);
      }
      
      this.status.pendingLoads--;
      if (this.status.pendingLoads <= 0) {
        this.status.isProcessing = false;
      }
      
      return buffer;
    } catch (error) {
      this.status.pendingLoads--;
      if (this.status.pendingLoads <= 0) {
        this.status.isProcessing = false;
      }
      
      if (this.errorHandler) {
        this.errorHandler(error, { operation: 'loadAudio', url });
      }
      throw error;
    }
  }
  
  /**
   * Preload multiple audio files
   * @param {string[]} urls - Array of URLs to preload
   * @returns {Promise<Map<string, AudioBuffer>>} Map of URLs to decoded buffers
   */
  async preloadAudio(urls = []) {
    if (!urls?.length) return new Map();
    
    try {
      const buffers = new Map();
      const promises = urls.map(async (url) => {
        const buffer = await this.loadAudio(url);
        if (buffer) {
          buffers.set(url, buffer);
        }
      });
      
      await Promise.allSettled(promises);
      return buffers;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error, { operation: 'preloadAudio' });
      }
      return new Map();
    }
  }
  
  /**
   * Get a buffer by ID/URL
   * @param {string} id - Buffer ID (usually the URL)
   * @returns {AudioBuffer|null} The audio buffer or null if not found
   */
  getBuffer(id) {
    if (this.bufferCache.has(id)) {
      this.cacheMetadata.hits++;
      this.cacheMetadata.lastAccessed[id] = Date.now();
      return this.bufferCache.get(id);
    }
    
    this.cacheMetadata.misses++;
    return null;
  }
  
  /**
   * Get statistics about the buffer cache
   * @returns {Object} Cache statistics
   */
  getStats() {
    const totalRequests = this.cacheMetadata.hits + this.cacheMetadata.misses;
    
    return {
      bufferCount: this.bufferCache.size,
      memoryUsage: this.cacheMetadata.totalSize,
      cacheHitRate: totalRequests > 0 
        ? (this.cacheMetadata.hits / totalRequests) * 100
        : 0,
      pendingLoads: this.status.pendingLoads,
      isProcessing: this.status.isProcessing
    };
  }
  
  /**
   * Clear the buffer cache
   */
  clearCache() {
    this.bufferCache.clear();
    this.cacheMetadata = {
      totalSize: 0,
      hits: 0,
      misses: 0,
      lastAccessed: {}
    };
  }
  
  /**
   * Set the maximum cache size
   * @param {number} sizeInMB - Max cache size in megabytes
   */
  setCacheSize(sizeInMB) {
    if (typeof sizeInMB === 'number' && sizeInMB > 0) {
      this.options.maxCacheSize = sizeInMB;
      this._enforceMaxCacheSize();
    }
  }
  
  /**
   * Set priority for a buffer (for cache retention)
   * @param {string} id - Buffer ID
   * @param {number} priority - Priority level (higher = more important)
   */
  setPriority(id, priority) {
    if (this.bufferCache.has(id)) {
      this.cacheMetadata.priority = this.cacheMetadata.priority || {};
      this.cacheMetadata.priority[id] = priority;
    }
  }
  
  /**
   * Set a custom error handler
   * @param {Function} callback - Error handler function
   */
  setErrorHandler(callback) {
    if (typeof callback === 'function') {
      this.errorHandler = callback;
    }
  }
  
  /**
   * Trim a buffer to specified time range
   * @param {AudioBuffer} buffer - Source buffer
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   * @returns {AudioBuffer} New trimmed buffer
   */
  trimBuffer(buffer, startTime, endTime) {
    if (!buffer) return null;
    
    try {
      const sampleRate = buffer?.sampleRate ?? this.context?.sampleRate ?? 44100;
      const channels = buffer?.numberOfChannels ?? 1;
      
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.min(Math.floor(endTime * sampleRate), buffer.length);
      const newLength = endSample - startSample;
      
      if (newLength <= 0) return null;
      
      const newBuffer = this.context?.createBuffer?.(
        channels,
        newLength,
        sampleRate
      );
      
      if (!newBuffer) return null;
      
      for (let channel = 0; channel < channels; channel++) {
        const newChannel = newBuffer.getChannelData(channel);
        const originalChannel = buffer.getChannelData(channel);
        
        for (let i = 0; i < newLength; i++) {
          newChannel[i] = originalChannel[i + startSample];
        }
      }
      
      return newBuffer;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error, { operation: 'trimBuffer' });
      }
      return null;
    }
  }
  
  // Private helper methods
  _addToCache(id, buffer) {
    // Calculate buffer size in bytes (2 bytes per sample × channels × samples)
    const sizeMB = this._calculateBufferSize(buffer) / (1024 * 1024);
    
    // Check if adding this would exceed cache limit
    if (this.cacheMetadata.totalSize + sizeMB > this.options.maxCacheSize) {
      this._enforceMaxCacheSize(sizeMB);
    }
    
    // Add to cache
    this.bufferCache.set(id, buffer);
    this.cacheMetadata.totalSize += sizeMB;
    this.cacheMetadata.lastAccessed[id] = Date.now();
  }
  
  _calculateBufferSize(buffer) {
    // Each sample is typically 2 bytes (16-bit)
    return buffer?.length * buffer?.numberOfChannels * 2 ?? 0;
  }
  
  _enforceMaxCacheSize(requiredSpace = 0) {
    if (this.cacheMetadata.totalSize + requiredSpace <= this.options.maxCacheSize) {
      return;
    }
    
    // Sort buffers by last accessed time
    const entries = [...this.bufferCache.entries()];
    entries.sort((a, b) => {
      // Consider priority first if set
      const priorityA = this.cacheMetadata.priority?.[a[0]] ?? 0;
      const priorityB = this.cacheMetadata.priority?.[b[0]] ?? 0;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Then consider last accessed time
      const timeA = this.cacheMetadata.lastAccessed[a[0]] ?? 0;
      const timeB = this.cacheMetadata.lastAccessed[b[0]] ?? 0;
      return timeA - timeB;
    });
    
    // Remove least recently used buffers until we have enough space
    for (const [id, buffer] of entries) {
      if (this.cacheMetadata.totalSize + requiredSpace <= this.options.maxCacheSize) {
        break;
      }
      
      const bufferSize = this._calculateBufferSize(buffer) / (1024 * 1024);
      this.bufferCache.delete(id);
      this.cacheMetadata.totalSize -= bufferSize;
      delete this.cacheMetadata.lastAccessed[id];
      if (this.cacheMetadata.priority?.[id]) {
        delete this.cacheMetadata.priority[id];
      }
    }
  }
}

export default BufferManager;