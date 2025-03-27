import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../../design-system/theme';

// Create theme context
const ThemeContext = createContext({
  theme: themes.dark,
  themeMode: 'dark',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from local storage or default to dark
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('audiocoreTheme');
    return savedTheme || 'dark';
  });
  
  // Get current theme object
  const theme = themes[themeMode];
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
  };
  
  // Update local storage when theme changes
  useEffect(() => {
    localStorage.setItem('audiocoreTheme', themeMode);
    
    // Update CSS variables for global theme access
    const root = document.documentElement;
    
    // Apply theme variables to CSS
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Set theme attribute on body for conditional CSS
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode, theme]);
  
  // Provide theme context to children
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        themeMode, 
        setThemeMode, 
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;