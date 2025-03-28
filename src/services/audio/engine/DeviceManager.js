/**
 * DeviceManager.js
 * Handles audio output device management including enumeration, selection,
 * capabilities detection, and monitoring of device changes.
 */
class DeviceManager {
  /**
   * Creates a new DeviceManager instance
   * @param {Object} options - Configuration options
   * @param {AudioEngineCore} options.audioEngineCore - Reference to AudioEngineCore
   * @param {EventBus} options.EventBus - Reference to EventBus
   * @param {Object} [options.config] - Additional configuration options
   */
  constructor(options = {}) {
    // Required dependencies
    if (!options.audioEngineCore) {
      throw new Error('DeviceManager requires AudioEngineCore');
    }
    
    this.audioEngineCore = options.audioEngineCore;
    this.audioContext = this.audioEngineCore.getContext();
    this.EventBus = options.EventBus;
    
    // Device state
    this.devices = {
      available: [],
      selected: null,
      default: null,
      previouslySelected: null
    };
    
    // Feature detection
    this.features = {
      deviceEnumerationSupported: false,
      deviceSelectionSupported: false,
      deviceInfoSupported: false,
      permissionsSupported: false
    };
    
    // Configuration
    this.config = {
      autoInit: options.config?.autoInit !== false,
      persistSelection: options.config?.persistSelection !== false,
      autoSwitch: options.config?.autoSwitch !== false,
      showUnavailableDevices: options.config?.showUnavailableDevices || false,
      fallbackToDefault: options.config?.fallbackToDefault !== false,
      deviceSwitchBehavior: options.config?.deviceSwitchBehavior || 'auto',
      ...options.config
    };
    
    // Permissions state
    this.permissionState = null;
    
    // Device change monitoring
    this.deviceChangeMonitoringActive = false;
    
    // Initialize
    if (this.config.autoInit) {
      this._initialize();
    }
  }

  /**
   * Initialize the DeviceManager
   * @private
   */
  async _initialize() {
    try {
      // Detect browser features
      this._detectFeatures();
      
      // Initial device enumeration
      await this.enumerateDevices();
      
      // Setup device change monitoring
      this._setupDeviceChangeListener();
      
      // Load saved device preference if enabled
      if (this.config.persistSelection) {
        await this._loadDevicePreference();
      }
      
      this._emitEvent('device:initialized', {
        supported: this.features.deviceSelectionSupported,
        deviceCount: this.devices.available.length
      });
    } catch (error) {
      console.error('Failed to initialize DeviceManager:', error);
      this._emitEvent('device:error', {
        error,
        operation: 'initialization'
      });
    }
  }

  /**
   * Detect browser features related to audio devices
   * @private
   */
  _detectFeatures() {
    // Check for MediaDevices API
    this.features.deviceEnumerationSupported = !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.enumerateDevices
    );
    
    // Check for Audio Output Device API
    this.features.deviceSelectionSupported = !!(
      typeof this.audioContext?.destination?.setSinkId === 'function'
    );
    
    // Check for device label access (requires permissions)
    this.features.deviceInfoSupported = this.features.deviceEnumerationSupported;
    
    // Check for Permissions API
    this.features.permissionsSupported = !!(
      navigator.permissions && 
      navigator.permissions.query
    );
    
