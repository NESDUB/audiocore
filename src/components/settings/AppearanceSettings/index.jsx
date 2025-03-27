import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../features/theme/ThemeProvider';
import SettingsSection, { 
  Setting, 
  SettingSelect, 
  SettingCheckbox,
  SettingRange
} from '../SettingsPanel/SettingsSection';
import Icon from '../../common/Icon';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

// Themes option
const themes = [
  { value: 'dark', label: 'Dark (Default)' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Match System' }
];

// Accent color options
const accentColors = [
  { value: 'green', label: 'Audiophile Green' },
  { value: 'blue', label: 'Deep Blue' },
  { value: 'purple', label: 'Cosmic Purple' },
  { value: 'orange', label: 'Warm Orange' },
  { value: 'red', label: 'Studio Red' }
];

// Font options
const fonts = [
  { value: 'inter', label: 'Inter (Default)' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'opensans', label: 'Open Sans' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'system', label: 'System UI' }
];

// Font size options
const fontSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (Default)' },
  { value: 'large', label: 'Large' }
];

// Layout options
const layouts = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'expanded', label: 'Expanded' }
];

// Visualizer type options
const visualizerTypes = [
  { value: 'waveform', label: 'Waveform' },
  { value: 'bars', label: 'Bars' },
  { value: 'spectrum', label: 'Spectrum' },
  { value: 'circular', label: 'Circular' }
];

// Theme preview
const ThemePreview = styled.div`
  width: 100%;
  height: 100px;
  background-color: ${({ theme, themeMode }) => 
    themeMode === 'light' ? '#F5F5F7' : theme.colors.surface.primary};
  border-radius: 6px;
  border: 1px solid ${({ theme, themeMode }) => 
    themeMode === 'light' ? '#E0E0E0' : theme.colors.border.tertiary};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  position: relative;
`;

const PreviewContent = styled.div`
  width: 90%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, themeMode, accentColor }) => {
    const surfaces = {
      light: 'rgba(255, 255, 255, 0.9)',
      dark: 'rgba(15, 15, 15, 0.7)'
    };
    return surfaces[themeMode] || theme.colors.surface.lighter;
  }};
  border-radius: 4px;
  box-shadow: ${({ theme, themeMode }) => 
    themeMode === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : theme.shadows.sm};
`;

const PreviewButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ accentColor, themeMode }) => {
    const colors = {
      green: '#91F291',
      blue: '#5D7DF2',
      purple: '#9D5DF2',
      orange: '#F29D52',
      red: '#F2555A'
    };
    return colors[accentColor] || colors.green;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ themeMode }) => themeMode === 'light' ? '#000' : '#000'};
