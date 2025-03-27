import React from 'react';
import styled from 'styled-components';
import { Settings } from 'lucide-react';
import { useTheme } from '../../../features/theme/ThemeProvider';
import { useNavigation, NAVIGATION_PAGES } from '../../../features/player/providers/NavigationProvider';

const FooterContainer = styled.div`
  height: 40px;
  border-top: 1px solid var(--borderSubtle);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'space-between')};
`;

const VersionText = styled.span`
  font-size: 10px;
  color: var(--textSecondary);
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
`;

const SettingsButton = styled.button`
  color: var(--textSecondary);
  transition: color 0.2s ease;
  padding: var(--spacing-xs);
  border-radius: 50%;
  
  &:hover {
    color: var(--textPrimary);
    background-color: var(--bgHover);
  }
`;

const ThemeToggle = styled.button`
  background-color: transparent;
  border: 1px solid var(--borderLight);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  color: var(--textSecondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: ${(props) => (props.$collapsed ? 'none' : 'flex')};
  
  &:hover {
    border-color: var(--textSecondary);
  }
`;

const SidebarFooter = ({ collapsed }) => {
  const { themeMode, toggleTheme } = useTheme();
  const { navigate, currentPage } = useNavigation();
  
  const handleSettingsClick = () => {
    navigate(NAVIGATION_PAGES.SETTINGS);
  };
  
  return (
    <FooterContainer $collapsed={collapsed}>
      <VersionText $collapsed={collapsed}>VERSION 1.0.0</VersionText>
      
      {!collapsed && (
        <ThemeToggle $collapsed={collapsed} onClick={toggleTheme}>
          {themeMode === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
        </ThemeToggle>
      )}
      
      <SettingsButton 
        aria-label="Settings" 
        onClick={handleSettingsClick}
        style={{ 
          color: currentPage === NAVIGATION_PAGES.SETTINGS ? 'var(--accentPrimary)' : 'var(--textSecondary)'
        }}
      >
        <Settings size={16} />
      </SettingsButton>
    </FooterContainer>
  );
};

export default SidebarFooter;