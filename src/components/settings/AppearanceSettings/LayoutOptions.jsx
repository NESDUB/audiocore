import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePlayer } from './features/player/providers/PlayerProvider';
import TransportControls from './components/player/TransportControls';
import ProgressControls from './components/player/ProgressControls';
import AudioVisualizer from './components/audio/AudioVisualizer';
import AlbumArtDisplay from './components/player/AlbumArtDisplay';
import LibraryBrowser from './components/player/LibraryBrowser';
import Sidebar from './components/layout/Sidebar';
import ShortcutsDialog from './components/common/ShortcutsDialog';
import useKeyboardShortcuts from './features/shortcuts/useKeyboardShortcuts';
import Icon from './components/common/Icon';
import { SecondaryButton } from './components/common/Button';
import { useNotification } from './components/common/Notification';
import NowPlaying from './components/player/NowPlaying';
import VolumeControl from './components/audio/VolumeControl';

// Main app container with dark theme background
const AppContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

// Subtle radial gradient background
const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 30% 30%,
    ${({ theme }) => theme.colors.background.gradient1},
    transparent 70%
  ),
  radial-gradient(
    circle at 70% 80%,
    ${({ theme }) => theme.colors.background.gradient2},
    transparent 70%
  );
  z-index: 0;
  pointer-events: none;
`;

// App header with title and controls
const Header = styled.header`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  position: relative;
  z-index: 1;
  background-color: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(10px);
`;

const HeaderTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 1px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.brand.primary : theme.colors.brand.warning};
  
  ${({ active }) => active && `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
  `}
`;

const HeaderButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  padding: 6px 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  letter-spacing: 0.5px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.darker};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.primary};
  }
`;

// Main content area (sidebar + content)
const Main = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

// Content area (everything except sidebar)
const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

// Player section at the top
const PlayerSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: ${({ theme }) => theme.spacing.md};
`;

// The player content when in standard view (not NowPlaying)
const PlayerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

// Top row of the player (artwork and visualizer)
const PlayerTopRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
  }
`;

// Album artwork area with proper sizing
const ArtworkArea = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  
  @media (max-width: 992px) {
    width: 260px;
    height: 260px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

// Visualizer area with flexible width
const VisualizerArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 992px) {
    width: 100%;
    min-height: 200px;
  }
`;

// Bottom row containing all controls
const ControlsArea = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

// Progress and transport controls
const MainControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Additional controls (volume, etc.)
const AdditionalControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

// Library section below the player
const LibrarySection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 8px;
  overflow: hidden;
  min-height: 0; /* Important for proper flexbox overflow */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

// Footer at the bottom
const Footer = styled.footer`
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  position: relative;
  z-index: 1;
  background-color: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(10px);
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
`;

const BuildInfo = styled.div`
  letter-spacing: 0.5px;
`;

const FooterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ShortcutsButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

function App() {
  const { isInitialized, isPlaying } = usePlayer();
  const { success } = useNotification();
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Show shortcuts dialog when ? key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setShowShortcutsDialog(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Show welcome notification
  useEffect(() => {
    if (isInitialized) {
      success('Welcome to AudioCore Player', {
        title: 'Ready to Play',
        autoClose: true,
        duration: 3000
      });
    }
  }, [isInitialized]);

  return (
    <AppContainer>
      <BackgroundGradient />

      {/* Header */}
      <Header>
        <HeaderTitle>AUDIOCORE</HeaderTitle>

        <HeaderControls>
          <StatusIndicator>
            ENGINE
            <StatusDot active={isInitialized} />
            {isInitialized ? 'READY' : 'INITIALIZING'}
          </StatusIndicator>

          <HeaderButton onClick={() => setShowNowPlaying(prev => !prev)}>
            <Icon name="Settings" size="14px" />
            {showNowPlaying ? "Show Visualizer" : "Now Playing"}
          </HeaderButton>

          <HeaderButton onClick={() => setShowShortcutsDialog(true)}>
            <Icon name="Settings" size="14px" />
            Keyboard Shortcuts
          </HeaderButton>
        </HeaderControls>
      </Header>

      {/* Main Content */}
      <Main>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <Content>
          {/* Player Section */}
          <PlayerSection>
            {showNowPlaying ? (
              <NowPlaying />
            ) : (
              <PlayerContent>
                <PlayerTopRow>
                  {/* Album Artwork */}
                  <ArtworkArea>
                    <AlbumArtDisplay size="100%" />
                  </ArtworkArea>

                  {/* Visualizer */}
                  <VisualizerArea>
                    <AudioVisualizer />
                  </VisualizerArea>
                </PlayerTopRow>
                
                <ControlsArea>
                  <MainControls>
                    <ProgressControls />
                    <TransportControls />
                  </MainControls>
                  
                  <AdditionalControls>
                    <VolumeControl alwaysExpanded showValue width="180px" />
                    <SecondaryButton>
                      <Icon name="Equalizer" size="14px" />
                      Equalizer
                    </SecondaryButton>
                  </AdditionalControls>
                </ControlsArea>
              </PlayerContent>
            )}
          </PlayerSection>

          {/* Library Section */}
          <LibrarySection>
            <LibraryBrowser />
          </LibrarySection>
        </Content>
      </Main>

      {/* Footer */}
      <Footer>
        <StatusInfo>
          <div>CPU: {isPlaying ? '12%' : '0%'}</div>
          <div>MEMORY: {isPlaying ? '142MB' : '64MB'}</div>
        </StatusInfo>

        <FooterControls>
          <ShortcutsButton onClick={() => setShowShortcutsDialog(true)}>
            <Icon name="Settings" size="12px" />
            Keyboard Shortcuts
          </ShortcutsButton>

          <BuildInfo>
            AUDIOCORE ENGINE v0.1.0
          </BuildInfo>
        </FooterControls>
      </Footer>

      {/* Shortcuts Dialog */}
      <ShortcutsDialog
        isOpen={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
    </AppContainer>
  );
}

export default App;