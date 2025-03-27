// Theme system for Audiocore
const themes = {
  dark: {
    // Backgrounds
    bgPrimary: '#0A0A0A',
    bgSecondary: 'rgba(15, 15, 15, 0.8)',
    bgContent: 'rgba(0, 0, 0, 0.4)',
    bgControl: 'rgba(20, 20, 20, 0.7)',
    bgHover: 'rgba(255, 255, 255, 0.05)',
    bgGradientStart: 'rgba(40, 40, 45, 0.3)',
    bgGradientEnd: 'rgba(50, 50, 60, 0.2)',
    // Text
    textPrimary: '#E0E0E0',
    textSecondary: '#888888',
    textDimmed: '#444444',
    textAccent: '#91F291',
    // Accents
    accentPrimary: '#91F291',
    accentWarning: '#F2CB05',
    accentError: '#F2555A',
    accentHighlight: '#5D7DF2',
    // Borders
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    borderLight: '#333333',
    borderMedium: 'rgba(255, 255, 255, 0.1)',
    borderFocus: 'rgba(145, 242, 145, 0.4)',
    // Shadow
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  light: {
    // Backgrounds (Inverted & Adjusted)
    bgPrimary: '#FDFDFD',
    bgSecondary: 'rgba(245, 245, 247, 0.9)',
    bgContent: 'rgba(255, 255, 255, 0.6)',
    bgControl: 'rgba(235, 235, 237, 0.8)',
    bgHover: 'rgba(0, 0, 0, 0.04)',
    bgGradientStart: 'rgba(200, 200, 210, 0.15)',
    bgGradientEnd: 'rgba(210, 210, 220, 0.1)',
    // Text (Inverted)
    textPrimary: '#1A1A1C',
    textSecondary: '#555558',
    textDimmed: '#A0A0A5',
    textAccent: '#008a00',
    // Accents
    accentPrimary: '#00A000',
    accentWarning: '#D9B404',
    accentError: '#D94045',
    accentHighlight: '#4060D9',
    // Borders
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    borderLight: '#D0D0D5',
    borderMedium: 'rgba(0, 0, 0, 0.1)',
    borderFocus: 'rgba(0, 160, 0, 0.4)',
    // Shadow
    shadowColor: 'rgba(100, 100, 110, 0.15)',
  },
};

// Grid layout configuration
const grid = {
  // Base grid units
  unit: '8px',
  
  // Layout grid areas
  areas: {
    app: "'sidebar main' / auto 1fr",
    main: "'content' 'player' / 1fr / 1fr auto",
    sidebar: "'nav' 'library' 'controls' / 1fr / auto 1fr auto",
  },
  
  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  }
};

// Typography system
const typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontFamilyMono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  
  // Font sizes
  sizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },
  
  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Animation and transition timings
const animation = {
  fast: '0.1s',
  normal: '0.2s',
  slow: '0.3s',
  timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// Border radius
const borderRadius = {
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  round: '9999px',
};

// Export theme system
export { themes, grid, typography, animation, borderRadius };
export default themes;