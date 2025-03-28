import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../../common/Icon';
import { useNotification } from '../../common/Notification';
import audioService from '../../../services/AudioService';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 6px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DeviceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 300px;
  overflow-y: auto;
`;

const DeviceItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 4px;
  background-color: ${({ isActive, theme }) =>
    isActive ? 'rgba(145, 242, 145, 0.1)' : 'transparent'};
  border: 1px solid ${({ isActive, theme }) =>
    isActive ? theme.colors.brand.primary : theme.colors.border.tertiary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ isActive, theme }) =>
      isActive ? 'rgba(145, 242, 145, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  }
`;

const DeviceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  margin-right: ${({ theme }) => theme.spacing.md};
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.brand.primary : theme.colors.text.secondary};
`;

const DeviceInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DeviceName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DeviceType = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DeviceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${({ isActive, theme }) =>
      isActive ? theme.colors.brand.primary : 'transparent'};
  }

  .label {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ isActive, theme }) =>
      isActive ? theme.colors.brand.primary : theme.colors.text.secondary};
  }
`;

const NoDevices = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Sample fallback data (used when engine is not available)
const sampleDevices = [
  {
    id: 'default',
    name: 'System Default',
    type: 'System',
    isDefault: true
  },
  {
    id: 'speakers',
    name: 'Built-in Speakers',
    type: 'Output Device',
    isDefault: false
  },
  {
    id: 'hdmi',
    name: 'HDMI Audio Output',
    type: 'Digital Output',
    isDefault: false
  },
  {
    id: 'monitors',
    name: 'Studio Monitors',
    type: 'External Audio Interface',
    isDefault: false
  },
  {
    id: 'headphones',
    name: 'Audio Technica ATH-M50x',
    type: 'Headphones',
    isDefault: false
  }
];

/**
 * OutputSelector Component - Displays and selects audio output devices
 * Integrates with the DeviceManager from the enhanced AudioService
 */
const OutputSelector = ({ engineComponents }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceManager, setDeviceManager] = useState(null);

  const { success, error } = useNotification();

  // Initialize device manager and load devices
  useEffect(() => {
    const initDeviceManager = async () => {
      setLoading(true);
      
      try {
        // Get device manager from engine components
        let manager = null;
        
        if (engineComponents && engineComponents.core) {
          // Try to get DeviceManager from AudioEngineCore
          manager = engineComponents.core.getDeviceManager ? 
            engineComponents.core.getDeviceManager() : 
            engineComponents.deviceManager;
        }
        
        if (!manager) {
          // Use fallback data if no device manager available
          console.warn('DeviceManager not available, using sample devices');
          setDevices(sampleDevices);
          setSelectedDevice(sampleDevices.find(device => device.isDefault) || sampleDevices[0]);
          setLoading(false);
          return;
        }
        
        // Store device manager for use in other functions
        setDeviceManager(manager);
        
        // Load devices from manager
        await loadDevices(manager);
      } catch (err) {
        console.error('Error initializing device manager:', err);
        
        // Use fallback data on error
        setDevices(sampleDevices);
        setSelectedDevice(sampleDevices.find(device => device.isDefault) || sampleDevices[0]);
        setLoading(false);
        
        error('Failed to initialize audio devices');
      }
    };
    
    initDeviceManager();
  }, [engineComponents, error]);

  // Load devices from device manager
  const loadDevices = async (manager) => {
    setLoading(true);
    
    try {
      // Get devices from manager
      const outputDevices = manager.getOutputDevices ? 
        await manager.getOutputDevices() : 
        sampleDevices;
        
      // Get currently selected device
      const currentDevice = manager.getCurrentOutputDevice ? 
        await manager.getCurrentOutputDevice() : 
        outputDevices.find(d => d.isDefault);
      
      setDevices(outputDevices);
      setSelectedDevice(currentDevice || (outputDevices.length > 0 ? outputDevices[0] : null));
      setLoading(false);
    } catch (err) {
      console.error('Error loading audio devices:', err);
      
      // Use fallback data on error
      setDevices(sampleDevices);
      setSelectedDevice(sampleDevices.find(device => device.isDefault) || sampleDevices[0]);
      setLoading(false);
      
      error('Failed to load audio devices');
    }
  };

  // Handle device selection
  const handleSelectDevice = async (device) => {
    try {
      setSelectedDevice(device);
      
      // Set device in device manager if available
      if (deviceManager && deviceManager.setOutputDevice) {
        await deviceManager.setOutputDevice(device.id);
        success(`Output changed to ${device.name}`);
      } else {
        // Fallback for when device manager is not available
        // In a real app, this would call an audio API to switch the output device
        success(`Output changed to ${device.name} (simulated)`);
      }
    } catch (err) {
      console.error('Error setting output device:', err);
      error(`Failed to change output device: ${err.message}`);
    }
  };

  // Handle device refresh
  const handleRefresh = async () => {
    if (deviceManager) {
      try {
        // Refresh devices in device manager
        if (deviceManager.refreshDevices) {
          await deviceManager.refreshDevices();
        }
        
        // Reload devices
        await loadDevices(deviceManager);
        success('Audio devices refreshed');
      } catch (err) {
        console.error('Error refreshing devices:', err);
        error('Failed to refresh audio devices');
      }
    } else {
      // Fallback for when device manager is not available
      setLoading(true);
      
      // Simulate a delay
      setTimeout(() => {
        setDevices(sampleDevices);
        setLoading(false);
        success('Audio devices refreshed (simulated)');
      }, 1000);
    }
  };

  // Get appropriate icon for device type
  const getDeviceIcon = (device) => {
    if (device.type.toLowerCase().includes('headphone')) {
      return 'VolumeUp';
    } else if (device.type.toLowerCase().includes('digital')) {
      return 'VolumeUp';
    } else {
      return 'VolumeUp';
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Icon name="VolumeUp" size="20px" />
          Output Device
        </Title>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <Icon name="Recent" size="18px" />
        </RefreshButton>
      </Header>

      {loading ? (
        <NoDevices>
          <Icon name="Recent" size="32px" opacity="0.5" />
          <div>Loading available devices...</div>
        </NoDevices>
      ) : devices.length === 0 ? (
        <NoDevices>
          <Icon name="Recent" size="32px" opacity="0.5" />
          <div>No audio output devices found</div>
          <div>Please check your system settings</div>
        </NoDevices>
      ) : (
        <DeviceList>
          {devices.map(device => (
            <DeviceItem
              key={device.id}
              isActive={selectedDevice?.id === device.id}
              onClick={() => handleSelectDevice(device)}
            >
              <DeviceIcon isActive={selectedDevice?.id === device.id}>
                <Icon
                  name={getDeviceIcon(device)}
                  size="20px"
                />
              </DeviceIcon>
              <DeviceInfo>
                <DeviceName>{device.name}</DeviceName>
                <DeviceType>{device.type}</DeviceType>
              </DeviceInfo>
              <DeviceStatus isActive={selectedDevice?.id === device.id}>
                <div className="dot" />
                <div className="label">
                  {selectedDevice?.id === device.id ? 'ACTIVE' : 'AVAILABLE'}
                </div>
              </DeviceStatus>
            </DeviceItem>
          ))}
        </DeviceList>
      )}
    </Container>
  );
};

export default OutputSelector;