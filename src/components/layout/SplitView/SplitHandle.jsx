import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const HandleContainer = styled.div`
  position: relative;
  background-color: var(--borderSubtle);
  transition: background-color 0.2s ease;
  
  /* Directional styles */
  ${(props) => props.$direction === 'horizontal' && `
    width: 4px;
    height: 100%;
    cursor: col-resize;
  `}
  
  ${(props) => props.$direction === 'vertical' && `
    height: 4px;
    width: 100%;
    cursor: row-resize;
  `}
  
  &:hover, &:active {
    background-color: var(--accentPrimary);
  }
  
  /* Visible area */
  &::after {
    content: '';
    position: absolute;
    
    ${(props) => props.$direction === 'horizontal' && `
      width: 12px;
      height: 100%;
      left: -4px;
    `}
    
    ${(props) => props.$direction === 'vertical' && `
      height: 12px;
      width: 100%;
      top: -4px;
    `}
  }
`;

// Handle for resizing split views
const SplitHandle = ({
  direction,
  containerRef,
  onResize,
  minSize,
  maxSize,
  onDragStart,
  onDragEnd,
}) => {
  const handleRef = useRef(null);
  
  // Setup drag behavior
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    let startPos = 0;
    let startSize = 0;
    let containerSize = 0;
    
    // Convert size string to pixels
    const parseSize = (size, total) => {
      if (size.endsWith('px')) {
        return parseFloat(size);
      }
      if (size.endsWith('%')) {
        return (parseFloat(size) / 100) * total;
      }
      return parseFloat(size);
    };
    
    // Convert pixels to appropriate size string
    const formatSize = (pixels, total) => {
      // If original size was percentage, return percentage
      if (typeof minSize === 'string' && minSize.endsWith('%')) {
        return `${(pixels / total) * 100}%`;
      }
      // Otherwise return pixels
      return `${pixels}px`;
    };
    
    const handleMouseDown = (e) => {
      e.preventDefault();
      
      // Get container dimensions
      const rect = container.getBoundingClientRect();
      containerSize = direction === 'horizontal' ? rect.width : rect.height;
      
      // Get current position
      startPos = direction === 'horizontal' ? e.clientX : e.clientY;
      
      // Get current size of first panel
      const firstPanel = handle.previousElementSibling;
      const computedStyle = window.getComputedStyle(firstPanel);
      startSize = direction === 'horizontal'
        ? firstPanel.offsetWidth
        : firstPanel.offsetHeight;
      
      // Start dragging
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      if (onDragStart) onDragStart();
    };
    
    const handleMouseMove = (e) => {
      // Calculate new position
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos;
      
      // Calculate new size
      let newSize = startSize + delta;
      
      // Apply min/max constraints
      const minPx = parseSize(minSize, containerSize);
      const maxPx = parseSize(maxSize, containerSize);
      
      newSize = Math.max(minPx, Math.min(maxPx, newSize));
      
      // Update size
      onResize(formatSize(newSize, containerSize));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (onDragEnd) onDragEnd();
    };
    
    handle.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      handle.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef, direction, maxSize, minSize, onDragEnd, onDragStart, onResize]);
  
  return <HandleContainer ref={handleRef} $direction={direction} />;
};

export default SplitHandle;