import React from 'react';
import styled from 'styled-components';
import { BarChart2, Settings, Eye } from 'lucide-react';

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--spacing-sm);
  background-color: ${props => props.$isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid var(--borderSubtle);
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  border-radius: 4px;
  color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
  background-color: ${props => 
    props.$active 
      ? props.$isDark ? 'rgba(145, 242, 145, 0.1)' : 'rgba(0, 160, 0, 0.1)'
      : 'transparent'
  };
  border: 1px solid ${props => props.$active ? 'var(--accentPrimary)' : 'var(--borderLight)'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--textSecondary);
    color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textPrimary)'};
  }
`;

const VisTypeSelect = styled.select`
  background-color: transparent;
  font-size: 11px;
  border: 1px solid var(--borderLight);
  color: var(--textSecondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  
  &:hover {
    border-color: var(--textSecondary);
  }
  
  option {
    background-color: var(--bgSecondary);
    color: var(--textPrimary);
  }
`;

/**
 * VisualizerControls component - placeholder for visualizer controls
 */
const VisualizerControls = () => {
  // Placeholder for theme
  const isDark = true;
  
  return (
    <ControlsContainer $isDark={isDark}>
      <ControlGroup>
        <ControlButton $active={true} $isDark={isDark}>
          <BarChart2 size={14} />
          <span>EQ</span>
        </ControlButton>
        
        <ControlButton $active={false} $isDark={isDark}>
          <Eye size={14} />
          <span>PEAK</span>
        </ControlButton>
      </ControlGroup>
      
      <ControlGroup>
        <VisTypeSelect>
          <option value="waveform">Waveform</option>
          <option value="spectrum">Spectrum</option>
          <option value="oscilloscope">Oscilloscope</option>
          <option value="spectrogram">Spectrogram</option>
        </VisTypeSelect>
        
        <ControlButton $active={false} $isDark={isDark}>
          <Settings size={14} />
          <span>OPTIONS</span>
        </ControlButton>
      </ControlGroup>
    </ControlsContainer>
  );
};

export default VisualizerControls;