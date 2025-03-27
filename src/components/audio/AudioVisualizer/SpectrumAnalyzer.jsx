import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../features/theme/ThemeProvider';

const SpectrumContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
`;

const SpectrumBars = styled.div`
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  height: 100%;
  padding: var(--spacing-xs);
`;

const FrequencyBand = styled.div`
  display: flex;
  width: 100%;
  height: 4px;
  background-color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  margin: 2px 0;
  border-radius: 2px;
  overflow: hidden;
`;

const FrequencyLevel = styled.div`
  height: 100%;
  width: ${props => props.$level}%;
  background: ${props => {
    const { $level, theme } = props;
    if ($level > 80) return theme.accentError;
    if ($level > 60) return theme.accentWarning;
    return theme.accentPrimary;
  }};
  transition: width 0.15s ease;
`;

const FrequencyLabels = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-xs);
  margin-top: var(--spacing-xs);
`;

const FrequencyLabel = styled.span`
  font-size: 9px;
  color: var(--textSecondary);
`;

/**
 * SpectrumAnalyzer component - placeholder for spectrum visualization
 */
const SpectrumAnalyzer = () => {
  const { theme, themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  
  // Placeholder frequency bands
  const frequencyBands = [
    '16k', '8k', '4k', '2k', '1k', '500', '250', '125', '62', '31'
  ];
  
  // Placeholder spectrum data
  const [spectrumLevels, setSpectrumLevels] = useState(
    Array(frequencyBands.length).fill(0)
  );
  
  // Simulate spectrum animation
  useEffect(() => {
    const updateSpectrum = () => {
      const newLevels = spectrumLevels.map(() => {
        // Random level with higher probability for lower values
        return Math.pow(Math.random(), 1.5) * 100;
      });
      setSpectrumLevels(newLevels);
    };
    
    const interval = setInterval(updateSpectrum, 100);
    return () => clearInterval(interval);
  }, [spectrumLevels]);
  
  return (
    <SpectrumContainer>
      <SpectrumBars>
        {frequencyBands.map((band, i) => (
          <FrequencyBand key={band} $isDark={isDark}>
            <FrequencyLevel 
              $level={spectrumLevels[i]}
              theme={theme} 
            />
          </FrequencyBand>
        ))}
      </SpectrumBars>
      
      <FrequencyLabels>
        {['31Hz', '1kHz', '16kHz'].map(label => (
          <FrequencyLabel key={label}>{label}</FrequencyLabel>
        ))}
      </FrequencyLabels>
    </SpectrumContainer>
  );
};

export default SpectrumAnalyzer;