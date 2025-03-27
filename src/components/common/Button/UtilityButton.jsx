import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import Icon from '../Icon';

// Pulse animation for active state
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(145, 242, 145, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(145, 242, 145, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(145, 242, 145, 0);
  }
`;

// Base utility button container
const UtilityButtonContainer = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme, compact }) => compact ? theme.spacing.xs : theme.spacing.sm};
  background-color: transparent;
  color: ${({ active, theme }) => 
    active ? theme.colors.text.primary : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.border.primary : theme.colors.border.secondary};
  border-radius: 3px;
  padding: ${({ compact }) => compact ? '4px 8px' : '6px 12px'};
  font-size: ${({ theme, compact }) => 
    compact ? theme.typography.sizes.xs : theme.typography.sizes.sm};
  letter-spacing: 1px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;
  
  /* Color accent on the left */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background-color: ${({ theme, status }) => {
      switch (status) {
        case 'success': return theme.colors.brand.primary;
        case 'warning': return theme.colors.brand.warning;
        case 'error': return theme.colors.brand.error;
        case 'info': return theme.colors.brand.secondary;
        default: return theme.colors.brand.primary;
      }
    }};
    opacity: ${({ active }) => active ? 1 : 0.4};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }
  
  /* Hover state */
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: rgba(255, 255, 255, 0.03);
    border-color: ${({ theme, active }) => 
      active ? theme.colors.brand.primary : theme.colors.border.primary};
    
    &::before {
      opacity: 1;
    }
  }
  
  /* Active state */
  ${({ active, theme, status, pulsing }) => active && css`
    background-color: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.colors.brand.primary};
    
    /* Different shadow colors based on status */
    box-shadow: 0 0 4px ${() => {
      switch (status) {
        case 'success': return `${theme.colors.brand.primary}4D`;
        case 'warning': return `${theme.colors.brand.warning}4D`;
        case 'error': return `${theme.colors.brand.error}4D`;
        case 'info': return `${theme.colors.brand.secondary}4D`;
        default: return `${theme.colors.brand.primary}4D`;
      }
    }};
    
    /* Pulsing animation for active state when pulsing is enabled */
    ${pulsing && css`
      animation: ${pulse} 2s infinite;
    `}
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &::before {
      opacity: 0.2;
    }
    
    &:hover {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text.secondary};
      border-color: ${({ theme }) => theme.colors.border.secondary};
      box-shadow: none;
    }
  }
`;

// Additional styles for icon-only variant
const IconOnlyButton = styled(UtilityButtonContainer)`
  padding: ${({ compact }) => compact ? '4px' : '6px'};
  min-width: ${({ compact }) => compact ? '24px' : '32px'};
  min-height: ${({ compact }) => compact ? '24px' : '32px'};
  justify-content: center;
`;

// Label with optional small indicator
const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Small indicator dot for subtle status indication
const StatusIndicator = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'success': return theme.colors.brand.primary;
      case 'warning': return theme.colors.brand.warning;
      case 'error': return theme.colors.brand.error;
      case 'info': return theme.colors.brand.secondary;
      default: return theme.colors.text.secondary;
    }
  }};
`;

// Value display (for numeric indicators)
const ValueDisplay = styled.div`
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  font-size: ${({ theme, compact }) => 
    compact ? '9px' : theme.typography.sizes.xs};
  padding: 1px 4px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  margin-left: auto;
`;

/**
 * Utility Button Component - For functional controls in audio interfaces
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether the button is in active state
 * @param {function} props.onClick - Click handler
 * @param {string} props.status - Status type: 'success', 'warning', 'error', 'info'
 * @param {boolean} props.compact - Whether to use compact sizing
 * @param {boolean} props.pulsing - Whether to use pulsing animation when active
 * @param {string} props.iconName - Name of icon to display
 * @param {string} props.iconPosition - Position of icon: 'left' (default) or 'right'
 * @param {boolean} props.iconOnly - Whether to show only the icon
 * @param {boolean} props.showIndicator - Whether to show small status indicator
 * @param {number|string} props.value - Optional value to display (e.g. for dB level)
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 */
const UtilityButton = ({
  active = false,
  onClick,
  children,
  status = 'success',
  compact = false,
  pulsing = false,
  iconName,
  iconPosition = 'left',
  iconOnly = false,
  showIndicator = false,
  value,
  className,
  style,
  ...props
}) => {
  // Icon size based on button size
  const iconSize = compact ? '14px' : '16px';
  
  // Use different button container for icon-only variant
  const ButtonComponent = iconOnly ? IconOnlyButton : UtilityButtonContainer;
  
  return (
    <ButtonComponent
      active={active}
      status={status}
      compact={compact}
      pulsing={pulsing}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {/* Left-positioned icon */}
      {iconName && iconPosition === 'left' && (
        <Icon
          name={iconName}
          size={iconSize}
          color="currentColor"
        />
      )}
      
      {/* Main content - not shown for icon-only variant */}
      {!iconOnly && (
        <>
          <Label>
            {showIndicator && <StatusIndicator status={status} />}
            {children}
          </Label>
          
          {/* Value display, if provided */}
          {value !== undefined && (
            <ValueDisplay compact={compact}>{value}</ValueDisplay>
          )}
        </>
      )}
      
      {/* Right-positioned icon */}
      {iconName && iconPosition === 'right' && (
        <Icon
          name={iconName}
          size={iconSize}
          color="currentColor"
        />
      )}
    </ButtonComponent>
  );
};

export default UtilityButton;