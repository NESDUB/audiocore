import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Clock, Music } from 'lucide-react';
import { useLibrary } from '../../../hooks/useLibrary';

const HeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 50px 40px 1fr 120px 80px 80px;
  align-items: center;
  height: 40px;
  padding: 0 var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
  background-color: var(--bgSecondary);
  font-size: 13px;
  color: var(--textSecondary);
  position: sticky;
  top: 0;
  z-index: 2;
`;

const HeaderCell = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;

  &:hover {
    color: var(--textPrimary);
  }
  
  ${props => props.$active && `
    color: var(--accentPrimary);
    font-weight: 500;
  `}
`;

const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SortIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$visible ? '1' : '0'};
  transition: opacity 0.2s;
  
  ${HeaderCell}:hover & {
    opacity: 1;
  }
`;

/**
 * TrackListHeader component - Header for the track list with sorting controls
 * Integrates with library state for sorting
 */
const TrackListHeader = () => {
  const { state, dispatch } = useLibrary();
  
  // Local state for sort field and direction
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Handle click on header cell to sort
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      
      // Update library sort state
      if (dispatch) {
        dispatch({
          type: 'SET_SORT',
          payload: { field, direction: newDirection }
        });
      }
    } else {
      // Set new field with default asc direction
      setSortField(field);
      setSortDirection('asc');
      
      // Update library sort state
      if (dispatch) {
        dispatch({
          type: 'SET_SORT',
          payload: { field, direction: 'asc' }
        });
      }
    }
  };
  
  // Helper to determine if column is the active sort
  const isActiveSort = (field) => field === sortField;
  
  return (
    <HeaderContainer>
      {/* Album Artwork Column - Not sortable */}
      <HeaderCell>
        <HeaderIcon>
          <Music size={16} />
        </HeaderIcon>
      </HeaderCell>
      
      {/* Track Number Column */}
      <HeaderCell 
        $active={isActiveSort('track')}
        onClick={() => handleSort('track')}
      >
        <HeaderText>#</HeaderText>
        <SortIcon $visible={isActiveSort('track')}>
          {sortDirection === 'asc' && isActiveSort('track') ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </SortIcon>
      </HeaderCell>
      
      {/* Title Column */}
      <HeaderCell 
        $active={isActiveSort('title')}
        onClick={() => handleSort('title')}
      >
        <HeaderText>Title</HeaderText>
        <SortIcon $visible={isActiveSort('title')}>
          {sortDirection === 'asc' && isActiveSort('title') ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </SortIcon>
      </HeaderCell>
      
      {/* Artist Column */}
      <HeaderCell 
        $active={isActiveSort('artist')}
        onClick={() => handleSort('artist')}
      >
        <HeaderText>Artist</HeaderText>
        <SortIcon $visible={isActiveSort('artist')}>
          {sortDirection === 'asc' && isActiveSort('artist') ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </SortIcon>
      </HeaderCell>
      
      {/* Album Column */}
      <HeaderCell 
        $active={isActiveSort('album')}
        onClick={() => handleSort('album')}
      >
        <HeaderText>Album</HeaderText>
        <SortIcon $visible={isActiveSort('album')}>
          {sortDirection === 'asc' && isActiveSort('album') ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </SortIcon>
      </HeaderCell>
      
      {/* Duration Column */}
      <HeaderCell 
        $active={isActiveSort('duration')}
        onClick={() => handleSort('duration')}
        style={{ justifyContent: 'flex-end' }}
      >
        <HeaderIcon>
          <Clock size={14} />
        </HeaderIcon>
        <SortIcon $visible={isActiveSort('duration')}>
          {sortDirection === 'asc' && isActiveSort('duration') ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </SortIcon>
      </HeaderCell>
    </HeaderContainer>
  );
};

export default TrackListHeader;