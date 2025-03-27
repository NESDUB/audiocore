import React, { useState } from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { Disc, SortAsc, Search, Filter, Grid, BarChart2, Play, Heart } from 'lucide-react';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: auto;
  height: 100%;
`;

const PageHeader = styled.div`
  background-color: var(--bgContent);
  border-radius: var(--spacing-md);
  border: 1px solid var(--borderSubtle);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    color: var(--accentPrimary);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  background-color: var(--bgSecondary);
  border-radius: 4px;
  border: 1px solid var(--borderLight);
  padding: 0 var(--spacing-sm);
  
  svg {
    color: var(--textSecondary);
  }
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: var(--spacing-sm);
    color: var(--textPrimary);
    font-size: 14px;
    outline: none;
    
    &::placeholder {
      color: var(--textDimmed);
    }
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderLight);
  color: var(--textSecondary);
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const AlbumStats = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 200px;
  background-color: var(--bgSecondary);
  border-radius: var(--spacing-sm);
  border: 1px solid var(--borderSubtle);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const StatTitle = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  margin-bottom: var(--spacing-xs);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: var(--textPrimary);
`;

const StatChange = styled.div`
  font-size: 12px;
  color: ${props => props.$positive ? 'var(--accentPrimary)' : 'var(--accentError)'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const AlbumCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderSubtle);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px var(--shadowColor);
  }
`;

const AlbumCover = styled.div`
  aspect-ratio: 1;
  background-color: var(--bgPrimary);
  position: relative;
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const CoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--accentPrimary);
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
  }
`;

const AlbumActions = styled.div`
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  z-index: 2;
`;

const ActionIconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
    color: var(--accentPrimary);
  }
  
  &.favorite {
    color: var(--accentError);
  }
`;

const AlbumInfo = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AlbumTitle = styled.div`
  font-size: 16px;
  color: var(--textPrimary);
  font-weight: 500;
`;

const AlbumArtist = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
`;

const AlbumYear = styled.div`
  font-size: 12px;
  color: var(--textDimmed);
  margin-top: 4px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: var(--spacing-sm);
`;

const FilterLabel = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
`;

const FilterChips = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 16px;
  background-color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--bgSecondary)'};
  color: ${props => props.$active ? 'black' : 'var(--textSecondary)'};
  border: 1px solid ${props => props.$active ? 'var(--accentPrimary)' : 'var(--borderLight)'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--accentHighlight)' : 'var(--bgHover)'};
  }
`;

const AlbumsPage = () => {
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState('date_added');
  
  const genres = ['All', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Hip Hop', 'Ambient'];
  
  return (
    <PageContainer>
      <PageHeader>
        <HeaderTitle>
          <Disc size={28} />
          Album Collection
        </HeaderTitle>
        
        <HeaderActions>
          <SearchBar>
            <Search size={18} />
            <input type="text" placeholder="Search albums..." />
          </SearchBar>
          
          <ActionButton>
            <SortAsc size={18} />
            Sort
          </ActionButton>
          
          <ActionButton>
            <Filter size={18} />
            Filter
          </ActionButton>
          
          <ActionButton>
            <Grid size={18} />
            View
          </ActionButton>
        </HeaderActions>
        
        <AlbumStats>
          <StatCard>
            <StatTitle>Total Albums</StatTitle>
            <StatValue>238</StatValue>
            <StatChange $positive={true}>+12 this month</StatChange>
          </StatCard>
          
          <StatCard>
            <StatTitle>Storage Used</StatTitle>
            <StatValue>147 GB</StatValue>
            <StatChange $positive={false}>56% of available space</StatChange>
          </StatCard>
          
          <StatCard>
            <StatTitle>Play Count</StatTitle>
            <StatValue>1,452</StatValue>
            <StatChange $positive={true}>+89 this week</StatChange>
          </StatCard>
        </AlbumStats>
      </PageHeader>
      
      <Panel title="YOUR ALBUMS">
        <FilterBar>
          <FilterLabel>Genre:</FilterLabel>
          <FilterChips>
            {genres.map(g => (
              <FilterChip 
                key={g} 
                $active={genre === g}
                onClick={() => setGenre(g)}
              >
                {g}
              </FilterChip>
            ))}
          </FilterChips>
        </FilterBar>
        
        <AlbumGrid>
          {Array.from({ length: 12 }).map((_, i) => (
            <AlbumCard key={i}>
              <AlbumCover>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bgPrimary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Disc size={50} color="var(--textDimmed)" />
                </div>
                
                <CoverOverlay className="overlay">
                  <button>
                    <Play size={24} />
                  </button>
                </CoverOverlay>
                
                <AlbumActions>
                  <ActionIconButton className="favorite">
                    <Heart size={16} fill="currentColor" />
                  </ActionIconButton>
                  <ActionIconButton>
                    <BarChart2 size={16} />
                  </ActionIconButton>
                </AlbumActions>
              </AlbumCover>
              
              <AlbumInfo>
                <AlbumTitle>Album Name {i + 1}</AlbumTitle>
                <AlbumArtist>Artist Name</AlbumArtist>
                <AlbumYear>2023 • 12 tracks</AlbumYear>
              </AlbumInfo>
            </AlbumCard>
          ))}
        </AlbumGrid>
      </Panel>
    </PageContainer>
  );
};

export default AlbumsPage;