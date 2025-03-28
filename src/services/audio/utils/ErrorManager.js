// src/components/Core/ErrorManager.js

/**
 * ErrorManager - Provides centralized error handling, normalization, classification,
 * and reporting for the entire AudioCore system.
 */
class ErrorManager {
  /**
   * Creates a new ErrorManager instance
   * @param {Object} options - Configuration options
   * @param {function} [options.onEvent] - Event callback function
   * @param {boolean} [options.autoRecovery=true] - Automatically attempt recovery for recoverable errors
   * @param {string} [options.logLevel='error'] - Minimum severity level to log
   * @param {number} [options.historySize=50] - Number of recent errors to keep in history
   * @param {boolean} [options.notifyUser=true] - Show user notifications for serious errors
   * @param {boolean} [options.detailedLogs=false] - Include stack traces and diagnostics in logs
   * @param {boolean} [options.telemetryEnabled=false] - Send error reports to telemetry service
   */
  constructor(options = {}) {
    // Configuration
    this.config = {
      autoRecovery: options.autoRecovery !== false,
      logLevel: options.logLevel || 'error',
      historySize: options.historySize || 50,
      notifyUser: options.notifyUser !== false,
      detailedLogs: options.detailedLogs || false,
      telemetryEnabled: options.telemetryEnabled || false
    };

    // Error history (circular buffer)
    this.errorHistory = [];
    
    // Event callback
    this.onEvent = options.onEvent || (() => {});

    // Stats
    this.stats = {
      totalErrors: 0,
      bySeverity: {
        critical: 0,
        error: 0,
        warn: 0,
        info: 0,
        debug: 0
      },
      byComponent: {},
      recoveryAttempts: 0,
      recoverySuccesses: 0
    };

    // Error recovery strategies
    this.recoveryStrategies = this._initRecoveryStrategies();

    // Log levels in order of severity
    this.logLevels = ['debug', 'info', 'warn', 'error', 'critical'];

    this.initialized = true;
    this._emitEvent('initialized', {});
  }