    this._emitEvent('device:features-detected', this.features);
  }

  /**
   * Enumerate available audio output devices
   * @returns {Promise<Array>} Available devices
   */
  async enumerateDevices() {
    try {
      const devices = [];
      
      // Check if device enumeration is supported
      if (!this.features.deviceEnumerationSupported) {
        // Fallback to default device only
        const defaultDevice = {
          id: 'default',
          label: 'Default Audio Output',
          kind: 'audiooutput',
          isDefault: true,
          groupId: '',
          type: 'unknown'
        };
        
        devices.push(defaultDevice);
        this.devices.default = defaultDevice;
        
        // If no device is selected, select default
        if (!this.devices.selected) {
          this.devices.selected = defaultDevice;
        }
        
        this.devices.available = devices;
        
        this._emitEvent('device:enumerated', {
          devices,
          enumerated: false,
          supported: false
        });
        
        return devices;
      }
      
      // Request microphone permission to enable device label access
      // This is a limitation of the Web Audio API - we need microphone permission
      // to get proper device labels even for output devices
      if (this.features.deviceInfoSupported && !this.permissionState) {
        await this._requestPermissions();
      }
      
      // Enumerate devices
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      
      // Filter and process output devices
      for (const device of mediaDevices) {
        if (device.kind === 'audiooutput') {
          // Determine if this is the default device
          const isDefault = device.deviceId === 'default' || 
                          device.deviceId === '' || 
                          device.deviceId === 'communications';
          
          // Enhance device object with additional information
          const enhancedDevice = {
            id: device.deviceId,
            label: device.label || (isDefault ? 'Default Audio Output' : 'Audio Output Device'),
            kind: device.kind,
            groupId: device.groupId,
            isDefault,
            type: this._detectDeviceType(device)
          };
          
          devices.push(enhancedDevice);
          
          // Store default device reference
          if (isDefault) {
            this.devices.default = enhancedDevice;
          }
        }
      }
      
      // Sort devices: default first, then by label
      devices.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.label.localeCompare(b.label);
      });
      
      // Update available devices
      this.devices.available = devices;
      
      // If no device is selected and we have devices, select default
      if (!this.devices.selected && devices.length > 0) {
        this.devices.selected = this.devices.default || devices[0];
      }
      
      this._emitEvent('device:enumerated', {
        devices,
        count: devices.length,
        hasLabels: devices.some(d => d.label && !d.label.includes('Default'))
      });
      
      return devices;
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      this._emitEvent('device:error', {
        error,
        operation: 'enumeration'
      });
      
      // Return default device as fallback
      const defaultDevice = {
        id: 'default',
        label: 'Default Audio Output',
        kind: 'audiooutput',
        isDefault: true,
        groupId: '',
        type: 'unknown'
      };
      
      this.devices.available = [defaultDevice];
      this.devices.default = defaultDevice;
      
      if (!this.devices.selected) {
        this.devices.selected = defaultDevice;
      }
      
      return [defaultDevice];
    }
  }

  /**
   * Select an audio output device
   * @param {string} deviceId - Device ID to select
   * @returns {Promise<Object|null>} Selected device or null if failed
   */
  async selectDevice(deviceId) {
    try {
      // Find device in available list
      const device = this.devices.available.find(d => d.id === deviceId);
      
      // If device not found, try refreshing the list first
      if (!device) {
        await this.enumerateDevices();
        const refreshedDevice = this.devices.available.find(d => d.id === deviceId);
        
        if (!refreshedDevice) {
          throw new Error(`Device with ID ${deviceId} not found`);
        }
      }
      
      // Store previous device for possible fallback
      this.devices.previouslySelected = this.devices.selected;
      
      // Check if device selection is supported
      if (!this.features.deviceSelectionSupported) {
        // Can't actually switch devices, but we can track selection
        this.devices.selected = device || this.devices.available.find(d => d.id === deviceId);
        
        this._emitEvent('device:selected', {
          device: this.devices.selected,
          success: false,
          message: 'Device selection not supported by browser',
          apiSupported: false
        });
        
        return this.devices.selected;
      }
      
      // Verify AudioContext is running
      if (this.audioContext.state !== 'running') {
        await this.audioEngineCore.resume();
      }
      
      // Apply device change using the Audio Output Device API
      await this.audioContext.destination.setSinkId(deviceId);
      
      // Update selected device
      this.devices.selected = device || this.devices.available.find(d => d.id === deviceId);
      
      // Save preference if enabled
      if (this.config.persistSelection) {
        this._saveDevicePreference(deviceId);
      }
      
      this._emitEvent('device:selected', {
        device: this.devices.selected,
        previous: this.devices.previouslySelected,
        success: true
      });
      
      return this.devices.selected;
    } catch (error) {
      console.error('Failed to select audio device:', error);
      this._emitEvent('device:error', {
        error,
        operation: 'selection',
        deviceId
      });
      
      // Fallback to default device if enabled
      if (this.config.fallbackToDefault && this.devices.default) {
        // Only fallback if we weren't already trying to select the default
        if (deviceId !== 'default' && deviceId !== this.devices.default.id) {
          this._emitEvent('device:fallback', {
            message: 'Falling back to default audio device',
            requestedDevice: deviceId,
            fallbackDevice: this.devices.default.id
          });
          
          // Try to select default device
          return this.selectDevice('default');
        }
      }
      
      return null;
    }
  }

  /**
   * Setup listener for device changes
   * @private
   */
  _setupDeviceChangeListener() {
    // Skip if already monitoring or not supported
    if (this.deviceChangeMonitoringActive || !this.features.deviceEnumerationSupported) {
      return;
    }
    
    try {
      // Monitor using mediaDevices API
      if (navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
        navigator.mediaDevices.addEventListener('devicechange', this._handleDeviceChange.bind(this));
        this.deviceChangeMonitoringActive = true;
        
        this._emitEvent('device:monitoring-started', {
          method: 'mediaDevices'
        });
      } else {
        // Fallback to polling if addEventListener is not available
        // Not implementing polling here as it's resource-intensive
        this._emitEvent('device:monitoring-unavailable', {
          message: 'Device change monitoring not supported by browser'
        });
      }
    } catch (error) {
      console.error('Failed to setup device change listener:', error);
      this._emitEvent('device:error', {
        error,
        operation: 'setupChangeListener'
      });
    }
  }

  /**
   * Handle device change event
   * @private
   * @param {Event} event - Device change event
   */
  async _handleDeviceChange(event) {
    // Get current device lists for comparison
    const previousDevices = [...this.devices.available];
    const previousSelected = this.devices.selected;
    
    // Re-enumerate devices
    await this.enumerateDevices();
    
    // Check if current device still exists
    let currentDeviceExists = false;
    
    if (previousSelected) {
      currentDeviceExists = this.devices.available.some(
        device => device.id === previousSelected.id
      );
    }
    
    // Auto-switch to default if current device disconnected
    if (!currentDeviceExists && 
        previousSelected && 
        previousSelected.id !== 'default' &&
        this.config.autoSwitch) {
      
      this._emitEvent('device:disconnected', {
        device: previousSelected,
        message: 'Selected audio device disconnected'
      });
      
      // Get default device and switch to it
      const defaultDevice = this.devices.default;
      if (defaultDevice) {
        await this.selectDevice(defaultDevice.id);
      }
    }
    
    // Identify added and removed devices
    const addedDevices = this.devices.available.filter(
      current => !previousDevices.some(prev => prev.id === current.id)
    );
    
    const removedDevices = previousDevices.filter(
      prev => !this.devices.available.some(current => current.id === prev.id)
    );
    
    // Emit event with device changes
    this._emitEvent('device:list-changed', {
      added: addedDevices,
      removed: removedDevices,
      current: this.devices.available,
      selected: this.devices.selected
    });
  }

  /**
   * Request permissions for device access
   * @private
   * @returns {Promise<string>} Permission state
   */
  async _requestPermissions() {
    try {
      // Try permissions API first if available
      if (this.features.permissionsSupported) {
        const permissionStatus = await navigator.permissions.query({
          name: 'microphone'
        });
        
        this.permissionState = permissionStatus.state;
        
        // Listen for permission changes
        permissionStatus.addEventListener('change', () => {
          this.permissionState = permissionStatus.state;
          
          this._emitEvent('device:permission-changed', {
            state: permissionStatus.state
          });
          
          // Re-enumerate devices on permission change
          if (permissionStatus.state === 'granted') {
            this.enumerateDevices();
          }
        });
        
        if (permissionStatus.state === 'granted') {
          return 'granted';
        }
      }
      
      // If permissions API not available or permission not granted,
      // try to get microphone access directly
      // This is deliberately not awaited as we just want to trigger the permission prompt
      // We don't actually need the microphone, just the permission to get device labels
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Stop all tracks immediately, we don't need the actual stream
        stream.getTracks().forEach(track => track.stop());
        
        this.permissionState = 'granted';
        return 'granted';
      } catch (mediaError) {
        this.permissionState = 'denied';
        console.warn('Microphone access denied, device labels may be unavailable:', mediaError);
        return 'denied';
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      this.permissionState = 'unavailable';
      return 'unavailable';
    }
  }

  /**
   * Save device selection preference
   * @private
   * @param {string} deviceId - Device ID to save
   * @returns {boolean} Success status
   */
  _saveDevicePreference(deviceId) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('audiocore-output-device', deviceId);
        
        // Store additional device preferences
        if (this.devices.selected) {
          const preferences = {
            deviceId,
            timestamp: Date.now()
          };
          
          localStorage.setItem(
            `audiocore-device-settings-${deviceId}`,
            JSON.stringify(preferences)
          );
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Failed to save device preference:', error);
      return false;
    }
  }

  /**
   * Load saved device preference
   * @private
   * @returns {Promise<boolean>} Success status
   */
  async _loadDevicePreference() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Get saved device ID
        const savedDeviceId = localStorage.getItem('audiocore-output-device');
        
        if (savedDeviceId) {
          // Check if device exists in available devices
          const deviceExists = this.devices.available.some(
            device => device.id === savedDeviceId
          );
          
          if (deviceExists) {
            // Select the saved device
            await this.selectDevice(savedDeviceId);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.warn('Failed to load device preference:', error);
      return false;
    }
  }

  /**
   * Detect device type based on device info
   * @private
   * @param {MediaDeviceInfo} device - Media device information
   * @returns {string} Device type
   */
  _detectDeviceType(device) {
    // This is an approximation as the Web Audio API doesn't provide
    // a standardized way to determine device types
    const label = (device.label || '').toLowerCase();
    
    if (label.includes('bluetooth') || label.includes('airpods') || label.includes('wireless')) {
      return 'bluetooth';
    } else if (label.includes('headphone') || label.includes('headset') || label.includes('earphone')) {
      return 'headphones';
    } else if (label.includes('hdmi') || label.includes('display') || label.includes('tv')) {
      return 'hdmi';
    } else if (label.includes('speaker') || label.includes('stereo') || label.includes('box')) {
      return 'speakers';
    } else if (label.includes('usb') || label.includes('interface') || label.includes('dac')) {
      return 'usb';
    } else {
      return 'unknown';
    }
  }

  /**
   * Emit an event through EventBus
   * @private
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  _emitEvent(type, data) {
    if (this.EventBus && typeof this.EventBus.emit === 'function') {
      this.EventBus.emit(type, {
        ...data,
        source: 'DeviceManager',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get all available devices
   * @returns {Array} Available devices
   */
  getDevices() {
    return [...this.devices.available];
  }

  /**
   * Get currently selected device
   * @returns {Object|null} Selected device
   */
  getSelectedDevice() {
    return this.devices.selected;
  }

  /**
   * Get default device
   * @returns {Object|null} Default device
   */
  getDefaultDevice() {
    return this.devices.default;
  }

  /**
   * Get device information by ID
   * @param {string} deviceId - Device ID
   * @returns {Object|null} Device information
   */
  getDeviceInfo(deviceId) {
    return this.devices.available.find(device => device.id === deviceId) || null;
  }

  /**
   * Check if device selection is supported
   * @returns {boolean} Whether device selection is supported
   */
  isDeviceSelectionSupported() {
    return this.features.deviceSelectionSupported;
  }

  /**
   * Get browser feature support information
   * @returns {Object} Feature support information
   */
  getFeatureSupport() {
    return { ...this.features };
  }

  /**
   * Get current permission state
   * @returns {string|null} Permission state
   */
  getPermissionState() {
    return this.permissionState;
  }

  /**
   * Request device permissions explicitly
   * @returns {Promise<string>} Permission state
   */
  async requestPermissions() {
    return this._requestPermissions();
  }

  /**
   * Register an event listener
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   * @returns {*} - Subscription identifier from EventBus
   */
  on(event, callback) {
    if (this.EventBus && typeof this.EventBus.on === 'function') {
      return this.EventBus.on(event, callback);
    }
    return null;
  }

  /**
   * Remove an event listener
   * @param {string} event - Event type
   * @param {*} subscription - Subscription identifier
   * @returns {boolean} - Success status
   */
  off(event, subscription) {
    if (this.EventBus && typeof this.EventBus.off === 'function') {
      return this.EventBus.off(event, subscription);
    }
    return false;
  }

  /**
   * Clean up and dispose of resources
   */
  dispose() {
    // Remove device change listener
    if (this.deviceChangeMonitoringActive && 
        navigator.mediaDevices && 
        typeof navigator.mediaDevices.removeEventListener === 'function') {
      navigator.mediaDevices.removeEventListener('devicechange', this._handleDeviceChange);
    }
    
    this._emitEvent('device:disposed', {
      time: Date.now()
    });
  }
}

export default DeviceManager;