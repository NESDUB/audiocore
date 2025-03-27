import React, { useState } from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { Heart, Music, Disc, List, Grid, Clock, Play, Calendar } from 'lucide-react';

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
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: var(--spacing-sm);
  background-color: var(--bgSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accentPrimary);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: var(--textPrimary);
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 4px;
  background-color: ${(props) => (props.$primary ? 'var(--accentPrimary)' : 'transparent')};
  color: ${(props) => (props.$primary ? 'black' : 'var(--textPrimary)')};
  border: ${(props) => (props.$primary ? 'none' : '1px solid var(--borderLight)')};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${(props) => (props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)')};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderSubtle);
  margin-bottom: var(--spacing-md);
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

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
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

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
`;

const ItemCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background-color: var(--bgSecondary);
  transition: transform 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const ItemCover = styled.div`
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  button {
    width: 48px;
    height: 48px;
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

const FavoriteIcon = styled.div`
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accentError);
  z-index: 2;
`;

const ItemInfo = styled.div`
  padding: var(--spacing-sm);
`;

const ItemTitle = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
  margin-bottom: 2px;
  font-weight: 500;
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderSubtle);
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 120px 80px;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bgPrimary);
  border-bottom: 1px solid var(--borderSubtle);
  
  span {
    font-size: 12px;
    color: var(--textSecondary);
    font-weight: 500;
  }
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 120px 80px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--bgHover);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TrackNumber = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackTitle = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
`;

const TrackArtist = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const TrackAlbum = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackDuration = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  text-align: right;
`;

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState('tracks');
  const [viewMode, setViewMode] = useState('grid');
  
  const renderContent = () => {
    if (activeTab === 'tracks' && viewMode === 'list') {
      return (
        <ItemsList>
          <ListHeader>
            <span>#</span>
            <span>TITLE</span>
            <span>ALBUM</span>
            <span>DURATION</span>
          </ListHeader>
          {Array.from({ length: 15 }).map((_, i) => (
            <ListItem key={i}>
              <TrackNumber>{i + 1}</TrackNumber>
              <TrackInfo>
                <TrackTitle>Favorite Track {i + 1}</TrackTitle>
                <TrackArtist>Artist Name</TrackArtist>
              </TrackInfo>
              <TrackAlbum>Album Name</TrackAlbum>
              <TrackDuration>3:45</TrackDuration>
            </ListItem>
          ))}
        </ItemsList>
      );
    }
    
    return (
      <ItemGrid>
        {Array.from({ length: 12 }).map((_, i) => (
          <ItemCard key={i}>
            <ItemCover>
              <FavoriteIcon>
                <Heart size={16} fill="currentColor" />
              </FavoriteIcon>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bgPrimary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeTab === 'tracks' ? (
                  <Music size={40} color="var(--textDimmed)" />
                ) : (
                  <Disc size={40} color="var(--textDimmed)" />
                )}
              </div>
              <CoverOverlay className="overlay">
                <button>
                  <Play size={24} />
                </button>
              </CoverOverlay>
            </ItemCover>
            <ItemInfo>
              <ItemTitle>
                {activeTab === 'tracks' ? `Favorite Track ${i + 1}` : `Favorite Album ${i + 1}`}
              </ItemTitle>
              <ItemSubtitle>Artist Name</ItemSubtitle>
            </ItemInfo>
          </ItemCard>
        ))}
      </ItemGrid>
    );
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <HeaderIcon>
            <Heart size={30} fill="currentColor" />
          </HeaderIcon>
          <HeaderInfo>
            <HeaderTitle>Your Favorites</HeaderTitle>
            <HeaderSubtitle>Collection of your favorite tracks and albums</HeaderSubtitle>
          </HeaderInfo>
        </HeaderLeft>
        
        <HeaderButtons>
          <HeaderButton>
            <Clock size={16} />
            Recently Added
          </HeaderButton>
          <HeaderButton $primary>
            <Play size={16} />
            Play All
          </HeaderButton>
        </HeaderButtons>
      </PageHeader>
      
      <Panel title="FAVORITES" noPadding>
        <div style={{ padding: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <TabsContainer>
              <Tab 
                $active={activeTab === 'tracks'} 
                onClick={() => setActiveTab('tracks')}
              >
                <Music size={16} />
                <span>Tracks</span>
              </Tab>
              <Tab 
                $active={activeTab === 'albums'} 
                onClick={() => setActiveTab('albums')}
              >
                <Disc size={16} />
                <span>Albums</span>
              </Tab>
            </TabsContainer>
            
            <ViewControls>
              <ViewButton 
                $active={viewMode === 'grid'} 
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </ViewButton>
              <ViewButton 
                $active={viewMode === 'list'} 
                onClick={() => setViewMode('list')}
                disabled={activeTab === 'albums'}
              >
                <List size={16} />
              </ViewButton>
            </ViewControls>
          </div>
          
          {renderContent()}
        </div>
      </Panel>
    </PageContainer>
  );
};

export default FavoritesPage;