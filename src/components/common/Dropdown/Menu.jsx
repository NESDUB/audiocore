import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import MenuItem from './MenuItem';

// Menu container with positioning options
const MenuContainer = styled.div`
  position: ${({ position }) => position || 'absolute'};
  top: ${({ position, top }) => position === 'fixed' ? top : top || '100%'};
  left: ${({ position, left }) => position === 'fixed' ? left : left || '0'};
  right: ${({ position, right }) => position === 'fixed' ? right : (right || 'auto')};
  bottom: ${({ position, bottom }) => position === 'fixed' ? bottom : (bottom || 'auto')};
  margin-top: ${({ theme, marginTop }) => marginTop || theme.spacing.xs};
  z-index: 1000;
  min-width: ${({ minWidth }) => minWidth || '180px'};
  width: ${({ width }) => width || 'auto'};
  max-height: ${({ maxHeight }) => maxHeight || '70vh'};
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen, origin }) => {
    if (origin === 'bottom') {
      return isOpen ? 'translateY(0)' : 'translateY(-10px)';
    } else if (origin === 'top') {
      return isOpen ? 'translateY(0)' : 'translateY(10px)';
    } else if (origin === 'right') {
      return isOpen ? 'translateX(0)' : 'translateX(-10px)';
    } else if (origin === 'left') {
      return isOpen ? 'translateX(0)' : 'translateX(10px)';
    }
    return isOpen ? 'scale(1)' : 'scale(0.95)';
  }};
  transform-origin: ${({ origin }) => {
    if (origin === 'bottom') return 'top center';
    if (origin === 'top') return 'bottom center';
    if (origin === 'right') return 'center left';
    if (origin === 'left') return 'center right';
    return 'top left';
  }};
  transition: opacity ${({ theme }) => theme.transitions.fast},
              visibility ${({ theme }) => theme.transitions.fast},
              transform ${({ theme }) => theme.transitions.fast};
`;

// Optional menu header
const MenuHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

// Menu content with optional scrolling
const MenuContent = styled.div`
  overflow-y: ${({ scrollable }) => scrollable ? 'auto' : 'visible'};
  max-height: ${({ scrollable, maxHeight }) => scrollable ? (maxHeight || 'calc(70vh - 100px)') : 'none'};
`;

// Menu list
const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${({ dense }) => dense ? '4px 0' : '8px 0'};
`;

// Optional divider between items
const Divider = styled.div`
  height: 1px;
  margin: ${({ theme }) => `${theme.spacing.xs} 0`};
  background-color: ${({ theme }) => theme.colors.border.tertiary};
`;

// Section label
const SectionLabel = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  letter-spacing: 0.5px;
`;

/**
 * Menu component for dropdowns, context menus, etc.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {Array} props.items - Array of menu items
 * @param {string} [props.title] - Optional menu title
 * @param {Function} [props.onClose] - Function called when menu should close
 * @param {Function} [props.onSelect] - Function called when an item is selected
 * @param {string} [props.position] - CSS position ('absolute', 'fixed')
 * @param {string} [props.top] - CSS top position
 * @param {string} [props.left] - CSS left position
 * @param {string} [props.right] - CSS right position
 * @param {string} [props.bottom] - CSS bottom position
 * @param {string} [props.width] - Menu width
 * @param {string} [props.minWidth] - Minimum menu width
 * @param {string} [props.maxHeight] - Maximum menu height
 * @param {string} [props.origin] - Transform origin for animations ('top', 'bottom', 'left', 'right')
 * @param {boolean} [props.scrollable] - Allow content to scroll
 * @param {boolean} [props.compact] - Use smaller text and padding
 * @param {boolean} [props.dense] - Even smaller than compact
 * @param {string} [props.marginTop] - Top margin
 * @returns {JSX.Element} Menu component
 */
const Menu = ({
  isOpen = false,
  items = [],
  title,
  onClose,
  onSelect,
  position,
  top,
  left,
  right,
  bottom,
  width,
  minWidth,
  maxHeight,
  origin = 'top',
  scrollable = true,
  compact = false,
  dense = false,
  marginTop,
  ...props
}) => {
  const menuRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        isOpen &&
        onClose
      ) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      // Get all non-disabled menu items
      const availableItems = items.filter(item => 
        !item.isDivider && !item.isSection && !item.disabled
      );
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            return nextIndex >= availableItems.length ? 0 : nextIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prevIndex => {
            const nextIndex = prevIndex - 1;
            return nextIndex < 0 ? availableItems.length - 1 : nextIndex;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < availableItems.length) {
            const selectedItem = availableItems[highlightedIndex];
            if (selectedItem.onClick) {
              selectedItem.onClick();
            }
            if (onSelect) {
              onSelect(selectedItem);
            }
            if (onClose && !selectedItem.keepOpen) {
              onClose();
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (onClose) {
            onClose();
          }
          break;
        default:
          break;
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Reset highlighted index when opening
      setHighlightedIndex(-1);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, items, highlightedIndex, onClose, onSelect]);
  
  // Handle item click
  const handleItemClick = (item, index) => (e) => {
    if (item.onClick) {
      item.onClick(e);
    }
    
    if (onSelect) {
      onSelect(item, index);
    }
    
    if (onClose && !item.keepOpen) {
      onClose();
    }
  };
  
  // Skip rendering if menu is not open and we're not animating
  if (!isOpen && !props.alwaysRender) {
    return null;
  }
  
  return (
    <MenuContainer
      ref={menuRef}
      isOpen={isOpen}
      position={position}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      width={width}
      minWidth={minWidth}
      maxHeight={maxHeight}
      origin={origin}
      marginTop={marginTop}
      role="menu"
      aria-hidden={!isOpen}
      {...props}
    >
      {title && <MenuHeader>{title}</MenuHeader>}
      
      <MenuContent scrollable={scrollable} maxHeight={maxHeight}>
        <MenuList dense={dense}>
          {items.map((item, index) => {
            // Divider
            if (item.isDivider) {
              return <Divider key={`divider-${index}`} />;
            }
            
            // Section label
            if (item.isSection) {
              return (
                <SectionLabel key={`section-${index}`}>
                  {item.label}
                </SectionLabel>
              );
            }
            
            // Regular menu item
            const availableItemIndex = items
              .slice(0, index)
              .filter(i => !i.isDivider && !i.isSection && !i.disabled)
              .length;
            
            const isHighlighted = availableItemIndex === highlightedIndex;
            
            return (
              <MenuItem
                key={`item-${index}`}
                label={item.label}
                description={item.description}
                icon={item.icon}
                endIcon={item.endIcon}
                isSelected={item.isSelected}
                isHighlighted={isHighlighted}
                isDisabled={item.disabled}
                onClick={handleItemClick(item, index)}
                compact={compact || item.compact}
                dense={dense || item.dense}
                truncate={item.truncate}
                autoFocus={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(availableItemIndex)}
                onMouseLeave={() => setHighlightedIndex(-1)}
              />
            );
          })}
        </MenuList>
      </MenuContent>
    </MenuContainer>
  );
};

export default Menu;