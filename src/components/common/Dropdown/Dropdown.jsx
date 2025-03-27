import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import Menu from './Menu';

// Main container
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ minWidth }) => minWidth || '120px'};
  user-select: none;
`;

// Trigger button
const DropdownTrigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: ${({ theme, compact }) => 
    compact ? `${theme.spacing.xs} ${theme.spacing.sm}` : `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme, isOpen }) => 
    isOpen ? theme.colors.brand.primary : theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme, compact }) => 
    compact ? theme.typography.sizes.xs : theme.typography.sizes.sm};
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme, isOpen }) => 
      isOpen ? theme.colors.brand.primary : theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surface.darker};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.brand.primary + '30'};
  }
  
  ${({ isDisabled, theme }) => isDisabled && `
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      border-color: ${theme.colors.border.secondary};
      background-color: ${theme.colors.surface.primary};
    }
  `}
`;

const TriggerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0; /* Needed for text truncation */
`;

const TriggerIcon = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const TriggerText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ isPlaceholder, theme }) => 
    isPlaceholder ? theme.colors.text.tertiary : theme.colors.text.primary};
`;

// Search input inside the menu
const SearchContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.brand.primary + '30'};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

/**
 * Dropdown component with a menu of selectable options
 * 
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of options or option groups
 * @param {string|number} [props.value] - Selected value (for controlled component)
 * @param {string|number} [props.defaultValue] - Default selected value (for uncontrolled)
 * @param {Function} [props.onChange] - Change handler
 * @param {boolean} [props.disabled] - Disables the dropdown
 * @param {string} [props.placeholder] - Placeholder text when no option is selected
 * @param {boolean} [props.compact] - Renders a smaller version
 * @param {string} [props.width] - Custom width
 * @param {string} [props.minWidth] - Minimum width
 * @param {string} [props.maxHeight] - Maximum height for dropdown menu
 * @param {boolean} [props.searchable] - Enables search functionality
 * @returns {JSX.Element} - Dropdown component
 */
const Dropdown = ({
  options = [],
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  compact = false,
  width,
  minWidth,
  maxHeight,
  searchable = false,
  emptyMessage = 'No options available',
  className,
  ...props
}) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  // Refs
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Use controlled value if provided
  const value = controlledValue !== undefined ? controlledValue : selectedValue;
  
  // Process options to convert to the format expected by the Menu component
  const processOptions = (opts, filterText = '') => {
    const lowerFilter = filterText.toLowerCase();
    const processed = [];
    
    opts.forEach(option => {
      // Handle option groups
      if (option.options) {
        // Filter the group's options
        const filteredGroupOptions = option.options.filter(groupOpt => 
          !filterText || groupOpt.label.toLowerCase().includes(lowerFilter)
        );
        
        // Skip empty groups after filtering
        if (filteredGroupOptions.length === 0) return;
        
        // Add a section header
        processed.push({
          isSection: true,
          label: option.label
        });
        
        // Add the group's options
        filteredGroupOptions.forEach(groupOpt => {
          processed.push({
            ...groupOpt,
            isSelected: groupOpt.value === value,
            disabled: groupOpt.disabled
          });
        });
        
        // Add a divider after the group
        processed.push({ isDivider: true });
      } else {
        // Regular option - include if it matches the filter
        if (!filterText || option.label.toLowerCase().includes(lowerFilter)) {
          processed.push({
            ...option,
            isSelected: option.value === value,
            disabled: option.disabled
          });
        }
      }
    });
    
    // Remove trailing divider if present
    if (processed.length > 0 && processed[processed.length - 1].isDivider) {
      processed.pop();
    }
    
    return processed;
  };
  
  // Update filtered options when search term changes
  useEffect(() => {
    setFilteredOptions(processOptions(options, searchTerm));
  }, [options, searchTerm, value]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setSearchTerm('');
      }
    }
  };
  
  // Close dropdown
  const closeDropdown = () => {
    setIsOpen(false);
  };
  
  // Handle option selection
  const handleSelect = (option) => {
    // Update selected value
    if (controlledValue === undefined) {
      setSelectedValue(option.value);
    }
    
    // Call onChange handler
    if (onChange) {
      onChange(option.value, option);
    }
    
    // Close dropdown
    setIsOpen(false);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen, searchable]);
  
  // Find the selected option
  const getSelectedOption = () => {
    // Check flat options
    const foundOption = options.find(opt => 
      !opt.options && opt.value === value
    );
    
    if (foundOption) return foundOption;
    
    // Check grouped options
    for (const group of options) {
      if (group.options) {
        const foundGroupOption = group.options.find(opt => opt.value === value);
        if (foundGroupOption) return foundGroupOption;
      }
    }
    
    return null;
  };
  
  const selectedOption = getSelectedOption();
  
  // Determine what to show in the trigger button
  const renderTriggerContent = () => {
    if (!selectedOption) {
      return (
        <TriggerText isPlaceholder>{placeholder}</TriggerText>
      );
    }
    
    return (
      <TriggerContent>
        {selectedOption.icon && (
          <TriggerIcon>
            {typeof selectedOption.icon === 'string' ? (
              <Icon name={selectedOption.icon} size={compact ? '14px' : '16px'} />
            ) : (
              selectedOption.icon
            )}
          </TriggerIcon>
        )}
        <TriggerText>{selectedOption.label}</TriggerText>
      </TriggerContent>
    );
  };
  
  // Process the options for the menu
  const menuItems = processOptions(options, searchTerm);
  
  // Check if menu would be empty
  const isMenuEmpty = menuItems.length === 0 || 
    !menuItems.some(item => !item.isDivider && !item.isSection);
  
  // Add empty message if needed
  if (isMenuEmpty) {
    menuItems.push({
      label: emptyMessage,
      disabled: true
    });
  }
  
  return (
    <DropdownContainer 
      ref={containerRef}
      className={className}
      width={width}
      minWidth={minWidth}
    >
      <DropdownTrigger
        ref={triggerRef}
        isOpen={isOpen}
        onClick={toggleDropdown}
        isDisabled={disabled}
        compact={compact}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...props}
      >
        {renderTriggerContent()}
        <Icon 
          name={isOpen ? "Collapse" : "Expand"} 
          size={compact ? "12px" : "14px"} 
          color="currentColor"
        />
      </DropdownTrigger>
      
      <Menu
        isOpen={isOpen}
        items={menuItems}
        onClose={closeDropdown}
        onSelect={handleSelect}
        width={width}
        minWidth={minWidth}
        maxHeight={maxHeight}
        compact={compact}
      >
        {searchable && (
          <SearchContainer>
            <SearchInput 
              ref={searchInputRef}
              type="text" 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
            />
          </SearchContainer>
        )}
      </Menu>
    </DropdownContainer>
  );
};

export default Dropdown;