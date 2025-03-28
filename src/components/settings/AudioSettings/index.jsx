import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import audioService from '../../../services/AudioService';
import OutputSelector from './OutputSelector';
import BufferSettings from './BufferSettings';
import ProcessingOptions from './ProcessingOptions';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * AudioSettings Component - Parent container for all audio settings
 * Integrates with the enhanced AudioService and coordinates settings components
 */
const AudioSettings = () => {
  // Get audio engine components from player provider
  const { getEngineComponents } = usePlayer();
  
  // Store references to engine components
  const [engineComponents, setEngineComponents] = useState(null);
  
  // Initialize engine components
  useEffect(() => {
    // Get engine components from player or directly from service
    const components = getEngineComponents ? 
      getEngineComponents() : 
      audioService.getEngineComponents();
      
    if (components) {
      setEngineComponents(components);
    }
  }, [getEngineComponents]);
  
  // If engine components are not available, we can still render the UI
  // but it will use mock data instead of real engine state
  
  return (
    <Container>
      <Section>
        <SectionTitle>Device Settings</SectionTitle>
        <OutputSelector engineComponents={engineComponents} />
      </Section>
      
      <Section>
        <SectionTitle>Buffer Settings</SectionTitle>
        <BufferSettings engineComponents={engineComponents} />
      </Section>
      
      <Section>
        <SectionTitle>Audio Processing</SectionTitle>
        <ProcessingOptions engineComponents={engineComponents} />
      </Section>
    </Container>
  );
};

export default AudioSettings;