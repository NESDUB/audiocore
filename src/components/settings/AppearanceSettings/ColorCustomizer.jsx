import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../../common/Icon';
import { useTheme } from '../../../features/theme/ThemeProvider';
import { useNotification } from '../../common/Notification';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const ColorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ColorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ColorGroupTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ColorPickerRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} 0;
`;

const ColorLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ColorSwatch = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${({ color }) => color};
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ColorInput = styled.input`
  width: 140px;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.brand.primary}40;
  }
`;

const ColorPickerInput = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: 1px solid ${({ theme }) => theme.colors.border.secondary};
    border-radius: 4px;
  }
  
  &::-moz-color-swatch {
    border: 1px solid ${({ theme }) => theme.colors.border.secondary};
    border-radius: 4px;
  }
`;

const PresetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PresetButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ active, theme }) => 
    active ? theme.colors.surface.darker : 'transparent'};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.brand.primary : theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme, active }) => 
    active ? theme.colors.brand.primary : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const PreviewContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 6px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const PreviewTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const ThemePreview = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  background-color: ${({ colors }) => colors.surface.primary};
`;

const PreviewHeader = styled.div`
  height: 40px;
  background-color: ${({ colors }) => colors.surface.primary};
  border-bottom: 1px solid ${({ colors }) => colors.border.tertiary};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const PreviewTitle2 = styled.div`
  color: ${({ colors }) => colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const PreviewContent = styled.div`
  display: flex;
  height: calc(100% - 40px);
`;

const PreviewSidebar = styled.div`
  width: 160px;
  height: 100%;
  background-color: ${({ colors }) => colors.surface.lighter};
  border-right: 1px solid ${({ colors }) => colors.border.tertiary};
`;

const PreviewSidebarItem = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  color: ${({ colors }) => colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  border-left: 2px solid transparent;
  
  &:nth-child(2) {
    color: ${({ colors }) => colors.text.primary};
    border-color: ${({ colors }) => colors.brand.primary};
    background-color: ${({ colors }) => colors.surface.darker};
  }
`;

const PreviewMain = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const PreviewControl = styled.div`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '20px'};
  background-color: ${({ colors }) => colors.surface.darker};
  border-radius: 3px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${({ progress }) => progress || '0'};
    background-color: ${({ colors }) => colors.brand.primary};
    opacity: 0.6;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const PreviewButton = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ primary, colors }) => 
    primary ? colors.brand.primary : 'transparent'};
  border: 1px solid ${({ primary, colors }) => 
    primary ? colors.brand.primary : colors.border.secondary};
  border-radius: 3px;
  color: ${({ primary, colors }) => 
    primary ? '#000' : colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SaveButton = styled.button`
  background-color: ${({ theme }) => theme.colors.brand.primary};
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.text.primary};
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

// Color theme presets
const presets = {
  audiophile: {
    name: 'Audiophile',
    colors: {
      brand: {
        primary: '#91F291',
        secondary: '#5D7DF2',
        warning: '#F2CB05',
        error: '#F2555A',
      },
      surface: {
        primary: '#0A0A0A',
        darker: 'rgba(0, 0, 0, 0.4)',
        lighter: 'rgba(15, 15, 15, 0.7)',
      },
      text: {
        primary: '#E0E0E0',
        secondary: '#666666',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.1)',
        secondary: '#333333',
        tertiary: '#222222',
      },
    }
  },
  midnight: {
    name: 'Midnight Blue',
    colors: {
      brand: {
        primary: '#64B5F6',
        secondary: '#7986CB',
        warning: '#FFD54F',
        error: '#FF8A65',
      },
      surface: {
        primary: '#0D1B2A',
        darker: 'rgba(10, 20, 30, 0.6)',
        lighter: 'rgba(20, 40, 60, 0.7)',
      },
      text: {
        primary: '#E0E0E0',
        secondary: '#607D8B',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.1)',
        secondary: '#1D3557',
        tertiary: '#121F2E',
      },
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      brand: {
        primary: '#FF9E80',
        secondary: '#FFAB91',
        warning: '#FFD180',
        error: '#FF5252',
      },
      surface: {
        primary: '#121212',
        darker: 'rgba(0, 0, 0, 0.4)',
        lighter: 'rgba(25, 25, 25, 0.7)',
      },
      text: {
        primary: '#FAFAFA',
        secondary: '#9E9E9E',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.1)',
        secondary: '#424242',
        tertiary: '#323232',
      },
    }
  },
  minimalLight: {
    name: 'Minimal Light',
    colors: {
      brand: {
        primary: '#00897B',
        secondary: '#4CAF50',
        warning: '#FBC02D',
        error: '#E53935',
      },
      surface: {
        primary: '#FAFAFA',
        darker: 'rgba(240, 240, 240, 0.7)',
        lighter: 'rgba(255, 255, 255, 0.9)',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
      border: {
        primary: 'rgba(0, 0, 0, 0.1)',
        secondary: '#E0E0E0',
        tertiary: '#EEEEEE',
      },
    }
  }
};

