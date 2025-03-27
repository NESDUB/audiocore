import React from 'react';
import styled from 'styled-components';
import * as icons from './icons/Icons';
import * as iconComponents from './icons/index'; // Import from individual icon components

// Styled icon container
const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || '24px'};
  height: ${({ size }) => size || '24px'};
  color: ${({ color, theme }) => color || 'currentColor'};
  opacity: ${({ opacity }) => opacity || 1};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
  
  ${({ clickable }) => clickable && `
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
    }
    
    &:active {
      transform: scale(0.95);
    }
  `}
`;

// Helper function to check if the icon name refers to an individual component
const isIndividualComponent = (name) => {
  return name.endsWith('Icon') && iconComponents[name];
};

// Icon component that renders the right SVG based on name
const Icon = ({ 
  name, 
  size, 
  color, 
  opacity,
  onClick,
  className,
  title,
  ...props 
}) => {
  // First, check if we have an individual component for this icon
  if (isIndividualComponent(name)) {
    const IconComponent = iconComponents[name];
    
    return (
      <IconWrapper 
        size={size} 
        color={color} 
        opacity={opacity}
        className={className}
        clickable={!!onClick}
        onClick={onClick}
        title={title || name}
        {...props}
      >
        <IconComponent 
          size={size} 
          color={color} 
          {...props} 
        />
      </IconWrapper>
    );
  }
  
  // Otherwise, get the SVG component from the consolidated icons
  const IconComponent = icons[name];
  
  // If icon doesn't exist, show placeholder or error
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return (
      <IconWrapper 
        size={size} 
        color={color} 
        opacity={opacity}
        className={className}
        clickable={!!onClick}
        onClick={onClick}
        title={title || name}
        {...props}
      >
        <svg viewBox="0 0 24 24">
          <rect width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="7" y1="7" x2="17" y2="17" stroke="currentColor" strokeWidth="2" />
          <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" strokeWidth="2" />
        </svg>
      </IconWrapper>
    );
  }
  
  // Render the icon
  return (
    <IconWrapper 
      size={size} 
      color={color} 
      opacity={opacity}
      className={className}
      clickable={!!onClick}
      onClick={onClick}
      title={title || name}
      {...props}
    >
      <IconComponent />
    </IconWrapper>
  );
};

export default Icon;