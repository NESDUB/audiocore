import React, { useRef } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Individual EQ band slider container
const BandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 36px;
  z-index: 1;
`;

// Value display above slider
const BandValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
`;

// Slider track (vertical line)
const SliderTrack = styled.div`
  position: relative;
  width: 4px;
  height: 150px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 2px;
  overflow: visible;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`;

// Colored portion of the slider
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

// Draggable thumb indicator
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
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  z-index: 2;

  &:hover {
    transform: translate(-50%, 50%) scale(1.2);
  }

  &:active {
    transform: translate(-50%, 50%) scale(1.1);
  }
`;

// Frequency label below slider
const BandLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * EqualizerBand component - Represents a single frequency band in the equalizer
 */
const EqualizerBand = ({ 
  frequency, 
  value, 
  onChange, 
  disabled, 
  onMouseDown 
}) => {
  // Reference to the slider element for position calculations
  const sliderRef = useRef(null);
  
  // Format frequency label (add 'k' suffix for kHz)
  const formatFrequency = (freq) => {
    return freq >= 1000 ? `${freq/1000}k` : freq;
  };
  
  // Format gain value with + sign for positive values
  const formatValue = (val) => {
    return val > 0 ? `+${val}` : val;
  };
  
  // Convert gain value to percentage for slider display
  const valueToPercent = (val) => val * 5; // Scale -10 to 10 to -50% to 50%
  
  // Handle mouse down on the slider
  const handleMouseDown = (e) => {
    if (disabled) return;
    
    // Pass the event and slider reference to parent component
    if (onMouseDown) {
      onMouseDown(e, sliderRef.current);
    }
  };

  return (
    <BandContainer>
      <BandValue>{formatValue(value)}</BandValue>
      <SliderTrack
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        disabled={disabled}
      >
        <SliderProgress value={valueToPercent(value)} />
        <SliderThumb value={valueToPercent(value)} disabled={disabled} />
      </SliderTrack>
      <BandLabel>{formatFrequency(frequency)}</BandLabel>
    </BandContainer>
  );
};

EqualizerBand.propTypes = {
  frequency: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onMouseDown: PropTypes.func
};

EqualizerBand.defaultProps = {
  disabled: false
};

export default EqualizerBand;