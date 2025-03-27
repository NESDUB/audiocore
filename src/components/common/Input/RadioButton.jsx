import React from 'react';
import styled, { css } from 'styled-components';

// Container for the radio button with label
const RadioContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  position: relative;
`;

// Hide the default radio input
const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
  margin: 0;
  padding: 0;
`;

// Custom radio appearance
const StyledRadio = styled.div`
  width: 18px;
  height: 18px;
  background-color: transparent;
  border: 1px solid ${({ theme, checked }) => 
    checked ? theme.colors.brand.primary : theme.colors.border.secondary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-right: ${({ theme }) => theme.spacing.sm};
  position: relative;
  flex-shrink: 0;
  
  ${({ theme, checked }) => !checked && css`
    &:hover {
      border-color: ${theme.colors.text.secondary};
      background-color: rgba(255, 255, 255, 0.03);
    }
  `}
  
  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.brand.primary};
    opacity: ${({ checked }) => checked ? 1 : 0};
    transform: scale(${({ checked }) => checked ? 1 : 0});
    transition: all ${({ theme }) => theme.transitions.fast};
  }
  
  ${({ error, theme }) => error && css`
    border-color: ${theme.colors.brand.error} !important;
    
    &:focus {
      border-color: ${theme.colors.brand.error};
      box-shadow: 0 0 0 1px ${theme.colors.brand.error + '40'};
    }
  `}
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

// Radio group container
const RadioGroupContainer = styled.div`
  display: flex;
  flex-direction: ${({ row }) => row ? 'row' : 'column'};
  gap: ${({ theme, row }) => row ? theme.spacing.md : theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Radio group label
const GroupLabel = styled.div`
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

/**
 * RadioButton component
 * A styled radio button with custom appearance and label
 */
const RadioButton = ({
  label,
  checked,
  onChange,
  name,
  id,
  value,
  disabled = false,
  error = null,
  className,
  ...props
}) => {
  // Generate an ID if one isn't provided
  const radioId = id || `radio-${name}-${value || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={className}>
      <RadioContainer disabled={disabled}>
        <HiddenRadio
          type="radio"
          id={radioId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          value={value}
          {...props}
        />
        
        <StyledRadio checked={checked} error={!!error} />
        
        {label && <Label htmlFor={radioId}>{label}</Label>}
      </RadioContainer>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

/**
 * RadioGroup component
 * A group of radio buttons with a shared name and group label
 */
export const RadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  name,
  required = false,
  row = false,
  error = null,
  className,
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <div className={className}>
      {label && (
        <GroupLabel required={required}>{label}</GroupLabel>
      )}
      
      <RadioGroupContainer row={row}>
        {options.map((option, index) => {
          const optionValue = option.value !== undefined ? option.value : option;
          const optionLabel = option.label !== undefined ? option.label : option;
          const optionDisabled = option.disabled !== undefined ? option.disabled : false;
          
          return (
            <RadioButton
              key={index}
              label={optionLabel}
              value={optionValue}
              name={name}
              checked={value === optionValue}
              onChange={handleChange}
              disabled={optionDisabled || props.disabled}
              error={index === 0 ? error : null} // Only show error on first radio
              {...props}
            />
          );
        })}
      </RadioGroupContainer>
      
      {error && !options.length && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

export default RadioButton;