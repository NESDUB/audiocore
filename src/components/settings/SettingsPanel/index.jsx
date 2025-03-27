import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../../common/Icon';
import AudioSettings from '../AudioSettings';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 6px;
  overflow: hidden;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 220px;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-right: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  padding: ${({ theme }) => theme.spacing.md} 0;
  overflow-y: auto;
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SettingsCategory = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CategoryTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
`;

const SettingsItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  text-align: left;
  cursor: pointer;
  color: ${({ active, theme }) => 
    active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  ${({ active, theme }) => active && `
    background-color: rgba(255, 255, 255, 0.05);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: ${theme.colors.brand.primary};
    }
  `}
`;

const ItemIcon = styled.div`
  margin-right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

// Settings categories and items
const settingsMenu = [
  {
    id: 'playback',
    title: 'Playback',
    items: [
      { id: 'audio', icon: 'VolumeUp', label: 'Audio', component: AudioSettings },
      { id: 'library', icon: 'Songs', label: 'Library', component: null },
      { id: 'visualizer', icon: 'WaveformIcon', label: 'Visualizer', component: null }
    ]
  },
  {
    id: 'interface',
    title: 'Interface',
    items: [
      { id: 'appearance', icon: 'DarkMode', label: 'Appearance', component: null },
      { id: 'layout', icon: 'Home', label: 'Layout', component: null },
      { id: 'controls', icon: 'Play', label: 'Controls', component: null }
    ]
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { id: 'performance', icon: 'Recent', label: 'Performance', component: null },
      { id: 'storage', icon: 'Folder', label: 'Storage', component: null },
      { id: 'backup', icon: 'Recent', label: 'Backup', component: null }
    ]
  }
];

const SettingsPanel = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('audio');
  
  // Find the active section component
  const activeComponent = (() => {
    for (const category of settingsMenu) {
      const item = category.items.find(item => item.id === activeSection);
      if (item && item.component) {
        return item.component;
      }
    }
    return null;
  })();
  
  const ActiveComponent = activeComponent;
  
  return (
    <Container>
      <Header>
        <Title>Settings</Title>
        <CloseButton onClick={onClose}>
          <Icon name="Close" size="20px" />
        </CloseButton>
      </Header>
      
      <Content>
        <Sidebar>
          <SettingsList>
            {settingsMenu.map(category => (
              <SettingsCategory key={category.id}>
                <CategoryTitle>{category.title}</CategoryTitle>
                {category.items.map(item => (
                  <SettingsItem 
                    key={item.id}
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <ItemIcon>
                      <Icon name={item.icon} size="18px" />
                    </ItemIcon>
                    {item.label}
                  </SettingsItem>
                ))}
              </SettingsCategory>
            ))}
          </SettingsList>
        </Sidebar>
        
        <MainContent>
          {ActiveComponent ? <ActiveComponent /> : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: '#666'
            }}>
              <Icon name="Settings" size="48px" opacity="0.3" />
              <div style={{ marginTop: '16px' }}>
                This settings section is not yet implemented
              </div>
            </div>
          )}
        </MainContent>
      </Content>
    </Container>
  );
};

export default SettingsPanel;