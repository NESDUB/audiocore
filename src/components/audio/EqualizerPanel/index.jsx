import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import { useNotification } from '../../common/Notification';
import Icon from '../../common/Icon';
import { SecondaryButton } from '../../common/Button';

// Import our new components
import EqualizerBand from './EqualizerBand';
import EqualizerPreset from './EqualizerPreset';
import FrequencyResponse from './FrequencyResponse';

// Main container
const EqualizerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 6px;
  overflow: hidden;
`;

// Header with controls
const EqualizerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const HeaderTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 1px;
  margin: 0;
`;

// Main EQ sliders area
const EqualizerContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Container for EQ bands
const EqualizerBands = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md} 0;
  position: relative;
  flex: 1;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border.tertiary};
    z-index: 0;
  }
`;

// Master controls
const MasterControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ToggleButton = styled.button`
  background-color: transparent;
  border: 1px solid ${({ theme, active }) =>
    active ? theme.colors.brand.primary : theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme, active }) =>
    active ? theme.colors.brand.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.primary};
    border-color: ${({ theme, active }) =>
      active ? theme.colors.brand.primary : theme.colors.text.primary};
    color: ${({ theme, active }) =>
      active ? theme.colors.brand.primary : theme.colors.text.primary};
  }
`;

const MasterValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Predefined equalizer presets
const DEFAULT_PRESETS = {
  flat: { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  bass: { name: 'Bass Boost', values: [6, 5, 4, 2, 1, 0, 0, 0, 0, 0] },
  treble: { name: 'Treble Boost', values: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5] },
  vocal: { name: 'Vocal Boost', values: [-1, -1, 0, 2, 4, 3, 2, 0, -1, -1] },
  electronic: { name: 'Electronic', values: [3, 2, 0, -1, -2, 0, 1, 2, 3, 4] },
  rock: { name: 'Rock', values: [3, 2, 1, 0, -1, -1, 0, 1, 2, 3] },
  custom: { name: 'Custom', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
};

// The frequency bands in Hz
const FREQUENCY_BANDS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

/**
 * EqualizerPanel component - Audio equalizer with frequency bands and presets
 */
const EqualizerPanel = () => {
  // State
  const [enabled, setEnabled] = useState(false);
  const [preset, setPreset] = useState('flat');
  const [bands, setBands] = useState(DEFAULT_PRESETS.flat.values);
  const [masterGain, setMasterGain] = useState(0);
  const [draggingBand, setDraggingBand] = useState(null);
  const [presets, setPresets] = useState(DEFAULT_PRESETS);

  // Refs
  const equalizerRef = useRef(null);

  // Get player context and notification system
  const { getAudioEffects, audioEngine } = usePlayer();
  const { success } = useNotification();
  
  // Connect to the audio engine equalizer when the component mounts
  useEffect(() => {
    // Get the equalizer from the audio engine effects
    if (audioEngine && getAudioEffects) {
      const effects = getAudioEffects();
      if (effects && effects.equalizer) {
        equalizerRef.current = effects.equalizer;
        
        // Initialize equalizer state from the engine if available
        if (equalizerRef.current.getBandValues) {
          const engineBands = equalizerRef.current.getBandValues();
          if (engineBands && engineBands.length === bands.length) {
            setBands(engineBands);
            
            // Determine preset if it matches any predefined preset
            detectAndSetPreset(engineBands);
          }
        }
        
        // Get enabled state from engine
        if (equalizerRef.current.isEnabled) {
          setEnabled(equalizerRef.current.isEnabled());
        }
        
        // Get master gain from engine
        if (equalizerRef.current.getMasterGain) {
          const gain = equalizerRef.current.getMasterGain();
          setMasterGain(Math.round(gain * 10)); // Convert from -1/+1 to -10/+10 range
        }
        
        // Load saved custom presets if available
        if (window.localStorage) {
          const savedPresets = window.localStorage.getItem('eqCustomPresets');
          if (savedPresets) {
            try {
              const customPresets = JSON.parse(savedPresets);
              setPresets({
                ...DEFAULT_PRESETS,
                ...customPresets
              });
            } catch (e) {
              console.error('Failed to load custom presets', e);
            }
          }
        }
      }
    }
  }, [audioEngine, getAudioEffects]);

  // Apply preset when changed
  useEffect(() => {
    if (preset !== 'custom') {
      const presetValues = presets[preset]?.values || DEFAULT_PRESETS.flat.values;
      setBands(presetValues);
      success(`Applied "${presets[preset]?.name || 'Flat'}" equalizer preset`, {
        autoClose: true,
        duration: 1500
      });
      
      // Apply to audio engine if enabled
      if (enabled && equalizerRef.current) {
        updateEqualizerBands(presetValues);
      }
    }
  }, [preset, success, enabled, presets]);

  // Update audio when bands change
  useEffect(() => {
    if (!enabled) return;

    // Apply to audio engine
    if (equalizerRef.current) {
      updateEqualizerBands(bands);
    }

    // If bands don't match any preset, set to custom
    const presetMatch = Object.entries(presets).find(([key, data]) =>
      key !== 'custom' && data.values.every((val, i) => val === bands[i])
    );

    if (!presetMatch && preset !== 'custom') {
      setPreset('custom');
    }
  }, [bands, enabled, preset, presets]);

  // Apply master gain
  useEffect(() => {
    if (!enabled || !equalizerRef.current) return;

    // Apply master gain to the audio engine
    if (equalizerRef.current.setMasterGain) {
      equalizerRef.current.setMasterGain(masterGain / 10); // Convert from -10/+10 to -1/+1 range
    }
  }, [masterGain, enabled]);

  // Function to update the equalizer bands in the audio engine
  const updateEqualizerBands = (bandValues) => {
    if (!equalizerRef.current) return;
    
    if (equalizerRef.current.setBandValues) {
      // Use bulk update if available
      equalizerRef.current.setBandValues(bandValues);
    } else {
      // Otherwise update bands individually
      bandValues.forEach((gain, i) => {
        if (equalizerRef.current.setBandGain) {
          equalizerRef.current.setBandGain(i, gain);
        } else if (equalizerRef.current.bands && equalizerRef.current.bands[i]) {
          // Direct access to filter nodes
          const filter = equalizerRef.current.bands[i];
          if (filter.gain && typeof filter.gain.value !== 'undefined') {
            filter.gain.value = gain;
          }
        }
      });
    }
  };
  
  // Detect current preset based on band values
  const detectAndSetPreset = (bandValues) => {
    const matchingPreset = Object.entries(presets).find(([key, data]) => 
      key !== 'custom' && data.values.every((val, i) => val === bandValues[i])
    );
    
    if (matchingPreset) {
      setPreset(matchingPreset[0]);
    } else {
      setPreset('custom');
    }
  };

  // Toggle equalizer on/off
  const toggleEqualizer = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    
    success(newEnabled ? 'Equalizer enabled' : 'Equalizer disabled', {
      autoClose: true,
      duration: 1500
    });

    // Toggle the equalizer in the audio engine
    if (equalizerRef.current && equalizerRef.current.setEnabled) {
      equalizerRef.current.setEnabled(newEnabled);
    }
  };

  // Reset all bands to zero
  const resetEqualizer = () => {
    const flatBands = DEFAULT_PRESETS.flat.values;
    setBands(flatBands);
    setMasterGain(0);
    setPreset('flat');
    
    // Apply to audio engine
    if (enabled && equalizerRef.current) {
      updateEqualizerBands(flatBands);
      
      // Reset master gain
      if (equalizerRef.current.setMasterGain) {
        equalizerRef.current.setMasterGain(0);
      }
    }
    
    success('Equalizer reset', {
      autoClose: true,
      duration: 1500
    });
  };

  // Handle band value change
  const handleBandChange = (index, value) => {
    const newBands = [...bands];
    newBands[index] = value;
    setBands(newBands);
  };

  // Handle mouse down on a band slider
  const handleBandMouseDown = (e, index) => {
    setDraggingBand(index);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault(); // Prevent text selection
  };

  // Handle mouse move while dragging
  const handleMouseMove = (e) => {
    if (draggingBand === null) return;
    
    const handleSliderDrag = (clientY) => {
      const sliders = document.querySelectorAll('.eq-band-slider');
      if (!sliders || !sliders[draggingBand]) return;
      
      const sliderRect = sliders[draggingBand].getBoundingClientRect();
      const height = sliderRect.height;
      const offsetY = sliderRect.bottom - clientY;
      const percentage = (offsetY / height) * 100 - 50; // -50 to 50 range
      const value = Math.round(percentage / 5) * 5; // Round to nearest 5
      const clampedValue = Math.max(Math.min(value, 50), -50); // Clamp to -50 to 50
      
      handleBandChange(draggingBand, clampedValue / 5); // Scale to -10 to 10
    };
    
    handleSliderDrag(e.clientY);
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setDraggingBand(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Save a custom preset
  const handleSaveCustom = (newPreset) => {
    // Add unique ID if not provided
    const presetId = newPreset.id || `custom_${Date.now()}`;
    
    // Create updated presets object
    const updatedPresets = {
      ...presets,
      [presetId]: {
        name: newPreset.name,
        values: newPreset.values
      }
    };
    
    // Update state
    setPresets(updatedPresets);
    setPreset(presetId);
    
    // Save to localStorage if available
    if (window.localStorage) {
      try {
        // Extract only custom presets (not the default ones)
        const customPresets = {};
        Object.entries(updatedPresets).forEach(([key, preset]) => {
          if (!DEFAULT_PRESETS[key]) {
            customPresets[key] = preset;
          }
        });
        
        window.localStorage.setItem('eqCustomPresets', JSON.stringify(customPresets));
      } catch (e) {
        console.error('Failed to save custom presets', e);
      }
    }
    
    success(`Saved "${newPreset.name}" preset`, {
      autoClose: true,
      duration: 1500
    });
  };

  return (
    <EqualizerContainer>
      <EqualizerHeader>
        <HeaderTitle>EQUALIZER</HeaderTitle>
        <EqualizerPreset
          currentPreset={preset}
          presets={presets}
          onPresetChange={setPreset}
          onReset={resetEqualizer}
          onSaveCustom={handleSaveCustom}
          currentValues={bands}
          disabled={!enabled}
        />
      </EqualizerHeader>

      <EqualizerContent>
        <FrequencyResponse
          bands={bands}
          frequencies={FREQUENCY_BANDS}
        />

        <EqualizerBands>
          {bands.map((band, index) => (
            <EqualizerBand
              key={index}
              frequency={FREQUENCY_BANDS[index]}
              value={band}
              onChange={(value) => handleBandChange(index, value)}
              onMouseDown={(e) => handleBandMouseDown(e, index)}
              disabled={!enabled}
              className="eq-band-slider"
            />
          ))}
        </EqualizerBands>
      </EqualizerContent>

      <MasterControls>
        <ToggleButton
          active={enabled}
          onClick={toggleEqualizer}
        >
          <Icon name="Equalizer" size="14px" />
          {enabled ? 'ENABLED' : 'DISABLED'}
        </ToggleButton>

        <MasterValue>
          <span>MASTER:</span>
          <SliderRow>
            <Icon name="VolumeDown" size="14px" color={enabled ? 'currentColor' : '#666'} />
            <input
              type="range"
              min="-10"
              max="10"
              value={masterGain}
              onChange={(e) => setMasterGain(parseInt(e.target.value))}
              disabled={!enabled}
              style={{ width: '100px' }}
            />
            <Icon name="VolumeUp" size="14px" color={enabled ? 'currentColor' : '#666'} />
          </SliderRow>
          <span style={{ minWidth: '30px', textAlign: 'right' }}>
            {masterGain > 0 ? `+${masterGain}` : masterGain}
          </span>
        </MasterValue>
      </MasterControls>
    </EqualizerContainer>
  );
};

export default EqualizerPanel;