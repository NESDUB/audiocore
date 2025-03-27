import React from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

// Container for the select input with label
const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width || '100%'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Label for the select
const SelectLabel = styled.label`
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

// Wrapper for the select to handle custom styling
const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Custom select element
const StyledSelect = styled.select`
  width: 100%;
  background-color: ${({ theme, variant }) => 
    variant === 'filled' ? theme.colors.surface.primary : 'transparent'};
  border: ${({ theme, variant }) => 
    variant === 'filled' ? 'none' : `1px solid ${theme.colors.border.secondary}`};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-right: 32px; /* Space for the arrow */
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  appearance: none; /* Remove default arrow */
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.brand.primary + '40'};
    
    ${({ variant, theme }) => variant === 'filled' && css`
      box-shadow: 0 1px 0 0 ${theme.colors.brand.primary};
    `}
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
  
  /* Style for the dropdown options */
  option {
    background-color: ${({ theme }) => theme.colors.surface.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 8px;
  }
`;

// Custom arrow icon
const SelectArrow = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform ${({ theme }) => theme.transitions.fast};
  
  ${({ open }) => open && css`
    transform: rotate(180deg);
  `}
`;

// Error message display
const ErrorMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.brand.error};
  margin-top: 4px;
`;

// Helper text below the select
const HelperText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`;

/**
 * SelectInput component
 * A styled select dropdown with custom arrow and styling
 */
const SelectInput = ({
  label,
  placeholder,
  value,
  onChange,
  options = [],
  name,
  id,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  variant = 'outlined',
  width,
  className,
  ...props
}) => {
  // Generate an ID if one isn't provided
  const selectId = id || `select-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <SelectContainer width={width} className={className}>
      {label && (
        <SelectLabel htmlFor={selectId} required={required}>
          {label}
        </SelectLabel>
      )}
      
      <SelectWrapper>
        <StyledSelect
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          error={!!error}
          variant={variant}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option, index) => {
            const value = option.value !== undefined ? option.value : option;
            const label = option.label !== undefined ? option.label : option;
            
            return (
              <option key={index} value={value}>
                {label}
              </option>
            );
          })}
        </StyledSelect>
        
        <SelectArrow>
          <Icon name="Expand" size="16px" />
        </SelectArrow>
      </SelectWrapper>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </SelectContainer>
  );
};

export default SelectInput;