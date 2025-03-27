import React from 'react';
import styled from 'styled-components';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Plus, List, BarChart2, Heart, Clock,
  Settings, ChevronDown, ChevronUp, Menu, Home, Search,
  Disc, Radio, PieChart, LayoutGrid, User, Star, Music
} from 'lucide-react';

import GlobalStyles from './global/GlobalStyles';
import ThemeProvider from './features/theme/ThemeProvider';
import NavigationProvider from './features/player/providers/NavigationProvider';
import PlayerProvider from './features/player/providers/PlayerProvider';
import LibraryProvider from './features/library/providers/LibraryProvider';
import Sidebar from './components/layout/Sidebar';
import StatusBar from './components/layout/StatusBar';
import ContentRouter from './components/layout/ContentRouter';
import NowPlaying from './components/player/NowPlaying';

// Main grid layout container
const AppContainer = styled.div`
  display: grid;
  grid-template-areas:
    "sidebar main"
    "sidebar statusbar";
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

// Main content area
const MainContent = styled.main`
  grid-area: main;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "content"
    "player";
  background-image: radial-gradient(
    circle at 30% 30%,
    var(--bgGradientStart),
    transparent 70%
  ),
  radial-gradient(
    circle at 70% 80%,
    var(--bgGradientEnd),
    transparent 70%
  );
`;

// Content area for pages
const ContentArea = styled.div`
  grid-area: content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Player area
const PlayerArea = styled.div`
  grid-area: player;
  height: 280px;
  overflow: hidden;
  padding: var(--spacing-md);
`;

// Status bar wrapper
const StatusBarWrapper = styled.div`
  grid-area: statusbar;
`;

// App component with grid layout
const App = () => {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <LibraryProvider>
          <PlayerProvider>
            <GlobalStyles />
            <AppContainer>
              <Sidebar />

              <MainContent>
                <ContentArea>
                  <ContentRouter />
                </ContentArea>

                <PlayerArea>
                  <NowPlaying />
                </PlayerArea>
              </MainContent>

              <StatusBarWrapper>
                <StatusBar />
              </StatusBarWrapper>
            </AppContainer>
          </PlayerProvider>
        </LibraryProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
};

export default App;