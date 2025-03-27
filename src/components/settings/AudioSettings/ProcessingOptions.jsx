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

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const OptionCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const OptionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const OptionSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${({ theme }) => theme.colors.brand.primary};
  }
  
  &:checked + span:before {
    transform: translateX(16px);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border.secondary};
  transition: ${({ theme }) => theme.transitions.fast};
  border-radius: 10px;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: ${({ theme }) => theme.transitions.fast};
    border-radius: 50%;
  }
`;

const OptionContent = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
`;

const OptionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const OptionControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ControlLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ControlValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  width: 40px;
  text-align: right;
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
  width: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
  background-color: ${({ theme }) => theme.colors.brand.primary};
  border-radius: 1px;
`;

const SliderThumb = styled.div`
  position: absolute;
  left: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.brand.primary};
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

const SelectContainer = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface.darker};
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

// Processing options component
const ProcessingOptions = () => {
  const { success } = useNotification();
  
  // State for processing options
  const [options, setOptions] = useState({
    eq: {
      enabled: true,
      preset: 'flat',
      gain: 0
    },
    compression: {
      enabled: false,
      threshold: -24,
      ratio: 4
    },
    spatializer: {
      enabled: true,
      width: 50
    },
    limiter: {
      enabled: true,
      ceiling: -0.3
    }
  });
  
  // Handle toggle change
  const handleToggle = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: {
        ...prev[option],
        enabled: !prev[option].enabled
      }
    }));
    
    success(`${option.charAt(0).toUpperCase() + option.slice(1)} ${!options[option].enabled ? 'enabled' : 'disabled'}`);
  };
  
  // Handle numeric value change
  const handleValueChange = (option, param, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: {
        ...prev[option],
        [param]: parseFloat(value)
      }
    }));
  };
  
  // Handle select change
  const handleSelectChange = (option, param, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: {
        ...prev[option],
        [param]: value
      }
    }));
    
    success(`${option.charAt(0).toUpperCase() + option.slice(1)} preset changed to ${value}`);
  };
  
  return (
    <Container>
      <Header>
        <Title>
          <Icon name="Equalizer" size="20px" />
          Audio Processing
        </Title>
      </Header>
      
      <OptionsGrid>
        {/* Equalizer */}
        <OptionCard>
          <OptionHeader>
            <OptionTitle>
              <Icon name="Equalizer" size="16px" />
              Equalizer
            </OptionTitle>
            <OptionSwitch>
              <SwitchInput 
                type="checkbox"
                checked={options.eq.enabled}
                onChange={() => handleToggle('eq')}
              />
              <SwitchSlider />
            </OptionSwitch>
          </OptionHeader>
          <OptionContent>
            <OptionDescription>
              Adjust frequency response to shape the sound to your preference.
            </OptionDescription>
            <OptionControls disabled={!options.eq.enabled}>
              <ControlRow>
                <ControlLabel>Preset</ControlLabel>
                <SelectContainer>
                  <StyledSelect
                    value={options.eq.preset}
                    onChange={(e) => handleSelectChange('eq', 'preset', e.target.value)}
                  >
                    <option value="flat">Flat</option>
                    <option value="bass">Bass Boost</option>
                    <option value="vocal">Vocal Boost</option>
                    <option value="acoustic">Acoustic</option>
                    <option value="electronic">Electronic</option>
                  </StyledSelect>
                  <SelectIcon>
                    <Icon name="Expand" size="12px" />
                  </SelectIcon>
                </SelectContainer>
              </ControlRow>
              <ControlRow>
                <ControlLabel>Gain</ControlLabel>
                <ControlValue>{options.eq.gain} dB</ControlValue>
              </ControlRow>
              <SliderContainer>
                <SliderTrack />
                <SliderFill 
                  value={options.eq.gain + 12} 
                  min={0} 
                  max={24} 
                />
                <SliderThumb 
                  value={options.eq.gain + 12} 
                  min={0} 
                  max={24}
                />
                <RangeInput
                  type="range"
                  min={-12}
                  max={12}
                  step={0.1}
                  value={options.eq.gain}
                  onChange={(e) => handleValueChange('eq', 'gain', e.target.value)}
                />
              </SliderContainer>
            </OptionControls>
          </OptionContent>
        </OptionCard>
        
        {/* Compressor */}
        <OptionCard>
          <OptionHeader>
            <OptionTitle>
              <Icon name="Equalizer" size="16px" />
              Compressor
            </OptionTitle>
            <OptionSwitch>
              <SwitchInput 
                type="checkbox"
                checked={options.compression.enabled}
                onChange={() => handleToggle('compression')}
              />
              <SwitchSlider />
            </OptionSwitch>
          </OptionHeader>
          <OptionContent>
            <OptionDescription>
              Evens out volume levels by reducing dynamic range.
            </OptionDescription>
            <OptionControls disabled={!options.compression.enabled}>
              <ControlRow>
                <ControlLabel>Threshold</ControlLabel>
                <ControlValue>{options.compression.threshold} dB</ControlValue>
              </ControlRow>
              <SliderContainer>
                <SliderTrack />
                <SliderFill 
                  value={options.compression.threshold + 60} 
                  min={0} 
                  max={60} 
                />
                <SliderThumb 
                  value={options.compression.threshold + 60} 
                  min={0} 
                  max={60}
                />
                <RangeInput
                  type="range"
                  min={-60}
                  max={0}
                  step={0.5}
                  value={options.compression.threshold}
                  onChange={(e) => handleValueChange('compression', 'threshold', e.target.value)}
                />
              </SliderContainer>
              
              <ControlRow>
                <ControlLabel>Ratio</ControlLabel>
                <ControlValue>{options.compression.ratio}:1</ControlValue>
              </ControlRow>
              <SliderContainer>
                <SliderTrack />
                <SliderFill 
                  value={options.compression.ratio} 
                  min={1} 
                  max={20} 
                />
                <SliderThumb 
                  value={options.compression.ratio} 
                  min={1} 
                  max={20}
                />
                <RangeInput
                  type="range"
                  min={1}
                  max={20}
                  step={0.1}
                  value={options.compression.ratio}
                  onChange={(e) => handleValueChange('compression', 'ratio', e.target.value)}
                />
              </SliderContainer>
            </OptionControls>
          </OptionContent>
        </OptionCard>
        
        {/* Spatializer */}
        <OptionCard>
          <OptionHeader>
            <OptionTitle>
              <Icon name="Equalizer" size="16px" />
              Spatializer
            </OptionTitle>
            <OptionSwitch>
              <SwitchInput 
                type="checkbox"
                checked={options.spatializer.enabled}
                onChange={() => handleToggle('spatializer')}
              />
              <SwitchSlider />
            </OptionSwitch>
          </OptionHeader>
          <OptionContent>
            <OptionDescription>
              Enhances stereo width for a more immersive sound.
            </OptionDescription>
            <OptionControls disabled={!options.spatializer.enabled}>
              <ControlRow>
                <ControlLabel>Width</ControlLabel>
                <ControlValue>{options.spatializer.width}%</ControlValue>
              </ControlRow>
              <SliderContainer>
                <SliderTrack />
                <SliderFill 
                  value={options.spatializer.width} 
                  min={0} 
                  max={100} 
                />
                <SliderThumb 
                  value={options.spatializer.width} 
                  min={0} 
                  max={100}
                />
                <RangeInput
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={options.spatializer.width}
                  onChange={(e) => handleValueChange('spatializer', 'width', e.target.value)}
                />
              </SliderContainer>
            </OptionControls>
          </OptionContent>
        </OptionCard>
        
        {/* Limiter */}
        <OptionCard>
          <OptionHeader>
            <OptionTitle>
              <Icon name="Equalizer" size="16px" />
              Limiter
            </OptionTitle>
            <OptionSwitch>
              <SwitchInput 
                type="checkbox"
                checked={options.limiter.enabled}
                onChange={() => handleToggle('limiter')}
              />
              <SwitchSlider />
            </OptionSwitch>
          </OptionHeader>
          <OptionContent>
            <OptionDescription>
              Prevents audio clipping by limiting peak levels.
            </OptionDescription>
            <OptionControls disabled={!options.limiter.enabled}>
              <ControlRow>
                <ControlLabel>Ceiling</ControlLabel>
                <ControlValue>{options.limiter.ceiling} dB</ControlValue>
              </ControlRow>
              <SliderContainer>
                <SliderTrack />
                <SliderFill 
                  value={options.limiter.ceiling + 6} 
                  min={0} 
                  max={6} 
                />
                <SliderThumb 
                  value={options.limiter.ceiling + 6} 
                  min={0} 
                  max={6}
                />
                <RangeInput
                  type="range"
                  min={-6}
                  max={0}
                  step={0.1}
                  value={options.limiter.ceiling}
                  onChange={(e) => handleValueChange('limiter', 'ceiling', e.target.value)}
                />
              </SliderContainer>
            </OptionControls>
          </OptionContent>
        </OptionCard>
      </OptionsGrid>
    </Container>
  );
};

export default ProcessingOptions;