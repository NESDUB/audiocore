import React from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

// Base toggle button styles with various visual states
const ToggleButtonContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: ${({ iconPosition }) => 
    iconPosition === 'right' ? 'space-between' : 'flex-start'};
  gap: ${({ theme, iconOnly }) => iconOnly ? '0' : theme.spacing.xs};
  padding: ${({ size, iconOnly }) => {
    if (iconOnly) return '8px';
    switch (size) {
      case 'small': return '4px 8px';
      case 'large': return '8px 16px';
      default: return '6px 12px';
    }
  }};
  background-color: ${({ active, variant, theme }) => {
    if (active) {
      switch (variant) {
        case 'filled':
          return theme.colors.brand.primary;
        case 'outline':
          return 'rgba(145, 242, 145, 0.1)';
        default:
          return 'transparent';
      }
    } else {
      return 'transparent';
    }
  }};
  color: ${({ active, variant, theme }) => {
    if (active) {
      if (variant === 'filled') {
        return '#000';
      }
      return theme.colors.brand.primary;
    }
    return theme.colors.text.secondary;
  }};
  border: 1px solid ${({ active, variant, theme }) => {
    if (active) {
      return variant === 'minimal' ? 'transparent' : theme.colors.brand.primary;
    }
    return variant === 'minimal' ? 'transparent' : theme.colors.border.secondary;
  }};
  border-radius: ${({ rounded }) => rounded ? '50px' : '4px'};
  font-size: ${({ theme, size }) => {
    switch (size) {
      case 'small': return theme.typography.sizes.xs;
      case 'large': return theme.typography.sizes.md;
      default: return theme.typography.sizes.sm;
    }
  }};
  letter-spacing: 1px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  min-width: ${({ iconOnly, size }) => {
    if (iconOnly) {
      switch (size) {
        case 'small': return '24px';
        case 'large': return '40px';
        default: return '32px';
      }
    }
    return 'auto';
  }};
  min-height: ${({ iconOnly, size }) => {
    if (iconOnly) {
      switch (size) {
        case 'small': return '24px';
        case 'large': return '40px';
        default: return '32px';
      }
    }
    return 'auto';
  }};
  
  &:hover {
    background-color: ${({ active, variant, theme }) => {
      if (active) {
        switch (variant) {
          case 'filled':
            return 'rgba(145, 242, 145, 0.8)';
          case 'outline':
            return 'rgba(145, 242, 145, 0.15)';
          default:
            return 'rgba(255, 255, 255, 0.03)';
        }
      } else {
        return 'rgba(255, 255, 255, 0.03)';
      }
    }};
    color: ${({ active, variant, theme }) => {
      if (active) {
        if (variant === 'filled') {
          return '#000';
        }
        return theme.colors.brand.primary;
      }
      return theme.colors.text.primary;
    }};
    border-color: ${({ active, variant, theme }) => {
      if (variant === 'minimal') return 'transparent';
      if (active) return theme.colors.brand.primary;
      return theme.colors.text.primary;
    }};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ variant, theme }) => 
      variant === 'minimal' ? 'transparent' : theme.colors.border.secondary};
    
    &:hover {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text.secondary};
      border-color: ${({ variant, theme }) => 
        variant === 'minimal' ? 'transparent' : theme.colors.border.secondary};
    }
  }
`;

// Indicator dot for toggle state
const ToggleIndicator = styled.span`
  width: ${({ size }) => {
    switch (size) {
      case 'small': return '6px';
      case 'large': return '10px';
      default: return '8px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'small': return '6px';
      case 'large': return '10px';
      default: return '8px';
    }
  }};
  border-radius: 50%;
  background-color: ${({ active, theme }) => 
    active ? theme.colors.brand.primary : 'transparent'};
  border: 1px solid ${({ active, theme }) => 
    active ? theme.colors.brand.primary : theme.colors.text.secondary};
  margin-right: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.fast};
`;

// Optional badge for notification or count
const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.brand.error};
  color: white;
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Toggle Button Component - For controls that have on/off or active/inactive states
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether the button is in active state
 * @param {function} props.onClick - Click handler
 * @param {string} props.variant - Visual style variant: 'outline' (default), 'filled', or 'minimal'
 * @param {string} props.size - Button size: 'small', 'medium' (default), or 'large'
 * @param {boolean} props.rounded - Whether to use rounded corners (pill shape)
 * @param {string} props.iconName - Name of icon to display
 * @param {string} props.iconPosition - Position of icon: 'left' (default) or 'right'
 * @param {boolean} props.iconOnly - Whether to show only the icon
 * @param {string} props.iconSize - Size of icon (defaults based on button size)
 * @param {boolean} props.showIndicator - Whether to show status indicator dot
 * @param {number} props.badgeCount - Number to display in badge (if any)
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 */
const ToggleButton = ({
  active = false,
  onClick,
  children,
  variant = 'outline',
  size = 'medium',
  rounded = false,
  iconName,
  iconPosition = 'left',
  iconOnly = false,
  iconSize,
  showIndicator = false,
  badgeCount,
  className,
  style,
  ...props
}) => {
  // Determine icon size based on button size if not specified
  const getIconSize = () => {
    if (iconSize) return iconSize;
    switch (size) {
      case 'small': return '14px';
      case 'large': return '22px';
      default: return '18px';
    }
  };
  
  return (
    <ToggleButtonContainer
      active={active}
      variant={variant}
      size={size}
      rounded={rounded}
      iconPosition={iconPosition}
      iconOnly={iconOnly}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {/* Badge, if specified */}
      {badgeCount && <Badge>{badgeCount > 99 ? '99+' : badgeCount}</Badge>}
      
      {/* Left-positioned icon */}
      {iconName && iconPosition === 'left' && (
        <Icon
          name={iconName}
          size={getIconSize()}
          color="currentColor"
        />
      )}
      
      {/* Status indicator */}
      {showIndicator && !iconOnly && (
        <ToggleIndicator active={active} size={size} />
      )}
      
      {/* Button text content */}
      {!iconOnly && children}
      
      {/* Right-positioned icon */}
      {iconName && iconPosition === 'right' && (
        <Icon
          name={iconName}
          size={getIconSize()}
          color="currentColor"
        />
      )}
    </ToggleButtonContainer>
  );
};

export default ToggleButton;