const ColorCustomizer = () => {
  const { theme, isDarkMode, updateTheme } = useTheme();
  const { success } = useNotification();
  
  // State for custom colors
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [customColors, setCustomColors] = useState(() => {
    // Initialize with current theme colors
    const savedColors = localStorage.getItem('audiocore-custom-colors');
    return savedColors ? JSON.parse(savedColors) : {...theme.colors};
  });
  
  // Apply a preset theme
  const applyPreset = (preset) => {
    if (preset === 'custom') {
      // Keep the custom colors
      return;
    }
    
    setSelectedPreset(preset);
    setCustomColors(presets[preset].colors);
  };
  
  // Handle color change
  const handleColorChange = (category, key, value) => {
    setSelectedPreset('custom');
    setCustomColors(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  // Reset to default theme
  const resetToDefault = () => {
    const defaultPreset = isDarkMode ? 'audiophile' : 'minimalLight';
    setSelectedPreset(defaultPreset);
    setCustomColors(presets[defaultPreset].colors);
  };
  
  // Save custom colors
  const saveCustomColors = () => {
    // Save to localStorage
    localStorage.setItem('audiocore-custom-colors', JSON.stringify(customColors));
    
    // Update the theme context
    updateTheme(customColors);
    
    // Show success notification
    success('Color theme saved successfully');
  };
  
  return (
    <Container>
      <SectionTitle>Color Customizer</SectionTitle>
      
      <PresetContainer>
        {Object.keys(presets).map((key) => (
          <PresetButton
            key={key}
            active={selectedPreset === key}
            onClick={() => applyPreset(key)}
          >
            {presets[key].name}
          </PresetButton>
        ))}
        <PresetButton
          active={selectedPreset === 'custom'}
          onClick={() => applyPreset('custom')}
        >
          Custom
        </PresetButton>
      </PresetContainer>
      
      <ColorSection>
        <ColorGroup>
          <ColorGroupTitle>Brand Colors</ColorGroupTitle>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.brand.primary} />
              Primary
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.brand.primary}
                onChange={(e) => handleColorChange('brand', 'primary', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.brand.primary}
                onChange={(e) => handleColorChange('brand', 'primary', e.target.value)}
              />
            </div>
          </ColorPickerRow>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.brand.secondary} />
              Secondary
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.brand.secondary}
                onChange={(e) => handleColorChange('brand', 'secondary', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.brand.secondary}
                onChange={(e) => handleColorChange('brand', 'secondary', e.target.value)}
              />
            </div>
          </ColorPickerRow>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.brand.warning} />
              Warning
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.brand.warning}
                onChange={(e) => handleColorChange('brand', 'warning', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.brand.warning}
                onChange={(e) => handleColorChange('brand', 'warning', e.target.value)}
              />
            </div>
          </ColorPickerRow>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.brand.error} />
              Error
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.brand.error}
                onChange={(e) => handleColorChange('brand', 'error', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.brand.error}
                onChange={(e) => handleColorChange('brand', 'error', e.target.value)}
              />
            </div>
          </ColorPickerRow>
        </ColorGroup>
        
        <ColorGroup>
          <ColorGroupTitle>Surface Colors</ColorGroupTitle>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.surface.primary} />
              Primary
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.surface.primary}
                onChange={(e) => handleColorChange('surface', 'primary', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.surface.primary}
                onChange={(e) => handleColorChange('surface', 'primary', e.target.value)}
              />
            </div>
          </ColorPickerRow>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.surface.darker} />
              Darker
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.surface.darker}
                onChange={(e) => handleColorChange('surface', 'darker', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.surface.darker.replace(/rgba?\(.*,\s*([0-9.]+)\)/, 'rgba(0,0,0,$1)')}
                onChange={(e) => {
                  // Convert hex to rgba with opacity
                  const hex = e.target.value;
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  const rgba = `rgba(${r}, ${g}, ${b}, 0.4)`;
                  handleColorChange('surface', 'darker', rgba);
                }}
              />
            </div>
          </ColorPickerRow>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.surface.lighter} />
              Lighter
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.surface.lighter}
                onChange={(e) => handleColorChange('surface', 'lighter', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.surface.lighter.replace(/rgba?\(.*,\s*([0-9.]+)\)/, 'rgba(0,0,0,$1)')}
                onChange={(e) => {
                  // Convert hex to rgba with opacity
                  const hex = e.target.value;
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  const rgba = `rgba(${r}, ${g}, ${b}, 0.7)`;
                  handleColorChange('surface', 'lighter', rgba);
                }}
              />
            </div>
          </ColorPickerRow>
        </ColorGroup>
        
        <ColorGroup>
          <ColorGroupTitle>Text Colors</ColorGroupTitle>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.text.primary} />
              Primary
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.text.primary}
                onChange={(e) => handleColorChange('text', 'primary', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.text.primary}
                onChange={(e) => handleColorChange('text', 'primary', e.target.value)}
              />
            </div>
          </ColorPickerRow>
          
          <ColorPickerRow>
            <ColorLabel>
              <ColorSwatch color={customColors.text.secondary} />
              Secondary
            </ColorLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ColorInput 
                type="text" 
                value={customColors.text.secondary}
                onChange={(e) => handleColorChange('text', 'secondary', e.target.value)}
              />
              <ColorPickerInput
                type="color"
                value={customColors.text.secondary}
                onChange={(e) => handleColorChange('text', 'secondary', e.target.value)}
              />
            </div>
          </ColorPickerRow>
        </ColorGroup>
      </ColorSection>
      
      <PreviewContainer>
        <PreviewTitle>Theme Preview</PreviewTitle>
        
        <ThemePreview colors={customColors}>
          <PreviewHeader colors={customColors}>
            <PreviewTitle2 colors={customColors}>AudioCore</PreviewTitle2>
          </PreviewHeader>
          
          <PreviewContent>
            <PreviewSidebar colors={customColors}>
              <PreviewSidebarItem colors={customColors}>Home</PreviewSidebarItem>
              <PreviewSidebarItem colors={customColors}>Songs</PreviewSidebarItem>
              <PreviewSidebarItem colors={customColors}>Albums</PreviewSidebarItem>
              <PreviewSidebarItem colors={customColors}>Artists</PreviewSidebarItem>
            </PreviewSidebar>
            
            <PreviewMain>
              <PreviewControl 
                colors={customColors} 
                progress="70%"
              />
              <PreviewControl 
                colors={customColors} 
                height="40px"
              />
              <PreviewControl 
                colors={customColors} 
                height="30px"
                width="70%"
              />
              
              <ButtonRow>
                <PreviewButton 
                  colors={customColors}
                  primary
                >
                  Primary
                </PreviewButton>
                <PreviewButton 
                  colors={customColors}
                >
                  Secondary
                </PreviewButton>
              </ButtonRow>
            </PreviewMain>
          </PreviewContent>
        </ThemePreview>
      </PreviewContainer>
      
      <ActionButtons>
        <ResetButton onClick={resetToDefault}>
          Reset to Default
        </ResetButton>
        <SaveButton onClick={saveCustomColors}>
          <Icon name="Settings" size="16px" />
          Apply Theme
        </SaveButton>
      </ActionButtons>
    </Container>
  );
};

export default ColorCustomizer;