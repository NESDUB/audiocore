import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import SidebarFooter from './SidebarFooter';
import { useTheme } from '../../../features/theme/ThemeProvider';
import { useNavigation, NAVIGATION_PAGES } from '../../../features/player/providers/NavigationProvider';

// Styled components for Sidebar
const SidebarContainer = styled.aside`
  width: ${(props) => (props.$collapsed ? '40px' : '240px')};
  height: 100%;
  background-color: var(--bgSecondary);
  transition: width 0.3s ease, background-color 0.3s ease;
  overflow: hidden;
  border-right: 1px solid var(--borderSubtle);
  display: flex;
  flex-direction: column;
  z-index: 5;
  grid-area: sidebar;
`;

const SidebarHeader = styled.div`
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  border-bottom: 1px solid var(--borderSubtle);
`;

const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--textSecondary);
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--textPrimary);
  }
`;

const LogoText = styled.span`
  color: var(--textPrimary);
  font-size: 14px;
  letter-spacing: 2px;
  font-weight: 500;
  margin-left: var(--spacing-sm);
  white-space: nowrap;
  opacity: ${(props) => (props.$collapsed ? '0' : '1')};
  transition: opacity 0.2s ease;
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xs);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const { currentPage } = useNavigation();
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarHeader>
        <CollapseButton onClick={toggleCollapsed}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </CollapseButton>
        <LogoText $collapsed={collapsed}>AUDIOCORE</LogoText>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Navigation Section */}
        <SidebarSection title="NAVIGATION" collapsed={collapsed}>
          <SidebarItem 
            icon="Home" 
            label="Home" 
            active={currentPage === NAVIGATION_PAGES.HOME} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.HOME}
          />
          <SidebarItem 
            icon="Search" 
            label="Discover" 
            active={currentPage === NAVIGATION_PAGES.DISCOVER} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.DISCOVER}
          />
          <SidebarItem 
            icon="Music" 
            label="Library" 
            active={currentPage === NAVIGATION_PAGES.LIBRARY} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.LIBRARY}
          />
          <SidebarItem 
            icon="Radio" 
            label="Radio" 
            active={currentPage === NAVIGATION_PAGES.RADIO} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.RADIO}
          />
        </SidebarSection>
        
        {/* Library Section */}
        <SidebarSection title="YOUR LIBRARY" collapsed={collapsed}>
          <SidebarItem 
            icon="Star" 
            label="Favorites" 
            active={currentPage === NAVIGATION_PAGES.FAVORITES} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.FAVORITES}
          />
          <SidebarItem 
            icon="LayoutGrid" 
            label="Albums" 
            active={currentPage === NAVIGATION_PAGES.ALBUMS} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.ALBUMS}
          />
          <SidebarItem 
            icon="PieChart" 
            label="Analytics" 
            active={currentPage === NAVIGATION_PAGES.ANALYTICS} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.ANALYTICS}
          />
          <SidebarItem 
            icon="User" 
            label="Profile" 
            active={currentPage === NAVIGATION_PAGES.PROFILE} 
            collapsed={collapsed}
            navTarget={NAVIGATION_PAGES.PROFILE}
          />
        </SidebarSection>
        
        {/* Playlists Section - Empty placeholder */}
        <SidebarSection title="PLAYLISTS" collapsed={collapsed}>
          <SidebarItem icon="Plus" label="New Playlist" active={false} collapsed={collapsed} />
          {/* Placeholder for playlist items */}
        </SidebarSection>
      </SidebarContent>
      
      <SidebarFooter collapsed={collapsed} />
    </SidebarContainer>
  );
};

export default Sidebar;