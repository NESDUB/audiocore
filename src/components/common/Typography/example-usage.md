import React from 'react';
import styled from 'styled-components';
import Title from './Title';
import Label from './Label';
import Metadata from './Metadata';
import Icon from '../Icon';

/**
 * This file provides examples of how to use the Typography components
 * in the AudioCore music player with the AudiophileConsole aesthetic.
 */

// Example container for demonstration
const ExampleContainer = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 6px;
  margin-bottom: 24px;
`;

// Track info display example
const TrackDisplay = () => (
  <ExampleContainer>
    {/* Track title using Title component */}
    <Title variant="section" noWrap>
      Midnight Sonata (Original Mix)
    </Title>
    
    {/* Artist as metadata */}
    <Metadata margin="0 0 8px 0">
      Ludwig van Beethoven
    </Metadata>
    
    {/* Album with icon */}
    <Metadata 
      variant="small" 
      icon={<Icon name="Albums" size="14px" />}
      margin="0 0 16px 0"
    >
      Classical Masterpieces
    </Metadata>
    
    {/* Technical details as a metadata list */}
    <Metadata isList listProps={{ gap: '16px' }}>
      <Metadata variant="technical" withSeparator>44.1kHz</Metadata>
      <Metadata variant="technical" withSeparator>16bit</Metadata>
      <Metadata variant="technical">FLAC</Metadata>
    </Metadata>
  </ExampleContainer>
);

// Player section example
const PlayerSection = () => (
  <ExampleContainer>
    {/* Section title with underline */}
    <Title 
      variant="subsection" 
      underline 
      underlineColor="#91F291"
      uppercase
      spacing="1.5px"
      margin="0 0 16px 0"
    >
      Equalizer
    </Title>
    
    {/* Control labels */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <Label>Low</Label>
      <Label>Mid</Label>
      <Label>High</Label>
    </div>
    
    {/* Status information */}
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Metadata variant="small">Presets:</Metadata>
      <Metadata 
        badge="rgba(145, 242, 145, 0.2)" 
        color="#91F291"
        interactive
      >
        Custom
      </Metadata>
    </div>
  </ExampleContainer>
);

// Library item example
const LibraryItem = () => (
  <ExampleContainer>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        {/* Title with truncation */}
        <Title variant="item" truncate={1} maxWidth="200px">
          Very Long Track Title That Would Normally Overflow
        </Title>
        
        {/* Artist and album metadata */}
        <Metadata noWrap maxWidth="200px">Artist Name</Metadata>
        <Metadata variant="small" opacity={0.7} noWrap maxWidth="200px">Album Name</Metadata>
      </div>
      
      {/* Track details */}
      <div style={{ textAlign: 'right' }}>
        <Metadata variant="technical">03:45</Metadata>
        <Label size="10px" margin="4px 0 0 0">320 KBPS</Label>
      </div>
    </div>
  </ExampleContainer>
);

// Settings section example
const SettingsSection = () => (
  <ExampleContainer>
    <Label withDot="#91F291" margin="0 0 16px 0">
      AUDIO SETTINGS
    </Label>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
      <Label size="10px">DRIVER</Label>
      <Metadata right>Core Audio</Metadata>
      
      <Label size="10px">DEVICE</Label>
      <Metadata right>Built-in Output</Metadata>
      
      <Label size="10px">BUFFER SIZE</Label>
      <Metadata right monospace>512</Metadata>
    </div>
    
    <Metadata 
      badge 
      variant="small" 
      margin="8px 0 0 0" 
      center
      interactive
    >
      Advanced Options
    </Metadata>
  </ExampleContainer>
);

// Usage example component
const TypographyExamples = () => {
  return (
    <div>
      <Title variant="main" center margin="0 0 24px 0">
        AudioCore Typography Examples
      </Title>
      
      <TrackDisplay />
      <PlayerSection />
      <LibraryItem />
      <SettingsSection />
    </div>
  );
};

export default TypographyExamples;