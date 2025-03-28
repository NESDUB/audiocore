import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Heart, Share2, List, Download, Info, Plus } from 'lucide-react';
import Panel from '../../layout/Panel';
import TransportControls from '../TransportControls';
import AlbumArt from './AlbumArt';
import TrackInfo from './TrackInfo';
import MetadataDisplay from './MetadataDisplay';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import audioService from '../../../services/AudioService';

const NowPlayingContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-md);
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
`;

const ArtworkSection = styled.div`
  width: 200px;
  height: 200px;
  position: relative;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--borderLight);
  color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
  background-color: ${props => props.$active ? 'rgba(var(--accentPrimaryRgb), 0.1)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--textPrimary);
    color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textPrimary)'};
    background-color: ${props => props.$active ? 'rgba(var(--accentPrimaryRgb), 0.15)' : 'var(--bgHover)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  background-color: ${props => props.$isPlaying ? 'var(--accentSuccess)' : 'var(--textDimmed)'};
  box-shadow: 0 0 4px ${props => props.$isPlaying ? 'var(--accentSuccess)' : 'transparent'};
`;

const BufferingIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 4px;
  font-size: 10px;
  padding: 2px 6px;
  pointer-events: none;
  opacity: ${props => props.$isBuffering ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const AudioFormatBadge = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  font-size: 10px;
  padding: 2px 6px;
  pointer-events: none;
`;

const ErrorMessage = styled.div`
  background-color: rgba(var(--accentErrorRgb), 0.1);
  border-left: 3px solid var(--accentError);
  padding: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  color: var(--textPrimary);
  font-size: 13px;
  border-radius: 2px;
  display: ${props => props.$show ? 'block' : 'none'};
`;

/**
 * NowPlaying component - displays the currently playing track
 * Integrates with AudioService for full-featured playback and metadata
 */
const NowPlaying = () => {
  // Get player state and audio engine from context
  const { 
    currentTrack, 
    isPlaying, 
    bufferState, 
    errorState,
    toggleFavorite,
    favorites,
    addToQueue,
    analyser
  } = usePlayer();
  
  // Local state
  const [audioFormat, setAudioFormat] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Refs
  const engineComponentsRef = useRef(null);
  
  // Effect to get audio format information
  useEffect(() => {
    if (currentTrack && audioService.isInitialized) {
      // Get advanced audio info from engine components
      engineComponentsRef.current = audioService.getEngineComponents();
      
      if (engineComponentsRef.current?.core) {
        const context = engineComponentsRef.current.core.getContext();
        
        if (context) {
          // Format information
          const sampleRate = context.sampleRate ? `${(context.sampleRate / 1000).toFixed(1)}kHz` : '';
          const fileFormat = currentTrack.fileType ? 
            currentTrack.fileType.split('/')[1]?.toUpperCase() : '';
            
          // Determine bit depth if available
          const bitDepth = currentTrack.bitDepth ? 
            `${currentTrack.bitDepth}-bit` : '16-bit';
            
          setAudioFormat(`${fileFormat} ${sampleRate} ${bitDepth}`);
        }
      }
    }
  }, [currentTrack]);
  
  // Determine if track is a favorite
  const isFavorite = currentTrack && favorites ? 
    favorites.includes(currentTrack.id) : false;
  
  // Handle toggle favorite
  const handleToggleFavorite = () => {
    if (currentTrack) {
      toggleFavorite(currentTrack.id);
    }
  };
  
  // Handle add to queue
  const handleAddToQueue = () => {
    if (currentTrack) {
      addToQueue(currentTrack);
    }
  };
  
  // Handle download track
  const handleDownload = () => {
    if (!currentTrack || !currentTrack.path) return;
    
    setIsDownloading(true);
    
    // Create a download link
    const link = document.createElement('a');
    link.href = currentTrack.path;
    link.download = currentTrack.fileName || `${currentTrack.title}.mp3`;
    link.click();
    
    // Clean up
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };
  
  // Show track info panel
  const handleShowInfo = () => {
    // This would typically show a modal with detailed track info
    console.log('Show info for track:', currentTrack?.id);
  };
  
  // Show in library/playlist
  const handleShowInLibrary = () => {
    // This would typically navigate to the track in library view
    console.log('Navigate to track in library', currentTrack?.id);
  };
  
  // Format audio stats
  const getAudioStats = () => {
    if (!currentTrack) return {};
    
    const { fileSize, bitrate } = currentTrack;
    
    // Size in MB
    const size = fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : null;
    
    // Bitrate in kbps
    const bitrateKbps = bitrate ? `${Math.round(bitrate / 1000)} kbps` : null;
    
    return { size, bitrate: bitrateKbps };
  };

  // Use current track data if available, otherwise use placeholder
  const trackData = currentTrack || {
    title: 'No Track Selected',
    artist: 'Select a track to play',
    album: '',
    year: '',
    duration: 0,
    artwork: null,
  };
  
  // Get audio stats
  const audioStats = getAudioStats();

  return (
    <Panel title="NOW PLAYING" fullHeight>
      <NowPlayingContainer>
        <ArtworkSection>
          <AlbumArt
            src={trackData.artwork}
            alt={`${trackData.artist} - ${trackData.title}`}
          />
          <StatusIndicator $isPlaying={isPlaying} />
          <BufferingIndicator $isBuffering={bufferState.isBuffering}>
            Buffering...
          </BufferingIndicator>
          {audioFormat && (
            <AudioFormatBadge>{audioFormat}</AudioFormatBadge>
          )}
        </ArtworkSection>

        <InfoSection>
          <div>
            <TrackInfo
              title={trackData.title}
              artist={trackData.artist}
              album={trackData.album}
            />

            <ActionButtons>
              <ActionButton 
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                $active={isFavorite}
                onClick={handleToggleFavorite}
                disabled={!currentTrack}
              >
                <Heart size={16} />
              </ActionButton>
              <ActionButton 
                aria-label="Add to queue"
                onClick={handleAddToQueue}
                disabled={!currentTrack}
              >
                <Plus size={16} />
              </ActionButton>
              <ActionButton 
                aria-label="Download"
                onClick={handleDownload}
                disabled={!currentTrack || !currentTrack.path || isDownloading}
              >
                <Download size={16} />
              </ActionButton>
              <ActionButton 
                aria-label="Show in library"
                onClick={handleShowInLibrary}
                disabled={!currentTrack}
              >
                <List size={16} />
              </ActionButton>
              <ActionButton 
                aria-label="Show info"
                onClick={handleShowInfo}
                disabled={!currentTrack}
              >
                <Info size={16} />
              </ActionButton>
            </ActionButtons>
          </div>

          <MetadataDisplay
            album={trackData.album}
            year={trackData.year}
            duration={trackData.duration}
            format={audioFormat}
            size={audioStats.size}
            bitrate={audioStats.bitrate}
          />

          <TransportControls />
          
          {errorState.hasError && (
            <ErrorMessage $show={errorState.hasError}>
              {errorState.message || 'Error playing track'}
            </ErrorMessage>
          )}
        </InfoSection>
      </NowPlayingContainer>
    </Panel>
  );
};

export default NowPlaying;