import React from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

// Container for the checkbox with label
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  position: relative;
`;

// Hide the default checkbox input
const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
  margin: 0;
  padding: 0;
`;

// Custom checkbox appearance
const StyledCheckbox = styled.div`
  width: 18px;
  height: 18px;
  background-color: ${({ theme, checked }) => 
    checked ? theme.colors.brand.primary : 'transparent'};
  border: 1px solid ${({ theme, checked }) => 
    checked ? theme.colors.brand.primary : theme.colors.border.secondary};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-right: ${({ theme }) => theme.spacing.sm};
  position: relative;
  flex-shrink: 0;
  
  ${({ indeterminate, theme }) => indeterminate && css`
    background-color: ${theme.colors.brand.primary};
    border-color: ${theme.colors.brand.primary};
  `}
  
  ${({ theme, checked, indeterminate }) => !checked && !indeterminate && css`
    &:hover {
      border-color: ${theme.colors.text.secondary};
      background-color: rgba(255, 255, 255, 0.03);
    }
  `}
  
  ${({ error, theme }) => error && css`
    border-color: ${theme.colors.brand.error} !important;
    
    &:focus {
      border-color: ${theme.colors.brand.error};
      box-shadow: 0 0 0 1px ${theme.colors.brand.error + '40'};
    }
  `}
`;

// Check mark or indeterminate indicator
const CheckIcon = styled.div`
  color: ${({ theme }) => theme.colors.surface.primary};
  width: 12px;
  height: 12px;
  
  svg {
    display: block;
  }
`;

// Label text
const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: inherit;
  user-select: none;
`;

// Error message
const ErrorMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.brand.error};
  margin-top: 2px;
  margin-left: 26px;
`;

// Indeterminate line
const IndeterminateLine = styled.div`
  width: 10px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
`;

/**
 * Checkbox component
 * A styled checkbox with custom appearance and label
 */
const Checkbox = ({
  label,
  checked,
  onChange,
  indeterminate = false,
  name,
  id,
  value,
  disabled = false,
  error = null,
  className,
  ...props
}) => {
  // Generate an ID if one isn't provided
  const checkboxId = id || `checkbox-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={className}>
      <CheckboxContainer disabled={disabled}>
        <HiddenCheckbox
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          value={value}
          ref={(input) => {
            if (input) {
              input.indeterminate = indeterminate;
            }
          }}
          {...props}
        />
        
        <StyledCheckbox 
          checked={checked} 
          indeterminate={indeterminate}
          error={!!error}
        >
          {checked && !indeterminate && (
            <CheckIcon>
              <Icon name="Albums" size="12px" />
            </CheckIcon>
          )}
          
          {indeterminate && (
            <IndeterminateLine />
          )}
        </StyledCheckbox>
        
        {label && <Label htmlFor={checkboxId}>{label}</Label>}
      </CheckboxContainer>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

export default Checkbox;