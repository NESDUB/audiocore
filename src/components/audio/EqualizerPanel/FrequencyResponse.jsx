import React, { useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Main container for the frequency response visualization
const ResponseContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 4px;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

// SVG for drawing the response curve
const CurveSvg = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

// Path element for drawing the curve
const CurvePath = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.brand.primary};
  stroke-width: 2;
  opacity: 0.8;
`;

// Area under the curve (for fill effect)
const AreaPath = styled.path`
  fill: ${({ theme }) => theme.colors.brand.primary};
  opacity: 0.1;
`;

// Frequency markers on the x-axis
const FrequencyMarker = styled.div`
  position: absolute;
  bottom: 2px;
  font-size: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  transform: translateX(-50%);
  white-space: nowrap;
`;

// Grid overlay for visual reference
const Grid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  &::before, &::after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.border.tertiary};
  }

  &::before {
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
  }

  &::after {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
  }
`;

// Horizontal grid lines
const HorizontalGrid = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ position }) => `${position}%`};
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  opacity: 0.5;
`;

// Vertical grid lines
const VerticalGrid = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ position }) => `${position}%`};
  width: 1px;
  background-color: ${({ theme }) => theme.colors.border.tertiary};
  opacity: 0.5;
`;

// Frequency labels at standard points
const FREQUENCY_LABELS = [
  { freq: 20, label: '20Hz', position: 0 },
  { freq: 100, label: '100', position: 12.5 },
  { freq: 1000, label: '1k', position: 37.5 },
  { freq: 10000, label: '10k', position: 75 },
  { freq: 20000, label: '20k', position: 100 }
];

/**
 * FrequencyResponse component - Visualizes equalizer frequency response curve
 */
const FrequencyResponse = ({ 
  bands, 
  frequencies, 
  width = 100, 
  height = 80,
  showGrid = true
}) => {
  // Generate SVG path for the frequency response curve
  const { curvePath, areaPath } = useMemo(() => {
    // Create curve path and area fill path
    let curvePathData = '';
    let areaPathData = '';
    
    // Handle case when we have no bands data
    if (!bands || bands.length === 0) {
      return { curvePath: '', areaPath: '' };
    }
    
    // Calculate points for the curve
    const points = bands.map((band, i) => {
      const x = (i / (bands.length - 1)) * width;
      const y = height / 2 - (band / 10) * (height / 4); // Scale -10 to 10 range to fit height
      return { x, y };
    });
    
    // Generate curve path using bezier curves for smoothness
    curvePathData = `M${points[0].x},${points[0].y}`;
    
    // Create a smooth curve through the points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smoother curve
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      
      curvePathData += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    
    // Create area fill path (same as curve but closed to the bottom)
    areaPathData = `${curvePathData} L${width},${height} L0,${height} Z`;
    
    return { curvePath: curvePathData, areaPath: areaPathData };
  }, [bands, width, height]);
  
  // Generate grid lines for visual reference
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const gridLines = [];
    
    // Add horizontal grid lines
    [25, 75].forEach((position, index) => {
      gridLines.push(
        <HorizontalGrid key={`h-${index}`} position={position} />
      );
    });
    
    // Add vertical grid lines
    [25, 75].forEach((position, index) => {
      gridLines.push(
        <VerticalGrid key={`v-${index}`} position={position} />
      );
    });
    
    return gridLines;
  };
  
  // Render frequency markers on the x-axis
  const renderFrequencyMarkers = () => {
    return FREQUENCY_LABELS.map((item, index) => (
      <FrequencyMarker
        key={index}
        style={{ left: `${item.position}%` }}
      >
        {item.label}
      </FrequencyMarker>
    ));
  };
  
  return (
    <ResponseContainer>
      <CurveSvg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <AreaPath d={areaPath} />
        <CurvePath d={curvePath} />
      </CurveSvg>
      
      <Grid />
      {renderGrid()}
      {renderFrequencyMarkers()}
    </ResponseContainer>
  );
};

FrequencyResponse.propTypes = {
  bands: PropTypes.array.isRequired,
  frequencies: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  showGrid: PropTypes.bool
};

FrequencyResponse.defaultProps = {
  frequencies: [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
  width: 100,
  height: 80,
  showGrid: true
};

export default FrequencyResponse;