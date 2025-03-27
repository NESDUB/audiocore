import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';

// Animation for the album art rotation during playback
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Fade in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Container for the album art display
const ArtworkContainer = styled.div`
  width: ${({ size }) => size || '260px'};
  height: ${({ size }) => size || '260px'};
  position: relative;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease;
`;

// The vinyl record visual effect
const VinylRecord = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    #000000 15%,
    #333333 15%,
    #333333 20%,
    #111111 20%,
    #111111 21%,
    #333333 21%,
    #333333 25%,
    #111111 25%,
    #111111 27%,
    transparent 27%
  );
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  z-index: 1;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ showFullVinyl }) => 
    showFullVinyl ? 'translateX(0)' : 'translateX(-40%)'};
  transition: transform 0.5s ease, opacity 0.5s ease;
  animation: ${({ isPlaying }) => isPlaying ? rotate : 'none'} 20s linear infinite;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10%;
    height: 10%;
    border-radius: 50%;
    background-color: #444;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.8) inset;
  }
`;

// The album cover artwork
const AlbumCover = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border-radius: ${({ isCircular }) => (isCircular ? '50%' : '4px')};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ showFullVinyl }) => (showFullVinyl ? 0 : 2)};
  transform: ${({ showFullVinyl }) => 
    showFullVinyl ? 'translateX(40%)' : 'translateX(0)'};
  transition: transform 0.5s ease, border-radius 0.5s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0) 20%,
      rgba(0, 0, 0, 0) 80%,
      rgba(0, 0, 0, 0.2) 100%
    );
    z-index: 1;
    pointer-events: none;
  }
`;

// Placeholder for missing artwork
const ArtworkPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  
  .icon {
    font-size: 40px;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    opacity: 0.5;
  }
  
  .text {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    letter-spacing: 1px;
  }
`;

// Reflection effect
const Reflection = styled.div`
  position: absolute;
  bottom: -60%;
  left: 5%;
  right: 5%;
  height: 60%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 0;
  opacity: ${({ isVisible }) => (isVisible ? 0.3 : 0)};
  transition: opacity 0.5s ease;
  transform: scaleY(-1);
  filter: blur(3px);
  
  img {
    width: 90%;
    height: 90%;
    object-fit: cover;
    transform: scaleY(-1);
    opacity: 0.7;
  }
`;

// Controls for album display
const ArtworkControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

const ArtworkButton = styled.button`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.brand.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.darker};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Track info display
const TrackInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  animation: ${fadeIn} 0.5s ease;
`;

const TrackTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TrackArtist = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TrackAlbum = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const AlbumArtDisplay = ({ size, showInfo = true, showControls = true }) => {
  const { currentTrack, isPlaying } = usePlayer();
  
  // State for visual effects
  const [displayMode, setDisplayMode] = useState('cover'); // 'cover', 'vinyl', 'both'
  const [hasImage, setHasImage] = useState(false);
  
  // Derived states for visual display
  const showFullVinyl = displayMode === 'vinyl';
  const showVinyl = displayMode === 'vinyl' || displayMode === 'both';
  const isCircular = displayMode === 'vinyl' || displayMode === 'both';
  
  // Set display mode based on playback state
  useEffect(() => {
    if (isPlaying && displayMode === 'cover') {
      setDisplayMode('both');
    }
  }, [isPlaying, displayMode]);
  
  // Check if track has artwork
  useEffect(() => {
    setHasImage(!!currentTrack?.artwork);
  }, [currentTrack]);
  
  // Toggle through display modes
  const toggleDisplayMode = () => {
    setDisplayMode(prevMode => {
      switch (prevMode) {
        case 'cover': return 'both';
        case 'both': return 'vinyl';
        case 'vinyl': return 'cover';
        default: return 'cover';
      }
    });
  };
  
  return (
    <div>
      <ArtworkContainer size={size}>
        {/* Vinyl Record */}
        <VinylRecord 
          isVisible={showVinyl}
          showFullVinyl={showFullVinyl}
          isPlaying={isPlaying}
        />
        
        {/* Album Cover */}
        <AlbumCover 
          isCircular={isCircular} 
          showFullVinyl={showFullVinyl}
        >
          {hasImage && currentTrack?.artwork ? (
            <img 
              src={currentTrack.artwork} 
              alt={`${currentTrack.title} album artwork`} 
            />
          ) : (
            <ArtworkPlaceholder>
              <div className="icon">♫</div>
              <div className="text">No Artwork</div>
            </ArtworkPlaceholder>
          )}
        </AlbumCover>
        
        {/* Reflection Effect */}
        <Reflection isVisible={hasImage && displayMode === 'cover'}>
          {hasImage && currentTrack?.artwork && (
            <img 
              src={currentTrack.artwork} 
              alt="" 
              aria-hidden="true"
            />
          )}
        </Reflection>
      </ArtworkContainer>
      
      {/* Display Controls */}
      {showControls && (
        <ArtworkControls>
          <ArtworkButton 
            isActive={displayMode === 'cover'}
            onClick={() => setDisplayMode('cover')}
          >
            COVER
          </ArtworkButton>
          <ArtworkButton 
            isActive={displayMode === 'both'}
            onClick={() => setDisplayMode('both')}
          >
            HYBRID
          </ArtworkButton>
          <ArtworkButton 
            isActive={displayMode === 'vinyl'}
            onClick={() => setDisplayMode('vinyl')}
          >
            VINYL
          </ArtworkButton>
        </ArtworkControls>
      )}
      
      {/* Track Information */}
      {showInfo && currentTrack && (
        <TrackInfo>
          <TrackTitle>{currentTrack.title || 'Unknown Track'}</TrackTitle>
          <TrackArtist>{currentTrack.artist || 'Unknown Artist'}</TrackArtist>
          <TrackAlbum>{currentTrack.album || 'Unknown Album'}</TrackAlbum>
        </TrackInfo>
      )}
    </div>
  );
};

export default AlbumArtDisplay;