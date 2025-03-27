import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import { useNotification } from '../../common/Notification';

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
`;

const SliderProgress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  background-color: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.1s ease;
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
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  opacity: ${({ isDragging, isHovering }) => (isDragging || isHovering) ? 1 : 0};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  
  ${SliderContainer}:hover & {
    opacity: 1;
  }
`;

const VolumeTooltip = styled.div`
  position: absolute;
  bottom: 20px;
  left: ${({ value, min, max }) => `${((value - min) / (max - min)) * 100}%`};
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  pointer-events: none;
  white-space: nowrap;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.border.tertiary} transparent transparent transparent;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const VolumeValueDisplay = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  width: 30px;
  margin-left: ${({ theme }) => theme.spacing.sm};
  text-align: right;
  display: ${({ showValue }) => (showValue ? 'block' : 'none')};
`;

const ClickInterceptor = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  cursor: pointer;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const VolumeSlider = ({ 
  min = 0, 
  max = 100, 
  step = 1, 
  showValue = false,
  showTooltip = true,
  width = '100%',
  onChange,
}) => {
  // Get player context
  const { volume, setVolume } = usePlayer();
  const { success } = useNotification();
  
  // Local state
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showTooltipValue, setShowTooltipValue] = useState(false);
  const [lastVolume, setLastVolume] = useState(volume);
  
  // Refs
  const trackRef = useRef(null);
  
  // Update external state when volume changes
  useEffect(() => {
    if (onChange) {
      onChange(volume);
    }
  }, [volume, onChange]);
  
  // Show notification for significant volume changes
  useEffect(() => {
    const volumeDiff = Math.abs(volume - lastVolume);
    
    if (volumeDiff >= 20 && volume > lastVolume) {
      success(`Volume increased to ${volume}%`);
    } else if (volumeDiff >= 20 && volume < lastVolume) {
      success(`Volume decreased to ${volume}%`);
    }
    
    setLastVolume(volume);
  }, [volume, lastVolume, success]);
  
  // Handle mouse movement for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      updateVolumeFromPosition(e.clientX);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setShowTooltipValue(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Calculate volume from mouse position
  const updateVolumeFromPosition = (clientX) => {
    if (!trackRef.current) return;
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const position = (clientX - trackRect.left) / trackRect.width;
    const newVolume = Math.min(Math.max(position * (max - min) + min, min), max);
    setVolume(Math.round(newVolume));
  };
  
  // Handle mouse down on track
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setShowTooltipValue(true);
    updateVolumeFromPosition(e.clientX);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setVolume(parseInt(e.target.value, 10));
  };
  
  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsHovering(false);
    }
  };
  
  // Format the volume value for display
  const formatVolume = (vol) => `${vol}%`;
  
  return (
    <SliderContainer style={{ width }}>
      <SliderTrack 
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SliderProgress value={volume} min={min} max={max} />
        <SliderThumb 
          value={volume} 
          min={min} 
          max={max}
          isDragging={isDragging}
          isHovering={isHovering}
        />
        <HiddenInput
          type="range"
          min={min}
          max={max}
          step={step}
          value={volume}
          onChange={handleInputChange}
        />
      </SliderTrack>
      
      {showTooltip && showTooltipValue && (
        <VolumeTooltip 
          value={volume} 
          min={min} 
          max={max}
          isVisible={isDragging || isHovering}
        >
          {formatVolume(volume)}
        </VolumeTooltip>
      )}
      
      {showValue && (
        <VolumeValueDisplay showValue={showValue}>
          {volume}
        </VolumeValueDisplay>
      )}
      
      <ClickInterceptor 
        isVisible={isDragging} 
        onClick={() => setIsDragging(false)}
      />
    </SliderContainer>
  );
};

export default VolumeSlider;