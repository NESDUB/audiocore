import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../features/theme/ThemeProvider';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import audioService from '../../../services/AudioService';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  position: relative;
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--textSecondary);
  font-family: var(--fontMono, monospace);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${props => props.$isDark ? '#333' : '#ddd'};
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: var(--accentPrimary);
  border-radius: 3px;
  transition: width 0.1s linear;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 6px;
    background-color: var(--accentPrimary);
    filter: brightness(1.2);
    opacity: ${props => props.$isActive ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;

const BufferBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$bufferProgress}%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
`;

const ProgressThumb = styled.div`
  position: absolute;
  top: 50%;
  left: ${props => props.$position}%;
  transform: translate(-50%, -50%) scale(${props => props.$isActive ? 1 : 0});
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--accentPrimary);
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  z-index: 2;
  
  ${ProgressBarContainer}:hover & {
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
`;

const MainButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const SideButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const CircleButton = styled.button`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: ${props => props.$color || 'var(--textPrimary)'};
  background-color: ${props => props.$bg || 'transparent'};
  border: ${props => props.$border || 'none'};
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${props => props.$hoverBg || 'var(--bgHover)'};
  }
  
  /* Center the play icon (which has a visual offset) */
  .ml-1 {
    margin-left: 2px;
  }
`;

const ToggleButton = styled(CircleButton)`
  color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
  background-color: ${props =>
    props.$active
      ? props.$isDark ? 'rgba(var(--accentPrimaryRgb), 0.1)' : 'rgba(var(--accentPrimaryRgb), 0.1)'
      : 'transparent'
  };

  &:hover:not(:disabled) {
    color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textPrimary)'};
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  position: relative;
  
  &:hover .volume-tooltip {
    opacity: 1;
    transform: translateY(0);
  }
`;

const VolumeSlider = styled.input.attrs({ type: 'range', min: 0, max: 100 })`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: ${props => {
    const { $value, $isDark } = props;
    const bgColor = $isDark ? '#333' : '#ddd';
    return `linear-gradient(to right, var(--accentPrimary) 0%, var(--accentPrimary) ${$value}%, ${bgColor} ${$value}%, ${bgColor} 100%)`;
  }};
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--textPrimary);
    cursor: pointer;
    border: none;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--textPrimary);
    cursor: pointer;
    border: none;
  }
`;

const VolumeTooltip = styled.div`
  position: absolute;
  top: -28px;
  right: 0;
  background-color: var(--bgRaised);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--textPrimary);
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  border: 1px solid var(--borderLight);
  white-space: nowrap;
`;

const ErrorIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--accentError);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  z-index: 2;
  
  &:hover .error-tooltip {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const ErrorTooltip = styled.div`
  position: absolute;
  bottom: 20px;
  right: 0;
  background-color: var(--bgRaised);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  color: var(--textPrimary);
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  border: 1px solid var(--accentError);
  min-width: 180px;
  max-width: 280px;
  z-index: 10;
