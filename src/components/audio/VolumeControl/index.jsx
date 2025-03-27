import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import VolumeSlider from './VolumeSlider';
import MuteButton from './MuteButton';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';

// Container for the entire volume control
const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: ${({ expanded, width }) => expanded ? width : 'auto'};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
`;

// Container that holds the slider
const SliderContainer = styled.div`
  width: ${({ width }) => width};
  overflow: hidden;
  max-width: ${({ expanded }) => expanded ? '100%' : '0'};
  opacity: ${({ expanded }) => expanded ? '1' : '0'};
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-left: ${({ expanded }) => expanded ? '0' : '-8px'};
`;

// Volume label
const VolumeLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 1px;
  white-space: nowrap;
  margin-right: ${({ theme }) => theme.spacing.xs};
  display: ${({ showLabel }) => showLabel ? 'block' : 'none'};
`;

// Container for the volume value when not expanded
const VolumeValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  padding: 0 ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
  opacity: ${({ isVisible }) => isVisible ? '1' : '0'};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

/**
 * Volume control component with mute button and expandable slider
 * 
 * @param {Object} props Component props
 * @param {boolean} props.alwaysExpanded Whether the slider should always be visible
 * @param {boolean} props.showLabel Whether to show the "VOLUME" label
 * @param {boolean} props.showValue Whether to show the volume percentage
 * @param {string} props.width The width of the expanded slider
 * @param {string} props.size The size of the mute button icon
 */
const VolumeControl = ({
  alwaysExpanded = false,
  showLabel = false,
  showValue = false,
  width = '100px',
  size = '20px'
}) => {
  // Get player context
  const { volume, isMuted } = usePlayer();
  
  // Local state
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showValueText, setShowValueText] = useState(false);
  
  // Always expanded mode
  useEffect(() => {
    if (alwaysExpanded) {
      setExpanded(true);
    }
  }, [alwaysExpanded]);
  
  // Handle mouse events for expansion
  const handleMouseEnter = () => {
    if (!alwaysExpanded) {
      setExpanded(true);
      setShowValueText(false);
    }
  };
  
  const handleMouseLeave = () => {
    if (!alwaysExpanded) {
      setExpanded(false);
      setShowValueText(true);
      
      // Show volume value briefly when collapsing
      setTimeout(() => {
        setShowValueText(false);
      }, 2000);
    }
  };
  
  // Determine if effectively muted
  const effectivelyMuted = isMuted || volume === 0;
  
  return (
    <VolumeContainer 
      expanded={expanded}
      width={width}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showLabel && <VolumeLabel showLabel={showLabel}>VOLUME</VolumeLabel>}
      
      <MuteButton size={size} />
      
      {!expanded && showValue && (
        <VolumeValue isVisible={showValueText}>
          {effectivelyMuted ? 'MUTE' : volume}
        </VolumeValue>
      )}
      
      <SliderContainer expanded={expanded} width={width}>
        <VolumeSlider 
          showValue={showValue} 
          showTooltip={showTooltip}
          width={width}
        />
      </SliderContainer>
    </VolumeContainer>
  );
};

export default VolumeControl;