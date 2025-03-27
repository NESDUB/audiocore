import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

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

// Dropdown menu
const DropdownMenu = styled.div`
  position: absolute;
  top: ${({ triggerHeight }) => `${triggerHeight + 4}px`};
  left: 0;
  width: ${({ width }) => width || '100%'};
  max-height: ${({ maxHeight }) => maxHeight || '300px'};
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1000;
  overflow-y: auto;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: opacity ${({ theme }) => theme.transitions.fast},
              visibility ${({ theme }) => theme.transitions.fast},
              transform ${({ theme }) => theme.transitions.fast};
`;

// Group label
const OptionGroup = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

// Menu item
const DropdownItem = styled.button`
  width: 100%;
  padding: ${({ theme, compact }) => 
    compact ? `${theme.spacing.xs} ${theme.spacing.md}` : `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: transparent;
  border: none;
  text-align: left;
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.brand.primary : theme.colors.text.secondary};
  font-size: ${({ theme, compact }) => 
    compact ? theme.typography.sizes.xs : theme.typography.sizes.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${({ hasIcon }) => hasIcon ? 'space-between' : 'flex-start'};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.primary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  ${({ isDisabled, theme }) => isDisabled && `
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
      color: ${theme.colors.text.secondary};
    }
  `}
`;

// For selected item indicator
const SelectedIndicator = styled.div`
  display: flex;
  align-items: center;
`;

// Optional divider between items
const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  margin: ${({ theme }) => `${theme.spacing.xs} 0`};
`;

// Empty state message
const EmptyMessage = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  text-align: center;
`;

/**
 * Dropdown component with support for both controlled and uncontrolled usage
 * 
 * @param {Object} props - Component props
 * @param {string} [props.label] - Label for the dropdown trigger
 * @param {Array} props.options - Array of options or option groups
 * @param {string|number} [props.value] - Selected value (for controlled component)
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
  label,
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
  ...props
}) => {
  // State for uncontrolled component
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  // Refs for positioning and clicks
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [triggerHeight, setTriggerHeight] = useState(0);
  
  // Use controlled value if provided
  const value = controlledValue !== undefined ? controlledValue : selectedValue;
  
  // Get selected option label
  const getSelectedLabel = () => {
    // Check flat options
    const foundOption = options.find(opt => 
      !opt.options && opt.value === value
    );
    
    if (foundOption) return foundOption.label;
    
    // Check grouped options
    for (const group of options) {
      if (group.options) {
        const foundGroupOption = group.options.find(opt => opt.value === value);
        if (foundGroupOption) return foundGroupOption.label;
      }
    }
    
    return placeholder;
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setSearchTerm('');
        filterOptions('');
      }
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Measure trigger height for positioning menu
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerHeight(triggerRef.current.offsetHeight);
    }
  }, []);
  
  // Handle option selection
  const handleSelect = (option) => {
    if (option.disabled) return;
    
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
  
  // Filter options based on search term
  const filterOptions = (term) => {
    if (!term) {
      setFilteredOptions(options);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    
    // Filter flat options
    const filtered = options
      .map(opt => {
        if (!opt.options) {
          // Single option
          return opt.label.toLowerCase().includes(lowerTerm) ? opt : null;
        } else {
          // Option group
          const filteredGroup = {
            ...opt,
            options: opt.options.filter(groupOpt => 
              groupOpt.label.toLowerCase().includes(lowerTerm)
            )
          };
          return filteredGroup.options.length > 0 ? filteredGroup : null;
        }
      })
      .filter(Boolean);
    
    setFilteredOptions(filtered);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterOptions(term);
  };
  
  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
          e.preventDefault();
        }
        break;
      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          e.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  };
  
  // Check if options exist
  const hasOptions = filteredOptions.length > 0 && 
    filteredOptions.some(opt => 
      (opt.options && opt.options.length > 0) || !opt.options
    );
  
  return (
    <DropdownContainer 
      ref={containerRef}
      width={width}
      minWidth={minWidth}
      {...props}
    >
      <DropdownTrigger
        ref={triggerRef}
        isOpen={isOpen}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        isDisabled={disabled}
        compact={compact}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{getSelectedLabel()}</span>
        <Icon 
          name={isOpen ? "Collapse" : "Expand"} 
          size={compact ? "12px" : "14px"} 
        />
      </DropdownTrigger>
      
      <DropdownMenu 
        ref={menuRef}
        isOpen={isOpen}
        triggerHeight={triggerHeight}
        maxHeight={maxHeight}
        width={width}
        role="listbox"
      >
        {/* Search input */}
        {searchable && isOpen && (
          <div style={{ padding: '8px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#E0E0E0'
              }}
              autoFocus
            />
          </div>
        )}
        
        {/* Options */}
        {hasOptions ? (
          filteredOptions.map((option, index) => {
            // Option group
            if (option.options) {
              // Skip empty groups after filtering
              if (option.options.length === 0) return null;
              
              return (
                <React.Fragment key={`group-${index}`}>
                  {index > 0 && <Divider />}
                  <OptionGroup>{option.label}</OptionGroup>
                  {option.options.map((groupOption, groupIndex) => (
                    <DropdownItem
                      key={`option-${index}-${groupIndex}`}
                      isSelected={groupOption.value === value}
                      isDisabled={groupOption.disabled}
                      onClick={() => handleSelect(groupOption)}
                      compact={compact}
                      hasIcon={true}
                      role="option"
                      aria-selected={groupOption.value === value}
                    >
                      <span>{groupOption.label}</span>
                      {groupOption.value === value && (
                        <SelectedIndicator>
                          <Icon name="Albums" size="14px" />
                        </SelectedIndicator>
                      )}
                    </DropdownItem>
                  ))}
                </React.Fragment>
              );
            }
            
            // Single option
            return (
              <DropdownItem
                key={`option-${index}`}
                isSelected={option.value === value}
                isDisabled={option.disabled}
                onClick={() => handleSelect(option)}
                compact={compact}
                hasIcon={true}
                role="option"
                aria-selected={option.value === value}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <SelectedIndicator>
                    <Icon name="Albums" size="14px" />
                  </SelectedIndicator>
                )}
              </DropdownItem>
            );
          })
        ) : (
          <EmptyMessage>{emptyMessage}</EmptyMessage>
        )}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default Dropdown;