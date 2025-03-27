import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../features/theme/ThemeProvider';
import Icon from '../Icon';

const SwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SwitchLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 1px;
`;

const SwitchTrack = styled.div`
  position: relative;
  width: 44px;
  height: 22px;
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.brand.primary + '40' : theme.colors.border.tertiary};
  border-radius: 11px;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, isActive }) => 
      isActive ? theme.colors.brand.primary + '60' : theme.colors.border.secondary};
  }
`;

const SwitchThumb = styled.div`
  position: absolute;
  top: 3px;
  left: ${({ isActive }) => isActive ? 'calc(100% - 19px)' : '3px'};
  width: 16px;
  height: 16px;
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.brand.primary : theme.colors.text.secondary};
  border-radius: 50%;
  transition: left ${({ theme }) => theme.transitions.fast},
              background-color ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

// Theme icons that change with the mode
const ThemeIcon = styled.div`
  width: 12px;
  height: 12px;
  color: ${({ dark }) => dark ? '#000' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThemeSwitcher = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <SwitcherContainer>
      <SwitchLabel>{isDarkMode ? 'DARK' : 'LIGHT'}</SwitchLabel>
      <SwitchTrack isActive={isDarkMode} onClick={toggleTheme}>
        <SwitchThumb isActive={isDarkMode}>
          <ThemeIcon dark={isDarkMode}>
            <Icon 
              name={isDarkMode ? 'DarkMode' : 'LightMode'} 
              size="12px"
            />
          </ThemeIcon>
        </SwitchThumb>
      </SwitchTrack>
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;