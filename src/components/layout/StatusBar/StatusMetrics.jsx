import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import StatusItem from './StatusItem';

const MetricsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

// Placeholder component for system metrics in status bar
const StatusMetrics = () => {
  const [cpuUsage, setCpuUsage] = useState('2%');
  const [memoryUsage, setMemoryUsage] = useState('128MB');
  
  // Simulate changing metrics (in a real app, this would be actual metrics)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate CPU usage between 1-8%
      const newCpu = `${Math.floor(Math.random() * 7) + 1}%`;
      setCpuUsage(newCpu);
      
      // Simulate memory usage between 120-160MB
      const newMemory = `${Math.floor(Math.random() * 40) + 120}MB`;
      setMemoryUsage(newMemory);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <MetricsContainer>
      <StatusItem label="CPU" value={cpuUsage} />
      <StatusItem label="MEM" value={memoryUsage} />
    </MetricsContainer>
  );
};

export default StatusMetrics;