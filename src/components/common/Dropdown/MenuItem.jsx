import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

const ItemWrapper = styled.li`
  list-style: none;
  position: relative;
`;

const StyledMenuItem = styled.button`
  width: 100%;
  padding: ${({ theme, compact, dense }) => 
    dense ? `${theme.spacing.xs} ${theme.spacing.sm}` : 
    compact ? `${theme.spacing.xs} ${theme.spacing.md}` : 
    `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ isHighlighted, theme }) => 
    isHighlighted ? theme.colors.surface.primary : 'transparent'};
  border: none;
  text-align: left;
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.brand.primary : theme.colors.text.secondary};
  font-size: ${({ theme, compact }) => 
    compact ? theme.typography.sizes.xs : theme.typography.sizes.sm};
  cursor: ${({ isDisabled }) => isDisabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  opacity: ${({ isDisabled }) => isDisabled ? 0.6 : 1};
  white-space: ${({ truncate }) => truncate ? 'nowrap' : 'normal'};
  overflow: ${({ truncate }) => truncate ? 'hidden' : 'visible'};
  text-overflow: ${({ truncate }) => truncate ? 'ellipsis' : 'clip'};
  
  &:hover {
    background-color: ${({ theme, isDisabled }) => 
      isDisabled ? 'transparent' : theme.colors.surface.primary};
    color: ${({ theme, isDisabled, isSelected }) => 
      isDisabled ? (isSelected ? theme.colors.brand.primary : theme.colors.text.secondary) : 
      theme.colors.text.primary};
  }
  
  &:focus {
    outline: none;
    background-color: ${({ theme, isDisabled }) => 
      isDisabled ? 'transparent' : theme.colors.surface.primary};
  }
`;

// For left/start icon or indicator
const StartIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.brand.primary : 'inherit'};
`;

// Content area with one or more lines of text
const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0; /* Needed for text truncation */
`;

// Main label
const Label = styled.span`
  display: block;
  ${({ truncate }) => truncate && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

// Optional description
const Description = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  ${({ truncate }) => truncate && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

// For right/end actions or indicators
const EndContent = styled.span`
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

/**
 * MenuItem component for use in Dropdown and other menu components
 * 
 * @param {Object} props - Component props
 * @param {string|React.ReactNode} props.label - Main item text or node
 * @param {string} [props.description] - Optional secondary text
 * @param {string|React.ReactNode} [props.icon] - Icon name or node to display at start
 * @param {string|React.ReactNode} [props.endIcon] - Icon name or node to display at end
 * @param {boolean} [props.isSelected] - Whether item is selected
 * @param {boolean} [props.isHighlighted] - Whether item is highlighted (hover/focus)
 * @param {boolean} [props.isDisabled] - Whether item is disabled
 * @param {function} [props.onClick] - Click handler
 * @param {boolean} [props.compact] - Use smaller text and padding
 * @param {boolean} [props.dense] - Use minimal padding (more compact than compact)
 * @param {boolean} [props.truncate] - Truncate text with ellipsis if too long
 * @param {boolean} [props.autoFocus] - Auto-focus this item on render
 * @returns {JSX.Element} - MenuItem component
 */
const MenuItem = ({
  label,
  description,
  icon,
  endIcon,
  isSelected = false,
  isHighlighted = false,
  isDisabled = false,
  onClick,
  compact = false,
  dense = false,
  truncate = false,
  autoFocus = false,
  className,
  ...props
}) => {
  const menuItemRef = useRef(null);
  
  // Auto-focus if needed
  useEffect(() => {
    if (autoFocus && menuItemRef.current && !isDisabled) {
      menuItemRef.current.focus();
    }
  }, [autoFocus, isDisabled]);
  
  // Handle click
  const handleClick = (e) => {
    if (isDisabled) return;
    if (onClick) onClick(e);
  };
  
  // Determine what to render for the icon
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return (
        <Icon 
          name={icon}
          size={compact ? '14px' : '16px'}
        />
      );
    }
    
    return icon;
  };
  
  // Determine what to render for the end icon
  const renderEndIcon = () => {
    if (isSelected && !endIcon) {
      return <Icon name="Albums" size={compact ? '12px' : '14px'} />;
    }
    
    if (!endIcon) return null;
    
    if (typeof endIcon === 'string') {
      return (
        <Icon 
          name={endIcon}
          size={compact ? '14px' : '16px'}
        />
      );
    }
    
    return endIcon;
  };
  
  return (
    <ItemWrapper className={className}>
      <StyledMenuItem
        ref={menuItemRef}
        onClick={handleClick}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        isDisabled={isDisabled}
        compact={compact}
        dense={dense}
        truncate={truncate}
        role="menuitem"
        aria-disabled={isDisabled}
        aria-selected={isSelected}
        tabIndex={isDisabled ? -1 : 0}
        {...props}
      >
        {icon && (
          <StartIcon isSelected={isSelected}>
            {renderIcon()}
          </StartIcon>
        )}
        
        <Content>
          <Label truncate={truncate}>{label}</Label>
          {description && (
            <Description truncate={truncate}>{description}</Description>
          )}
        </Content>
        
        {(endIcon || isSelected) && (
          <EndContent>
            {renderEndIcon()}
          </EndContent>
        )}
      </StyledMenuItem>
    </ItemWrapper>
  );
};

export default MenuItem;