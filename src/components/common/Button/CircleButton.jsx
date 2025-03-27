import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import Icon from '../Icon';

// Ripple animation for click effect
const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

// Subtle floating animation
const float = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
`;

// Container for the button
const CircleButtonContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => {
    switch (size) {
      case 'xs': return '32px';
      case 'sm': return '40px';
      case 'lg': return '60px';
      case 'xl': return '80px';
      default: return '48px'; // Medium (default)
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'xs': return '32px';
      case 'sm': return '40px';
      case 'lg': return '60px';
      case 'xl': return '80px';
      default: return '48px'; // Medium (default)
    }
  }};
  border-radius: 50%;
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary': return theme.colors.brand.primary;
      case 'secondary': return theme.colors.brand.secondary;
      case 'error': return theme.colors.brand.error;
      case 'warning': return theme.colors.brand.warning;
      case 'ghost': return 'transparent';
      case 'dark': return theme.colors.surface.darker;
      default: return theme.colors.brand.primary;
    }
  }};
  color: ${({ variant, theme }) => {
    // For main color variants, text is usually dark
    if (['primary', 'secondary', 'error', 'warning'].includes(variant)) {
      return '#000';
    }
    // For transparent or dark variants, use theme text colors
    return variant === 'ghost' ? theme.colors.text.primary : theme.colors.text.primary;
  }};
  border: ${({ variant, theme }) => {
    if (variant === 'ghost') {
      return `1px solid ${theme.colors.border.secondary}`;
    }
    return 'none';
  }};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;
  box-shadow: ${({ elevated, theme }) => 
    elevated ? theme.shadows.md : 'none'};
  
  /* Hover states */
  &:hover {
    background-color: ${({ variant, theme }) => {
      switch (variant) {
        case 'primary': return 'rgba(145, 242, 145, 0.8)';
        case 'secondary': return 'rgba(93, 125, 242, 0.8)';
        case 'error': return 'rgba(242, 85, 90, 0.8)';
        case 'warning': return 'rgba(242, 203, 5, 0.8)';
        case 'ghost': return 'rgba(255, 255, 255, 0.05)';
        case 'dark': return 'rgba(0, 0, 0, 0.6)';
        default: return 'rgba(145, 242, 145, 0.8)';
      }
    }};
    transform: ${({ floating }) => floating ? 'scale(1.05)' : 'none'};
    box-shadow: ${({ variant, elevated, theme }) => {
      if (variant === 'ghost' && !elevated) return 'none';
      return theme.shadows.md;
    }};
  }
  
  /* Active state */
  &:active {
    transform: scale(0.95);
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  /* Animated floating effect */
  ${({ floating }) => floating && css`
    animation: ${float} 3s ease-in-out infinite;
  `}
  
  /* Ripple effect container */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
  }
  
  /* Ripple animation on click */
  &.rippling::after {
    animation: ${ripple} 0.6s ease-out;
  }
`;

// Inner container for content with optional highlight ring
const ButtonInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  
  /* Optional glowing ring effect */
  ${({ ringColor }) => ringColor && css`
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      border: 2px solid ${ringColor};
      opacity: 0.7;
      pointer-events: none;
    }
  `}
`;

/**
 * CircleButton Component - Circular button commonly used for media controls
 * 
 * @param {Object} props - Component props
 * @param {string} props.iconName - Name of icon to display
 * @param {string} props.size - Button size: 'xs', 'sm', 'md' (default), 'lg', or 'xl'
 * @param {string} props.variant - Button style: 'primary' (default), 'secondary', 'error', 'warning', 'ghost', or 'dark'
 * @param {boolean} props.elevated - Whether to add elevation shadow 
 * @param {boolean} props.floating - Whether to add floating animation
 * @param {string} props.ringColor - Optional color for highlight ring around button
 * @param {function} props.onClick - Click handler
 * @param {string} props.ariaLabel - Accessibility label (required)
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 */
const CircleButton = ({
  children,
  iconName,
  size = 'md',
  variant = 'primary',
  elevated = false,
  floating = false,
  ringColor,
  onClick,
  ariaLabel,
  className,
  style,
  ...props
}) => {
  // Ref for ripple effect
  const buttonRef = React.useRef(null);
  
  // Calculate icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'xs': return '16px';
      case 'sm': return '20px';
      case 'lg': return '32px';
      case 'xl': return '40px';
      default: return '24px'; // Medium
    }
  };
  
  // Handle click with ripple effect
  const handleClick = (event) => {
    if (buttonRef.current) {
      // Add and remove ripple class for animation
      buttonRef.current.classList.add('rippling');
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.remove('rippling');
        }
      }, 600);
    }
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(event);
    }
  };
  
  return (
    <CircleButtonContainer
      ref={buttonRef}
      size={size}
      variant={variant}
      elevated={elevated}
      floating={floating}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={className}
      style={style}
      {...props}
    >
      <ButtonInner ringColor={ringColor}>
        {iconName ? (
          <Icon
            name={iconName}
            size={getIconSize()}
            color="currentColor"
          />
        ) : (
          children
        )}
      </ButtonInner>
    </CircleButtonContainer>
  );
};

export default CircleButton;