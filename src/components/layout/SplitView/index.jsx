import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import SplitHandle from './SplitHandle';

// Main container for the split view
const SplitViewContainer = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.$direction === 'horizontal' ? 'row' : 'column')};
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

// First panel
const FirstPanel = styled.div`
  flex: ${(props) => props.$flex};
  min-${(props) => (props.$direction === 'horizontal' ? 'width' : 'height')}: ${(props) => props.$minSize};
  max-${(props) => (props.$direction === 'horizontal' ? 'width' : 'height')}: ${(props) => props.$maxSize};
  height: ${(props) => (props.$direction === 'horizontal' ? '100%' : props.$size)};
  width: ${(props) => (props.$direction === 'horizontal' ? props.$size : '100%')};
  overflow: hidden;
  transition: ${(props) => props.$animate ? 'all 0.3s ease' : 'none'};
`;

// Second panel
const SecondPanel = styled.div`
  flex: 1;
  overflow: hidden;
`;

/**
 * SplitView component for creating resizable split layouts
 * @param {Object} props Component props
 * @param {React.ReactNode} props.first Content for the first panel
 * @param {React.ReactNode} props.second Content for the second panel
 * @param {string} props.direction 'horizontal' or 'vertical' splitting
 * @param {string} props.defaultSize Default size of the first panel (e.g., '300px', '50%')
 * @param {string} props.minSize Minimum size of the first panel
 * @param {string} props.maxSize Maximum size of the first panel
 * @param {boolean} props.animate Whether to animate size changes
 * @param {boolean} props.resizable Whether the split view is resizable
 * @param {string} props.className Additional CSS class
 */
const SplitView = ({
  first,
  second,
  direction = 'horizontal',
  defaultSize = '50%',
  minSize = '100px',
  maxSize = '80%',
  animate = true,
  resizable = true,
  className,
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  
  // Calculate flex value based on size
  const getFlex = () => {
    if (size.includes('%')) {
      const percentage = parseFloat(size) / 100;
      return `0 0 ${percentage * 100}%`;
    }
    return '0 0 auto';
  };
  
  // Handle resize from the split handle
  const handleResize = (newSize) => {
    setSize(newSize);
  };
  
  // Effect to handle mouse up event to stop dragging
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);
  
  return (
    <SplitViewContainer 
      ref={containerRef}
      $direction={direction}
      className={className}
    >
      <FirstPanel
        $direction={direction}
        $size={size}
        $minSize={minSize}
        $maxSize={maxSize}
        $flex={getFlex()}
        $animate={animate && !isDragging}
      >
        {first}
      </FirstPanel>
      
      {resizable && (
        <SplitHandle
          direction={direction}
          containerRef={containerRef}
          onResize={handleResize}
          minSize={minSize}
          maxSize={maxSize}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />
      )}
      
      <SecondPanel>
        {second}
      </SecondPanel>
    </SplitViewContainer>
  );
};

export default SplitView;