import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import { useLibrary } from '../../../hooks/useLibrary';
import TrackItem from './TrackItem';
import TrackListHeader from './TrackListHeader';
import TrackContextMenu from './TrackContextMenu';
import { SecondaryButton } from '../../common/Button';
import { Music, Upload } from 'lucide-react';
import audioService from '../../../services/AudioService';

const TrackListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const TracksContainer = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const NoTracksMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--textSecondary);
  text-align: center;
  gap: var(--spacing-md);
  height: 100%;
`;

const Message = styled.p`
  margin-bottom: var(--spacing-md);
  font-size: 15px;
`;

const MessageIcon = styled.div`
  color: var(--textDimmed);
  margin-bottom: var(--spacing-md);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
`;

/**
 * TrackList component - Displays a list of audio tracks with playback controls
 * Interfaces with AudioService through the PlayerProvider
 */
const TrackList = ({ tracks: propTracks, showHeader = true }) => {
  // Get tracks from props or library context
  const { state: libraryState } = useLibrary();
  const { 
    currentTrack, 
    play, 
    pause, 
    addToQueue, 
    addToPlaylist,
    isPlaying 
  } = usePlayer();
  
  // Local state for context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    track: null
  });
  
  // Determine tracks to display - from props or library
  const tracks = propTracks || libraryState.tracks;
  
  // Refs
  const containerRef = useRef(null);
  
  // Handle file selection
  const handleFileSelect = useCallback(async () => {
    try {
      // Open file picker
      const fileHandle = await window.showOpenFilePicker({
        types: [
          {
            description: 'Audio Files',
            accept: {
              'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a']
            }
          }
        ],
        multiple: true
      });
      
      if (fileHandle && fileHandle.length > 0) {
        // Process files
        for (const handle of fileHandle) {
          const file = await handle.getFile();
          
          if (file) {
            // Create blob URL for the file
            const url = audioService.createBlobURL(file);
            
            // Play the first file
            if (fileHandle.indexOf(handle) === 0) {
              await audioService.play(url);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      // Handle error (could show notification)
    }
  }, []);
  
  // Show context menu for track
  const handleShowContext = useCallback((track, position) => {
    setContextMenu({
      visible: true,
      position,
      track
    });
    
    // Add document listener to close on click outside
    document.addEventListener('click', handleHideContext);
  }, []);
  
  // Hide context menu
  const handleHideContext = useCallback(() => {
    setContextMenu({
      visible: false,
      position: { x: 0, y: 0 },
      track: null
    });
    
    // Remove document listener
    document.removeEventListener('click', handleHideContext);
  }, []);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' && document.activeElement === containerRef.current) {
      e.preventDefault();
      
      if (isPlaying) {
        pause();
      } else if (currentTrack) {
        play();
      }
    }
  }, [isPlaying, pause, play, currentTrack]);
  
  return (
    <TrackListContainer 
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      {showHeader && <TrackListHeader />}
      
      {tracks && tracks.length > 0 ? (
        <TracksContainer>
          {tracks.map((track, index) => (
            <TrackItem
              key={track.id || index}
              track={track}
              index={index}
              isActive={currentTrack?.id === track.id}
              onShowContext={handleShowContext}
            />
          ))}
        </TracksContainer>
      ) : (
        <NoTracksMessage>
          <MessageIcon>
            <Music size={48} />
          </MessageIcon>
          <Message>No tracks in your library</Message>
          <ButtonGroup>
            <SecondaryButton onClick={handleFileSelect}>
              <Upload size={16} style={{ marginRight: '8px' }} />
              Add Music Files
            </SecondaryButton>
          </ButtonGroup>
        </NoTracksMessage>
      )}
      
      {contextMenu.visible && (
        <TrackContextMenu
          track={contextMenu.track}
          isVisible={contextMenu.visible}
          position={contextMenu.position}
          onClose={handleHideContext}
        />
      )}
    </TrackListContainer>
  );
};

export default TrackList;