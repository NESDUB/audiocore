import React, { useState } from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { useTheme } from '../features/theme/ThemeProvider';
import { Settings, Palette, Sliders, Database, Wifi, FolderOpen, Shield, Bell, Volume2, Download, HardDrive } from 'lucide-react';

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: auto;
  height: 100%;
`;

const SettingsSidebar = styled.div`
  background-color: var(--bgContent);
  border-radius: var(--spacing-sm);
  border: 1px solid var(--borderSubtle);
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const SidebarTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
`;

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  text-align: left;
  background-color: ${props => props.$active ? 'var(--bgHover)' : 'transparent'};
  color: ${props => props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  border-left: 3px solid ${props => props.$active ? 'var(--accentPrimary)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const MenuItemIcon = styled.div`
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuItemText = styled.span`
  font-size: 14px;
`;

const SettingsContent = styled.div`
  background-color: var(--bgContent);
  border-radius: var(--spacing-sm);
  border: 1px solid var(--borderSubtle);
  overflow: hidden;
`;

const ContentHeader = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
`;

const ContentTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    color: var(--accentPrimary);
  }
`;

const ContentDescription = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  margin-top: var(--spacing-xs);
`;

const ContentBody = styled.div`
  padding: var(--spacing-md);
`;

const SettingSection = styled.div`
  margin-bottom: var(--spacing-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--borderSubtle);
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
`;

const LabelText = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
`;

const LabelDescription = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  margin-top: 2px;
`;

const InputWrapper = styled.div`
  min-width: 200px;
`;

const Switch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.$checked ? 'var(--accentPrimary)' : 'var(--bgSecondary)'};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    transition: left 0.2s ease;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderLight);
  border-radius: 4px;
  color: var(--textPrimary);
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: var(--accentPrimary);
  }
  
  option {
    background-color: var(--bgSecondary);
    color: var(--textPrimary);
  }
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: linear-gradient(to right, var(--accentPrimary) 0%, var(--accentPrimary) ${props => props.$value}%, var(--bgSecondary) ${props => props.$value}%, var(--bgSecondary) 100%);
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accentPrimary);
    cursor: pointer;
    border: none;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accentPrimary);
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  text-align: right;
  margin-top: var(--spacing-xs);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
`;

const Button = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 4px;
  background-color: ${(props) => (props.$primary ? 'var(--accentPrimary)' : 'transparent')};
  color: ${(props) => (props.$primary ? 'black' : 'var(--textPrimary)')};
  border: ${(props) => (props.$primary ? 'none' : '1px solid var(--borderLight)')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${(props) => (props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)')};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FolderPath = styled.div`
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderLight);
  border-radius: 4px;
  color: var(--textSecondary);
  font-size: 12px;
  font-family: monospace;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-xs);
    color: var(--textDimmed);
  }
`;

const ColorPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
`;

