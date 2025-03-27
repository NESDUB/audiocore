import React from 'react';
import styled from 'styled-components';
import Slider from '../../common/Slider';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AlbumArt = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.surface.lighter};
  border-radius: 4px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TrackArtist = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Helper to format time in MM:SS
const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ProgressControls = () => {
  const { 
    currentTrack,
    currentTime,
    duration,
    seek
  } = usePlayer();

  return (
    <ControlsContainer>
      <TrackInfo>
        <AlbumArt>
          {currentTrack?.artwork && (
            <img src={currentTrack.artwork} alt={`${currentTrack.title} artwork`} />
          )}
        </AlbumArt>
        
        <TrackDetails>
          <TrackTitle>
            {currentTrack?.title || 'No Track Selected'}
          </TrackTitle>
          <TrackArtist>
            {currentTrack?.artist || 'Select a track to play'}
          </TrackArtist>
        </TrackDetails>
      </TrackInfo>
      
      <ProgressBar>
        <Slider 
          value={currentTime}
          min={0}
          max={duration || 100}
          step={0.1}
          onChange={seek}
          showValue={false}
        />
        
        <TimeDisplay>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </TimeDisplay>
      </ProgressBar>
    </ControlsContainer>
  );
};

export default ProgressControls;