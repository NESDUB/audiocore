import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AlertCircle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import audioService from '../../services/AudioService';

// Status indicator container
const AudioStatusContainer = styled.div`
  display: ${props => props.$visible ? 'flex' : 'none'};
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--bgRaised);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: var(--spacing-sm);
  z-index: 1000;
  max-width: 320px;
  border: 1px solid var(--borderMedium);
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(20px)'};
  opacity: ${props => props.$visible ? '1' : '0'};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
`;

const StatusTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  svg {
    color: ${props => {
      if (props.$status === 'success') return 'var(--accentSuccess)';
      if (props.$status === 'error') return 'var(--accentError)';
      if (props.$status === 'warning') return 'var(--accentWarning)';
      return 'var(--accentInfo)';
    }};
  }
`;

const StatusInfo = styled.div`
  font-size: 13px;
  color: var(--textSecondary);
  margin-top: var(--spacing-xs);
  padding-left: var(--spacing-md);
`;

const StatusProgress = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--bgPrimary);
  border-radius: 2px;
  overflow: hidden;
  margin-top: var(--spacing-xs);
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: var(--accentPrimary);
  transition: width 0.3s ease;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;

  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  background-color: ${props => props.$primary ? 'var(--accentPrimary)' : 'transparent'};
  color: ${props => props.$primary ? 'white' : 'var(--textPrimary)'};
  border: ${props => props.$primary ? 'none' : '1px solid var(--borderLight)'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)'};
  }
`;

/**
 * AudioInit - Handles audio system initialization and browser audio context unlocking
 * Provides audio context state management and error handling
 * Directly interfaces with AudioService for enhanced functionality
 */
const AudioInit = ({ children }) => {
  // Track audio initialization state
  const [audioState, setAudioState] = useState({
    initialized: audioService.isInitialized,
    contextState: audioService.engineCore?.getContext()?.state || 'closed',
    error: null,
    progress: 0
  });

  // Track status dialog visibility
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'error', 'warning'

  // Initialize audio system on component mount
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // If not already initialized, initialize with progress tracking
        if (!audioService.isInitialized) {
          // Update progress during initialization
          const progressCallback = (progress) => {
            setAudioState(prevState => ({
              ...prevState,
              progress: progress
            }));
          };

          // Show initialization status
          setShowStatus(true);
          setStatusMessage('Initializing audio engine...');
          setStatusType('info');

          // Initialize with progress tracking
          audioService.initialize({
            onProgress: progressCallback
          });

          // Update state with new initialization status
          setAudioState(prevState => ({
            ...prevState,
            initialized: true,
            contextState: audioService.engineCore?.getContext()?.state || 'closed',
            progress: 100
          }));

          // Show success message
          setStatusMessage('Audio engine initialized successfully');
          setStatusType('success');

          // Hide status after a delay
          setTimeout(() => {
            setShowStatus(false);
          }, 3000);
        }

        // Get engine components for status reporting
        const components = audioService.getEngineComponents?.();

        // Register event listeners for audio errors
        if (components && components.eventBus) {
          components.eventBus.on('source:error', handleAudioError);
          components.eventBus.on('context:statechange', handleContextStateChange);
        }

        // Log initialization status
        console.log('Audio system initialized:', {
          initialized: audioService.isInitialized,
          contextState: audioService.engineCore?.getContext()?.state,
          engineComponents: components ? Object.keys(components).length : 0
        });


      } catch (error) {
        console.error('Audio initialization error:', error);
        setAudioState(prevState => ({
          ...prevState,
          error: error
        }));

        // Show error message
        setShowStatus(true);
        setStatusMessage(`Audio initialization error: ${error.message || 'Unknown error'}`);
        setStatusType('error');
      }
    };

    initializeAudio();

    // Set up listeners for user interaction to unlock audio
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Clean up listeners on unmount
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);

      // Remove event listeners
      const components = audioService.getEngineComponents?.();
      if (components && components.eventBus) {
        components.eventBus.off('source:error', handleAudioError);
        components.eventBus.off('context:statechange', handleContextStateChange);
      }
    };
  }, []);

  // Handle audio errors
  const handleAudioError = useCallback((event) => {
    const errorMessage = event.message || event.data?.message || 'Audio playback error';

    // Show error message
    setShowStatus(true);
    setStatusMessage(`Audio error: ${errorMessage}`);
    setStatusType('error');

    // Update state
    setAudioState(prevState => ({
      ...prevState,
      error: { message: errorMessage }
    }));

    // Hide status after a delay
    setTimeout(() => {
      setShowStatus(false);
    }, 5000);
  }, []);

  // Handle audio context state changes
  const handleContextStateChange = useCallback((event) => {
    // Get new state
    const newState = event.state || event.data?.state || audioService.engineCore?.getContext()?.state;

    if (newState) {
      // Update state
      setAudioState(prevState => ({
        ...prevState,
        contextState: newState
      }));

      // Show status message for suspended context
      if (newState === 'suspended') {
        setShowStatus(true);
        setStatusMessage('Audio suspended. Click anywhere to resume playback.');
        setStatusType('warning');
      } else if (newState === 'running') {
        // Show brief success message when resumed
        setShowStatus(true);
        setStatusMessage('Audio playback resumed');
        setStatusType('success');

        // Hide after a short delay
        setTimeout(() => {
          setShowStatus(false);
        }, 1500);
      }
    }
  }, []);

  // Handle user interaction to unlock audio
  const handleUserInteraction = async () => {
    await handleAudioContextState();
  };

  // Try to resume audio context if suspended
  const handleAudioContextState = async () => {
    if (!audioService.audioContext) return;

    // If context is suspended, try to resume it
    if (audioService.audioContext.state === 'suspended') {
      try {
        // Directly try to resume since we're now in a user interaction event
        await audioService.audioContext.resume();
        console.log('AudioContext resumed successfully');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  };

  // Handle manual resume attempt
  const handleManualResume = useCallback(() => {
    handleAudioContextState();
  }, []);

  // Dismiss status dialog
  const dismissStatus = useCallback(() => {
    setShowStatus(false);
  }, []);

  // Determine icon for status
  const getStatusIcon = () => {
    switch (statusType) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertCircle size={16} />;
      default: // info
        return audioState.contextState === 'suspended' ? <VolumeX size={16} /> : <Volume2 size={16} />;
    }
  };

  // Pass audio state to children via a data attribute for debugging
  return (
    <>
      <div data-audio-state={`${audioState.initialized ? 'initialized' : 'error'}-${audioState.contextState}`}>
        {children}
      </div>

      <AudioStatusContainer $visible={showStatus}>
        <StatusHeader>
          <StatusTitle $status={statusType}>
            {getStatusIcon()}
            {audioState.contextState === 'suspended' ? 'Audio Suspended' : 'Audio Status'}
          </StatusTitle>

          <CloseButton onClick={dismissStatus}>×</CloseButton>
        </StatusHeader>

        <StatusInfo>{statusMessage}</StatusInfo>

        {audioState.progress > 0 && audioState.progress < 100 && (
          <StatusProgress>
            <ProgressBar $progress={audioState.progress} />
          </StatusProgress>
        )}

        {audioState.contextState === 'suspended' && (
          <ActionButton $primary onClick={handleManualResume}>
            Resume Audio
          </ActionButton>
        )}
      </AudioStatusContainer>
    </>
  );
};

export default AudioInit;