const ColorSwatch = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: ${props => props.$color};
  border: 2px solid ${props => props.$selected ? 'white' : 'transparent'};
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('appearance');
  const { theme, themeMode, toggleTheme } = useTheme();
  
  // State for UI settings
  const [bufferSize, setBufferSize] = useState(50);
  const [autoPlay, setAutoPlay] = useState(true);
  const [fileFormat, setFileFormat] = useState('flac');
  const [volume, setVolume] = useState(75);
  const [notifications, setNotifications] = useState(true);
  const [cacheLimit, setCacheLimit] = useState(5);
  const [accentColor, setAccentColor] = useState('#91F291');
  
  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <>
            <ContentHeader>
              <ContentTitle>
                <Palette size={20} />
                Appearance Settings
              </ContentTitle>
              <ContentDescription>
                Customize the look and feel of the application
              </ContentDescription>
            </ContentHeader>
            
            <ContentBody>
              <SettingSection>
                <SectionTitle>Theme</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Dark Mode</LabelText>
                    <LabelDescription>Use dark theme for UI elements</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={themeMode === 'dark'} onClick={toggleTheme} />
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Accent Color</LabelText>
                    <LabelDescription>Choose primary accent color</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <ColorPickerGrid>
                      {['#91F291', '#5D7DF2', '#F2CB05', '#F2555A', '#F290D0', '#90CAF2'].map(color => (
                        <ColorSwatch 
                          key={color} 
                          $color={color}
                          $selected={accentColor === color}
                          onClick={() => setAccentColor(color)}
                        />
                      ))}
                    </ColorPickerGrid>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Font Size</LabelText>
                    <LabelDescription>Adjust UI text size</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="medium">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
              
              <SettingSection>
                <SectionTitle>Layout</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Compact Mode</LabelText>
                    <LabelDescription>Reduce spacing in UI elements</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={false} />
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Show Album Art</LabelText>
                    <LabelDescription>Display album artwork in lists</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={true} />
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
            </ContentBody>
          </>
        );
        
      case 'audio':
        return (
          <>
            <ContentHeader>
              <ContentTitle>
                <Volume2 size={20} />
                Audio Settings
              </ContentTitle>
              <ContentDescription>
                Configure playback and audio processing options
              </ContentDescription>
            </ContentHeader>
            
            <ContentBody>
              <SettingSection>
                <SectionTitle>Playback</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Default Volume</LabelText>
                    <LabelDescription>Set initial volume level</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Slider 
                      min="0" 
                      max="100" 
                      value={volume} 
                      $value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value, 10))} 
                    />
                    <SliderValue>{volume}%</SliderValue>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Auto-Play</LabelText>
                    <LabelDescription>Automatically play music when opened</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={autoPlay} onClick={() => setAutoPlay(!autoPlay)} />
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Crossfade</LabelText>
                    <LabelDescription>Smooth transition between tracks</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="2">
                      <option value="0">Off</option>
                      <option value="2">2 seconds</option>
                      <option value="4">4 seconds</option>
                      <option value="6">6 seconds</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
              
              <SettingSection>
                <SectionTitle>Processing</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Buffer Size</LabelText>
                    <LabelDescription>Audio processing buffer size</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Slider 
                      min="0" 
                      max="100" 
                      value={bufferSize} 
                      $value={bufferSize}
                      onChange={(e) => setBufferSize(parseInt(e.target.value, 10))} 
                    />
                    <SliderValue>{bufferSize} ms</SliderValue>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Audio Output</LabelText>
                    <LabelDescription>Select audio output device</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="system">
                      <option value="system">System Default</option>
                      <option value="speakers">Speakers</option>
                      <option value="headphones">Headphones</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Audio Quality</LabelText>
                    <LabelDescription>Playback quality setting</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="high">
                      <option value="low">Low (96 kbps)</option>
                      <option value="medium">Medium (256 kbps)</option>
                      <option value="high">High (320 kbps)</option>
                      <option value="lossless">Lossless</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
            </ContentBody>
          </>
        );
        
      case 'storage':
        return (
          <>
            <ContentHeader>
              <ContentTitle>
                <HardDrive size={20} />
                Storage Settings
              </ContentTitle>
              <ContentDescription>
                Manage file storage and library locations
              </ContentDescription>
            </ContentHeader>
            
            <ContentBody>
              <SettingSection>
                <SectionTitle>Library Locations</SectionTitle>
                
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <FolderPath>
                    <FolderOpen size={14} />
                    C:/Users/username/Music
                  </FolderPath>
                  <FolderPath>
                    <FolderOpen size={14} />
                    D:/Media/Audio/Albums
                  </FolderPath>
                  
                  <ButtonRow>
                    <Button>
                      Add Folder
                    </Button>
                    <Button>
                      Remove
                    </Button>
                  </ButtonRow>
                </div>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Scan on Startup</LabelText>
                    <LabelDescription>Scan library for changes when app starts</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={true} />
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Default Format</LabelText>
                    <LabelDescription>Preferred audio file format</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select 
                      value={fileFormat}
                      onChange={(e) => setFileFormat(e.target.value)}
                    >
                      <option value="mp3">MP3</option>
                      <option value="aac">AAC</option>
                      <option value="flac">FLAC</option>
                      <option value="wav">WAV</option>
                      <option value="ogg">OGG</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
              
              <SettingSection>
                <SectionTitle>Cache Management</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Cache Limit</LabelText>
                    <LabelDescription>Maximum cache storage (GB)</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Slider 
                      min="1" 
                      max="20" 
                      value={cacheLimit} 
                      $value={(cacheLimit / 20) * 100}
                      onChange={(e) => setCacheLimit(parseInt(e.target.value, 10))} 
                    />
                    <SliderValue>{cacheLimit} GB</SliderValue>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Current Cache Size</LabelText>
                    <LabelDescription>Currently used cache storage</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <div style={{ fontSize: '14px', color: 'var(--textPrimary)', textAlign: 'right' }}>
                      2.87 GB
                    </div>
                  </InputWrapper>
                </SettingRow>
                
                <ButtonRow>
                  <Button>
                    Clear Cache
                  </Button>
                </ButtonRow>
              </SettingSection>
            </ContentBody>
          </>
        );
        
      case 'network':
        return (
          <>
            <ContentHeader>
              <ContentTitle>
                <Wifi size={20} />
                Network Settings
              </ContentTitle>
              <ContentDescription>
                Configure network and connection options
              </ContentDescription>
            </ContentHeader>
            
            <ContentBody>
              <SettingSection>
                <SectionTitle>Connectivity</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Proxy Settings</LabelText>
                    <LabelDescription>Configure network proxy</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="none">
                      <option value="none">No Proxy</option>
                      <option value="system">Use System Settings</option>
                      <option value="manual">Manual Configuration</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Download Speed Limit</LabelText>
                    <LabelDescription>Maximum download bandwidth</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="unlimited">
                      <option value="unlimited">Unlimited</option>
                      <option value="1">1 MB/s</option>
                      <option value="2">2 MB/s</option>
                      <option value="5">5 MB/s</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
              
              <SettingSection>
                <SectionTitle>Streaming</SectionTitle>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Stream Quality</LabelText>
                    <LabelDescription>Audio quality for streaming</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Select defaultValue="auto">
                      <option value="auto">Auto (Based on Connection)</option>
                      <option value="low">Low (96 kbps)</option>
                      <option value="medium">Medium (256 kbps)</option>
                      <option value="high">High (320 kbps)</option>
                    </Select>
                  </InputWrapper>
                </SettingRow>
                
                <SettingRow>
                  <SettingLabel>
                    <LabelText>Pre-buffer</LabelText>
                    <LabelDescription>Buffer ahead for smoother playback</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={true} />
                  </InputWrapper>
                </SettingRow>
              </SettingSection>
            </ContentBody>
          </>
        );
        
      default:
        return (
          <div style={{ padding: 'var(--spacing-md)' }}>
            Select a settings section from the sidebar.
          </div>
        );
    }
  };
  
  return (
    <PageContainer>
      <SettingsSidebar>
        <SidebarHeader>
          <Settings size={20} color="var(--accentPrimary)" />
          <SidebarTitle>Settings</SidebarTitle>
        </SidebarHeader>
        
        <SidebarMenu>
          <MenuItem 
            $active={activeSection === 'appearance'} 
            onClick={() => setActiveSection('appearance')}
          >
            <MenuItemIcon>
              <Palette size={18} />
            </MenuItemIcon>
            <MenuItemText>Appearance</MenuItemText>
          </MenuItem>
          
          <MenuItem 
            $active={activeSection === 'audio'} 
            onClick={() => setActiveSection('audio')}
          >
            <MenuItemIcon>
              <Sliders size={18} />
            </MenuItemIcon>
            <MenuItemText>Audio</MenuItemText>
          </MenuItem>
          
          <MenuItem 
            $active={activeSection === 'storage'} 
            onClick={() => setActiveSection('storage')}
          >
            <MenuItemIcon>
              <Database size={18} />
            </MenuItemIcon>
            <MenuItemText>Storage</MenuItemText>
          </MenuItem>
          
          <MenuItem 
            $active={activeSection === 'network'} 
            onClick={() => setActiveSection('network')}
          >
            <MenuItemIcon>
              <Wifi size={18} />
            </MenuItemIcon>
            <MenuItemText>Network</MenuItemText>
          </MenuItem>
          
          <MenuItem 
            $active={activeSection === 'security'} 
            onClick={() => setActiveSection('security')}
          >
            <MenuItemIcon>
              <Shield size={18} />
            </MenuItemIcon>
            <MenuItemText>Security</MenuItemText>
          </MenuItem>
          
          <MenuItem 
            $active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')}
          >
            <MenuItemIcon>
              <Bell size={18} />
            </MenuItemIcon>
            <MenuItemText>Notifications</MenuItemText>
          </MenuItem>
          
          <MenuItem 
            $active={activeSection === 'updates'} 
            onClick={() => setActiveSection('updates')}
          >
            <MenuItemIcon>
              <Download size={18} />
            </MenuItemIcon>
            <MenuItemText>Updates</MenuItemText>
          </MenuItem>
        </SidebarMenu>
      </SettingsSidebar>
      
      <SettingsContent>
        {renderContent()}
      </SettingsContent>
    </PageContainer>
  );
};

export default SettingsPage;