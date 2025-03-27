import React from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { Disc, Plus, Music, Star, Radio } from 'lucide-react';

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: auto;
  height: 100%;
`;

const FeaturedContent = styled.div`
  grid-column: 1 / -1;
  height: 280px;
  background-color: var(--bgContent);
  border-radius: var(--spacing-md);
  border: 1px solid var(--borderSubtle);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-end;
  background-image: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.1), 
    rgba(0, 0, 0, 0.7)
  );
`;

const FeaturedGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.1), 
    rgba(0, 0, 0, 0.7)
  );
  z-index: 1;
`;

const FeaturedImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bgSecondary);
  background-image: radial-gradient(
    circle at 30% 30%, 
    var(--bgGradientStart), 
    transparent 70%
  );
  z-index: 0;
`;

const FeaturedInfo = styled.div`
  padding: var(--spacing-md);
  color: white;
  z-index: 2;
  width: 100%;
`;

const FeaturedTitle = styled.h2`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
`;

const FeaturedSubtitle = styled.p`
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: var(--spacing-md);
`;

const CategoryPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow: hidden;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-sm);
  overflow-y: auto;
`;

const ItemCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: var(--spacing-xs);
  overflow: hidden;
  background-color: var(--bgSecondary);
  transition: transform 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const ItemImage = styled.div`
  aspect-ratio: 1;
  background-color: var(--bgPrimary);
  position: relative;
  
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--textSecondary);
    opacity: 0.4;
  }
`;

const ItemInfo = styled.div`
  padding: var(--spacing-xs);
`;

const ItemTitle = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
  margin-bottom: 2px;
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const FeaturedButton = styled.button`
  background-color: var(--accentPrimary);
  color: ${(props) => (props.theme === 'dark' ? 'black' : 'white')};
  border: none;
  border-radius: 4px;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--accentHighlight);
  }
`;

const DiscoverPage = () => {
  return (
    <PageContainer>
      <FeaturedContent>
        <FeaturedImage />
        <FeaturedGradient />
        <FeaturedInfo>
          <FeaturedTitle>New Releases This Week</FeaturedTitle>
          <FeaturedSubtitle>Explore the latest albums and singles from your favorite artists</FeaturedSubtitle>
          <FeaturedButton>Browse New Releases</FeaturedButton>
        </FeaturedInfo>
      </FeaturedContent>
      
      <CategoryPanel title="TRENDING ALBUMS">
        <CategoryGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCard key={i}>
              <ItemImage>
                <Disc size={40} />
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Album Name {i + 1}</ItemTitle>
                <ItemSubtitle>Artist Name</ItemSubtitle>
              </ItemInfo>
            </ItemCard>
          ))}
        </CategoryGrid>
      </CategoryPanel>
      
      <CategoryPanel title="FEATURED PLAYLISTS">
        <CategoryGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCard key={i}>
              <ItemImage>
                <Music size={40} />
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Playlist {i + 1}</ItemTitle>
                <ItemSubtitle>Curator</ItemSubtitle>
              </ItemInfo>
            </ItemCard>
          ))}
        </CategoryGrid>
      </CategoryPanel>
      
      <CategoryPanel title="POPULAR STATIONS">
        <CategoryGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCard key={i}>
              <ItemImage>
                <Radio size={40} />
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Station {i + 1}</ItemTitle>
                <ItemSubtitle>Genre</ItemSubtitle>
              </ItemInfo>
            </ItemCard>
          ))}
        </CategoryGrid>
      </CategoryPanel>
    </PageContainer>
  );
};

export default DiscoverPage;