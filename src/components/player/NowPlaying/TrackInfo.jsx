import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const TrackTitle = styled.h2`
  color: var(--textPrimary);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 1px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArtistName = styled.p`
  color: var(--textSecondary);
  font-size: 14px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AlbumTitle = styled.p`
  color: var(--textDimmed);
  font-size: 12px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * TrackInfo component for displaying track, artist and album information
 * @param {Object} props Component props
 * @param {string} props.title Track title
 * @param {string} props.artist Artist name
 * @param {string} props.album Album title
 */
const TrackInfo = ({ title, artist, album }) => {
  return (
    <InfoContainer>
      <TrackTitle>{title || 'Unknown Track'}</TrackTitle>
      <ArtistName>{artist || 'Unknown Artist'}</ArtistName>
      {album && <AlbumTitle>{album}</AlbumTitle>}
    </InfoContainer>
  );
};

export default TrackInfo;