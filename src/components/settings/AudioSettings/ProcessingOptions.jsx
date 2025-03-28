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

// Default options for fallback
const defaultOptions = {
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
};

/**
 * ProcessingOptions Component - Controls audio processing effects
 * Integrates with the audio effects in the enhanced AudioService
 */
const ProcessingOptions = ({ engineComponents }) => {
  const { success, error } = useNotification();
  const [audioEffects, setAudioEffects] = useState(null);
  
  // State for processing options
  const [options, setOptions] = useState(defaultOptions);

  // Initialize audio effects connection
  useEffect(() => {
    const initAudioEffects = async () => {
      try {
        // Get audio effects from engine components
        let effects = null;
        
        if (engineComponents) {
          if (engineComponents.core && engineComponents.core.getAudioEffects) {
            effects = await engineComponents.core.getAudioEffects();
          } else if (engineComponents.getAudioEffects) {
            effects = await engineComponents.getAudioEffects();
          }
        } else if (audioService && audioService.getEngineComponents) {
          const components = audioService.getEngineComponents();
          if (components && components.core && components.core.getAudioEffects) {
            effects = await components.core.getAudioEffects();
          }
        }
        
        if (!effects) {
          console.warn('Audio effects not available, using default options');
          return;
        }
        
        setAudioEffects(effects);
        
        // Initialize state with actual effect settings
        const currentSettings = {};
        
        // Get equalizer settings
        if (effects.equalizer) {
          try {
            currentSettings.eq = {
              enabled: effects.equalizer.isEnabled ? effects.equalizer.isEnabled() : defaultOptions.eq.enabled,
              preset: effects.equalizer.getCurrentPreset ? 
                effects.equalizer.getCurrentPreset() : defaultOptions.eq.preset,
              gain: effects.equalizer.getMasterGain ? 
                effects.equalizer.getMasterGain() : defaultOptions.eq.gain
            };
          } catch (err) {
            console.warn('Error getting equalizer settings:', err);
          }
        }
        
        // Get compressor settings
        if (effects.compressor) {
          try {
            currentSettings.compression = {
              enabled: effects.compressor.isEnabled ? 
                effects.compressor.isEnabled() : defaultOptions.compression.enabled,
              threshold: effects.compressor.getThreshold ? 
                effects.compressor.getThreshold() : defaultOptions.compression.threshold,
              ratio: effects.compressor.getRatio ? 
                effects.compressor.getRatio() : defaultOptions.compression.ratio
            };
          } catch (err) {
            console.warn('Error getting compressor settings:', err);
          }
        }
        
        // Get spatializer settings
        if (effects.spatializer) {
          try {
            currentSettings.spatializer = {
              enabled: effects.spatializer.isEnabled ? 
                effects.spatializer.isEnabled() : defaultOptions.spatializer.enabled,
              width: effects.spatializer.getWidth ? 
                effects.spatializer.getWidth() * 100 : defaultOptions.spatializer.width
            };
          } catch (err) {
            console.warn('Error getting spatializer settings:', err);
          }
        }
        
        // Get limiter settings
        if (effects.limiter) {
          try {
            currentSettings.limiter = {
              enabled: effects.limiter.isEnabled ? 
                effects.limiter.isEnabled() : defaultOptions.limiter.enabled,
              ceiling: effects.limiter.getCeiling ? 
                effects.limiter.getCeiling() : defaultOptions.limiter.ceiling
            };
          } catch (err) {
            console.warn('Error getting limiter settings:', err);
          }
        }
        
        // Update state with engine settings
        setOptions(prev => ({
          ...prev,
          ...currentSettings
        }));
      } catch (err) {
        console.error('Error initializing audio effects:', err);
      }
    };
    
    initAudioEffects();
  }, [engineComponents]);

  // Handle toggle change
  const handleToggle = async (effectType) => {
    try {
      const newEnabled = !options[effectType].enabled;
      
      // Update local state
      setOptions(prev => ({
        ...prev,
        [effectType]: {
          ...prev[effectType],
          enabled: newEnabled
        }
      }));
      
      // Update effect in audio engine
      if (audioEffects) {
        let effect = null;
        
        // Get the correct effect
        switch (effectType) {
          case 'eq':
            effect = audioEffects.equalizer;
            break;
          case 'compression':
            effect = audioEffects.compressor;
            break;
          case 'spatializer':
            effect = audioEffects.spatializer;
            break;
          case 'limiter':
            effect = audioEffects.limiter;
            break;
        }
        
        // Enable/disable the effect
        if (effect && effect.setEnabled) {
          await effect.setEnabled(newEnabled);
        }
      }
      
      success(`${effectType.charAt(0).toUpperCase() + effectType.slice(1)} ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error(`Error toggling ${effectType}:`, err);
      error(`Failed to toggle ${effectType}: ${err.message}`);
      
      // Revert state on error
      setOptions(prev => ({
        ...prev,
        [effectType]: {
          ...prev[effectType],
          enabled: !prev[effectType].enabled
        }
      }));
    }
  };

  // Handle numeric value change
  const handleValueChange = async (effectType, param, value) => {
    try {
      const numValue = parseFloat(value);
      
      // Update local state
      setOptions(prev => ({
        ...prev,
        [effectType]: {
          ...prev[effectType],
          [param]: numValue
        }
      }));
      
      // Update effect in audio engine
      if (audioEffects) {
        let effect = null;
        
        // Get the correct effect
        switch (effectType) {
          case 'eq':
            effect = audioEffects.equalizer;
            break;
          case 'compression':
            effect = audioEffects.compressor;
            break;
          case 'spatializer':
            effect = audioEffects.spatializer;
            break;
          case 'limiter':
            effect = audioEffects.limiter;
            break;
        }
        
        // Apply the parameter change
        if (effect) {
          switch (param) {
            case 'gain':
              if (effect.setMasterGain) {
                await effect.setMasterGain(numValue);
              }
              break;
            case 'threshold':
              if (effect.setThreshold) {
                await effect.setThreshold(numValue);
              }
              break;
            case 'ratio':
              if (effect.setRatio) {
                await effect.setRatio(numValue);
              }
              break;
            case 'width':
              if (effect.setWidth) {
                // Convert from percentage to 0-1 range
                await effect.setWidth(numValue / 100);
              }
              break;
            case 'ceiling':
              if (effect.setCeiling) {
                await effect.setCeiling(numValue);
              }
              break;
          }
        }
      }
    } catch (err) {
      console.error(`Error setting ${param} for ${effectType}:`, err);
      error(`Failed to update ${param}: ${err.message}`);
    }
  };

  // Handle select change
  const handleSelectChange = async (effectType, param, value) => {
    try {
      // Update local state
      setOptions(prev => ({
        ...prev,
        [effectType]: {
          ...prev[effectType],
          [param]: value
        }
      }));
      
      // Update effect in audio engine
      if (audioEffects && effectType === 'eq' && param === 'preset') {
        const equalizer = audioEffects.equalizer;
        if (equalizer && equalizer.applyPreset) {
          await equalizer.applyPreset(value);
        }
      }
      
      success(`${effectType.charAt(0).toUpperCase() + effectType.slice(1)} preset changed to ${value}`);
    } catch (err) {
      console.error(`Error setting ${param} for ${effectType}:`, err);
      error(`Failed to update ${param}: ${err.message}`);
    }
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