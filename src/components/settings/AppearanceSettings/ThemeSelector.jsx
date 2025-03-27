import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../features/theme/ThemeProvider';
import Icon from '../../common/Icon';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ThemeOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ThemeOption = styled.button`
  flex: 1;
  aspect-ratio: 1.6;
  border-radius: 6px;
  border: 2px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.brand.primary : theme.colors.border.secondary};
  background: ${({ isDark, theme }) => 
    isDark ? theme.colors.surface.primary : '#F5F5F7'};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const OptionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ isDark, theme }) => 
    isDark ? theme.colors.text.primary : '#2A2A2A'};
`;

const OptionIcon = styled.div`
  color: ${({ isDark, isActive, theme }) => {
    if (isActive) {
      return isDark ? theme.colors.brand.primary : '#17B978';
    }
    return isDark ? theme.colors.text.secondary : '#5F6368';
  }};
`;

const ThemePreview = styled.div`
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: ${({ isDark, theme }) => 
    isDark 
      ? 'linear-gradient(to right, #1A1A1A, #2A2A2A)' 
      : 'linear-gradient(to right, #FFFFFF, #F0F0F0)'};
  overflow: hidden;
`;

const PreviewElement = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ isActive, isDark }) => 
    isActive 
      ? (isDark ? '#91F291' : '#17B978') 
      : (isDark ? '#666666' : '#CCCCCC')};
  margin: 0 2px;
`;

const AccentSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ColorOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  border: 2px solid ${({ isSelected, theme }) => 
    isSelected ? theme.colors.brand.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
  }
`;

// Predefined color options
const ACCENT_COLORS = [
  { id: 'green', name: 'Audiophile Green', color: '#91F291', lightColor: '#17B978' },
  { id: 'blue', name: 'Ocean Blue', color: '#5D7DF2', lightColor: '#3F64D9' },
  { id: 'purple', name: 'Cosmic Purple', color: '#9D5DF2', lightColor: '#8344D9' },
  { id: 'orange', name: 'Warm Orange', color: '#F29D52', lightColor: '#D98344' },
  { id: 'red', name: 'Studio Red', color: '#F2555A', lightColor: '#D93438' },
  { id: 'pink', name: 'Neon Pink', color: '#F25D9C', lightColor: '#D9347F' },
  { id: 'teal', name: 'Deep Teal', color: '#5DF2D6', lightColor: '#34D9B9' },
  { id: 'yellow', name: 'Bright Yellow', color: '#F2DA5D', lightColor: '#D9C034' }
];

/**
 * Theme selector component with theme mode and accent color selection
 * 
 * @param {Object} props
 * @param {String} props.selectedTheme - Current theme (dark, light, system)
 * @param {Function} props.onThemeChange - Theme change handler
 * @param {String} props.selectedColor - Current accent color
 * @param {Function} props.onColorChange - Color change handler
 */
const ThemeSelector = ({ 
  selectedTheme = 'dark', 
  onThemeChange, 
  selectedColor = 'green',
  onColorChange 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Handle theme selection
  const handleThemeSelect = (theme) => {
    if (onThemeChange) {
      onThemeChange(theme);
    } else {
      // Direct toggle if no handler provided
      if ((theme === 'dark') !== isDarkMode) {
        toggleTheme();
      }
    }
  };
  
  // Handle color selection
  const handleColorSelect = (colorId) => {
    if (onColorChange) {
      onColorChange(colorId);
    }
  };
  
  return (
    <SelectorContainer>
      {/* Theme options */}
      <ThemeOptions>
        <ThemeOption 
          isDark={true} 
          isActive={selectedTheme === 'dark'} 
          onClick={() => handleThemeSelect('dark')}
          aria-label="Dark theme"
        >
          <OptionIcon isDark={true} isActive={selectedTheme === 'dark'}>
            <Icon name="DarkMode" size="32px" />
          </OptionIcon>
          <OptionTitle isDark={true}>Dark</OptionTitle>
          <ThemePreview isDark={true}>
            {[0, 1, 2, 3, 4].map(i => (
              <PreviewElement 
                key={i} 
                isDark={true} 
                isActive={i === 2} 
              />
            ))}
          </ThemePreview>
        </ThemeOption>
        
        <ThemeOption 
          isDark={false} 
          isActive={selectedTheme === 'light'} 
          onClick={() => handleThemeSelect('light')}
          aria-label="Light theme"
        >
          <OptionIcon isDark={false} isActive={selectedTheme === 'light'}>
            <Icon name="LightMode" size="32px" />
          </OptionIcon>
          <OptionTitle isDark={false}>Light</OptionTitle>
          <ThemePreview isDark={false}>
            {[0, 1, 2, 3, 4].map(i => (
              <PreviewElement 
                key={i} 
                isDark={false} 
                isActive={i === 2} 
              />
            ))}
          </ThemePreview>
        </ThemeOption>
      </ThemeOptions>
      
      {/* Accent color options */}
      <AccentSection>
        <SectionTitle>Accent color</SectionTitle>
        <ColorOptions>
          {ACCENT_COLORS.map(colorOption => (
            <ColorOption 
              key={colorOption.id}
              color={isDarkMode ? colorOption.color : colorOption.lightColor}
              isSelected={selectedColor === colorOption.id}
              onClick={() => handleColorSelect(colorOption.id)}
              title={colorOption.name}
              aria-label={colorOption.name}
            />
          ))}
        </ColorOptions>
      </AccentSection>
    </SelectorContainer>
  );
};

export default ThemeSelector;