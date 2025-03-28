import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Play, Pause, Loader } from 'lucide-react';
import audioService from '../../../services/AudioService';

/**
 * PlayPauseButton component - Enhanced play/pause button
 * Directly integrates with AudioService for better performance
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isPlaying Whether audio is currently playing
 * @param {Function} props.onClick Click handler
 * @param {boolean} props.disabled Button disabled state
 * @param {boolean} props.isBuffering Whether audio is currently buffering
 * @param {string} props.size Button size (default: '48px')
 */
const PlayPauseButton = ({ 
  isPlaying = false, 
  onClick, 
  disabled = false, 
  isBuffering = false,
  size = '48px'
}) => {
  // Local state to track audio context state
  const [contextRunning, setContextRunning] = useState(true);
  
  // Effect to monitor audio context state
  useEffect(() => {
    if (!audioService.isInitialized) return;
    
    // Get audio context
    const engineComponents = audioService.getEngineComponents();
    const audioContext = engineComponents?.core?.getContext();
    
    if (!audioContext) return;
    
    // Update state based on current context state
    setContextRunning(audioContext.state === 'running');
    
    // Listen for state changes
    const handleStateChange = () => {
      setContextRunning(audioContext.state === 'running');
    };
    
    audioContext.addEventListener('statechange', handleStateChange);
    
    return () => {
      audioContext.removeEventListener('statechange', handleStateChange);
    };
  }, []);
  
  // Enhanced click handler that ensures audio context is running
  const handleClick = useCallback(async (e) => {
    // If context isn't running, try to resume it
    if (!contextRunning && audioService.isInitialized) {
      try {
        const engineComponents = audioService.getEngineComponents();
        const audioContext = engineComponents?.core?.getContext();
        
        if (audioContext && audioContext.state !== 'running') {
          await audioContext.resume();
          setContextRunning(true);
        }
      } catch (err) {
        console.error('Error resuming audio context:', err);
      }
    }
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(e);
    }
  }, [onClick, contextRunning]);

  return (
    <PlayButton
      onClick={handleClick}
      disabled={disabled}
      aria-label={isPlaying ? "Pause" : "Play"}
      aria-pressed={isPlaying}
      $size={size}
    >
      {isBuffering ? (
        <Loader size={24} className="spinner" />
      ) : isPlaying ? (
        <Pause size={24} />
      ) : (
        <Play size={24} className="ml-1" />
      )}
    </PlayButton>
  );
};

const PlayButton = styled.button`
  width: ${props => props.$size};
  height: ${props => props.$size};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--accentPrimary);
  color: ${props => props.theme === 'dark' ? '#000000' : '#ffffff'};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease-out;
  opacity: ${props => props.disabled ? 0.7 : 1};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  /* Center the play icon (which has a visual offset) */
  .ml-1 {
    margin-left: 2px;
  }
  
  /* Spinner animation */
  .spinner {
    animation: spin 1.5s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background-color: var(--accentHighlight);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--accentPrimaryRgb), 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

export default PlayPauseButton;