import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const MeterContainer = styled.div`
  padding: var(--spacing-md);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-md);
`;

const ChannelMeter = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const MeterLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChannelLabel = styled.span`
  font-size: 11px;
  color: var(--textSecondary);
`;

const LevelValue = styled.span`
  font-size: 11px;
  color: var(--textPrimary);
`;

const MeterBar = styled.div`
  height: 8px;
  width: 100%;
  background-color: var(--bgPrimary);
  border-radius: 4px;
  overflow: hidden;
`;

const MeterLevel = styled.div`
  height: 100%;
  width: ${props => props.$level}%;
  background: ${props => {
    const level = props.$level;
    if (level > 90) return 'var(--accentError)';
    if (level > 75) return 'var(--accentWarning)';
    return 'var(--accentPrimary)';
  }};
  transition: width 0.1s ease;
`;

const MeterTicks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
`;

const MeterTick = styled.span`
  font-size: 8px;
  color: var(--textSecondary);
`;

/**
 * VUMeter component - placeholder for audio level meters
 */
const VUMeter = () => {
  const [levels, setLevels] = useState({ left: 0, right: 0 });
  
  // Simulate audio levels
  useEffect(() => {
    const updateLevels = () => {
      // Generate random levels with higher probability for mid-range values
      const baseLevel = 50 + Math.random() * 30;
      
      setLevels({
        left: Math.min(100, Math.max(0, baseLevel + (Math.random() * 20 - 10))),
        right: Math.min(100, Math.max(0, baseLevel + (Math.random() * 20 - 10)))
      });
    };
    
    const interval = setInterval(updateLevels, 100);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <MeterContainer>
      <ChannelMeter>
        <MeterLabel>
          <ChannelLabel>L</ChannelLabel>
          <LevelValue>{levels.left.toFixed(1)} dB</LevelValue>
        </MeterLabel>
        <MeterBar>
          <MeterLevel $level={levels.left} />
        </MeterBar>
        <MeterTicks>
          <MeterTick>-60</MeterTick>
          <MeterTick>-36</MeterTick>
          <MeterTick>-12</MeterTick>
          <MeterTick>0</MeterTick>
        </MeterTicks>
      </ChannelMeter>
      
      <ChannelMeter>
        <MeterLabel>
          <ChannelLabel>R</ChannelLabel>
          <LevelValue>{levels.right.toFixed(1)} dB</LevelValue>
        </MeterLabel>
        <MeterBar>
          <MeterLevel $level={levels.right} />
        </MeterBar>
        <MeterTicks>
          <MeterTick>-60</MeterTick>
          <MeterTick>-36</MeterTick>
          <MeterTick>-12</MeterTick>
          <MeterTick>0</MeterTick>
        </MeterTicks>
      </ChannelMeter>
    </MeterContainer>
  );
};

export default VUMeter;