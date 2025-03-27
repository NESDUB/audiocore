import React from 'react';
import styled from 'styled-components';
import { Clock, Disc, Calendar } from 'lucide-react';

const MetadataContainer = styled.div`
  display: flex;
  gap: var(--spacing-lg);
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
 */
const MetadataDisplay = ({ album, year, duration }) => {
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
    </MetadataContainer>
  );
};

export default MetadataDisplay;