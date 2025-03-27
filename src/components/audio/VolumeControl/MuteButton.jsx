import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import Icon from '../../common/Icon';
import { useNotification } from '../../common/Notification';

const ButtonContainer = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme, isMuted }) => 
    isMuted ? theme.colors.brand.warning : theme.colors.text.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  
  &:hover {
    color: ${({ theme, isMuted }) => 
      isMuted ? theme.colors.brand.warning : theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surface.darker};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const VolumeIcon = styled.div`
  transition: transform ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: scale(1.05);
  }
`;

const VolumeLevel = styled.span`
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  bottom: -1px;
  right: 0px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Determine which icon to use based on volume level
const getVolumeIconName = (volume, isMuted) => {
  if (isMuted || volume === 0) {
    return 'VolumeMute';
  } else if (volume < 50) {
    return 'VolumeDown';
  } else {
    return 'VolumeUp';
  }
};

const MuteButton = ({ size = '20px' }) => {
  // Get player context
  const { volume, setVolume } = usePlayer();
  const { info } = useNotification();
  
  // Local state
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume > 0 ? volume : 50);
  const [isHovering, setIsHovering] = useState(false);
  
  // Update previous volume when volume changes
  useEffect(() => {
    if (volume > 0 && !isMuted) {
      setPrevVolume(volume);
    }
  }, [volume, isMuted]);
  
  // Handle mute/unmute
  const toggleMute = () => {
    if (isMuted) {
      // Unmute - restore previous volume
      setVolume(prevVolume);
      setIsMuted(false);
      info('Audio unmuted');
    } else {
      // Mute - set volume to 0 and save current volume
      setPrevVolume(volume > 0 ? volume : prevVolume);
      setVolume(0);
      setIsMuted(true);
      info('Audio muted');
    }
  };
  
  // Handle events
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  // Determine if effectively muted (either explicitly or volume at 0)
  const effectivelyMuted = isMuted || volume === 0;
  
  // Get the appropriate icon based on volume and mute state
  const iconName = getVolumeIconName(volume, effectivelyMuted);
  
  return (
    <ButtonContainer 
      isMuted={effectivelyMuted}
      onClick={toggleMute}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={effectivelyMuted ? "Unmute" : "Mute"}
      aria-label={effectivelyMuted ? "Unmute" : "Mute"}
    >
      <VolumeIcon>
        <Icon name={iconName} size={size} />
      </VolumeIcon>
      
      {!effectivelyMuted && isHovering && (
        <VolumeLevel>
          {volume}
        </VolumeLevel>
      )}
    </ButtonContainer>
  );
};

export default MuteButton;