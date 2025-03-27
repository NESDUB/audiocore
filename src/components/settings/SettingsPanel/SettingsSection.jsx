import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../../common/Icon';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: ${({ collapsible }) => collapsible ? 'pointer' : 'default'};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  line-height: 1.5;
`;

const ContentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${({ isCollapsed }) => isCollapsed ? '0' : '1000px'};
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns ? `repeat(${columns}, 1fr)` : '1fr'};
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ToggleIcon = styled.div`
  transition: transform 0.3s ease;
  transform: ${({ isCollapsed }) => isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
`;

/**
 * A reusable component for settings sections
 * 
 * @param {Object} props
 * @param {string} props.title - The section title
 * @param {string} [props.description] - Optional description for the section
 * @param {React.ReactNode} props.children - Content for the section
 * @param {boolean} [props.collapsible=false] - Whether the section can be collapsed
 * @param {boolean} [props.defaultCollapsed=false] - Whether the section is collapsed by default
 * @param {number} [props.columns=1] - Number of columns for grid layout
 * @param {string} [props.icon] - Optional icon name for the section
 */
const SettingsSection = ({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  columns = 1,
  icon
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  return (
    <SectionContainer>
      <SectionHeader collapsible={collapsible} onClick={handleToggle}>
        <SectionTitle>
          {icon && (
            <Icon name={icon} size="20px" />
          )}
          {title}
        </SectionTitle>
        
        {collapsible && (
          <ToggleIcon isCollapsed={isCollapsed}>
            <Icon name="Expand" size="20px" />
          </ToggleIcon>
        )}
      </SectionHeader>
      
      <SectionDivider />
      
      {description && (
        <SectionDescription>{description}</SectionDescription>
      )}
      
      <ContentContainer isCollapsed={collapsible && isCollapsed}>
        {Array.isArray(children) ? (
          <SettingsGrid columns={columns}>
            {children}
          </SettingsGrid>
        ) : (
          children
        )}
      </ContentContainer>
    </SectionContainer>
  );
};

// Helper components for different setting types

const SettingRow = styled.div`
  display: flex;
  flex-direction: ${({ stacked }) => stacked ? 'column' : 'row'};
  align-items: ${({ stacked }) => stacked ? 'flex-start' : 'center'};
  justify-content: space-between;
  gap: ${({ theme, stacked }) => stacked ? theme.spacing.xs : theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SettingLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ stacked }) => stacked && 'margin-bottom: 4px;'}
`;

const SettingDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`;

const SettingControl = styled.div`
  flex: ${({ stacked }) => stacked ? '1' : '0 0 50%'};
  display: flex;
  align-items: center;
  justify-content: ${({ stacked }) => stacked ? 'flex-start' : 'flex-end'};
  width: ${({ stacked }) => stacked ? '100%' : 'auto'};
`;

/**
 * A setting item with label and control
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the setting
 * @param {string} [props.description] - Optional description
 * @param {React.ReactNode} props.children - Control element(s)
 * @param {boolean} [props.stacked=false] - Whether to stack label and control vertically
 */
export const Setting = ({ label, description, children, stacked = false }) => (
  <SettingRow stacked={stacked}>
    <div>
      <SettingLabel stacked={stacked}>{label}</SettingLabel>
      {description && <SettingDescription>{description}</SettingDescription>}
    </div>
    <SettingControl stacked={stacked}>
      {children}
    </SettingControl>
  </SettingRow>
);

// Select control
const StyledSelect = styled.select`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  padding: 8px 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.brand.primary + '40'};
  }
`;

/**
 * A select control for settings
 * 
 * @param {Object} props
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of option objects with value and label
 */
export const SettingSelect = ({ value, onChange, options, ...rest }) => (
  <StyledSelect value={value} onChange={onChange} {...rest}>
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </StyledSelect>
);

// Checkbox control
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledCheckbox = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  cursor: pointer;
  position: relative;
  
  &:checked {
    background-color: ${({ theme }) => theme.colors.brand.primary};
    border-color: ${({ theme }) => theme.colors.brand.primary};
    
    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 6px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.brand.primary + '40'};
  }
`;

const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
`;

/**
 * A checkbox control for settings
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Checkbox label
 * @param {string} [props.id] - Checkbox ID
 */
export const SettingCheckbox = ({ checked, onChange, label, id, ...rest }) => (
  <CheckboxContainer>
    <StyledCheckbox
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      {...rest}
    />
    <CheckboxLabel htmlFor={id}>{label}</CheckboxLabel>
  </CheckboxContainer>
);

// Range/slider control
const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const StyledRange = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.border.secondary};
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.brand.primary};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.brand.primary};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &:focus {
    &::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brand.primary + '40'};
    }
    
    &::-moz-range-thumb {
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brand.primary + '40'};
    }
  }
`;

const SliderValue = styled.div`
  min-width: 40px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

/**
 * A range/slider control for settings
 * 
 * @param {Object} props
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step increment
 * @param {Function} [props.formatValue] - Function to format the displayed value
 */
export const SettingRange = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = val => val,
  ...rest
}) => (
  <SliderContainer>
    <StyledRange
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      {...rest}
    />
    <SliderValue>{formatValue(value)}</SliderValue>
  </SliderContainer>
);

export default SettingsSection;