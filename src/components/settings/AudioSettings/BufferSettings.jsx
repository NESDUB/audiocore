import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../../common/Icon';
import { useNotification } from '../../common/Notification';

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

const BufferSettings = () => {
  const { success } = useNotification();
  
  // State for buffer settings
  const [settings, setSettings] = useState({
    bufferSize: 512,          // Buffer size in samples (powers of 2)
    sampleRate: 48000,        // Sample rate in Hz
    bitDepth: 24,             // Bit depth in bits
    channels: 2,              // Number of audio channels
    latencyMode: 'balanced',  // Latency mode (low, balanced, safe)
  });
  
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
  
  // Handle buffer size change
  const handleBufferSizeChange = (size) => {
    setSettings(prev => ({
      ...prev,
      bufferSize: parseInt(size)
    }));
    
    success(`Buffer size changed to ${size} samples`);
  };
  
  // Handle sample rate change
  const handleSampleRateChange = (rate) => {
    setSettings(prev => ({
      ...prev,
      sampleRate: parseInt(rate)
    }));
    
    success(`Sample rate changed to ${rate} Hz`);
  };
  
  // Handle bit depth change
  const handleBitDepthChange = (depth) => {
    setSettings(prev => ({
      ...prev,
      bitDepth: parseInt(depth)
    }));
    
    success(`Bit depth changed to ${depth} bits`);
  };
  
  // Handle channels change
  const handleChannelsChange = (channels) => {
    setSettings(prev => ({
      ...prev,
      channels: parseInt(channels)
    }));
    
    success(`Channels changed to ${channels}`);
  };
  
  // Handle latency mode change
  const handleLatencyModeChange = (mode) => {
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
    
    setSettings(prev => ({
      ...prev,
      latencyMode: mode,
      bufferSize: modeSettings[mode].bufferSize,
      sampleRate: modeSettings[mode].sampleRate
    }));
    
    success(`Latency mode changed to ${mode}`);
  };
  
  // Reset to default settings
  const handleReset = () => {
    setSettings({
      bufferSize: 512,
      sampleRate: 48000,
      bitDepth: 24,
      channels: 2,
      latencyMode: 'balanced'
    });
    
    success('Audio buffer settings reset to defaults');
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