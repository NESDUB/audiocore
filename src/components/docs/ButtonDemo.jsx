import React, { useState } from 'react';
import styled from 'styled-components';
import {
  PrimaryButton,
  SecondaryButton,
  TextButton,
  TransportButton,
  CircleButton,
  IconButton,
  ToggleButton,
  UtilityButton
} from '../common/Button';

// Demo container
const DemoContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 6px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 16px;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ButtonSection = styled.div`
  margin-bottom: 24px;
`;

const ButtonLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const Spacer = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  margin: 12px 0;
`;

/**
 * Demo component showcasing all button types in the AudioCore UI
 */
const ButtonDemo = () => {
  const [toggleStates, setToggleStates] = useState({
    playback: false,
    shuffle: true,
    repeat: false,
    mute: false
  });
  
  const [activeUtility, setActiveUtility] = useState('solo');
  
  // Toggle state handler
  const toggleState = (key) => {
    setToggleStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <DemoContainer>
      <div>
        <SectionTitle>Basic Buttons</SectionTitle>
        
        <ButtonSection>
          <ButtonLabel>Primary Buttons</ButtonLabel>
          <ButtonRow>
            <PrimaryButton>PRIMARY</PrimaryButton>
            <PrimaryButton alt>PRIMARY ALT</PrimaryButton>
            <PrimaryButton small>SMALL</PrimaryButton>
            <PrimaryButton disabled>DISABLED</PrimaryButton>
          </ButtonRow>
        </ButtonSection>
        
        <ButtonSection>
          <ButtonLabel>Secondary Buttons</ButtonLabel>
          <ButtonRow>
            <SecondaryButton>SECONDARY</SecondaryButton>
            <SecondaryButton small>SMALL</SecondaryButton>
            <SecondaryButton disabled>DISABLED</SecondaryButton>
          </ButtonRow>
        </ButtonSection>
        
        <ButtonSection>
          <ButtonLabel>Text Buttons</ButtonLabel>
          <ButtonRow>
            <TextButton>TEXT BUTTON</TextButton>
            <TextButton small>SMALL TEXT</TextButton>
            <TextButton disabled>DISABLED</TextButton>
          </ButtonRow>
        </ButtonSection>
      </div>
      
      <Spacer />
      
      <div>
        <SectionTitle>Media Player Controls</SectionTitle>
        
        <ButtonSection>
          <ButtonLabel>Transport Controls</ButtonLabel>
          <ButtonRow>
            <TransportButton aria-label="Previous">⏮︎</TransportButton>
            <CircleButton 
              iconName="Play"
              variant="primary" 
              ariaLabel="Play"
              onClick={() => toggleState('playback')}
            />
            <TransportButton aria-label="Stop">■</TransportButton>
            <TransportButton aria-label="Next">⏭︎</TransportButton>
            <TransportButton 
              active={toggleStates.shuffle} 
              onClick={() => toggleState('shuffle')}
              aria-label="Shuffle"
            >
              ⇄
            </TransportButton>
          </ButtonRow>
        </ButtonSection>
        
        <ButtonSection>
          <ButtonLabel>Circle Buttons</ButtonLabel>
          <ButtonRow>
            <CircleButton 
              iconName="Play" 
              variant="primary" 
              size="sm"
              ariaLabel="Small Play"
            />
            <CircleButton 
              iconName="Play" 
              variant="primary"
              ariaLabel="Medium Play"
            />
            <CircleButton 
              iconName="Play" 
              variant="primary" 
              size="lg"
              ariaLabel="Large Play"
            />
            <CircleButton 
              iconName="Pause" 
              variant="secondary"
              ariaLabel="Pause"
            />
            <CircleButton 
              iconName="Stop" 
              variant="error"
              ariaLabel="Stop"
            />
            <CircleButton 
              iconName="Record" 
              variant="error" 
              elevated
              ringColor="rgba(242, 85, 90, 0.5)"
              ariaLabel="Record"
            />
          </ButtonRow>
        </ButtonSection>
      </div>
      
      <Spacer />
      
      <div>
        <SectionTitle>Icon Buttons</SectionTitle>
        
        <ButtonGrid>
          <ButtonSection>
            <ButtonLabel>Basic Icon Buttons</ButtonLabel>
            <ButtonRow>
              <IconButton 
                iconName="Play" 
                ariaLabel="Play"
              />
              <IconButton 
                iconName="Pause" 
                variant="filled"
                ariaLabel="Pause"
              />
              <IconButton 
                iconName="Stop" 
                variant="minimal"
                ariaLabel="Stop"
              />
              <IconButton 
                iconName="SkipNext" 
                shape="circle"
                ariaLabel="Next"
              />
            </ButtonRow>
          </ButtonSection>
          
          <ButtonSection>
            <ButtonLabel>Sizes and States</ButtonLabel>
            <ButtonRow>
              <IconButton 
                iconName="Play" 
                size="small"
                ariaLabel="Small"
              />
              <IconButton 
                iconName="Play" 
                ariaLabel="Medium"
              />
              <IconButton 
                iconName="Play" 
                size="large"
                ariaLabel="Large"
              />
              <IconButton 
                iconName="Play" 
                active
                ariaLabel="Active"
              />
              <IconButton 
                iconName="Play" 
                badge
                ariaLabel="With Badge"
              />
            </ButtonRow>
          </ButtonSection>
          
          <ButtonSection>
            <ButtonLabel>With Tooltips</ButtonLabel>
            <ButtonRow>
              <IconButton 
                iconName="VolumeUp" 
                tooltip="Volume"
                ariaLabel="Volume"
              />
              <IconButton 
                iconName="Settings" 
                tooltip="Settings"
                ariaLabel="Settings"
              />
              <IconButton 
                iconName="Search" 
                tooltip="Search Library"
                ariaLabel="Search"
              />
            </ButtonRow>
          </ButtonSection>
        </ButtonGrid>
      </div>
      
      <Spacer />
      
      <div>
        <SectionTitle>Toggle and Utility Buttons</SectionTitle>
        
        <ButtonGrid>
          <ButtonSection>
            <ButtonLabel>Toggle Buttons</ButtonLabel>
            <ButtonRow>
              <ToggleButton 
                active={toggleStates.playback}
                onClick={() => toggleState('playback')}
                iconName="Play"
              >
                PLAYBACK
              </ToggleButton>
              
              <ToggleButton 
                active={toggleStates.shuffle}
                onClick={() => toggleState('shuffle')}
                variant="filled"
                iconName="Shuffle"
              >
                SHUFFLE
              </ToggleButton>
              
              <ToggleButton 
                active={toggleStates.repeat}
                onClick={() => toggleState('repeat')}
                variant="minimal"
                showIndicator
              >
                REPEAT
              </ToggleButton>
            </ButtonRow>
            
            <ButtonRow>
              <ToggleButton 
                active={toggleStates.mute}
                onClick={() => toggleState('mute')}
                iconName={toggleStates.mute ? "VolumeMute" : "VolumeUp"}
                iconOnly
                rounded
              />
              
              <ToggleButton 
                active={true}
                iconName="Favorites"
                iconOnly
                variant="filled"
              />
              
              <ToggleButton 
                active={false}
                size="small"
                badgeCount={3}
              >
                ALERTS
              </ToggleButton>
            </ButtonRow>
          </ButtonSection>
          
          <ButtonSection>
            <ButtonLabel>Utility Buttons</ButtonLabel>
            <ButtonRow>
              <UtilityButton 
                active={activeUtility === 'solo'}
                onClick={() => setActiveUtility('solo')}
                status="success"
              >
                SOLO
              </UtilityButton>
              
              <UtilityButton 
                active={activeUtility === 'mute'}
                onClick={() => setActiveUtility('mute')}
                status="warning"
              >
                MUTE
              </UtilityButton>
              
              <UtilityButton 
                active={activeUtility === 'bypass'}
                onClick={() => setActiveUtility('bypass')}
                status="info"
              >
                BYPASS
              </UtilityButton>
            </ButtonRow>
            
            <ButtonRow>
              <UtilityButton 
                active={true}
                status="error"
                pulsing
              >
                CLIP
              </UtilityButton>
              
              <UtilityButton 
                iconName="VolumeUp"
                value="-3dB"
              >
                LEVEL
              </UtilityButton>
              
              <UtilityButton 
                compact
                showIndicator
                status="success"
              >
                ON
              </UtilityButton>
              
              <UtilityButton 
                iconOnly
                iconName="WaveformIcon"
                status="info"
              />
            </ButtonRow>
          </ButtonSection>
        </ButtonGrid>
      </div>
    </DemoContainer>
  );
};

export default ButtonDemo;