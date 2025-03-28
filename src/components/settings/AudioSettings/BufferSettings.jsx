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

const ResetButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SettingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SettingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SettingLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
`;

const SettingValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
`;

const SliderContainer = styled.div`
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
`;

const SliderTrack = styled.div`
  position: absolute;
  height: 2px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 1px;
`;

const SliderFill = styled.div`
  position: absolute;
  height: 2px;
  width: ${({ percentage }) => percentage}%;
  background-color: ${({ theme, warning }) =>
    warning ? theme.colors.brand.warning : theme.colors.brand.primary};
  border-radius: 1px;
`;

const SliderThumb = styled.div`
  position: absolute;
  left: ${({ percentage }) => percentage}%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme, warning }) =>
    warning ? theme.colors.brand.warning : theme.colors.brand.primary};
  cursor: pointer;
  z-index: 1;

  &:hover {
    transform: translateX(-50%) scale(1.1);
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
  }
`;

const RangeInput = styled.input`
  position: absolute;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
`;

const SettingInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme, warning }) =>
    warning ? theme.colors.brand.warning : theme.colors.text.tertiary};
  font-style: italic;
  margin-top: 4px;
`;

const SelectContainer = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 4px;
  padding: 6px 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const SelectIcon = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InfoPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  border-left: 3px solid ${({ theme, warning }) =>
    warning ? theme.colors.brand.warning : theme.colors.brand.primary};
`;

const InfoTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const MetricCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme, warning }) =>
    warning ? theme.colors.brand.warning : theme.colors.text.primary};
  margin-bottom: 2px;
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Default values for fallback
const defaultSettings = {
  bufferSize: 512,
  sampleRate: 48000,
  bitDepth: 24,
  channels: 2,
  latencyMode: 'balanced',
};

/**
 * BufferSettings Component - Configures audio buffer settings
 * Integrates with the AudioEngineCore from the enhanced AudioService
 */
