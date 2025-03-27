import React from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import { SecondaryButton } from '../../common/Button';

const TrackListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 120px 80px 80px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const HeaderCell = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

const NoTracksMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TrackRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 120px 80px 80px;
  align-items: center;
  height: 50px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: 4px;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
    cursor: pointer;
  }
  
  ${({ isActive, theme }) => isActive && `
    background-color: rgba(145, 242, 145, 0.05);
    border-left: 2px solid ${theme.colors.brand.primary};
  `}
`;

const TrackNumber = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TrackTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackAlbum = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackDuration = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
`;

// Helper to format time in MM:SS
const formatTime = (seconds) => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TrackList = () => {
  const { tracks, currentTrack, play } = usePlayer();
  
  const handleFileSelect = async () => {
    try {
      // Open file picker
      const fileHandle = await window.showOpenFilePicker({
        types: [
          {
            description: 'Audio Files',
            accept: {
              'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg']
            }
          }
        ],
        multiple: true
      });
      
      // Handle file selection
      console.log('Files selected:', fileHandle);
      // In a real app, you would process these files and add them to your library
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };
  
  return (
    <TrackListContainer>
      {tracks && tracks.length > 0 ? (
        <>
          <ListHeader>
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Title</HeaderCell>
            <HeaderCell>Album</HeaderCell>
            <HeaderCell>Duration</HeaderCell>
            <HeaderCell>Format</HeaderCell>
          </ListHeader>
          
          {tracks.map((track, index) => (
            <TrackRow 
              key={track.id}
              isActive={currentTrack?.id === track.id}
              onClick={() => play(track)}
            >
              <TrackNumber>{index + 1}</TrackNumber>
              <TrackInfo>
                <TrackTitle>{track.title}</TrackTitle>
                <TrackArtist>{track.artist}</TrackArtist>
              </TrackInfo>
              <TrackAlbum>{track.album}</TrackAlbum>
              <TrackDuration>{formatTime(track.duration)}</TrackDuration>
              <div>{track.format}</div>
            </TrackRow>
          ))}
        </>
      ) : (
        <NoTracksMessage>
          <Message>No tracks in your library</Message>
          <SecondaryButton onClick={handleFileSelect}>
            Add Music Files
          </SecondaryButton>
        </NoTracksMessage>
      )}
    </TrackListContainer>
  );
};

export default TrackList;