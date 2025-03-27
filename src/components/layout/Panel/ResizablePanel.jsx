import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Panel from './index';

const ResizableContainer = styled.div`
  position: relative;
  height: ${(props) => props.$height || 'auto'};
  width: ${(props) => props.$width || 'auto'};
  min-height: ${(props) => props.$minHeight || '0'};
  min-width: ${(props) => props.$minWidth || '0'};
  max-height: ${(props) => props.$maxHeight || 'none'};
  max-width: ${(props) => props.$maxWidth || 'none'};
  transition: ${(props) => props.$animate ? 'all 0.3s ease' : 'none'};
`;

const ResizeHandle = styled.div`
  position: absolute;
  background-color: transparent;
  transition: background-color 0.1s ease;
  z-index: 10;
  
  &:hover {
    background-color: var(--accentPrimary);
  }
  
  /* Right handle */
  ${(props) => props.$position === 'right' && `
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    cursor: ew-resize;
  `}
  
  /* Bottom handle */
  ${(props) => props.$position === 'bottom' && `
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    cursor: ns-resize;
  `}
  
  /* Bottom-right corner handle */
  ${(props) => props.$position === 'corner' && `
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: nwse-resize;
  `}
`;

/**
 * ResizablePanel component for resizable content containers
 * @param {Object} props Component props
 * @param {string} props.title Panel title
 * @param {React.ReactNode} props.controls Optional controls for the header
 * @param {React.ReactNode} props.children Panel content
 * @param {string} props.defaultWidth Default width
 * @param {string} props.defaultHeight Default height
 * @param {string} props.minWidth Minimum width
 * @param {string} props.minHeight Minimum height
 * @param {string} props.maxWidth Maximum width
 * @param {string} props.maxHeight Maximum height
 * @param {boolean} props.resizeHorizontal Allow horizontal resizing
 * @param {boolean} props.resizeVertical Allow vertical resizing
 * @param {boolean} props.animate Animate size changes
 * @param {boolean} props.noPadding Whether to remove padding from content
 * @param {string} props.className Additional CSS class
 */
const ResizablePanel = ({
  title,
  controls,
  children,
  defaultWidth = '100%',
  defaultHeight = 'auto',
  minWidth = '200px',
  minHeight = '100px',
  maxWidth = '100%',
  maxHeight = '100%',
  resizeHorizontal = true,
  resizeVertical = true,
  animate = true,
  noPadding = false,
  className,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  
  // Handle resize start
  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;
    
    // Get initial dimensions and mouse position
    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;
    
    // Set dragging state
    setIsDragging(true);
    
    // Handle mouse move
    const handleMouseMove = (moveEvent) => {
      if (direction === 'right' || direction === 'corner') {
        let newWidth = startWidth + moveEvent.clientX - startX;
        // Apply min/max constraints
        newWidth = Math.max(parseInt(minWidth), Math.min(parseInt(maxWidth), newWidth));
        setWidth(`${newWidth}px`);
      }
      
      if (direction === 'bottom' || direction === 'corner') {
        let newHeight = startHeight + moveEvent.clientY - startY;
        // Apply min/max constraints
        newHeight = Math.max(parseInt(minHeight), Math.min(parseInt(maxHeight), newHeight));
        setHeight(`${newHeight}px`);
      }
    };
    
    // Handle mouse up
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <ResizableContainer
      ref={containerRef}
      $width={width}
      $height={height}
      $minWidth={minWidth}
      $minHeight={minHeight}
      $maxWidth={maxWidth}
      $maxHeight={maxHeight}
      $animate={animate && !isDragging}
      className={className}
    >
      <Panel 
        title={title} 
        controls={controls} 
        fullHeight 
        noPadding={noPadding}
      >
        {children}
      </Panel>
      
      {resizeHorizontal && (
        <ResizeHandle
          $position="right"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />
      )}
      
      {resizeVertical && (
        <ResizeHandle
          $position="bottom"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        />
      )}
      
      {resizeHorizontal && resizeVertical && (
        <ResizeHandle
          $position="corner"
          onMouseDown={(e) => handleResizeStart(e, 'corner')}
        />
      )}
    </ResizableContainer>
  );
};

export default ResizablePanel;