const BufferSettings = ({ engineComponents }) => {
  const { success, error } = useNotification();
  const [engineCore, setEngineCore] = useState(null);

  // State for buffer settings
  const [settings, setSettings] = useState(defaultSettings);

  // Derived values
  const latencyMs = (settings.bufferSize / settings.sampleRate) * 1000;
  const qualityFactor = (settings.sampleRate * settings.bitDepth * settings.channels) / 1000000;
  const isHighLatency = latencyMs > 20;

  // Buffer size options (powers of 2)
  const bufferSizes = [128, 256, 512, 1024, 2048, 4096];

  // Sample rate options
  const sampleRates = [44100, 48000, 88200, 96000, 176400, 192000];

  // Bit depth options
  const bitDepths = [16, 24, 32];

  // Initialize engine connection
  useEffect(() => {
    const initEngineCore = async () => {
      try {
        // Get audio engine core
        let core = null;
        
        if (engineComponents && engineComponents.core) {
          core = engineComponents.core;
        } else if (audioService && audioService.getEngineComponents) {
          const components = audioService.getEngineComponents();
          core = components?.core || null;
        }
        
        if (!core) {
          console.warn('AudioEngineCore not available, using default settings');
          return;
        }
        
        setEngineCore(core);
        
        // Load current settings from engine
        try {
          // Get buffer configuration
          const engineSettings = {};
          
          if (core.getBufferSize) {
            engineSettings.bufferSize = await core.getBufferSize();
          }
          
          if (core.getSampleRate) {
            engineSettings.sampleRate = await core.getSampleRate();
          }
          
          if (core.getBitDepth) {
            engineSettings.bitDepth = await core.getBitDepth();
          }
          
          if (core.getChannelCount) {
            engineSettings.channels = await core.getChannelCount();
          }
          
          // Determine latency mode based on buffer size
          if (engineSettings.bufferSize) {
            if (engineSettings.bufferSize <= 128) {
              engineSettings.latencyMode = 'low';
            } else if (engineSettings.bufferSize >= 1024) {
              engineSettings.latencyMode = 'safe';
            } else {
              engineSettings.latencyMode = 'balanced';
            }
          }
          
          // Update state with engine settings
          setSettings(prev => ({
            ...prev,
            ...engineSettings
          }));
        } catch (err) {
          console.error('Error loading engine settings:', err);
          // Continue using default values
        }
      } catch (err) {
        console.error('Error initializing engine core:', err);
      }
    };
    
    initEngineCore();
  }, [engineComponents]);

  // Handle buffer size change
  const handleBufferSizeChange = async (size) => {
    try {
      // Update local state
      setSettings(prev => ({
        ...prev,
        bufferSize: parseInt(size)
      }));
      
      // Update engine if available
      if (engineCore && engineCore.setBufferSize) {
        await engineCore.setBufferSize(parseInt(size));
      }
      
      success(`Buffer size changed to ${size} samples`);
    } catch (err) {
      console.error('Error setting buffer size:', err);
      error(`Failed to set buffer size: ${err.message}`);
    }
  };

  // Handle sample rate change
  const handleSampleRateChange = async (rate) => {
    try {
      // Update local state
      setSettings(prev => ({
        ...prev,
        sampleRate: parseInt(rate)
      }));
      
      // Update engine if available
      if (engineCore && engineCore.setSampleRate) {
        await engineCore.setSampleRate(parseInt(rate));
      }
      
      success(`Sample rate changed to ${rate} Hz`);
    } catch (err) {
      console.error('Error setting sample rate:', err);
      error(`Failed to set sample rate: ${err.message}`);
    }
  };

  // Handle bit depth change
  const handleBitDepthChange = async (depth) => {
    try {
      // Update local state
      setSettings(prev => ({
        ...prev,
        bitDepth: parseInt(depth)
      }));
      
      // Update engine if available
      if (engineCore && engineCore.setBitDepth) {
        await engineCore.setBitDepth(parseInt(depth));
      }
      
      success(`Bit depth changed to ${depth} bits`);
    } catch (err) {
      console.error('Error setting bit depth:', err);
      error(`Failed to set bit depth: ${err.message}`);
    }
  };

  // Handle channels change
  const handleChannelsChange = async (channels) => {
    try {
      // Update local state
      setSettings(prev => ({
        ...prev,
        channels: parseInt(channels)
      }));
      
      // Update engine if available
      if (engineCore && engineCore.setChannelCount) {
        await engineCore.setChannelCount(parseInt(channels));
      }
      
      success(`Channels changed to ${channels}`);
    } catch (err) {
      console.error('Error setting channels:', err);
      error(`Failed to set channels: ${err.message}`);
    }
  };

  // Handle latency mode change
  const handleLatencyModeChange = async (mode) => {
    try {
      const modeSettings = {
        low: {
          bufferSize: 128,
          sampleRate: 48000
        },
        balanced: {
          bufferSize: 512,
          sampleRate: 48000
        },
        safe: {
          bufferSize: 1024,
          sampleRate: 48000
        }
      };
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        latencyMode: mode,
        bufferSize: modeSettings[mode].bufferSize,
        sampleRate: modeSettings[mode].sampleRate
      }));
      
      // Update engine if available
      if (engineCore) {
        // Apply buffer size
        if (engineCore.setBufferSize) {
          await engineCore.setBufferSize(modeSettings[mode].bufferSize);
        }
        
        // Apply sample rate
        if (engineCore.setSampleRate) {
          await engineCore.setSampleRate(modeSettings[mode].sampleRate);
        }
        
        // Apply latency hint if available
        if (engineCore.setLatencyHint) {
          await engineCore.setLatencyHint(mode);
        }
      }
      
      success(`Latency mode changed to ${mode}`);
    } catch (err) {
      console.error('Error setting latency mode:', err);
      error(`Failed to set latency mode: ${err.message}`);
    }
  };

  // Reset to default settings
  const handleReset = async () => {
    try {
      const defaultValues = {
        bufferSize: 512,
        sampleRate: 48000,
        bitDepth: 24,
        channels: 2,
        latencyMode: 'balanced'
      };
      
      // Update local state
      setSettings(defaultValues);
      
      // Update engine if available
      if (engineCore) {
        // Reset all settings in engine
        if (engineCore.resetBufferSettings) {
          await engineCore.resetBufferSettings();
        } else {
          // Apply individual settings
          if (engineCore.setBufferSize) {
            await engineCore.setBufferSize(defaultValues.bufferSize);
          }
          
          if (engineCore.setSampleRate) {
            await engineCore.setSampleRate(defaultValues.sampleRate);
          }
          
          if (engineCore.setBitDepth) {
            await engineCore.setBitDepth(defaultValues.bitDepth);
          }
          
          if (engineCore.setChannelCount) {
            await engineCore.setChannelCount(defaultValues.channels);
          }
          
          if (engineCore.setLatencyHint) {
            await engineCore.setLatencyHint(defaultValues.latencyMode);
          }
        }
      }
      
      success('Audio buffer settings reset to defaults');
    } catch (err) {
      console.error('Error resetting settings:', err);
      error(`Failed to reset settings: ${err.message}`);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Icon name="Recent" size="20px" />
          Buffer Settings
        </Title>
        <ResetButton onClick={handleReset}>
          <Icon name="Recent" size="14px" />
          Reset to Defaults
        </ResetButton>
      </Header>

      <Description>
        Configure audio buffer settings to optimize performance and quality for your system.
        Lower buffer sizes reduce latency but may cause audio glitches on slower systems.
      </Description>

      <SettingsGrid>
        <SettingSection>
          <SectionTitle>
            <Icon name="Recent" size="16px" />
            Buffer Configuration
          </SectionTitle>

          {/* Buffer Size Setting */}
          <SettingItem>
            <SettingHeader>
              <SettingLabel>Buffer Size</SettingLabel>
              <SettingValue>{settings.bufferSize} samples</SettingValue>
            </SettingHeader>
            <SliderContainer>
              <SliderTrack />
              <SliderFill
                percentage={
                  (bufferSizes.indexOf(settings.bufferSize) / (bufferSizes.length - 1)) * 100
                }
                warning={settings.bufferSize < 256}
              />
              <SliderThumb
                percentage={
                  (bufferSizes.indexOf(settings.bufferSize) / (bufferSizes.length - 1)) * 100
                }
                warning={settings.bufferSize < 256}
              />
              <RangeInput
                type="range"
                min={0}
                max={bufferSizes.length - 1}
                step={1}
                value={bufferSizes.indexOf(settings.bufferSize)}
                onChange={(e) => handleBufferSizeChange(bufferSizes[e.target.value])}
              />
            </SliderContainer>
            {settings.bufferSize < 256 && (
              <SettingInfo warning>
                Low buffer sizes may cause audio dropouts on some systems.
              </SettingInfo>
            )}
          </SettingItem>

          {/* Latency Mode Setting */}
          <SettingItem>
            <SettingHeader>
              <SettingLabel>Latency Mode</SettingLabel>
            </SettingHeader>
            <SelectContainer>
              <StyledSelect
                value={settings.latencyMode}
                onChange={(e) => handleLatencyModeChange(e.target.value)}
              >
                <option value="low">Low Latency (Live Performance)</option>
                <option value="balanced">Balanced (Recommended)</option>
                <option value="safe">Safe (High Stability)</option>
              </StyledSelect>
              <SelectIcon>
                <Icon name="Expand" size="12px" />
              </SelectIcon>
            </SelectContainer>
          </SettingItem>
        </SettingSection>

        <SettingSection>
          <SectionTitle>
            <Icon name="Recent" size="16px" />
            Audio Quality
          </SectionTitle>

          {/* Sample Rate Setting */}
          <SettingItem>
            <SettingHeader>
              <SettingLabel>Sample Rate</SettingLabel>
              <SettingValue>{settings.sampleRate / 1000} kHz</SettingValue>
            </SettingHeader>
            <SelectContainer>
              <StyledSelect
                value={settings.sampleRate}
                onChange={(e) => handleSampleRateChange(e.target.value)}
              >
                {sampleRates.map(rate => (
                  <option key={rate} value={rate}>
                    {rate / 1000} kHz
                  </option>
                ))}
              </StyledSelect>
              <SelectIcon>
                <Icon name="Expand" size="12px" />
              </SelectIcon>
            </SelectContainer>
          </SettingItem>

          {/* Bit Depth Setting */}
          <SettingItem>
            <SettingHeader>
              <SettingLabel>Bit Depth</SettingLabel>
              <SettingValue>{settings.bitDepth} bit</SettingValue>
            </SettingHeader>
            <SelectContainer>
              <StyledSelect
                value={settings.bitDepth}
                onChange={(e) => handleBitDepthChange(e.target.value)}
              >
                {bitDepths.map(depth => (
                  <option key={depth} value={depth}>
                    {depth} bit
                  </option>
                ))}
              </StyledSelect>
              <SelectIcon>
                <Icon name="Expand" size="12px" />
              </SelectIcon>
            </SelectContainer>
          </SettingItem>

          {/* Channels Setting */}
          <SettingItem>
            <SettingHeader>
              <SettingLabel>Channels</SettingLabel>
              <SettingValue>
                {settings.channels === 1 ? 'Mono' :
                 settings.channels === 2 ? 'Stereo' :
                 `${settings.channels} channels`}
              </SettingValue>
            </SettingHeader>
            <SelectContainer>
              <StyledSelect
                value={settings.channels}
                onChange={(e) => handleChannelsChange(e.target.value)}
              >
                <option value={1}>Mono (1 channel)</option>
                <option value={2}>Stereo (2 channels)</option>
                <option value={6}>5.1 Surround (6 channels)</option>
                <option value={8}>7.1 Surround (8 channels)</option>
              </StyledSelect>
              <SelectIcon>
                <Icon name="Expand" size="12px" />
              </SelectIcon>
            </SelectContainer>
          </SettingItem>
        </SettingSection>
      </SettingsGrid>

      <InfoPanel warning={isHighLatency}>
        <InfoTitle>
          <Icon name={isHighLatency ? "Recent" : "Albums"} size="16px" />
          {isHighLatency ? 'Performance Warning' : 'Performance Information'}
        </InfoTitle>
        <InfoText>
          {isHighLatency
            ? `The current buffer settings result in higher latency (${latencyMs.toFixed(2)} ms). This may be noticeable during real-time performance but provides better stability.`
            : `The current buffer settings provide good balance between performance and latency (${latencyMs.toFixed(2)} ms). These settings should work well for most scenarios.`
          }
        </InfoText>
      </InfoPanel>

      <MetricsGrid>
        <MetricCard>
          <MetricValue warning={isHighLatency}>
            {latencyMs.toFixed(1)}
          </MetricValue>
          <MetricLabel>Latency (ms)</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>
            {qualityFactor.toFixed(1)}
          </MetricValue>
          <MetricLabel>Quality Factor</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>
            {((settings.bitDepth * settings.sampleRate * settings.channels) / 8 / 1000).toFixed(0)}
          </MetricValue>
          <MetricLabel>KB/s</MetricLabel>
        </MetricCard>
      </MetricsGrid>
    </Container>
  );
};

export default BufferSettings;