import React from 'react';
import styled from 'styled-components';
import { /* ... your icon imports ... */ } from 'lucide-react';

import GlobalStyles from './global/GlobalStyles';
import ThemeProvider from './features/theme/ThemeProvider';
import NavigationProvider from './features/player/providers/NavigationProvider';
import PlayerProvider from './features/player/providers/PlayerProvider';
import LibraryProvider from './features/library/providers/LibraryProvider';
import AudioInit from './features/player/audioinit';
import Sidebar from './components/layout/Sidebar';
import StatusBar from './components/layout/StatusBar';
import ContentRouter from './components/layout/ContentRouter';
import NowPlaying from './components/player/NowPlaying';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ContextMenuProvider } from './features/contextmenu';

// Define key layout variables
const PLAYER_HEIGHT_VAR = '--player-area-height';
const DEFAULT_PLAYER_HEIGHT = '280px';

// Main grid layout container
const AppContainer = styled.div`
  /* Define CSS variables specific to this container's layout */
  --app-grid-cols: auto 1fr;
  --app-grid-rows: 1fr auto;
  /* Define or override potentially global variables */
  ${PLAYER_HEIGHT_VAR}: ${DEFAULT_PLAYER_HEIGHT};

  display: grid;
  grid-template-areas:
    "sidebar main"
    "sidebar statusbar";
  /* Use the defined CSS variables */
  grid-template-columns: var(--app-grid-cols);
  grid-template-rows: var(--app-grid-rows);
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

// Main content area
const MainContent = styled.main`
  /* Define CSS variables specific to this container's layout */
  --main-content-rows: 1fr auto; /* Content area above Player area */

  grid-area: main;
  overflow: hidden; /* Prevent content overflow from breaking layout */
  display: grid;
  grid-template-rows: var(--main-content-rows);
  grid-template-areas:
    "content"
    "player";

  /* Background using assumed global theme variables */
  background-image: radial-gradient(
    circle at 30% 30%,
    var(--bgGradientStart, transparent), /* Added fallback */
    transparent 70%
  ),
  radial-gradient(
    circle at 70% 80%,
    var(--bgGradientEnd, transparent), /* Added fallback */
    transparent 70%
  );
`;

// Content area for pages
const ContentArea = styled.div`
  grid-area: content;
  overflow: auto; /* Allow content scrolling, not hidden */
  display: flex;
  flex-direction: column;
  /* Maybe add padding if needed, using theme variables */
  /* padding: var(--spacing-lg); */
`;

// Player area
const PlayerArea = styled.div`
  grid-area: player;
  /* Use the CSS variable defined higher up (on AppContainer or globally) */
  height: var(${PLAYER_HEIGHT_VAR});
  overflow: hidden; /* Keep player contents contained */
  /* Use assumed global theme variable for padding */
  padding: var(--spacing-md, 1rem); /* Added fallback */
  /* Add a subtle border or background for visual separation if desired */
  /* border-top: 1px solid var(--color-border-subtle, #ffffff1a); */
  /* background-color: var(--color-background-raised, #00000033); */
`;

// Status bar wrapper
const StatusBarWrapper = styled.div`
  grid-area: statusbar;
  /* Optional: Add border/background if needed */
  /* border-top: 1px solid var(--color-border-subtle, #ffffff1a); */
`;

// Error handling callback for monitoring errors
const handleErrorLogging = (error, errorInfo) => {
  // You could send to a logging service here, e.g., Sentry
  console.error('Captured application error:', error);
  console.error('Component stack:', errorInfo.componentStack);
};

// App component with grid layout
const App = () => {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={handleErrorLogging}
    >
      <ThemeProvider>
        {/* AudioInit should be high in the tree to initialize early */}
        <AudioInit>
          <NavigationProvider>
            <LibraryProvider>
              <ErrorBoundary>
                <PlayerProvider>
                  {/* Add ContextMenuProvider here to make it available globally */}
                  <ContextMenuProvider>
                    <GlobalStyles /> {/* Assumed to define global vars like --spacing-md, colors etc. */}
                    <AppContainer>
                      <ErrorBoundary>
                        <Sidebar />
                      </ErrorBoundary>

                      <MainContent>
                        <ContentArea>
                          <ErrorBoundary>
                            <ContentRouter />
                          </ErrorBoundary>
                        </ContentArea>

                        <PlayerArea>
                          <ErrorBoundary>
                            <NowPlaying />
                          </ErrorBoundary>
                        </PlayerArea>
                      </MainContent>

                      <StatusBarWrapper>
                        <ErrorBoundary>
                          <StatusBar />
                        </ErrorBoundary>
                      </StatusBarWrapper>
                    </AppContainer>
                  </ContextMenuProvider>
                </PlayerProvider>
              </ErrorBoundary>
            </LibraryProvider>
          </NavigationProvider>
        </AudioInit>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;