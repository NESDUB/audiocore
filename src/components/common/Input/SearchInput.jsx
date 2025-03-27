import React, { useState } from 'react';
import styled from 'styled-components';
import TextInput from './TextInput';
import Icon from '../Icon';

// Specialized container for search input
const SearchContainer = styled.div`
  position: relative;
  width: ${({ width }) => width || '100%'};
`;

// Clear button that appears when search has input
const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

/**
 * Search Input component
 * A specialized text input for search functionality with clear button
 */
const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  onClear,
  onSearch,
  width,
  className,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  
  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };
  
  // Handle clearing the input
  const handleClear = () => {
    setLocalValue('');
    if (onClear) {
      onClear();
    } else if (onChange) {
      // Simulate an onChange event
      onChange({ target: { value: '', name: props.name } });
    }
  };
  
  // Handle the search action (typically on Enter key)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(localValue);
    }
    
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };
  
  // Left icon (search icon)
  const searchIcon = <Icon name="Search" size="18px" />;
  
  // Show clear button only when we have input
  const rightIcon = localValue ? (
    <ClearButton 
      onClick={handleClear}
      type="button"
      aria-label="Clear search"
    >
      <Icon name="Close" size="14px" />
    </ClearButton>
  ) : null;
  
  return (
    <SearchContainer width={width} className={className}>
      <TextInput
        leftIcon={searchIcon}
        rightIcon={rightIcon}
        placeholder={placeholder}
        value={value !== undefined ? value : localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="search"
        {...props}
      />
    </SearchContainer>
  );
};

export default SearchInput;