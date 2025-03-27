import React from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

// Base styled button with all the variants
const ButtonContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ variant, theme, active }) => {
    if (variant === 'filled') {
      return active ? theme.colors.brand.primary : 'rgba(255, 255, 255, 0.05)';
    }
    return 'transparent';
  }};
  color: ${({ variant, theme, active }) => {
    if (variant === 'filled' && active) {
      return '#000';
    }
    return active ? theme.colors.brand.primary : theme.colors.text.secondary;
  }};
  border: ${({ variant, theme, active }) => {
    if (variant === 'minimal') {
      return 'none';
    }
    if (variant === 'filled') {
      return active ? `1px solid ${theme.colors.brand.primary}` : `1px solid ${theme.colors.border.secondary}`;
    }
    return active ? `1px solid ${theme.colors.brand.primary}` : `1px solid ${theme.colors.border.secondary}`;
  }};
  border-radius: ${({ shape }) => {
    switch (shape) {
      case 'square': return '0';
      case 'rounded': return '4px';
      case 'circle': return '50%';
      default: return '4px';
    }
  }};
  width: ${({ size }) => {
    switch (size) {
      case 'small': return '28px';
      case 'large': return '44px';
      default: return '36px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'small': return '28px';
      case 'large': return '44px';
      default: return '36px';
    }
  }};
  padding: 0;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;
  
  /* Hover states */
  &:hover {
    background-color: ${({ variant, theme, active }) => {
      if (variant === 'filled') {
        return active ? 'rgba(145, 242, 145, 0.8)' : 'rgba(255, 255, 255, 0.08)';
      }
      return 'rgba(255, 255, 255, 0.03)';
    }};
    color: ${({ variant, theme, active }) => {
      if (variant === 'filled' && active) {
        return '#000';
      }
      return active ? theme.colors.brand.primary : theme.colors.text.primary;
    }};
    border-color: ${({ variant, theme, active }) => {
      if (variant === 'minimal') {
        return 'transparent';
      }
      return active ? theme.colors.brand.primary : theme.colors.text.primary;
    }};
  }
  
  /* Active click state */
  &:active {
    transform: scale(0.95);
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      background-color: ${({ variant }) => variant === 'filled' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
      color: ${({ theme }) => theme.colors.text.secondary};
      border-color: ${({ variant, theme }) => variant === 'minimal' ? 'transparent' : theme.colors.border.secondary};
    }
  }
  
  /* Badge styles */
  ${({ hasBadge }) => hasBadge && css`
    &::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.brand.error};
    }
  `}
  
  /* Tooltip on hover */
  &:hover .icon-tooltip {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Optional tooltip component
const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background-color: rgba(0, 0, 0, 0.8);
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
  }
`;

/**
 * IconButton Component - For buttons that primarily feature icons
 * 
 * @param {Object} props - Component props
 * @param {string} props.iconName - Name of icon to display
 * @param {string} props.size - Button size: 'small', 'medium' (default), or 'large'
 * @param {string} props.variant - Button style: 'outline' (default), 'filled', or 'minimal'
 * @param {string} props.shape - Button shape: 'rounded' (default), 'square', or 'circle'
 * @param {boolean} props.active - Whether the button appears in active state
 * @param {string} props.tooltip - Optional tooltip text
 * @param {boolean} props.badge - Whether to show a notification badge
 * @param {string} props.ariaLabel - Accessibility label (required for icon-only buttons)
 * @param {function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 */
const IconButton = ({
  iconName,
  size = 'medium',
  variant = 'outline',
  shape = 'rounded',
  active = false,
  tooltip,
  badge = false,
  ariaLabel,
  onClick,
  className,
  style,
  ...props
}) => {
  // Calculate icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small': return '16px';
      case 'large': return '24px';
      default: return '20px';
    }
  };
  
  return (
    <ButtonContainer
      size={size}
      variant={variant}
      shape={shape}
      active={active}
      hasBadge={badge}
      onClick={onClick}
      aria-label={ariaLabel || tooltip}
      className={className}
      style={style}
      {...props}
    >
      <Icon 
        name={iconName}
        size={getIconSize()}
        color="currentColor"
      />
      
      {tooltip && (
        <Tooltip className="icon-tooltip">
          {tooltip}
        </Tooltip>
      )}
    </ButtonContainer>
  );
};

export default IconButton;