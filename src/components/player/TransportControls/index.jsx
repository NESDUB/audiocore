import React from 'react';
import styled from 'styled-components';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../../features/theme/ThemeProvider';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${props => props.$isDark ? '#333' : '#ddd'};
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: var(--accentPrimary);
  border-radius: 3px;
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

  &:hover {
    background-color: ${props => props.$hoverBg || 'var(--bgHover)'};
  }
`;

const ToggleButton = styled(CircleButton)`
  color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
  background-color: ${props =>
    props.$active
      ? props.$isDark ? 'rgba(145, 242, 145, 0.1)' : 'rgba(0, 160, 0, 0.1)'
      : 'transparent'
  };

  &:hover {
    color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textPrimary)'};
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
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

/**
 * TransportControls component for audio playback controls
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
    toggleRepeat
  } = usePlayer();

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = (currentTime / duration) * 100 || 0;

  // Handle progress bar click for seeking
  const handleProgressClick = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const seekTime = position * duration;
    seek(seekTime);
  };

  return (
    <ControlsContainer>
      <TimelineContainer>
        <TimeDisplay>
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </TimeDisplay>

        <ProgressBarContainer 
          $isDark={isDark} 
          onClick={handleProgressClick}
        >
          <ProgressFill $progress={progressPercent} />
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
            $active={repeat}
            $isDark={isDark}
            onClick={toggleRepeat}
            aria-label={repeat ? 'Repeat On' : 'Repeat Off'}
          >
            <Repeat size={16} />
          </ToggleButton>
        </SideButtons>

        <MainButtons>
          <CircleButton 
            onClick={previous}
            aria-label="Previous Track"
          >
            <SkipBack size={18} />
          </CircleButton>

          <CircleButton
            $size="48px"
            $bg="var(--accentPrimary)"
            $color={isDark ? '#000' : '#fff'}
            $hoverBg="var(--accentHighlight)"
            onClick={toggle}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
          </CircleButton>

          <CircleButton 
            onClick={next}
            aria-label="Next Track"
          >
            <SkipForward size={18} />
          </CircleButton>
        </MainButtons>

        <SideButtons>
          <VolumeControl>
            <CircleButton
              $size="32px"
              onClick={toggleMute}
              $color={isMuted ? 'var(--accentError)' : 'var(--textSecondary)'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </CircleButton>

            <VolumeSlider
              value={isMuted ? 0 : volume}
              $value={isMuted ? 0 : volume}
              $isDark={isDark}
              onChange={(e) => {
                setVolume(parseInt(e.target.value, 10));
              }}
              aria-label="Volume"
            />
          </VolumeControl>
        </SideButtons>
      </ButtonsContainer>
    </ControlsContainer>
  );
};

export default TransportControls;