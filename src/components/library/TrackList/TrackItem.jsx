import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Play, Pause, MoreHorizontal, Plus, Heart } from 'lucide-react';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import audioService from '../../../services/AudioService';

const TrackItemContainer = styled.div`
  display: grid;
  grid-template-columns: 50px 40px 1fr 120px 80px 80px;
  align-items: center;
  height: 50px;
  padding: 0 var(--spacing-md);
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bgHover);
    cursor: pointer;
  }

  ${({ $isActive }) => $isActive && `
    background-color: rgba(var(--accentPrimaryRgb), 0.08);
    border-left: 2px solid var(--accentPrimary);
  `}
`;

const ArtworkContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const Artwork = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ArtworkFallback = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--bgSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
  font-size: 16px;
`;

const PlayButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$isPlaying 
    ? 'rgba(var(--accentPrimaryRgb), 0.1)' 
    : 'transparent'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isPlaying 
    ? 'var(--accentPrimary)' 
    : 'var(--textSecondary)'};
  cursor: pointer;
  opacity: ${props => props.$isActive ? '1' : '0.6'};
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    background-color: ${props => props.$isPlaying 
      ? 'rgba(var(--accentPrimaryRgb), 0.2)' 
      : 'var(--bgSecondary)'};
  }
`;

const TrackNumber = styled.div`
  font-size: 13px;
  color: var(--textSecondary);
  text-align: center;
`;

const TrackTitle = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  font-size: 13px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackAlbum = styled.div`
  font-size: 13px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackDuration = styled.div`
  font-size: 13px;
  color: var(--textSecondary);
  font-family: var(--fontMono);
  text-align: right;
`;

const TrackActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s;

  ${TrackItemContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
  cursor: pointer;

  &:hover {
    background-color: var(--bgSecondary);
    color: var(--textPrimary);
  }
  
  &.$active {
    color: var(--accentPrimary);
  }
`;

// Helper to format time in MM:SS
const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format file size to KB, MB, GB
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const TrackItem = ({ track, index, onShowContext, isActive }) => {
  const { 
    currentTrack, 
    isPlaying, 
    play, 
    pause, 
    playTrack, 
    addToQueue, 
    toggleFavorite 
  } = usePlayer();
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFavorite, setIsFavorite] = useState(track.isFavorite);
  
  const itemRef = useRef(null);
  
  // Check if this track is the currently playing track
  const isCurrentTrack = currentTrack && currentTrack.id === track.id;
  
  // Handle playing the track
  const handlePlay = useCallback((e) => {
    e.stopPropagation();
    
    if (isCurrentTrack && isPlaying) {
      // If already playing this track, pause it
      pause();
    } else if (isCurrentTrack && !isPlaying) {
      // If this track is loaded but paused, resume
      play();
    } else {
      // If this is a different track, play it
      if (track.file && !track.url) {
        track.url = audioService.createBlobURL(track.file);
      }

      const source = {
        src: track.path || track.url,
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork,
        id: track.id
      };

      // Use playTrack from PlayerProvider which will use AudioService
      playTrack(source);
  
  // Handle adding to queue
  const handleAddToQueue = useCallback((e) => {
    e.stopPropagation();
    addToQueue(track);
    
    // Show temporary tooltip
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  }, [track, addToQueue]);
  
  // Handle toggling favorite status
  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    toggleFavorite(track.id);
    setIsFavorite(!isFavorite);
  }, [track.id, isFavorite, toggleFavorite]);
  
  // Handle context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get position for context menu
    const rect = itemRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX,
      y: e.clientY
    };
    
    // Show context menu
    onShowContext && onShowContext(track, position);
  }, [track, onShowContext]);
  
  // Handle row click for selection and playback
  const handleRowClick = useCallback(() => {
    playTrack(track);
  }, [track, playTrack]);
  
  return (
    <TrackItemContainer 
      ref={itemRef}
      $isActive={isCurrentTrack} 
      onClick={handleRowClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ArtworkContainer>
        {track.artwork ? (
          <Artwork src={track.artwork} alt={`${track.title} artwork`} />
        ) : (
          <ArtworkFallback>♪</ArtworkFallback>
        )}
      </ArtworkContainer>
      
      <PlayButton 
        onClick={handlePlay} 
        $isPlaying={isCurrentTrack && isPlaying}
        $isActive={isHovering || isCurrentTrack}
        aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} />
        )}
      </PlayButton>
      
      <TrackTitle>{track.title || 'Unknown Track'}</TrackTitle>
      <TrackArtist>{track.artist || 'Unknown Artist'}</TrackArtist>
      <TrackAlbum>{track.album || ''}</TrackAlbum>
      
      <TrackDuration>
        {formatDuration(track.duration)}
      </TrackDuration>
      
      <TrackActions>
        <ActionButton 
          onClick={handleAddToQueue}
          aria-label="Add to queue"
          title="Add to queue"
        >
          <Plus size={16} />
        </ActionButton>
        
        <ActionButton 
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={isFavorite ? "active" : ""}
        >
          <Heart size={16} color={isFavorite ? "var(--accentPrimary)" : "currentColor"} fill={isFavorite ? "var(--accentPrimary)" : "none"} />
        </ActionButton>
        
        <ActionButton
          onClick={handleContextMenu}
          aria-label="More options"
          title="More options"
        >
          <MoreHorizontal size={16} />
        </ActionButton>
      </TrackActions>
    </TrackItemContainer>
  );
};

export default TrackItem;