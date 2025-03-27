import React from 'react';
import styled from 'styled-components';
import Icon from '../common/Icon';
import { PlayIcon, PauseIcon, EqualizerIcon } from '../common/Icon/icons';

const ExampleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 6px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const IconItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const IconName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * This component demonstrates the different ways to use icons in the application.
 */
const IconUsageExample = () => {
  return (
    <ExampleContainer>
      <Section>
        <SectionTitle>Using Icon Component with Name</SectionTitle>
        <IconRow>
          <IconItem>
            <Icon name="Play" size="32px" color="#91F291" />
            <IconName>Play</IconName>
          </IconItem>
          <IconItem>
            <Icon name="Pause" size="32px" color="#F2CB05" />
            <IconName>Pause</IconName>
          </IconItem>
          <IconItem>
            <Icon name="VolumeUp" size="32px" color="#5D7DF2" />
            <IconName>VolumeUp</IconName>
          </IconItem>
          <IconItem>
            <Icon name="Settings" size="32px" />
            <IconName>Settings</IconName>
          </IconItem>
        </IconRow>
      </Section>

      <Section>
        <SectionTitle>Using Individual Icon Components</SectionTitle>
        <IconRow>
          <IconItem>
            <PlayIcon size={32} color="#91F291" />
            <IconName>PlayIcon</IconName>
          </IconItem>
          <IconItem>
            <PauseIcon size={32} color="#F2CB05" />
            <IconName>PauseIcon</IconName>
          </IconItem>
          <IconItem>
            <EqualizerIcon size={32} color="#5D7DF2" />
            <IconName>EqualizerIcon</IconName>
          </IconItem>
        </IconRow>
      </Section>

      <Section>
        <SectionTitle>Using Icon Component with Individual Components</SectionTitle>
        <IconRow>
          <IconItem>
            <Icon name="PlayIcon" size="32px" color="#91F291" />
            <IconName>PlayIcon</IconName>
          </IconItem>
          <IconItem>
            <Icon name="PauseIcon" size="32px" color="#F2CB05" />
            <IconName>PauseIcon</IconName>
          </IconItem>
          <IconItem>
            <Icon name="EqualizerIcon" size="32px" color="#5D7DF2" />
            <IconName>EqualizerIcon</IconName>
          </IconItem>
        </IconRow>
      </Section>

      <Section>
        <SectionTitle>Interactive Icons</SectionTitle>
        <IconRow>
          <IconItem>
            <Icon 
              name="Play" 
              size="32px" 
              color="#91F291" 
              onClick={() => alert('Play clicked!')}
              title="Play audio"
            />
            <IconName>Clickable</IconName>
          </IconItem>
          <IconItem>
            <Icon 
              name="VolumeUp" 
              size="32px" 
              color="#5D7DF2" 
              opacity={0.7}
            />
            <IconName>With Opacity</IconName>
          </IconItem>
        </IconRow>
      </Section>

      <Section>
        <SectionTitle>Specialized Icons</SectionTitle>
        <IconRow>
          <IconItem>
            <Icon name="VolumeIcon" size="32px" level="high" />
            <IconName>Volume High</IconName>
          </IconItem>
          <IconItem>
            <Icon name="VolumeIcon" size="32px" level="low" />
            <IconName>Volume Low</IconName>
          </IconItem>
          <IconItem>
            <Icon name="VolumeIcon" size="32px" level="mute" />
            <IconName>Volume Mute</IconName>
          </IconItem>
          <IconItem>
            <Icon name="SkipIcon" size="32px" direction="next" />
            <IconName>Skip Next</IconName>
          </IconItem>
          <IconItem>
            <Icon name="SkipIcon" size="32px" direction="previous" />
            <IconName>Skip Previous</IconName>
          </IconItem>
        </IconRow>
      </Section>
    </ExampleContainer>
  );
};

export default IconUsageExample;