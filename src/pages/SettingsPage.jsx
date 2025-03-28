import React, { useState } from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel'; // Assuming Panel is used elsewhere or can be removed if not
import { useLibrary } from '../features/library/providers/LibraryProvider';
import { useTheme } from '../features/theme/ThemeProvider';
import { Settings, Palette, Sliders, Database, Wifi, FolderOpen, Shield, Bell, Volume2, Download, HardDrive, XCircle } from 'lucide-react'; // Added XCircle

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
  width: 100%; // Ensure button takes full width
  border: none; // Remove default button border
  cursor: pointer; // Ensure cursor is pointer

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
  display: flex; // Added for flex layout
  flex-direction: column; // Stack header and body vertically
`;

const ContentHeader = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
  flex-shrink: 0; // Prevent header from shrinking
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
  overflow-y: auto; // Allow content body to scroll if needed
  flex-grow: 1; // Allow body to take remaining space
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
  gap: var(--spacing-md); // Add gap between label and control
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; // Allow label to take available space
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
  flex-shrink: 0; // Prevent input wrapper from shrinking
`;

const Switch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.$checked ? 'var(--accentPrimary)' : 'var(--bgSecondary)'};
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 1px solid var(--borderLight); // Add subtle border

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$checked ? '26px' : '2px'};
    width: 18px; // Slightly smaller handle
    height: 18px; // Slightly smaller handle
    border-radius: 50%;
    background-color: white;
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2); // Add shadow to handle
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
  appearance: none; // Use standard appearance property
  background: linear-gradient(to right, var(--accentPrimary) 0%, var(--accentPrimary) ${props => props.$value}%, var(--bgSecondary) ${props => props.$value}%, var(--bgSecondary) 100%);
  border-radius: 2px;
  outline: none;
  cursor: pointer; // Add pointer cursor

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accentPrimary);
    cursor: pointer;
    border: none;
    margin-top: -6px; // Adjust thumb position vertically
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
  background-color: ${(props) => (props.$primary ? 'var(--accentPrimary)' : 'var(--bgSecondary)')}; // Use secondary bg for non-primary
  color: ${(props) => (props.$primary ? 'black' : 'var(--textPrimary)')};
  border: 1px solid ${(props) => (props.$primary ? 'var(--accentPrimary)' : 'var(--borderLight)')}; // Use accent border for primary
  font-size: 14px;
  font-weight: 500; // Slightly bolder text
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex; // Align icon and text if needed
  align-items: center;
  gap: var(--spacing-xs);

  &:hover:not(:disabled) { // Add :not(:disabled)
    background-color: ${(props) => (props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)')};
    border-color: ${(props) => (props.$primary ? 'var(--accentHighlight)' : 'var(--borderMedium)')}; // Darker border on hover
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Updated FolderPath to be a container
const FolderItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderLight);
  border-radius: 4px;
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
`;

// Renamed FolderPath to FolderPathDisplay
const FolderPathDisplay = styled.div`
  display: flex;
  align-items: center;
  color: var(--textSecondary);
  font-size: 12px;
  font-family: monospace;
  overflow: hidden; // Prevent long paths from overflowing
  text-overflow: ellipsis; // Show ellipsis for long paths
  white-space: nowrap;
  flex-grow: 1; // Allow path to take space
  margin-right: var(--spacing-sm); // Add space before remove button

  svg {
    margin-right: var(--spacing-xs);
    color: var(--textDimmed);
    flex-shrink: 0; // Prevent icon from shrinking
  }
`;

const RemoveFolderButton = styled.button`
  background: none;
  border: none;
  color: var(--textDimmed);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0; // Prevent button from shrinking

  &:hover {
    color: var(--accentError);
    background-color: rgba(242, 85, 90, 0.1);
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
  border: 2px solid ${props => props.$selected ? 'var(--accentPrimary)' : 'transparent'}; // Use accent color for selected border
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease; // Add border transition
  box-shadow: 0 1px 2px rgba(0,0,0,0.1); // Add subtle shadow

  &:hover {
    transform: scale(1.1);
  }

  &:focus {
     outline: 2px solid var(--accentPrimary); // Add focus ring
     outline-offset: 2px;
  }
`;

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('appearance');
  const { state, addFolder, removeFolder, scanLibrary } = useLibrary(); // Correctly destructured removeFolder
  const { theme, themeMode, toggleTheme } = useTheme();

  // State for UI settings (can be moved to context or zustand later)
  const [bufferSize, setBufferSize] = useState(50);
  const [autoPlay, setAutoPlay] = useState(true);
  const [fileFormat, setFileFormat] = useState('flac');
  const [volume, setVolume] = useState(75);
  const [notifications, setNotifications] = useState(true);
  const [cacheLimit, setCacheLimit] = useState(5);
  const [accentColor, setAccentColor] = useState('#91F291'); // Example initial color

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
                          aria-label={`Set accent color to ${color}`} // Accessibility
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
                    <Switch $checked={false} /> {/* Placeholder */}
                  </InputWrapper>
                </SettingRow>

                <SettingRow>
                  <SettingLabel>
                    <LabelText>Show Album Art</LabelText>
                    <LabelDescription>Display album artwork in lists</LabelDescription>
                  </SettingLabel>
                  <InputWrapper>
                    <Switch $checked={true} /> {/* Placeholder */}
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
                      aria-label="Default Volume" // Accessibility
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
                      max="100" // Assuming 100 represents max buffer size in ms
                      value={bufferSize}
                      $value={bufferSize} // Use value directly for percentage if max is 100
                      onChange={(e) => setBufferSize(parseInt(e.target.value, 10))}
                      aria-label="Buffer Size" // Accessibility
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
                      {/* Add dynamic device listing here in a real app */}
                      <option value="speakers">Speakers (Placeholder)</option>
                      <option value="headphones">Headphones (Placeholder)</option>
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
                  {state.folders.length > 0 ? (
                    state.folders.map((folder, index) => (
                      // Use FolderItemContainer and add RemoveFolderButton
                      <FolderItemContainer key={folder.path}> {/* Use path as key */}
                        <FolderPathDisplay title={folder.path}> {/* Add title for full path on hover */}
                          <FolderOpen size={14} />
                          {folder.path}
                        </FolderPathDisplay>
                        <RemoveFolderButton
                          onClick={() => removeFolder(folder.path)}
                          title={`Remove ${folder.path}`}
                          aria-label={`Remove folder ${folder.path}`} // Accessibility
                        >
                          <XCircle size={16} />
                        </RemoveFolderButton>
                      </FolderItemContainer>
                    ))
                  ) : (
                    <div style={{ color: 'var(--textSecondary)', fontSize: '14px', padding: 'var(--spacing-sm)' }}>
                      No folders added. Add music folders to build your library.
                    </div>
                  )}

                  <ButtonRow>
                    <Button onClick={async () => {
                      try {
                        // Dynamically import to potentially reduce initial load
                        const { selectFolder } = await import('../services/FileSystemService');
                        const folderHandle = await selectFolder();

                        if (folderHandle) {
                          // Check if folder already exists (by path/name)
                          if (!state.folders.some(f => f.path === folderHandle.name)) {
                             await addFolder({
                               path: folderHandle.name, // Use name as the path identifier for simplicity here
                               name: folderHandle.name,
                               handle: folderHandle // Keep handle for potential future use (like rescanning)
                             });
                          } else {
                             // Optionally show a notification that the folder is already added
                             console.warn(`Folder "${folderHandle.name}" is already in the library.`);
                          }
                        }
                      } catch (error) {
                        // Handle user cancellation gracefully
                        if (error.name !== 'AbortError') {
                           console.error('Error selecting folder:', error);
                           // Optionally show an error notification to the user
                        }
                      }
                    }}>
                      Add Folder
                    </Button>

                    {/* Removed the generic Remove button */}

                    {state.folders.length > 0 && (
                      <Button $primary onClick={scanLibrary} disabled={state.isScanning}>
                        {state.isScanning ? 'Scanning...' : 'Scan Library'} {/* Improved button text */}
                      </Button>
                    )}
                  </ButtonRow>
                </div>

                {/* --- Progress Bar --- */}
                {state.isScanning && (
                  <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)',
                               backgroundColor: 'var(--bgSecondary)', borderRadius: '4px' }}>
                    <div style={{ marginBottom: 'var(--spacing-xs)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: 'var(--textPrimary)' }}>Scanning...</span>
                      <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>
                        {state.scanProgress} of {state.scanTotal || '?'} files
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bgPrimary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${state.scanTotal > 0 ? (state.scanProgress / state.scanTotal) * 100 : 0}%`, // Prevent division by zero
                          backgroundColor: 'var(--accentPrimary)',
                          transition: 'width 0.3s ease'
                        }}
                        role="progressbar" // Accessibility
                        aria-valuenow={state.scanProgress}
                        aria-valuemin="0"
                        aria-valuemax={state.scanTotal || 0}
                        aria-label="Library scan progress"
                      />
                    </div>
                  </div>
                )}

                {/* --- Error Display --- */}
                {state.error && (
                  <div style={{
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'rgba(242, 85, 90, 0.1)', // Error background
                    color: 'var(--accentError)', // Error text color
                    border: '1px solid rgba(242, 85, 90, 0.2)', // Subtle error border
                    borderRadius: '4px',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '13px' // Slightly smaller font for error
                  }} role="alert"> {/* Accessibility */}
                    {state.error}
                  </div>
                )}

                 <SettingRow>
                   <SettingLabel>
                     <LabelText>Scan on Startup</LabelText>
                     <LabelDescription>Scan library for changes when app starts</LabelDescription>
                   </SettingLabel>
                   <InputWrapper>
                     <Switch $checked={true} /> {/* Placeholder */}
                   </InputWrapper>
                 </SettingRow>

                 <SettingRow>
                   <SettingLabel>
                     <LabelText>Default Format</LabelText>
                     <LabelDescription>Preferred audio file format (for future features)</LabelDescription>
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
                      step="1" // Define step for slider
                      value={cacheLimit}
                      $value={(cacheLimit / 20) * 100} // Calculate percentage for visual fill
                      onChange={(e) => setCacheLimit(parseInt(e.target.value, 10))}
                      aria-label="Cache Limit" // Accessibility
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
                      2.87 GB {/* Placeholder value - should be dynamic */}
                    </div>
                  </InputWrapper>
                </SettingRow>

                <ButtonRow>
                  <Button> {/* Add onClick handler */}
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
              {/* Placeholder for Network Settings Content */}
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
               </SettingSection>
            </ContentBody>
          </>
        );

      // Add placeholders for other sections if needed
      case 'security':
      case 'notifications':
      case 'updates':
         return (
           <>
             <ContentHeader>
               <ContentTitle>
                 {activeSection === 'security' && <Shield size={20} />}
                 {activeSection === 'notifications' && <Bell size={20} />}
                 {activeSection === 'updates' && <Download size={20} />}
                 {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Settings
               </ContentTitle>
               <ContentDescription>
                 Settings for {activeSection} (coming soon).
               </ContentDescription>
             </ContentHeader>
             <ContentBody>
               <p style={{ color: 'var(--textSecondary)' }}>Configuration options for {activeSection} will be available here in a future update.</p>
             </ContentBody>
           </>
         );


      default:
        return (
          <div style={{ padding: 'var(--spacing-md)', color: 'var(--textSecondary)' }}>
            Select a settings section from the sidebar.
          </div>
        );
    }
  };

  const menuItems = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'audio', label: 'Audio', icon: Sliders },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'network', label: 'Network', icon: Wifi },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'updates', label: 'Updates', icon: Download },
  ];

  return (
    <PageContainer>
      <SettingsSidebar>
         <SidebarHeader>
           <Settings size={20} color="var(--accentPrimary)" />
           <SidebarTitle>Settings</SidebarTitle>
         </SidebarHeader>

         <SidebarMenu role="navigation" aria-label="Settings Sections">
           {menuItems.map(item => (
             <MenuItem
               key={item.id}
               $active={activeSection === item.id}
               onClick={() => setActiveSection(item.id)}
               role="menuitem" // Accessibility
               aria-current={activeSection === item.id ? 'page' : undefined} // Accessibility
             >
               <MenuItemIcon><item.icon size={18} /></MenuItemIcon>
               <MenuItemText>{item.label}</MenuItemText>
             </MenuItem>
           ))}
         </SidebarMenu>
      </SettingsSidebar>

      <SettingsContent>
        {renderContent()}
      </SettingsContent>
    </PageContainer>
  );
};

export default SettingsPage;