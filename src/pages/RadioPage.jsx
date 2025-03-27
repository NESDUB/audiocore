import React from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { Radio, Music, Zap, Globe, Star } from 'lucide-react';

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: auto;
  height: 100%;
`;

const PageHeader = styled.div`
  grid-column: 1 / -1;
  background-color: var(--bgContent);
  border-radius: var(--spacing-md);
  border: 1px solid var(--borderSubtle);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: var(--textPrimary);
`;

const PageDescription = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  max-width: 800px;
`;

const CategoryTabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderSubtle);
  margin-bottom: var(--spacing-md);
`;

const CategoryTab = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) => (props.$active ? 'var(--accentPrimary)' : 'transparent')};
  color: ${(props) => (props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)')};
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? '500' : '400')};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    color: var(--textPrimary);
  }
`;

const StationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-md);
  overflow-y: auto;
`;

const StationCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderSubtle);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px var(--shadowColor);
  }
`;

const StationHeader = styled.div`
  position: relative;
  height: 120px;
  background-color: var(--bgPrimary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StationIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--bgContent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
`;

const LiveBadge = styled.div`
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  background-color: var(--accentError);
  color: white;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
`;

const StationInfo = styled.div`
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const StationName = styled.h3`
  font-size: 16px;
  color: var(--textPrimary);
  font-weight: 500;
`;

const StationGenre = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const StationListeners = styled.div`
  font-size: 12px;
  color: var(--textDimmed);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const FeaturedStations = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const NowPlayingPanel = styled(Panel)`
  grid-row: span 2;
`;

const NowPlayingContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
`;

const StationLogoLarge = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--bgSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
`;

const NowPlayingTitle = styled.h2`
  font-size: 20px;
  color: var(--textPrimary);
  font-weight: 500;
`;

const NowPlayingSubtitle = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
`;

const RadioPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Radio Stations</PageTitle>
        <PageDescription>
          Stream live radio stations and curated playlists from around the world. 
          Discover new genres and artists with our handpicked selection of stations.
        </PageDescription>
        
        <CategoryTabs>
          <CategoryTab $active={true}>All Stations</CategoryTab>
          <CategoryTab>Genre</CategoryTab>
          <CategoryTab>Location</CategoryTab>
          <CategoryTab>Favorites</CategoryTab>
        </CategoryTabs>
      </PageHeader>
      
      <NowPlayingPanel title="NOW PLAYING">
        <NowPlayingContent>
          <StationLogoLarge>
            <Radio size={60} color="var(--accentPrimary)" />
          </StationLogoLarge>
          <NowPlayingTitle>Electronic Beats Radio</NowPlayingTitle>
          <NowPlayingSubtitle>Currently playing: Artist - Track Title</NowPlayingSubtitle>
          <StationListeners>
            <Zap size={14} />
            12,345 listeners
          </StationListeners>
        </NowPlayingContent>
      </NowPlayingPanel>
      
      <Panel title="POPULAR STATIONS">
        <StationGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <StationCard key={i}>
              <StationHeader>
                <StationIcon>
                  <Radio size={24} />
                </StationIcon>
                {i % 3 === 0 && <LiveBadge>LIVE</LiveBadge>}
              </StationHeader>
              <StationInfo>
                <StationName>Station Name {i + 1}</StationName>
                <StationGenre>Electronic • Dance</StationGenre>
                <StationListeners>
                  <Zap size={14} />
                  {Math.floor(Math.random() * 10000)} listeners
                </StationListeners>
              </StationInfo>
            </StationCard>
          ))}
        </StationGrid>
      </Panel>
      
      <Panel title="GENRE STATIONS">
        <StationGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <StationCard key={i}>
              <StationHeader>
                <StationIcon>
                  <Music size={24} />
                </StationIcon>
              </StationHeader>
              <StationInfo>
                <StationName>Genre Station {i + 1}</StationName>
                <StationGenre>
                  {['Jazz', 'Rock', 'Classical', 'Hip Hop', 'Pop', 'Ambient'][i % 6]} 
                </StationGenre>
                <StationListeners>
                  <Zap size={14} />
                  {Math.floor(Math.random() * 10000)} listeners
                </StationListeners>
              </StationInfo>
            </StationCard>
          ))}
        </StationGrid>
      </Panel>
    </PageContainer>
  );
};

export default RadioPage;