  /**
   * Main error handling method
   * @param {Error|string|Object} error - Error to handle
   * @param {Object} [context={}] - Additional context information
   * @param {Object} [options={}] - Handling options
   * @returns {Object} Normalized error object
   */
  handleError(error, context = {}, options = {}) {
    try {
      // Normalize error into standard format
      const normalizedError = this._normalizeError(error, context);
      
      // Determine error severity if not specified
      if (!normalizedError.severity) {
        normalizedError.severity = this._determineSeverity(normalizedError);
      }
      
      // Classify error type and set code if not already defined
      if (!normalizedError.code) {
        normalizedError.code = this._classifyError(normalizedError);
      }
      
      // Determine if error is recoverable
      if (normalizedError.recoverable === undefined) {
        normalizedError.recoverable = this._isRecoverable(normalizedError);
      }
      
      // Log the error based on severity
      this._logError(normalizedError);
      
      // Store in history
      this._addToHistory(normalizedError);
      
      // Update statistics
      this._updateStats(normalizedError);
      
      // Emit error event for global handling
      if (!options.silent) {
        this._emitEvent(`error:${normalizedError.category || 'audio'}`, normalizedError);
      }
      
      // Attempt recovery if enabled and error is recoverable
      if (this.config.autoRecovery && normalizedError.recoverable && !options.noRecovery) {
        this._attemptRecovery(normalizedError);
      }
      
      // User notification if severe enough
      if (['critical', 'error'].includes(normalizedError.severity) && this.config.notifyUser && !options.noNotify) {
        this._notifyUser(normalizedError);
      }
      
      return normalizedError;
    } catch (metaError) {
      // Handle errors in the error handler (to avoid infinite loops)
      console.error('Error in ErrorManager:', metaError);
      
      // Return a basic error object
      return {
        message: error?.message || String(error),
        severity: 'error',
        code: 'ERROR_HANDLER_FAILURE',
        normalized: true,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Normalize various error formats into standard structure
   * @private
   */
  _normalizeError(error, context = {}) {
    // Already normalized
    if (error && error.normalized) {
      return {...error, ...context};
    }

    // Standard Error object
    if (error instanceof Error) {
      return {
        message: error.message,
        originalError: error,
        stack: error.stack,
        code: error.code || error.name,
        normalized: true,
        timestamp: Date.now(),
        ...context
      };
    }

    // String error message
    if (typeof error === 'string') {
      return {
        message: error,
        normalized: true,
        timestamp: Date.now(),
        ...context
      };
    }

    // Object with error details
    if (error && typeof error === 'object') {
      return {
        message: error.message || 'Unknown error',
        originalError: error,
        normalized: true,
        timestamp: Date.now(),
        ...error,
        ...context
      };
    }

    // Unknown error type
    return {
      message: 'Unknown error',
      originalValue: error,
      normalized: true,
      timestamp: Date.now(),
      ...context
    };
  }

  /**
   * Classify error into known types
   * @private
   */
  _classifyError(error) {
    const message = (error.message || '').toLowerCase();
    const component = (error.component || '').toLowerCase();
    const operation = (error.operation || '').toLowerCase();

    // Context-based classification
    if (component.includes('buffer') || component === 'buffermanager') {
      if (message.includes('decode')) return 'BUFFER_DECODE_ERROR';
      if (message.includes('load')) return 'BUFFER_LOAD_ERROR';
      if (message.includes('memory') || message.includes('allocation')) return 'BUFFER_MEMORY_ERROR';
      return 'BUFFER_ERROR';
    }

    if (component.includes('context') || component === 'audioenginecode') {
      if (message.includes('resume')) return 'CONTEXT_RESUME_ERROR';
      if (message.includes('suspend')) return 'CONTEXT_SUSPEND_ERROR';
      if (message.includes('create')) return 'CONTEXT_CREATION_ERROR';
      return 'CONTEXT_ERROR';
    }

    if (component.includes('source') || component === 'sourcemanager') {
      if (message.includes('play')) return 'SOURCE_PLAYBACK_ERROR';
      if (message.includes('stop')) return 'SOURCE_STOP_ERROR';
      if (message.includes('connect')) return 'SOURCE_CONNECTION_ERROR';
      return 'SOURCE_ERROR';
    }

    if (component.includes('device') || component === 'devicemanager') {
      if (message.includes('permission')) return 'DEVICE_PERMISSION_ERROR';
      if (message.includes('select')) return 'DEVICE_SELECTION_ERROR';
      if (message.includes('disconnected')) return 'DEVICE_DISCONNECTED_ERROR';
      return 'DEVICE_ERROR';
    }

    // Pattern-based classification
    if (message.includes('not found') || message.includes('404')) {
      return 'RESOURCE_NOT_FOUND';
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return 'NETWORK_ERROR';
    }

    if (message.includes('permission') || message.includes('access denied')) {
      return 'PERMISSION_DENIED';
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'OPERATION_TIMEOUT';
    }

    if (message.includes('quota') || message.includes('storage')) {
      return 'STORAGE_ERROR';
    }

    // Operation-based classification
    if (operation === 'initialization') return 'INITIALIZATION_ERROR';
    if (operation === 'playback') return 'PLAYBACK_ERROR';
    if (operation === 'loading') return 'LOADING_ERROR';
    if (operation === 'connection') return 'CONNECTION_ERROR';

    // Default error code
    return 'AUDIO_ERROR';
  }

  /**
   * Determine error severity based on error details
   * @private
   */
  _determineSeverity(error) {
    const code = error.code || '';
    const message = (error.message || '').toLowerCase();
    const component = (error.component || '').toLowerCase();

    // Critical errors (system cannot function)
    if (
      code === 'CONTEXT_CREATION_ERROR' ||
      code === 'INITIALIZATION_ERROR' ||
      message.includes('cannot create audiocontext') ||
      message.includes('not supported') ||
      message.includes('fatal')
    ) {
      return 'critical';
    }

    // Errors (feature failure)
    if (
      code.includes('_ERROR') ||
      message.includes('failed') ||
      message.includes('error') ||
      component === 'audioenginecode'
    ) {
      return 'error';
    }

    // Warnings (degraded experience)
    if (
      code.includes('_WARNING') ||
      message.includes('warning') ||
      message.includes('deprecated') ||
      message.includes('fallback')
    ) {
      return 'warn';
    }

    // Informational (non-critical issues)
    if (
      code.includes('_INFO') ||
      message.includes('info') ||
      message.includes('notice')
    ) {
      return 'info';
    }

    // Default to warning level
    return 'warn';
  }

  /**
   * Determine if error is recoverable
   * @private
   */
  _isRecoverable(error) {
    // If explicitly marked
    if (error.recoverable !== undefined) {
      return error.recoverable;
    }

    const code = error.code || '';
    const message = (error.message || '').toLowerCase();

    // Non-recoverable errors
    if (
      code === 'CONTEXT_CREATION_ERROR' ||
      code === 'DEVICE_PERMISSION_ERROR' ||
      message.includes('not supported') ||
      message.includes('fatal')
    ) {
      return false;
    }

    // Known recoverable errors
    if (
      code === 'BUFFER_DECODE_ERROR' ||
      code === 'NETWORK_ERROR' ||
      code === 'OPERATION_TIMEOUT' ||
      code === 'SOURCE_PLAYBACK_ERROR' ||
      code === 'CONTEXT_RESUME_ERROR'
    ) {
      return true;
    }

    // Default to non-recoverable for safety
    return false;
  }

  /**
   * Initialize error recovery strategies
   * @private
   */
  _initRecoveryStrategies() {
    return {
      // AudioContext suspension error
      'CONTEXT_RESUME_ERROR': async (error) => {
        // Signal that the context needs to be reset
        this._emitEvent('recovery:context-reset-needed', {
          reason: 'resume-failure',
          error
        });
        
        // Return true to indicate recovery was attempted
        return true;
      },
      
      // Buffer decode error
      'BUFFER_DECODE_ERROR': async (error) => {
        // Try again with alternative options
        this._emitEvent('recovery:retry-decode', {
          url: error.context?.url,
          options: {
            forceFormat: true,
            // Toggle decoder implementation
            webkitAudioDecoder: !error.context?.webkitAudioDecoder
          }
        });
        
        return true;
      },
      
      // Network error
      'NETWORK_ERROR': async (error) => {
        const url = error.context?.url;
        if (!url) return false;
        
        // Schedule retry with exponential backoff
        const retryCount = error.context?.retryCount || 0;
        const maxRetries = 3;
        
        if (retryCount < maxRetries) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          
          setTimeout(() => {
            this._emitEvent('recovery:retry-load', {
              url,
              retryCount: retryCount + 1
            });
          }, backoffTime);
          
          return true;
        }
        
        return false;
      },
      
      // Device error
      'DEVICE_ERROR': async (error) => {
        // Fall back to default device
        this._emitEvent('recovery:device-fallback', {
          reason: 'error-recovery',
          previousDeviceId: error.context?.deviceId
        });
        
        return true;
      },
      
      // Source playback error
      'SOURCE_PLAYBACK_ERROR': async (error) => {
        // Recreate the source
        this._emitEvent('recovery:recreate-source', {
          sourceId: error.context?.sourceId
        });
        
        return true;
      }
    };
  }

  /**
   * Attempt to recover from an error
   * @private
   */
  async _attemptRecovery(error) {
    // Skip if error marked as non-recoverable
    if (error.recoverable === false) {
      return false;
    }
    
    // Get recovery strategy for this error code
    const strategy = this.recoveryStrategies[error.code];
    if (!strategy) {
      return false;
    }
    
    // Update stats
    this.stats.recoveryAttempts++;
    
    try {
      // Execute recovery strategy
      const result = await strategy(error);
      
      // Log recovery attempt
      console.debug(`Recovery attempted for ${error.code}:`, result ? 'success' : 'failed');
      
      // Emit recovery event
      this._emitEvent('error:recovery-attempted', {
        error,
        success: !!result
      });
      
      // Update stats on success
      if (result) {
        this.stats.recoverySuccesses++;
      }
      
      return result;
    } catch (recoveryError) {
      // Log recovery failure
      console.error('Recovery attempt failed:', recoveryError);
      
      // Emit recovery failure event
      this._emitEvent('error:recovery-failed', {
        error,
        recoveryError
      });
      
      return false;
    }
  }

  /**
   * Log error with appropriate level
   * @private
   */
  _logError(error) {
    const level = error.severity || 'error';
    const component = error.component || 'Unknown';
    const code = error.code || 'UNKNOWN_ERROR';
    const message = error.message || 'Unknown error';
    
    // Check if severity meets minimum log level
    if (!this._shouldLog(level)) {
      return;
    }
    
    // Format log message
    const logMessage = `[${component}] ${code}: ${message}`;
    
    // Detailed logs include stack trace and context
    const details = this.config.detailedLogs ? 
      { stack: error.stack, context: error.context, timestamp: error.timestamp } : 
      null;
    
    // Log with the appropriate console method
    switch (level) {
      case 'critical':
      case 'error':
        console.error(logMessage, details || '');
        break;
      case 'warn':
        console.warn(logMessage, details || '');
        break;
      case 'info':
        console.info(logMessage, details || '');
        break;
      case 'debug':
        console.debug(logMessage, details || '');
        break;
    }
  }

  /**
   * Check if error should be logged based on severity
   * @private
   */
  _shouldLog(level) {
    const levelIndex = this.logLevels.indexOf(level);
    const minLevelIndex = this.logLevels.indexOf(this.config.logLevel);
    
    return levelIndex >= minLevelIndex;
  }

  /**
   * Add error to history
   * @private
   */
  _addToHistory(error) {
    // Add to start of array (newest first)
    this.errorHistory.unshift({
      timestamp: error.timestamp,
      code: error.code,
      message: error.message,
      component: error.component,
      severity: error.severity
    });
    
    // Trim history to max size
    if (this.errorHistory.length > this.config.historySize) {
      this.errorHistory.pop();
    }
  }

  /**
   * Update error statistics
   * @private
   */
  _updateStats(error) {
    // Increment total count
    this.stats.totalErrors++;
    
    // Increment by severity
    if (error.severity && this.stats.bySeverity[error.severity] !== undefined) {
      this.stats.bySeverity[error.severity]++;
    }
    
    // Track by component
    if (error.component) {
      if (!this.stats.byComponent[error.component]) {
        this.stats.byComponent[error.component] = 0;
      }
      this.stats.byComponent[error.component]++;
    }
  }

  /**
   * Notify user of errors requiring attention
   * @private
   */
  _notifyUser(error) {
    // Only notify for significant errors
    if (error.severity !== 'critical' && error.severity !== 'error') {
      return;
    }
    
    // Create user-friendly message based on error code
    let userMessage;
    
    switch (error.code) {
      case 'CONTEXT_CREATION_ERROR':
        userMessage = 'Unable to initialize audio system. Please check your audio settings.';
        break;
      case 'BUFFER_LOAD_ERROR':
        userMessage = 'Unable to load audio file. The file may be missing or in an unsupported format.';
        break;
      case 'NETWORK_ERROR':
        userMessage = 'Network error while loading audio. Please check your connection.';
        break;
      case 'PERMISSION_DENIED':
        userMessage = 'Permission to access audio devices was denied. Please adjust your browser settings.';
        break;
      case 'DEVICE_ERROR':
        userMessage = 'Error with audio output device. The default device will be used.';
        break;
      default:
        userMessage = 'An audio system error occurred. Some features may be unavailable.';
    }
    
    // Emit user notification event
    this._emitEvent('ui:show-notification', {
      type: 'error',
      message: userMessage,
      duration: 5000,
      dismissible: true,
      sourceError: {
        code: error.code,
        component: error.component
      }
    });
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
      component: 'ErrorManager'
    });
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get error history
   * @param {number} [limit] - Maximum number of errors to return
   * @returns {Array} Array of recent errors
   */
  getErrorHistory(limit) {
    if (limit && limit > 0) {
      return this.errorHistory.slice(0, limit);
    }
    return [...this.errorHistory];
  }

  /**
   * Get telemetry data (for error reporting)
   * @returns {Object|null} Telemetry data or null if disabled
   */
  getTelemetryData() {
    if (!this.config.telemetryEnabled) {
      return null;
    }
    
    // Create telemetry report with non-sensitive data
    return {
      timestamp: Date.now(),
      errorStats: {
        total: this.stats.totalErrors,
        bySeverity: { ...this.stats.bySeverity },
        byComponent: { ...this.stats.byComponent },
        recoveryRate: this.stats.recoveryAttempts > 0 ? 
          this.stats.recoverySuccesses / this.stats.recoveryAttempts : 0
      },
      recentErrors: this.errorHistory.slice(0, 5).map(error => ({
        code: error.code,
        component: error.component,
        severity: error.severity,
        timestamp: error.timestamp
      }))
    };
  }

  /**
   * Clean up and dispose resources
   */
  dispose() {
    // Clear error history
    this.errorHistory = [];
    
    // Reset stats
    this.stats = {
      totalErrors: 0,
      bySeverity: {
        critical: 0,
        error: 0,
        warn: 0,
        info: 0,
        debug: 0
      },
      byComponent: {},
      recoveryAttempts: 0,
      recoverySuccesses: 0
    };
    
    this.initialized = false;
    this._emitEvent('disposed', {});
  }
}

export default ErrorManager;