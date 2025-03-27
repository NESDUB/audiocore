import React from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

/**
 * Primary button component for AudioCore
 * Used for main actions and primary call-to-actions
 */

// Base button styles
const StyledButton = styled.button`
  /* Structure */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ size, theme }) => 
    size === 'small' ? `${theme.spacing.xs} ${theme.spacing.sm}` :
    size === 'large' ? `${theme.spacing.sm} ${theme.spacing.lg}` :
    `${theme.spacing.sm} ${theme.spacing.md}`
  };
  
  /* Typography */
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  font-size: ${({ size, theme }) => 
    size === 'small' ? theme.typography.sizes.xs :
    size === 'large' ? theme.typography.sizes.md :
    theme.typography.sizes.sm
  };
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 1px;
  
  /* Visual styling */
  background-color: ${({ variant, theme }) => 
    variant === 'filled' ? theme.colors.brand.primary :
    variant === 'alternate' ? 'rgba(145, 242, 145, 0.1)' :
    'transparent'
  };
  color: ${({ variant, theme }) => 
    variant === 'filled' ? '#000' : 
    theme.colors.brand.primary
  };
  border: 1px solid ${({ theme }) => theme.colors.brand.primary};
  border-radius: 4px;
  
  /* Interactive states */
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background-color: ${({ variant, theme }) => 
      variant === 'filled' ? 'rgba(145, 242, 145, 0.8)' :
      variant === 'alternate' ? 'rgba(145, 242, 145, 0.2)' :
      'rgba(145, 242, 145, 0.05)'
    };
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(145, 242, 145, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Icon positioning */
  ${({ iconPosition }) => iconPosition === 'right' && css`
    flex-direction: row-reverse;
  `}
  
  /* Full width option */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
`;

/**
 * Primary Button Component
 * 
 * @param {string} variant - 'outline' (default), 'filled', or 'alternate'
 * @param {string} size - 'small', 'medium' (default), or 'large'
 * @param {string} iconName - Name of the icon to display (optional)
 * @param {string} iconPosition - 'left' (default) or 'right'
 * @param {string} iconSize - Size of the icon (defaults based on button size)
 * @param {boolean} fullWidth - Whether the button should take up full width
 * @param {boolean} disabled - Whether the button is disabled
 * @param {function} onClick - Click handler
 */
const PrimaryButton = ({
  children,
  variant = 'outline',
  size = 'medium',
  iconName,
  iconPosition = 'left',
  iconSize,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className,
  ...props
}) => {
  // Determine icon size based on button size if not specified
  const calculatedIconSize = iconSize || 
    (size === 'small' ? '14px' : 
     size === 'large' ? '20px' : 
     '16px');
  
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      iconPosition={iconPosition}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {iconName && <Icon name={iconName} size={calculatedIconSize} />}
      {children}
    </StyledButton>
  );
};

export default PrimaryButton;