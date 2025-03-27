import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import { useNotification } from '../../common/Notification';
import Icon from '../../common/Icon';
import { SecondaryButton } from '../../common/Button';

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

const EqualizerControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PresetsSelect = styled.select`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  padding: 4px 8px;
  outline: none;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
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

// Individual EQ band slider
const BandSlider = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 36px;
  z-index: 1;
`;

const SliderTrack = styled.div`
  position: relative;
  width: 4px;
  height: 150px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 2px;
  overflow: visible;
`;

const SliderProgress = styled.div`
  position: absolute;
  bottom: ${({ value }) => value > 0 ? '50%' : `calc(50% - ${Math.abs(value)}%)`};
  left: 0;
  width: 100%;
  height: ${({ value }) => `${Math.abs(value)}%`};
  background-color: ${({ theme, value }) => 
    value > 0 ? theme.colors.brand.primary : theme.colors.brand.secondary};
  transition: all 0.1s ease;
`;

const SliderThumb = styled.div`
  position: absolute;
  left: 50%;
  bottom: ${({ value }) => `calc(50% + ${value}%)`};
  width: 12px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 50%;
  transform: translate(-50%, 50%);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    transform: translate(-50%, 50%) scale(1.2);
  }
  
  &:active {
    transform: translate(-50%, 50%) scale(1.1);
  }
`;

const BandLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BandValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
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

// Visualization of frequency response curve
const ResponseCurve = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 4px;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const CurveSvg = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const CurvePath = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.brand.primary};
  stroke-width: 2;
  opacity: 0.8;
`;

const CurveGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.border.tertiary};
  }
  
  &::before {
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
  }
  
  &::after {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
  }
`;

// Predefined equalizer presets
const PRESETS = {
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

const EqualizerPanel = () => {
  // State
  const [enabled, setEnabled] = useState(false);
  const [preset, setPreset] = useState('flat');
  const [bands, setBands] = useState(PRESETS.flat.values);
  const [masterGain, setMasterGain] = useState(0);
  const [draggingBand, setDraggingBand] = useState(null);
  
  // Refs for drag handling
  const slidersRef = useRef([]);
  
  // Get player context and notification system
  const { /* audioContext, masterEqualizer */ } = usePlayer();
  const { success } = useNotification();
  
  // Apply preset when changed
  useEffect(() => {
    if (preset !== 'custom') {
      setBands(PRESETS[preset].values);
      success(`Applied "${PRESETS[preset].name}" equalizer preset`, {
        autoClose: true,
        duration: 1500
      });
    }
  }, [preset]);
  
  // Update audio when bands change
  useEffect(() => {
    if (!enabled) return;
    
    // In a real app, you would apply the EQ values to Web Audio API filters
    // For example:
    // bands.forEach((gain, i) => {
    //   if (masterEqualizer && masterEqualizer.bands[i]) {
    //     masterEqualizer.bands[i].gain.value = gain;
    //   }
    // });
    
    // If bands don't match any preset, set to custom
    const presetMatch = Object.entries(PRESETS).find(([key, data]) => 
      key !== 'custom' && data.values.every((val, i) => val === bands[i])
    );
    
    if (!presetMatch && preset !== 'custom') {
      setPreset('custom');
    }
  }, [bands, enabled]);
  
  // Apply master gain
  useEffect(() => {
    if (!enabled) return;
    
    // In a real app, you would apply master gain to the Web Audio API
    // For example:
    // if (masterEqualizer && masterEqualizer.masterGain) {
    //   masterEqualizer.masterGain.gain.value = masterGain;
    // }
  }, [masterGain, enabled]);
  
  // Toggle equalizer on/off
  const toggleEqualizer = () => {
    setEnabled(!enabled);
    success(!enabled ? 'Equalizer enabled' : 'Equalizer disabled', {
      autoClose: true,
      duration: 1500
    });
    
    // In a real app, you would connect/bypass the EQ in the audio chain
  };
  
  // Reset all bands to zero
  const resetEqualizer = () => {
    setBands(PRESETS.flat.values);
    setMasterGain(0);
    setPreset('flat');
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
    
    const sliderRef = slidersRef.current[draggingBand];
    if (!sliderRef) return;
    
    const rect = sliderRef.getBoundingClientRect();
    const height = rect.height;
    const offsetY = rect.bottom - e.clientY;
    const percentage = (offsetY / height) * 100 - 50; // -50 to 50 range
    const value = Math.round(percentage / 5) * 5; // Round to nearest 5
    const clampedValue = Math.max(Math.min(value, 50), -50); // Clamp to -50 to 50
    
    handleBandChange(draggingBand, clampedValue / 5); // Scale to -10 to 10
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setDraggingBand(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Generate SVG path for response curve
  const generateCurvePath = () => {
    const width = 100;
    const height = 80;
    const points = bands.map((band, i) => {
      const x = (i / (bands.length - 1)) * width;
      const y = height / 2 - (band / 10) * (height / 4); // Scale -10 to 10 range to fit height
      return `${x},${y}`;
    });
    
    // Add control points for a smooth curve
    return `M0,${height / 2} C${points.join(' ')} ${width},${height / 2}`;
  };
  
  return (
    <EqualizerContainer>
      <EqualizerHeader>
        <HeaderTitle>EQUALIZER</HeaderTitle>
        <EqualizerControls>
          <PresetsSelect 
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            disabled={!enabled}
          >
            {Object.entries(PRESETS).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </PresetsSelect>
          <SecondaryButton onClick={resetEqualizer} disabled={!enabled}>
            Reset
          </SecondaryButton>
        </EqualizerControls>
      </EqualizerHeader>
      
      <EqualizerContent>
        <ResponseCurve>
          <CurveSvg viewBox="0 0 100 80" preserveAspectRatio="none">
            <CurvePath d={generateCurvePath()} />
          </CurveSvg>
          <CurveGrid />
        </ResponseCurve>
        
        <EqualizerBands>
          {bands.map((band, index) => (
            <BandSlider key={index}>
              <BandValue>{band > 0 ? `+${band}` : band}</BandValue>
              <SliderTrack 
                ref={(el) => slidersRef.current[index] = el}
                onMouseDown={(e) => enabled && handleBandMouseDown(e, index)}
              >
                <SliderProgress value={band * 5} /> {/* Scale -10 to 10 to -50 to 50 for display */}
                <SliderThumb value={band * 5} />
              </SliderTrack>
              <BandLabel>
                {FREQUENCY_BANDS[index] >= 1000 
                  ? `${FREQUENCY_BANDS[index]/1000}k` 
                  : FREQUENCY_BANDS[index]}
              </BandLabel>
            </BandSlider>
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