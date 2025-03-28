import React, { useCallback } from 'react';
import styled from 'styled-components';
import { SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import audioService from '../../../services/AudioService';

/**
 * SkipButtons component - Previous and next track controls
 * Directly integrates with AudioService for improved track navigation
 * 
 * @param {Object} props Component props
 * @param {Function} props.onSkipPrevious Previous track handler
 * @param {Function} props.onSkipNext Next track handler
 * @param {boolean} props.disabled Buttons disabled state
 * @param {boolean} props.hasNextTrack Whether there's a next track available
 * @param {boolean} props.hasPreviousTrack Whether there's a previous track available
 * @param {Object} props.errorState Error state object
 */
const SkipButtons = ({ 
  onSkipPrevious, 
  onSkipNext, 
  disabled = false,
  hasNextTrack = false,
  hasPreviousTrack = false,
  errorState = { hasError: false, message: '' }
}) => {
  // Enhanced previous track handler with AudioService integration
  const handlePrevious = useCallback((e) => {
    if (disabled) return;
    
    // If we have direct access to AudioService and current time available
    if (audioService.isInitialized) {
      const currentState = audioService.getState();
      
      // If more than 5 seconds in, just restart current track
      if (currentState.currentTime > 5) {
        audioService.seek(0);
        return;
      }
    }
    
    // Otherwise use the provided callback
    if (onSkipPrevious) {
      onSkipPrevious(e);
    }
  }, [onSkipPrevious, disabled]);
  
  // Enhanced next track handler with error recovery
  const handleNext = useCallback((e) => {
    if (disabled) return;
    
    // Clear any errors in the audio engine when skipping
    if (errorState.hasError && audioService.isInitialized) {
      const components = audioService.getEngineComponents();
      if (components && components.errorManager) {
        components.errorManager.clearErrors();
      }
    }
    
    // Use provided callback
    if (onSkipNext) {
      onSkipNext(e);
    }
  }, [onSkipNext, disabled, errorState]);

  return (
    <SkipButtonsContainer>
      <SkipButton
        onClick={handlePrevious}
        disabled={disabled || !hasPreviousTrack}
        aria-label="Previous track"
        direction="previous"
      >
        <SkipBack size={18} />
      </SkipButton>

      <SkipButton
        onClick={handleNext}
        disabled={disabled || (!hasNextTrack && !errorState.hasError)}
        aria-label="Next track"
        direction="next"
        $error={errorState.hasError}
      >
        {errorState.hasError ? <AlertCircle size={18} /> : <SkipForward size={18} />}
      </SkipButton>
    </SkipButtonsContainer>
  );
};

const SkipButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
`;

const SkipButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  color: ${props => props.$error ? 'var(--accentError)' : 'var(--textPrimary)'};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease-out;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background-color: ${props => props.$error ? 'rgba(var(--accentErrorRgb), 0.1)' : 'var(--bgHover)'};
    color: ${props => props.$error ? 'var(--accentError)' : 'var(--textPrimary)'};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(var(--accentPrimaryRgb), 0.4);
  }
`;

export default SkipButtons;