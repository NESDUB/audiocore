import React from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';

const HomeContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: var(--spacing-md);
`;

const WelcomeHeader = styled.div`
  grid-column: 1 / -1;
  padding: var(--spacing-md);
  border-radius: var(--spacing-sm);
  background-color: var(--bgContent);
  border: 1px solid var(--borderSubtle);
  color: var(--textPrimary);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  color: var(--textPrimary);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--textSecondary);
  margin-bottom: var(--spacing-lg);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  background-color: var(--bgSecondary);
  border-radius: var(--spacing-sm);
  border: 1px solid var(--borderSubtle);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: var(--accentPrimary);
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
`;

const HomePage = () => {
  return (
    <HomeContainer>
      <WelcomeHeader>
        <Title>Welcome to Audiocore</Title>
        <Subtitle>Your advanced audio player and library manager</Subtitle>

        <StatsContainer>
          <StatItem>
            <StatValue>238</StatValue>
            <StatLabel>Albums in library</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>3,542</StatValue>
            <StatLabel>Tracks available</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>142h</StatValue>
            <StatLabel>Listening time</StatLabel>
          </StatItem>
        </StatsContainer>
      </WelcomeHeader>

      <Panel title="RECENTLY PLAYED">
        <p>Recently played tracks will appear here.</p>
      </Panel>

      <Panel title="RECOMMENDATIONS">
        <p>Music recommendations based on your listening habits.</p>
      </Panel>

      <Panel title="STATS & INSIGHTS">
        <p>Listening statistics and insights will be displayed here.</p>
      </Panel>
    </HomeContainer>
  );
};

export default HomePage;