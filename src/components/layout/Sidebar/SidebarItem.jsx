import React from 'react';
import styled from 'styled-components';
import * as LucideIcons from 'lucide-react';
import { useNavigation } from '../../../features/player/providers/NavigationProvider';

const ItemContainer = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  background-color: ${(props) => (props.$active ? 'var(--bgHover)' : 'transparent')};
  color: ${(props) => (props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)')};
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  text-align: left;
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const ItemLabel = styled.span`
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
`;

const SidebarItem = ({ icon, label, active, collapsed, onClick, navTarget }) => {
  // Get navigation context
  const { navigate } = useNavigation();
  
  // Dynamic icon component from lucide-react
  const IconComponent = LucideIcons[icon] || LucideIcons.Circle;

  // Handle click with navigation if navTarget is provided
  const handleClick = () => {
    if (navTarget) {
      navigate(navTarget);
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <ItemContainer $active={active} onClick={handleClick}>
      <IconComponent size={16} />
      <ItemLabel $collapsed={collapsed}>{label}</ItemLabel>
    </ItemContainer>
  );
};

export default SidebarItem;