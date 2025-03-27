import React, { useState } from 'react';
import styled from 'styled-components';
import Panel from '../../layout/Panel';
import { Disc, Music, User, List, Grid, Search } from 'lucide-react';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-md);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderSubtle);
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  color: ${props => props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--accentPrimary)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--textPrimary);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--bgSecondary);
  border-radius: var(--spacing-sm);
`;

const SearchInput = styled.input`
  flex: 1;
  background-color: var(--bgPrimary);
  border: 1px solid var(--borderLight);
  border-radius: 4px;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--textPrimary);
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: var(--accentPrimary);
  }
  
  &::placeholder {
    color: var(--textDimmed);
  }
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
  background-color: ${props => props.$active ? 'var(--bgHover)' : 'transparent'};
  
  &:hover {
    background-color: var(--bgHover);
    color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textPrimary)'};
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  overflow-y: auto;
  padding: var(--spacing-sm);
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--borderSubtle);
  cursor: pointer;
  
  &:hover {
    background-color: var(--bgHover);
  }
`;

const ItemArtwork = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: var(--bgSecondary);
  margin-right: var(--spacing-sm);
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemTitle = styled.span`
  color: var(--textPrimary);
  font-size: 14px;
`;

const ItemSubtitle = styled.span`
  color: var(--textSecondary);
  font-size: 12px;
`;

// Grid view item
const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const GridItemArtwork = styled.div`
  aspect-ratio: 1;
  background-color: var(--bgSecondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }
`;

const GridItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs);
`;

/**
 * LibraryBrowser component - placeholder for library browsing
 */
const LibraryBrowser = () => {
  const [activeTab, setActiveTab] = useState('albums');
  const [viewMode, setViewMode] = useState('grid');
  
  // Placeholder controls for panel header
  const controls = (
    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
      <ViewButton 
        $active={viewMode === 'grid'} 
        onClick={() => setViewMode('grid')}
        aria-label="Grid view"
      >
        <Grid size={16} />
      </ViewButton>
      <ViewButton 
        $active={viewMode === 'list'} 
        onClick={() => setViewMode('list')}
        aria-label="List view"
      >
        <List size={16} />
      </ViewButton>
    </div>
  );
  
  return (
    <Panel title="LIBRARY" controls={controls} fullHeight noPadding>
      <BrowserContainer>
        <TabsContainer>
          <Tab 
            $active={activeTab === 'albums'} 
            onClick={() => setActiveTab('albums')}
          >
            <Disc size={16} />
            <span>Albums</span>
          </Tab>
          <Tab 
            $active={activeTab === 'tracks'} 
            onClick={() => setActiveTab('tracks')}
          >
            <Music size={16} />
            <span>Tracks</span>
          </Tab>
          <Tab 
            $active={activeTab === 'artists'} 
            onClick={() => setActiveTab('artists')}
          >
            <User size={16} />
            <span>Artists</span>
          </Tab>
        </TabsContainer>
        
        <SearchContainer>
          <SearchInput type="text" placeholder="Search library..." />
          <ViewButton aria-label="Search">
            <Search size={16} />
          </ViewButton>
        </SearchContainer>
        
        {/* Content area - either grid or list */}
        {viewMode === 'grid' ? (
          <GridContainer>
            {/* Placeholder grid items */}
            {Array.from({ length: 12 }).map((_, i) => (
              <GridItem key={i}>
                <GridItemArtwork>
                  <img src="/api/placeholder/150/150" alt="Placeholder" />
                </GridItemArtwork>
                <GridItemInfo>
                  <ItemTitle>Item {i + 1}</ItemTitle>
                  <ItemSubtitle>Subtitle</ItemSubtitle>
                </GridItemInfo>
              </GridItem>
            ))}
          </GridContainer>
        ) : (
          <ListContainer>
            {/* Placeholder list items */}
            {Array.from({ length: 15 }).map((_, i) => (
              <ListItem key={i}>
                <ItemArtwork />
                <ItemInfo>
                  <ItemTitle>Item {i + 1}</ItemTitle>
                  <ItemSubtitle>Subtitle</ItemSubtitle>
                </ItemInfo>
              </ListItem>
            ))}
          </ListContainer>
        )}
      </BrowserContainer>
    </Panel>
  );
};

export default LibraryBrowser;