`;

/**
 * TransportControls component for audio playback controls
 * Directly interfaces with AudioService for enhanced control
 */
const TransportControls = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  // Get player state and controls from context
  const {
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    volume,
    isMuted,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    currentTrack
  } = usePlayer();
  
  // Local component state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(null);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [volumeLevel, setVolumeLevel] = useState(volume);
  
  // Refs for interacting with progress bar
  const progressRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  // Direct access to AudioService for performance-critical operations
  const audioEngineRef = useRef(null);

  // Get direct reference to audio engine components on mount
  useEffect(() => {
    if (audioService.isInitialized) {
      audioEngineRef.current = audioService.getEngineComponents();
    } else {
      // Initialize if not already
      audioService.initialize();
      audioEngineRef.current = audioService.getEngineComponents();
    }
    
    // Add event listener for errors
    const errorHandler = (event) => {
      setHasError(true);
      setErrorMessage(event.message || 'Audio playback error');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setHasError(false);
        setErrorMessage('');
      }, 5000);
    };
    
    // Add event listener for buffer progress
    const bufferHandler = (event) => {
      if (event.data && typeof event.data.percent === 'number') {
        setBufferProgress(event.data.percent);
      }
    };
    
    // Add event listeners directly to audio engine
    if (audioEngineRef.current && audioEngineRef.current.eventBus) {
      audioEngineRef.current.eventBus.on('source:error', errorHandler);
      audioEngineRef.current.eventBus.on('buffer:progress', bufferHandler);
    }
    
    return () => {
      // Remove event listeners
      if (audioEngineRef.current && audioEngineRef.current.eventBus) {
        audioEngineRef.current.eventBus.off('source:error', errorHandler);
        audioEngineRef.current.eventBus.off('buffer:progress', bufferHandler);
      }
    };
  }, []);
  
  // Update volume level when volume changes
  useEffect(() => {
    setVolumeLevel(isMuted ? 0 : volume);
  }, [volume, isMuted]);
  
  // Handle repeat mode changes
  useEffect(() => {
    // Map boolean repeat to mode string
    setRepeatMode(repeat ? 'all' : 'off');
  }, [repeat]);

  // Format time in MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
      return '0:00';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = isDragging 
    ? dragPosition 
    : ((currentTime / (duration || 1)) * 100) || 0;

  // Handle progress bar click for seeking
  const handleProgressClick = useCallback((e) => {
    if (!progressRef.current || !duration) return;
    
    const container = progressRef.current;
    const rect = container.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const seekTime = position * duration;
    
    // Use direct AudioService call for better performance
    if (audioService.isInitialized) {
      audioService.seek(seekTime);
    } else {
      // Fall back to context
      seek(seekTime);
    }
  }, [duration, seek]);
  
  // Handle mouse down on progress bar
  const handleMouseDown = useCallback((e) => {
    if (!progressRef.current || !duration) return;
    
    setIsDragging(true);
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    const container = progressRef.current;
    const rect = container.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setDragPosition(position);
  }, [duration]);
  
  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !progressRef.current) return;
    
    const container = progressRef.current;
    const rect = container.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setDragPosition(Math.max(0, Math.min(100, position)));
  }, []);
  
  // Handle mouse up after drag
  const handleMouseUp = useCallback((e) => {
    if (!isDraggingRef.current || !progressRef.current || !duration) return;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    const container = progressRef.current;
    const rect = container.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const seekTime = position * duration;
    
    // Use direct AudioService call
    if (audioService.isInitialized) {
      audioService.seek(seekTime);
    } else {
      // Fall back to context
      seek(seekTime);
    }
    
    setIsDragging(false);
    isDraggingRef.current = false;
  }, [duration, handleMouseMove, seek]);
  
  // Handle volume change with direct AudioService call
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseInt(e.target.value, 10);
    
    // Use direct AudioService call for immediate response
    if (audioService.isInitialized) {
      audioService.setVolume(newVolume);
    }
    
    // Also update through context
    setVolume(newVolume);
    setVolumeLevel(newVolume);
  }, [setVolume]);
  
  // Handle mute toggle with direct AudioService call
  const handleToggleMute = useCallback(() => {
    if (audioService.isInitialized) {
      audioService.setMuted(!isMuted);
    }
    
    toggleMute();
  }, [isMuted, toggleMute]);
  
  // Handle play/pause with direct AudioService call
  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      if (audioService.isInitialized) {
        audioService.pause();
      }
    } else {
      if (audioService.isInitialized && currentTrack) {
        audioService.play(currentTrack);
      }
    }
    
    toggle();
  }, [currentTrack, isPlaying, toggle]);
  
  // Handle repeat mode toggle
  const handleToggleRepeat = useCallback(() => {
    // Cycle through repeat modes: off -> all -> one -> off
    const nextMode = (() => {
      switch (repeatMode) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': return 'off';
        default: return 'off';
      }
    })();
    
    setRepeatMode(nextMode);
    
    // Update through context (which only supports on/off)
    toggleRepeat();
    
    // If AudioService supports repeat one, set it directly
    if (audioEngineRef.current && audioEngineRef.current.sourceManager) {
      if (nextMode === 'one') {
        audioEngineRef.current.sourceManager.setRepeatOne(true);
      } else {
        audioEngineRef.current.sourceManager.setRepeatOne(false);
      }
    }
  }, [repeatMode, toggleRepeat]);

  return (
    <ControlsContainer>
      {hasError && (
        <ErrorIndicator>
          !
          <ErrorTooltip className="error-tooltip">
            {errorMessage || 'Audio playback error. Try again or select a different track.'}
          </ErrorTooltip>
        </ErrorIndicator>
      )}
      
      <TimelineContainer>
        <TimeDisplay>
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </TimeDisplay>

        <ProgressBarContainer
          ref={progressRef}
          $isDark={isDark}
          onClick={handleProgressClick}
          onMouseDown={handleMouseDown}
        >
          <BufferBar $bufferProgress={bufferProgress} />
          <ProgressFill 
            $progress={progressPercent} 
            $isActive={isDragging} 
          />
          <ProgressThumb 
            $position={progressPercent} 
            $isActive={isDragging}
          />
        </ProgressBarContainer>
      </TimelineContainer>

      <ButtonsContainer>
        <SideButtons>
          <ToggleButton
            $active={shuffle}
            $isDark={isDark}
            onClick={toggleShuffle}
            aria-label={shuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle size={16} />
          </ToggleButton>

          <ToggleButton
            $active={repeatMode !== 'off'}
            $isDark={isDark}
            onClick={handleToggleRepeat}
            aria-label={
              repeatMode === 'off' ? 'Repeat Off' : 
              repeatMode === 'all' ? 'Repeat All' : 'Repeat One'
            }
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </ToggleButton>
        </SideButtons>

        <MainButtons>
          <CircleButton
            onClick={previous}
            aria-label="Previous Track"
            disabled={!currentTrack}
          >
            <SkipBack size={18} />
          </CircleButton>

          <CircleButton
            $size="48px"
            $bg="var(--accentPrimary)"
            $color={isDark ? '#000' : '#fff'}
            $hoverBg="var(--accentHighlight)"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!currentTrack && !isPlaying}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
          </CircleButton>

          <CircleButton
            onClick={next}
            aria-label="Next Track"
            disabled={!currentTrack}
          >
            <SkipForward size={18} />
          </CircleButton>
        </MainButtons>

        <SideButtons>
          <VolumeControl>
            <CircleButton
              $size="32px"
              onClick={handleToggleMute}
              $color={isMuted ? 'var(--accentError)' : 'var(--textSecondary)'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </CircleButton>

            <VolumeSlider
              value={volumeLevel}
              $value={volumeLevel}
              $isDark={isDark}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
            
            <VolumeTooltip className="volume-tooltip">
              Volume: {volumeLevel}%
            </VolumeTooltip>
          </VolumeControl>
        </SideButtons>
      </ButtonsContainer>
    </ControlsContainer>
  );
};

export default TransportControls;