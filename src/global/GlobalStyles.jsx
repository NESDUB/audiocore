import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { themes, typography, grid } from '../design-system/theme';

const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  /* Theme CSS Variables */
  :root {
    /* Generate CSS variables from theme */
    ${() => {
      let cssVars = '';
      // Default to dark theme for initial load
      const theme = themes.dark;
      
      Object.entries(theme).forEach(([key, value]) => {
        cssVars += `--${key}: ${value};\n`;
      });
      
      return cssVars;
    }}
    
    /* Grid spacing variables */
    --grid-unit: ${grid.unit};
    --spacing-xs: ${grid.spacing.xs};
    --spacing-sm: ${grid.spacing.sm};
    --spacing-md: ${grid.spacing.md};
    --spacing-lg: ${grid.spacing.lg};
    --spacing-xl: ${grid.spacing.xl};
  }
  
  /* Base HTML elements */
  html, body {
    height: 100%;
    width: 100%;
    font-family: ${typography.fontFamily};
    font-size: ${typography.sizes.md};
    line-height: 1.5;
    color: var(--textPrimary);
    background-color: var(--bgPrimary);
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Root element for React */
  #root {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  /* App layout */
  .app-container {
    display: grid;
    grid-template: ${grid.areas.app};
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  
  /* Main content area */
  .main-content {
    display: grid;
    grid-template: ${grid.areas.main};
    overflow: hidden;
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--bgPrimary);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--borderLight);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--borderMedium);
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${typography.weights.medium};
    letter-spacing: 0.5px;
    color: var(--textPrimary);
  }
  
  /* Focus styles */
  :focus {
    outline: 2px solid var(--borderFocus);
    outline-offset: 2px;
  }
  
  /* Base button reset */
  button {
    background: none;
    border: none;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    cursor: pointer;
  }
  
  /* Grid area class styles */
  .grid-area {
    position: relative;
    border-radius: var(--spacing-sm);
    background-color: var(--bgContent);
    border: 1px solid var(--borderSubtle);
    transition: background-color 0.3s ease;
    box-shadow: 0 2px 6px var(--shadowColor);
    overflow: hidden;
  }
  
  /* Transition classes */
  .transition-all {
    transition: all 0.3s ease;
  }
  
  .transition-opacity {
    transition: opacity 0.3s ease;
  }
  
  .transition-transform {
    transition: transform 0.3s ease;
  }
  
  /* Background gradient effects */
  .bg-gradient {
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
  }
`;

const GlobalStylesWrapper = ({ children }) => {
  return (
    <>
      <GlobalStyles />
      {children}
    </>
  );
};

export default GlobalStylesWrapper;