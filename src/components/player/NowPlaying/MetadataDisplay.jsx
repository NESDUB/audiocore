import React from 'react';
import styled from 'styled-components';
import { Clock, Disc, Calendar, File } from 'lucide-react';

const MetadataContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const MetadataGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const MetadataIcon = styled.div`
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetadataValue = styled.span`
  color: var(--textSecondary);
  font-size: 13px;
`;

/**
 * Format seconds into MM:SS format
 * @param {number} seconds Seconds to format
 * @returns {string} Formatted time string
 */
const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * MetadataDisplay component for showing additional track metadata
 * @param {Object} props Component props
 * @param {string} props.album Album name
 * @param {string} props.year Release year
 * @param {number} props.duration Track duration in seconds
 * @param {string} props.format Audio format information (e.g. "44.1kHz 16-bit")
 */
const MetadataDisplay = ({ album, year, duration, format }) => {
  return (
    <MetadataContainer>
      {album && (
        <MetadataGroup>
          <MetadataIcon>
            <Disc size={14} />
          </MetadataIcon>
          <MetadataValue>{album}</MetadataValue>
        </MetadataGroup>
      )}

      {year && (
        <MetadataGroup>
          <MetadataIcon>
            <Calendar size={14} />
          </MetadataIcon>
          <MetadataValue>{year}</MetadataValue>
        </MetadataGroup>
      )}

      {duration !== undefined && (
        <MetadataGroup>
          <MetadataIcon>
            <Clock size={14} />
          </MetadataIcon>
          <MetadataValue>{formatTime(duration)}</MetadataValue>
        </MetadataGroup>
      )}
      
      {format && (
        <MetadataGroup>
          <MetadataIcon>
            <File size={14} />
          </MetadataIcon>
          <MetadataValue>{format}</MetadataValue>
        </MetadataGroup>
      )}
    </MetadataContainer>
  );
};

export default MetadataDisplay;