`;

const PreviewText = styled.div`
  font-size: ${({ fontSize }) => {
    const sizes = {
      small: '12px',
      medium: '14px',
      large: '16px'
    };
    return sizes[fontSize] || sizes.medium;
  }};
  font-family: ${({ fontFamily }) => {
    const families = {
      inter: 'Inter, sans-serif',
      roboto: 'Roboto, sans-serif',
      opensans: '"Open Sans", sans-serif',
      montserrat: 'Montserrat, sans-serif',
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
    return families[fontFamily] || families.inter;
  }};
  color: ${({ theme, themeMode }) => 
    themeMode === 'light' ? '#2A2A2A' : theme.colors.text.primary};
`;

const PreviewControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Color picker
const ColorOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ color }) => {
    const colors = {
      green: '#91F291',
      blue: '#5D7DF2',
      purple: '#9D5DF2',
      orange: '#F29D52',
      red: '#F2555A'
    };
    return colors[color] || colors.green;
  }};
  border: 2px solid ${({ isSelected, color, theme }) => 
    isSelected ? 
      (color === 'green' ? theme.colors.brand.primary : '#FFF') : 
      'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const AppearanceSettings = () => {
  // Theme settings
  const { isDarkMode, toggleTheme } = useTheme();
  const [themeMode, setThemeMode] = useState(isDarkMode ? 'dark' : 'light');
  const [accentColor, setAccentColor] = useState('green');
  
  // Text settings
  const [fontFamily, setFontFamily] = useState('inter');
  const [fontSize, setFontSize] = useState('medium');
  
  // Layout settings
  const [layout, setLayout] = useState('default');
  const [showSidebar, setShowSidebar] = useState(true);
  const [compactHeader, setCompactHeader] = useState(false);
  
  // Visualization settings
  const [visualizerType, setVisualizerType] = useState('waveform');
  const [visualizerSensitivity, setVisualizerSensitivity] = useState(70);
  const [showAlbumArt, setShowAlbumArt] = useState(true);
  const [showWaveform, setShowWaveform] = useState(true);
  
  // Animation settings
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Handle theme change
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setThemeMode(newTheme);
    
    if (newTheme !== 'system') {
      // Only toggle if we're changing to a different theme
      if ((newTheme === 'dark') !== isDarkMode) {
        toggleTheme();
      }
    } else {
      // Match system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark !== isDarkMode) {
        toggleTheme();
      }
    }
  };
  
  // Handle accent color change
  const handleAccentColorChange = (color) => {
    setAccentColor(color);
  };
  
  return (
    <Container>
      <SettingsSection 
        title="Theme Preview" 
        icon="LightMode"
      >
        <ThemePreview themeMode={themeMode}>
          <PreviewContent themeMode={themeMode} accentColor={accentColor}>
            <PreviewText themeMode={themeMode} fontFamily={fontFamily} fontSize={fontSize}>
              AudioCore Player
            </PreviewText>
            <PreviewControls>
              <PreviewButton accentColor={accentColor} themeMode={themeMode}>
                <Icon name="Play" size="16px" />
              </PreviewButton>
            </PreviewControls>
          </PreviewContent>
        </ThemePreview>
      </SettingsSection>
      
      <SettingsSection 
        title="Theme" 
        icon="LightMode"
        description="Customize the appearance of the application."
      >
        <Setting label="Theme Mode">
          <SettingSelect 
            value={themeMode}
            onChange={handleThemeChange}
            options={themes}
          />
        </Setting>
        
        <Setting label="Accent Color">
          <ColorOptions>
            {accentColors.map(color => (
              <ColorOption 
                key={color.value}
                color={color.value}
                isSelected={accentColor === color.value}
                onClick={() => handleAccentColorChange(color.value)}
                title={color.label}
              />
            ))}
          </ColorOptions>
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Text" 
        icon="Albums"
        collapsible
      >
        <Setting label="Font Family">
          <SettingSelect 
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            options={fonts}
          />
        </Setting>
        
        <Setting label="Font Size">
          <SettingSelect 
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            options={fontSizes}
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Layout" 
        icon="Menu"
        collapsible
      >
        <Setting label="Layout Mode">
          <SettingSelect 
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            options={layouts}
          />
        </Setting>
        
        <Setting label="Sidebar">
          <SettingCheckbox 
            id="show-sidebar"
            checked={showSidebar}
            onChange={(e) => setShowSidebar(e.target.checked)}
            label="Show sidebar"
          />
        </Setting>
        
        <Setting label="Header">
          <SettingCheckbox 
            id="compact-header"
            checked={compactHeader}
            onChange={(e) => setCompactHeader(e.target.checked)}
            label="Use compact header"
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Visualizations" 
        icon="WaveformIcon"
        collapsible
      >
        <Setting label="Visualizer Type">
          <SettingSelect 
            value={visualizerType}
            onChange={(e) => setVisualizerType(e.target.value)}
            options={visualizerTypes}
          />
        </Setting>
        
        <Setting label="Visualizer Sensitivity">
          <SettingRange 
            value={visualizerSensitivity}
            onChange={(e) => setVisualizerSensitivity(parseInt(e.target.value))}
            formatValue={(val) => `${val}%`}
          />
        </Setting>
        
        <Setting label="Show Album Art">
          <SettingCheckbox 
            id="show-album-art"
            checked={showAlbumArt}
            onChange={(e) => setShowAlbumArt(e.target.checked)}
            label="Display album artwork"
          />
        </Setting>
        
        <Setting label="Show Waveform">
          <SettingCheckbox 
            id="show-waveform"
            checked={showWaveform}
            onChange={(e) => setShowWaveform(e.target.checked)}
            label="Display audio waveform"
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Animations" 
        icon="Play"
        collapsible
        defaultCollapsed
      >
        <Setting 
          label="Enable Animations" 
          description="Enables smooth transitions and animations throughout the interface."
        >
          <SettingCheckbox 
            id="enable-animations"
            checked={enableAnimations}
            onChange={(e) => setEnableAnimations(e.target.checked)}
            label="Enable animations"
          />
        </Setting>
        
        <Setting 
          label="Reduced Motion" 
          description="Reduces the amount of motion effects for accessibility purposes."
        >
          <SettingCheckbox 
            id="reduced-motion"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            label="Use reduced motion"
          />
        </Setting>
      </SettingsSection>
    </Container>
  );
};

export default AppearanceSettings;