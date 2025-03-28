// src/components/Core/eventBus.js

/**
 * eventBus - Handles application-wide event subscription and publishing
 * with standardized event formatting and delivery.
 */
class EventBus {
  /**
   * Create a new eventBus instance
   * @param {Object} options - Configuration options
   * @param {Function} [options.onError] - Error callback function
   * @param {boolean} [options.debug] - Enable debug mode
   */
  constructor(options = {}) {
    // Event subscribers map: eventType -> array of callbacks
    this.subscribers = new Map();

    // Configuration
    this.config = {
      debug: options.debug || false,
      maxListeners: options.maxListeners || 10,
      bufferSize: options.bufferSize || 100
    };

    // Error handling
    this.onError = options.onError || ((error) => {
      console.error('[eventBus]', error);
    });

    // Event buffer for debugging/replay
    this.eventBuffer = [];

    this.initialized = true;
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - Type of event to subscribe to
   * @param {Function} callback - Callback function when event occurs
   * @returns {Function} Unsubscribe function
   */
  on(eventType, callback) {
    if (typeof callback !== 'function') {
      this.onError(new Error(`Invalid callback for event type: ${eventType}`));
      return () => {}; // Return no-op unsubscribe function
    }

    // Get or create subscriber array for this event type
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscribers = this.subscribers.get(eventType);

    // Check for maximum listeners
    if (subscribers.length >= this.config.maxListeners) {
      this.onError(new Error(`Max listeners (${this.config.maxListeners}) exceeded for event: ${eventType}`));
    }

    // Add the callback to subscribers
    subscribers.push(callback);

    // Log in debug mode
    if (this.config.debug) {
      console.log(`[eventBus] Subscribed to: ${eventType}, total subscribers: ${subscribers.length}`);
    }

    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventType - Type of event to unsubscribe from
   * @param {Function} callback - The callback to remove
   * @returns {boolean} Whether unsubscription was successful
   */
  off(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      return false;
    }

    const subscribers = this.subscribers.get(eventType);
    const index = subscribers.indexOf(callback);

    if (index !== -1) {
      subscribers.splice(index, 1);

      // Remove empty subscriber arrays
      if (subscribers.length === 0) {
        this.subscribers.delete(eventType);
      }

      // Log in debug mode
      if (this.config.debug) {
        console.log(`[eventBus] Unsubscribed from: ${eventType}, remaining subscribers: ${subscribers.length}`);
      }

      return true;
    }

    return false;
  }

  /**
   * Emit an event to all subscribers
   * @param {string} eventType - Type of event to emit
   * @param {Object} data - Event data
   * @returns {boolean} Whether event was delivered to any subscribers
   */
  emit(eventType, data = {}) {
    if (!this.subscribers.has(eventType)) {
      // No subscribers for this event type
      return false;
    }

    try {
      // Format the event
      const event = this._formatEvent(eventType, data);

      // Add to buffer if enabled
      if (this.config.bufferSize > 0) {
        this._addToBuffer(event);
      }

      // Deliver to all subscribers
      const subscribers = this.subscribers.get(eventType);
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          this.onError(error);
        }
      });

      // Log in debug mode
      if (this.config.debug) {
        console.log(`[eventBus] Emitted: ${eventType} to ${subscribers.length} subscriber(s)`);
      }

      return true;
    } catch (error) {
      this.onError(error);
      return false;
    }
  }

  /**
   * Format an event object with standard properties
   * @private
   */
  _formatEvent(type, data) {
    return {
      type,
      data,
      timestamp: Date.now(),
      id: this._generateEventId()
    };
  }

  /**
   * Generate a unique event ID
   * @private
   */
  _generateEventId() {
    return `event_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Add an event to the buffer
   * @private
   */
  _addToBuffer(event) {
    this.eventBuffer.push(event);

    // Trim buffer if it exceeds max size
    if (this.eventBuffer.length > this.config.bufferSize) {
      this.eventBuffer.shift();
    }
  }

  /**
   * Get recent events from the buffer
   * @param {number} [count=10] - Number of recent events to get
   * @param {string} [eventType] - Optional filter by event type
   * @returns {Array} Array of recent events
   */
  getRecentEvents(count = 10, eventType = null) {
    let events = [...this.eventBuffer];

    // Filter by event type if specified
    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }

    // Return most recent events
    return events.slice(-count);
  }

  /**
   * Clear all subscribers
   */
  clearAllSubscribers() {
    this.subscribers.clear();

    if (this.config.debug) {
      console.log('[eventBus] All subscribers cleared');
    }
  }

  /**
   * Clear the event buffer
   */
  clearEventBuffer() {
    this.eventBuffer = [];

    if (this.config.debug) {
      console.log('[eventBus] Event buffer cleared');
    }
  }

  /**
   * Dispose and clean up
   */
  dispose() {
    this.clearAllSubscribers();
    this.clearEventBuffer();
    this.initialized = false;
  }
}

export default EventBus;