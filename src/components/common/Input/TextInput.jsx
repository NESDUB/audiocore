import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

// Container for the input field with optional label
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width || '100%'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Label for the input field
const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  letter-spacing: 1px;
  
  ${({ required }) => required && css`
    &::after {
      content: '*';
      color: ${({ theme }) => theme.colors.brand.error};
      margin-left: 2px;
    }
  `}
`;

// Wrapper for the input to handle icons and appearance
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// The actual input element
const StyledInput = styled.input`
  width: 100%;
  background-color: ${({ theme, variant }) => 
    variant === 'filled' ? theme.colors.surface.primary : 'transparent'};
  border: ${({ theme, variant }) => 
    variant === 'filled' ? 'none' : `1px solid ${theme.colors.border.secondary}`};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  ${({ hasLeftIcon }) => hasLeftIcon && css`
    padding-left: 36px;
  `}
  
  ${({ hasRightIcon }) => hasRightIcon && css`
    padding-right: 36px;
  `}
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.brand.primary + '40'};
    
    ${({ variant, theme }) => variant === 'filled' && css`
      box-shadow: 0 1px 0 0 ${theme.colors.brand.primary};
    `}
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ error, theme }) => error && css`
    border-color: ${theme.colors.brand.error} !important;
    box-shadow: 0 0 0 1px ${theme.colors.brand.error + '40'};
    
    &:focus {
      border-color: ${theme.colors.brand.error};
    }
  `}
`;

// Icon container positioned within the input
const IconContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
  
  ${({ position }) => position === 'left' && css`
    left: ${({ theme }) => theme.spacing.sm};
  `}
  
  ${({ position }) => position === 'right' && css`
    right: ${({ theme }) => theme.spacing.sm};
  `}
  
  ${({ clickable }) => clickable && css`
    cursor: pointer;
    
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `}
`;

// Error message display
const ErrorMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.brand.error};
  margin-top: 4px;
`;

// Helper text below the input
const HelperText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`;

/**
 * Text Input component
 * A styled input field with optional label, helper text, and icons
 */
const TextInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  name,
  id,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  leftIcon = null,
  rightIcon = null,
  onLeftIconClick = null,
  onRightIconClick = null,
  variant = 'outlined',
  width,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate an ID if one isn't provided
  const inputId = id || `input-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <InputContainer width={width} className={className}>
      {label && (
        <InputLabel htmlFor={inputId} required={required}>
          {label}
        </InputLabel>
      )}
      
      <InputWrapper>
        {leftIcon && (
          <IconContainer 
            position="left" 
            clickable={!!onLeftIconClick}
            onClick={onLeftIconClick}
          >
            {typeof leftIcon === 'string' ? (
              <Icon name={leftIcon} size="18px" />
            ) : (
              leftIcon
            )}
          </IconContainer>
        )}
        
        <StyledInput
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          error={!!error}
          variant={variant}
          {...props}
        />
        
        {rightIcon && (
          <IconContainer 
            position="right" 
            clickable={!!onRightIconClick}
            onClick={onRightIconClick}
          >
            {typeof rightIcon === 'string' ? (
              <Icon name={rightIcon} size="18px" />
            ) : (
              rightIcon
            )}
          </IconContainer>
        )}
      </InputWrapper>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </InputContainer>
  );
};

export default TextInput;