import React from 'react';
import styled from 'styled-components';
import StatusItem from './StatusItem';
import StatusMetrics from './StatusMetrics';

const StatusBarContainer = styled.footer`
  height: 26px;
  background-color: var(--bgControl);
  border-top: 1px solid var(--borderSubtle);
  padding: 0 var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  grid-area: statusbar;
  z-index: 5;
`;

const StatusBarSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--borderLight);
`;

const VersionText = styled.span`
  color: var(--textSecondary);
  font-size: 11px;
`;

const StatusBar = () => {
  return (
    <StatusBarContainer>
      <StatusBarSection>
        <VersionText>VERSION 1.0.0</VersionText>
        <Divider />
        <StatusItem label="AUDIO" value="44.1kHz" />
        <StatusItem label="FORMAT" value="WAV" />
      </StatusBarSection>
      
      <StatusBarSection>
        <StatusMetrics />
        <Divider />
        <StatusItem 
          label="STATUS" 
          value="ACTIVE" 
          indicator={{
            show: true,
            color: 'var(--accentPrimary)'
          }} 
        />
      </StatusBarSection>
    </StatusBarContainer>
  );
};

export default StatusBar;