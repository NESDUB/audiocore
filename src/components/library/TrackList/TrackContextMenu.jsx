import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Play, 
  Pause, 
  ListPlus, 
  Heart, 
  Disc, 
  User, 
  Download, 
  Info, 
  Share,
  Radio,
  ListMusic
} from 'lucide-react';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import audioService from '../../../services/AudioService';

const ContextMenuContainer = styled.div`
  position: fixed;
  background-color: var(--bgRaised);
  border: 1px solid var(--borderMedium);
  border-radius: var(--spacingXs);
  padding: var(--spacingXs);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 220px;
  max-width: 280px;
  opacity: ${props => props.$isVisible ? '1' : '0'};
  transform: ${props => props.$isVisible ? 'scale(1)' : 'scale(0.95)'};
  transform-origin: top left;
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`;

const MenuItem = styled.div`
  padding: var(--spacingXs) var(--spacingSm);
  display: flex;
  align-items: center;
  gap: var(--spacingSm);
  cursor: pointer;
  border-radius: var(--spacingXs);
  color: var(--textPrimary);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bgHover);
  }
  
  ${props => props.$active && `
    color: var(--accentPrimary);
  `}
  
  ${props => props.$destructive && `
    color: var(--accentError);
    
    &:hover {
      background-color: rgba(255, 80, 80, 0.08);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MenuIcon = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MenuText = styled.span`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuDivider = styled.div`
  height: 1px;
  background-color: var(--borderLight);
  margin: var(--spacingSm) var(--spacingSm);
`;

const MenuHeader = styled.div`
  padding: var(--spacingSm);
  border-bottom: 1px solid var(--borderLight);
  margin-bottom: var(--spacingXs);
`;

const TrackTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * TrackContextMenu component - Context menu for track options
 * Integrates with AudioService through PlayerProvider
 * 
 * @param {Object} props - Component props
 * @param {Object} props.track - Track data object
 * @param {boolean} props.isVisible - Whether menu is visible
 * @param {Object} props.position - Position {x, y} for menu
 * @param {Function} props.onClose - Callback to close menu
 */
const TrackContextMenu = ({ track, isVisible, position, onClose }) => {
  const menuRef = useRef(null);
  
  const { 
    currentTrack,
    isPlaying,
    play,
    pause,
    playTrack,
    addToQueue,
    addToPlaylist,
    toggleFavorite
  } = usePlayer();
  
  // Calculate if this track is the current track and if it's a favorite
  const isCurrentTrack = currentTrack && currentTrack.id === track?.id;
  const isFavorite = track?.isFavorite;
  
  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);
  
  // Position the menu within viewport bounds
  useEffect(() => {
    if (isVisible && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Adjust position if menu goes off-screen
      if (position.x + menuRect.width > windowWidth) {
        menuRef.current.style.left = `${windowWidth - menuRect.width - 10}px`;
      } else {
        menuRef.current.style.left = `${position.x}px`;
      }
      
      if (position.y + menuRect.height > windowHeight) {
        menuRef.current.style.top = `${windowHeight - menuRect.height - 10}px`;
      } else {
        menuRef.current.style.top = `${position.y}px`;
      }
    }
  }, [isVisible, position]);
  
  if (!track) return null;
  
  // Play/pause handler
  const handlePlayPause = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      playTrack(track);
    }
    onClose();
  };
  
  // Add to queue handler
  const handleAddToQueue = () => {
    addToQueue(track);
    onClose();
  };
  
  // Add to playlist handler (opens dialog)
  const handleAddToPlaylist = () => {
    // Placeholder for opening playlist selector dialog
    // This would typically dispatch an action to show a modal
    console.log('Add to playlist:', track.id);
    onClose();
  };
  
  // Toggle favorite status
  const handleToggleFavorite = () => {
    toggleFavorite(track.id);
    onClose();
  };
  
  // Navigate to album
  const handleViewAlbum = () => {
    // Placeholder for navigation to album view
    // This would typically use a router to navigate
    console.log('View album:', track.album);
    onClose();
  };
  
  // Navigate to artist
  const handleViewArtist = () => {
    // Placeholder for navigation to artist view
    console.log('View artist:', track.artist);
    onClose();
  };
  
  // Show info/details dialog
  const handleShowDetails = () => {
    // Placeholder for showing track details modal
    console.log('Show details for:', track.id);
    onClose();
  };
  
  // Create similar radio/playlist
  const handleCreateRadio = () => {
    // Placeholder for creating a radio based on this track
    console.log('Create radio from:', track.id);
    onClose();
  };
  
  return (
    <ContextMenuContainer
      ref={menuRef}
      $isVisible={isVisible}
      role="menu"
    >
      {/* Track info header */}
      <MenuHeader>
        <TrackTitle>{track.title || 'Unknown Track'}</TrackTitle>
        <TrackArtist>{track.artist || 'Unknown Artist'}</TrackArtist>
      </MenuHeader>
      
      {/* Play/Pause option */}
      <MenuItem onClick={handlePlayPause} $active={isCurrentTrack}>
        <MenuIcon>
          {isCurrentTrack && isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </MenuIcon>
        <MenuText>
          {isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
        </MenuText>
      </MenuItem>
      
      {/* Queue management */}
      <MenuItem onClick={handleAddToQueue}>
        <MenuIcon>
          <ListPlus size={16} />
        </MenuIcon>
        <MenuText>Add to Queue</MenuText>
      </MenuItem>
      
      <MenuItem onClick={handleAddToPlaylist}>
        <MenuIcon>
          <ListMusic size={16} />
        </MenuIcon>
        <MenuText>Add to Playlist...</MenuText>
      </MenuItem>
      
      <MenuItem onClick={handleCreateRadio}>
        <MenuIcon>
          <Radio size={16} />
        </MenuIcon>
        <MenuText>Start Radio</MenuText>
      </MenuItem>
      
      <MenuDivider />
      
      {/* Favorites */}
      <MenuItem onClick={handleToggleFavorite} $active={isFavorite}>
        <MenuIcon>
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </MenuIcon>
        <MenuText>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</MenuText>
      </MenuItem>
      
      <MenuDivider />
      
      {/* Navigation */}
      <MenuItem onClick={handleViewAlbum} disabled={!track.album}>
        <MenuIcon>
          <Disc size={16} />
        </MenuIcon>
        <MenuText>Go to Album</MenuText>
      </MenuItem>
      
      <MenuItem onClick={handleViewArtist} disabled={!track.artist}>
        <MenuIcon>
          <User size={16} />
        </MenuIcon>
        <MenuText>Go to Artist</MenuText>
      </MenuItem>
      
      <MenuDivider />
      
      {/* Actions */}
      <MenuItem onClick={handleShowDetails}>
        <MenuIcon>
          <Info size={16} />
        </MenuIcon>
        <MenuText>Track Details</MenuText>
      </MenuItem>
    </ContextMenuContainer>
  );
};

export default TrackContextMenu;