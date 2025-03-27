import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../features/theme/ThemeProvider';

const ArtworkContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: var(--spacing-md);
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px var(--shadowColor);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid var(--borderMedium);
    border-radius: var(--spacing-md);
    pointer-events: none;
  }
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PlaceholderArt = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.$isDark ? '#333' : '#ddd'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '♫';
    color: ${props => props.$isDark ? '#555' : '#bbb'};
    font-size: 64px;
  }
`;

/**
 * AlbumArt component for displaying track/album artwork
 * @param {Object} props Component props
 * @param {string} props.src Image source URL
 * @param {string} props.alt Alt text for image
 */
const AlbumArt = ({ src, alt }) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  
  return (
    <ArtworkContainer>
      {src ? (
        <ArtworkImage src={src} alt={alt} />
      ) : (
        <PlaceholderArt $isDark={isDark} />
      )}
    </ArtworkContainer>
  );
};

export default AlbumArt;