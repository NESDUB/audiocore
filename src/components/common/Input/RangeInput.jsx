import React, { useState } from 'react';
import styled, { css } from 'styled-components';

// Container for the range input with label
const RangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width || '100%'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Label for the range input
const RangeLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Label text
const LabelText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 1px;
`;

// Value display
const ValueDisplay = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  min-width: 40px;
  text-align: right;
`;

// Track wrapper for custom styling
const TrackWrapper = styled.div`
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
`;

// Actual range input (hidden but functional)
const RangeInput = styled.input`
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  z-index: 2;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: transparent;
    border: none;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: transparent;
    border: none;
  }
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Custom track for the range input
const Track = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 2px;
  overflow: hidden;
`;

// Progress bar that fills the track
const Progress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  background-color: ${({ theme, accentColor }) => accentColor || theme.colors.brand.primary};
  transition: width 0.1s ease;
  
  ${({ isClipping, theme }) => isClipping && css`
    background-color: ${theme.colors.brand.error};
  `}
`;

// Custom thumb that shows on the track
const Thumb = styled.div`
  position: absolute;
  top: 50%;
  left: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme, accentColor }) => accentColor || theme.colors.brand.primary};
  transform: translate(-50%, -50%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease;
  z-index: 1;
  
  ${({ isDragging }) => isDragging && css`
    transform: translate(-50%, -50%) scale(1.2);
  `}
  
  ${({ isClipping, theme }) => isClipping && css`
    background-color: ${theme.colors.brand.error};
  `}
`;

// Tick marks along the track
const TickMarks = styled.div`
  position: relative;
  width: 100%;
  height: 10px;
  margin-top: 4px;
`;

const TickMark = styled.div`
  position: absolute;
  top: 0;
  width: 1px;
  height: 5px;
  background-color: ${({ theme }) => theme.colors.text.tertiary};
  transform: translateX(-50%);
  
  ${({ active, theme }) => active && css`
    background-color: ${theme.colors.text.secondary};
    height: 7px;
  `}
`;

// Helper text below the range input
const HelperText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 8px;
`;

/**
 * Range Input component
 * A styled slider input with custom track, thumb, and optional tick marks
 */
const RangeSlider = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  showValue = true,
  valueFormatter = value => value,
  helperText,
  name,
  id,
  disabled = false,
  showTicks = false,
  tickInterval,
  tickLabels = [],
  isClipping = false,
  accentColor,
  width,
  className,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Generate a list of tick positions
  const getTicks = () => {
    const ticks = [];
    const interval = tickInterval || step;
    
    for (let i = min; i <= max; i += interval) {
      const position = ((i - min) / (max - min)) * 100;
      const isActiveValue = value >= i;
      
      ticks.push({
        value: i,
        position,
        active: isActiveValue
      });
    }
    
    return ticks;
  };
  
  // Generate an ID if one isn't provided
  const inputId = id || `range-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <RangeContainer width={width} className={className}>
      {label && (
        <RangeLabel htmlFor={inputId}>
          <LabelText>{label}</LabelText>
          {showValue && (
            <ValueDisplay>{valueFormatter(value)}</ValueDisplay>
          )}
        </RangeLabel>
      )}
      
      <TrackWrapper>
        <Track>
          <Progress 
            value={value} 
            min={min} 
            max={max} 
            isClipping={isClipping}
            accentColor={accentColor}
          />
        </Track>
        
        <Thumb 
          value={value} 
          min={min} 
          max={max} 
          isDragging={isDragging}
          isClipping={isClipping}
          accentColor={accentColor}
        />
        
        <RangeInput
          id={inputId}
          type="range"
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          {...props}
        />
      </TrackWrapper>
      
      {showTicks && (
        <TickMarks>
          {getTicks().map((tick, index) => (
            <TickMark 
              key={index}
              style={{ left: `${tick.position}%` }}
              active={tick.active}
            />
          ))}
        </TickMarks>
      )}
      
      {tickLabels.length > 0 && (
        <TickMarks style={{ marginTop: '12px' }}>
          {tickLabels.map((label, index) => {
            const position = ((index / (tickLabels.length - 1)) * 100);
            return (
              <div 
                key={index}
                style={{ 
                  position: 'absolute',
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: '#666'
                }}
              >
                {label}
              </div>
            );
          })}
        </TickMarks>
      )}
      
      {helperText && <HelperText>{helperText}</HelperText>}
    </RangeContainer>
  );
};

export default RangeSlider;