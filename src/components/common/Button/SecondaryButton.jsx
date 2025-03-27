import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

/**
 * SecondaryButton - A more subtle button style for less prominent actions
 * Follows the AudiophileConsole styling system with transparent background
 * and subtle hover effects
 */
const StyledSecondaryButton = styled.button`
  /* Base styles */
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  letter-spacing: 1px;
  
  /* Sizing and shape */
  border-radius: 4px;
  padding: ${({ size }) => 
    size === 'small' ? '4px 10px' : 
    size === 'large' ? '10px 18px' : 
    '7px 14px'
  };
  min-width: ${({ size }) => 
    size === 'small' ? '60px' : 
    size === 'large' ? '100px' : 
    '80px'
  };
  height: ${({ size }) => 
    size === 'small' ? '28px' : 
    size === 'large' ? '40px' : 
    '34px'
  };
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  /* Interactive states */
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? '0.5' : '1'};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.text.primary};
    background-color: rgba(255, 255, 255, 0.03);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.brand.primary + '40'};
  }
  
  /* Variants */
  ${({ variant, theme }) => variant === 'outline' && `
    border-color: ${theme.colors.brand.primary};
    color: ${theme.colors.brand.primary};
    
    &:hover:not(:disabled) {
      background-color: rgba(145, 242, 145, 0.05);
    }
  `}
  
  ${({ variant, theme }) => variant === 'ghost' && `
    border-color: transparent;
    
    &:hover:not(:disabled) {
      border-color: transparent;
      background-color: rgba(255, 255, 255, 0.05);
    }
  `}
  
  ${({ variant, theme }) => variant === 'text' && `
    border: none;
    background: none;
    padding-left: 0;
    padding-right: 0;
    min-width: auto;
    
    &:hover:not(:disabled) {
      background: none;
      color: ${theme.colors.brand.primary};
    }
  `}
  
  ${({ isActive, theme }) => isActive && `
    border-color: ${theme.colors.brand.primary};
    color: ${theme.colors.brand.primary};
    background-color: rgba(145, 242, 145, 0.05);
  `}
  
  /* Full width option */
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
`;

const SecondaryButton = ({
  children,
  onClick,
  disabled,
  variant,
  size,
  fullWidth,
  isActive,
  type = 'button',
  ...props
}) => {
  return (
    <StyledSecondaryButton
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isActive={isActive}
      type={type}
      {...props}
    >
      {children}
    </StyledSecondaryButton>
  );
};

SecondaryButton.propTypes = {
  /**
   * Button contents
   */
  children: PropTypes.node.isRequired,
  /**
   * Optional click handler
   */
  onClick: PropTypes.func,
  /**
   * Is button disabled?
   */
  disabled: PropTypes.bool,
  /**
   * Button variant
   */
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'text']),
  /**
   * Button size
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * Makes button take up full width of container
   */
  fullWidth: PropTypes.bool,
  /**
   * Is button in active state?
   */
  isActive: PropTypes.bool,
  /**
   * HTML Button type
   */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

SecondaryButton.defaultProps = {
  disabled: false,
  variant: 'default',
  size: 'medium',
  fullWidth: false,
  isActive: false,
  onClick: undefined,
  type: 'button',
};

export default SecondaryButton;