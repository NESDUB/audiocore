import React, { createContext, useContext, useState } from 'react';

// Available navigation pages
export const NAVIGATION_PAGES = {
  HOME: 'home',
  DISCOVER: 'discover',
  LIBRARY: 'library',
  RADIO: 'radio',
  FAVORITES: 'favorites',
  ALBUMS: 'albums',
  ANALYTICS: 'analytics',
  PROFILE: 'profile',
  SETTINGS: 'settings',
};

// Create navigation context
const NavigationContext = createContext({
  currentPage: NAVIGATION_PAGES.HOME,
  navigate: () => {},
  previousPage: null,
  history: [],
});

// Custom hook to use navigation context
export const useNavigation = () => useContext(NavigationContext);

/**
 * NavigationProvider component - manages application navigation state
 */
export const NavigationProvider = ({ children }) => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState(NAVIGATION_PAGES.DISCOVER);
  const [previousPage, setPreviousPage] = useState(null);
  const [history, setHistory] = useState([NAVIGATION_PAGES.DISCOVER]);

  // Navigate to a specific page
  const navigate = (page) => {
    if (page === currentPage) return;

    setPreviousPage(currentPage);
    setCurrentPage(page);

    // Update history (limit to last 10 pages)
    setHistory(prev => {
      const newHistory = [page, ...prev];
      return newHistory.slice(0, 10);
    });
  };

  // Context value
  const value = {
    currentPage,
    previousPage,
    history,
    navigate,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;