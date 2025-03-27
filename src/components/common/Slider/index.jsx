import React from 'react';
import styled from 'styled-components';

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const SliderLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 1px;
  white-space: nowrap;
`;

const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 2px;
  overflow: hidden;
`;

const SliderProgress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  background-color: ${({ theme, isClipping }) => 
    isClipping ? theme.colors.brand.error : theme.colors.brand.primary};
  transition: width 0.1s ease;
`;

const StyledRangeInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
  }
`;

const SliderThumb = styled.div`
  position: absolute;
  top: 50%;
  left: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.brand.primary};
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: transform 0.1s ease;
  
  ${({ isDragging }) => isDragging && `
    transform: translate(-50%, -50%) scale(1.2);
  `}
`;

const SliderValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 30px;
  text-align: center;
`;

const Slider = ({ 
  label,
  value = 0, 
  min = 0, 
  max = 100, 
  step = 1,
  onChange,
  isClipping = false,
  showValue = true,
  valueFormatter = (val) => val
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  
  const handleChange = (e) => {
    onChange(Number(e.target.value));
  };
  
  return (
    <SliderContainer>
      {label && <SliderLabel>{label}</SliderLabel>}
      
      <SliderTrack>
        <SliderProgress 
          value={value} 
          min={min} 
          max={max} 
          isClipping={isClipping} 
        />
        <SliderThumb 
          value={value} 
          min={min} 
          max={max} 
          isDragging={isDragging}
        />
        <StyledRangeInput
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        />
      </SliderTrack>
      
      {showValue && (
        <SliderValue>{valueFormatter(value)}</SliderValue>
      )}
    </SliderContainer>
  );
};

export default Slider;