import React, { useState } from 'react';
import styled from 'styled-components';
import Dropdown from './index';
import Icon from '../Icon';

// Container for examples
const ExamplesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const ExampleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 4px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ExampleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const ExampleLabel = styled.div`
  width: 120px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Example/demo component for the Dropdown
 */
const DropdownExample = () => {
  const [basicValue, setBasicValue] = useState(null);
  const [groupedValue, setGroupedValue] = useState(null);
  const [iconValue, setIconValue] = useState('songs');
  
  // Basic options
  const basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' }
  ];
  
  // Grouped options
  const groupedOptions = [
    {
      label: 'Group 1',
      options: [
        { value: 'group1-option1', label: 'Group 1 - Option 1' },
        { value: 'group1-option2', label: 'Group 1 - Option 2' }
      ]
    },
    {
      label: 'Group 2',
      options: [
        { value: 'group2-option1', label: 'Group 2 - Option 1' },
        { value: 'group2-option2', label: 'Group 2 - Option 2', disabled: true }
      ]
    }
  ];
  
  // Options with icons
  const iconOptions = [
    { value: 'songs', label: 'Songs', icon: 'Songs' },
    { value: 'albums', label: 'Albums', icon: 'Albums' },
    { value: 'artists', label: 'Artists', icon: 'Artists' },
    { value: 'playlists', label: 'Playlists', icon: 'Playlist' }
  ];
  
  // More complex options with descriptions
  const complexOptions = [
    {
      value: 'wav',
      label: 'WAV Audio',
      description: 'Uncompressed, high quality',
      icon: 'Albums'
    },
    {
      value: 'flac',
      label: 'FLAC Audio',
      description: 'Lossless compression',
      icon: 'Albums'
    },
    {
      value: 'mp3',
      label: 'MP3 Audio',
      description: 'Lossy compression, smaller files',
      icon: 'Albums'
    },
    {
      value: 'aac',
      label: 'AAC Audio',
      description: 'Advanced Audio Coding',
      icon: 'Albums'
    }
  ];
  
  return (
    <ExamplesContainer>
      <ExampleSection>
        <SectionTitle>Basic Dropdowns</SectionTitle>
        
        <ExampleRow>
          <ExampleLabel>Default</ExampleLabel>
          <Dropdown
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Select an option"
          />
        </ExampleRow>
        
        <ExampleRow>
          <ExampleLabel>Compact</ExampleLabel>
          <Dropdown
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Select an option"
            compact
          />
        </ExampleRow>
        
        <ExampleRow>
          <ExampleLabel>Disabled</ExampleLabel>
          <Dropdown
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Select an option"
            disabled
          />
        </ExampleRow>
      </ExampleSection>
      
      <ExampleSection>
        <SectionTitle>Option Groups</SectionTitle>
        
        <ExampleRow>
          <ExampleLabel>With Groups</ExampleLabel>
          <Dropdown
            options={groupedOptions}
            value={groupedValue}
            onChange={setGroupedValue}
            placeholder="Select from groups"
          />
        </ExampleRow>
        
        <ExampleRow>
          <ExampleLabel>Searchable</ExampleLabel>
          <Dropdown
            options={groupedOptions}
            value={groupedValue}
            onChange={setGroupedValue}
            placeholder="Search in groups"
            searchable
          />
        </ExampleRow>
      </ExampleSection>
      
      <ExampleSection>
        <SectionTitle>With Icons</SectionTitle>
        
        <ExampleRow>
          <ExampleLabel>Icon Options</ExampleLabel>
          <Dropdown
            options={iconOptions}
            value={iconValue}
            onChange={setIconValue}
            placeholder="Select media type"
          />
        </ExampleRow>
        
        <ExampleRow>
          <ExampleLabel>With Descriptions</ExampleLabel>
          <Dropdown
            options={complexOptions}
            placeholder="Select audio format"
            width="250px"
          />
        </ExampleRow>
      </ExampleSection>
      
      <ExampleSection>
        <SectionTitle>Custom Widths</SectionTitle>
        
        <ExampleRow>
          <ExampleLabel>Fixed Width</ExampleLabel>
          <Dropdown
            options={basicOptions}
            placeholder="300px width"
            width="300px"
          />
        </ExampleRow>
        
        <ExampleRow>
          <ExampleLabel>Min Width</ExampleLabel>
          <Dropdown
            options={basicOptions}
            placeholder="Min 200px width"
            minWidth="200px"
          />
        </ExampleRow>
      </ExampleSection>
    </ExamplesContainer>
  );
};

export default DropdownExample;