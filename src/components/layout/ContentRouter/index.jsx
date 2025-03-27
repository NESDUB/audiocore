import React from 'react';
import styled from 'styled-components';
import { useNavigation, NAVIGATION_PAGES } from '../../../features/player/providers/NavigationProvider';

// Import pages
import HomePage from '../../../pages/HomePage';
import DiscoverPage from '../../../pages/DiscoverPage';
import RadioPage from '../../../pages/RadioPage';
import FavoritesPage from '../../../pages/FavoritesPage';
import AlbumsPage from '../../../pages/AlbumsPage';
import AnalyticsPage from '../../../pages/AnalyticsPage';
import ProfilePage from '../../../pages/ProfilePage';
import SettingsPage from '../../../pages/SettingsPage';
import LibraryPage from '../../../pages/LibraryPage';
import AudioVisualizer from '../../audio/AudioVisualizer';

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`;

/**
 * ContentRouter - Renders the appropriate page based on navigation state
 */
const ContentRouter = () => {
  const { currentPage } = useNavigation();

  // Render the appropriate page based on current navigation state
  const renderPage = () => {
    switch (currentPage) {
      case NAVIGATION_PAGES.HOME:
        return <HomePage />;
      case NAVIGATION_PAGES.DISCOVER:
        return <DiscoverPage />;
      case NAVIGATION_PAGES.LIBRARY:
        return <LibraryPage />;
      case NAVIGATION_PAGES.RADIO:
        return <RadioPage />;
      case NAVIGATION_PAGES.FAVORITES:
        return <FavoritesPage />;
      case NAVIGATION_PAGES.ALBUMS:
        return <AlbumsPage />;
      case NAVIGATION_PAGES.ANALYTICS:
        return <AnalyticsPage />;
      case NAVIGATION_PAGES.PROFILE:
        return <ProfilePage />;
      case NAVIGATION_PAGES.SETTINGS:
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ContentContainer>
      {renderPage()}
    </ContentContainer>
  );
};

export default ContentRouter;