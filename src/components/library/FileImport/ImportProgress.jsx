import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLibrary } from '../../../hooks/useLibrary';
import { X, Music, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import audioService from '../../../services/AudioService';

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background-color: var(--bgSecondary);
  border-radius: 8px;
  border: 1px solid var(--borderSubtle);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--textSecondary);
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--textPrimary);
    background-color: var(--bgHover);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--bgPrimary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--accentPrimary);
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: ${props => props.$isIndeterminate ? '150%' : '0'};
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: ${props => props.$isIndeterminate ? 'shine 2s infinite' : 'none'};
    
    @keyframes shine {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: var(--textSecondary);
`;

const InfoValue = styled.span`
  color: var(--textPrimary);
  font-family: ${props => props.$monospace ? 'monospace' : 'inherit'};
`;

const StatusBox = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: ${props => {
    if (props.$error) return 'rgba(var(--accentErrorRgb), 0.1)';
    if (props.$warning) return 'rgba(var(--accentWarningRgb), 0.1)';
    if (props.$success) return 'rgba(var(--accentSuccessRgb), 0.1)';
    return 'rgba(var(--accentInfoRgb), 0.1)';
  }};
  border-left: 3px solid ${props => {
    if (props.$error) return 'var(--accentError)';
    if (props.$warning) return 'var(--accentWarning)';
    if (props.$success) return 'var(--accentSuccess)';
    return 'var(--accentInfo)';
  }};
  border-radius: 2px;
  color: ${props => props.$error ? 'var(--accentError)' : 'var(--textPrimary)'};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const ActionButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-md);
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 4px;
  background-color: transparent;
  color: var(--textSecondary);
  border: 1px solid var(--borderLight);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }

  &.danger {
    color: var(--accentError);
    border-color: var(--accentError);

    &:hover {
      background-color: rgba(var(--accentErrorRgb), 0.1);
    }
  }
  
  &.primary {
    background-color: var(--accentPrimary);
    color: ${props => props.theme === 'dark' ? 'black' : 'white'};
    border: none;
    
    &:hover {
      background-color: var(--accentHighlight);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RecentFiles = styled.div`
  margin-top: var(--spacing-sm);
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid var(--borderSubtle);
  border-radius: 4px;
`;

const RecentFile = styled.div`
  padding: var(--spacing-xs) var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--borderSubtle);
  font-size: 13px;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background-color: var(--bgPrimary);
  }
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--textSecondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: ${props => {
    if (props.$success) return 'var(--accentSuccess)';
    if (props.$error) return 'var(--accentError)';
    return 'var(--textSecondary)';
  }};
`;

/**
 * ImportProgress component - Shows real-time progress of scanning/importing
 * Integrates with AudioService for initializing and viewing imported files
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Callback to cancel import
 * @param {Function} props.onComplete - Callback when import completes
 */
const ImportProgress = ({ onCancel, onComplete }) => {
  // Get library state which contains scanning information
  const { state, dispatch } = useLibrary();
  
  // Local state for audio engine status
  const [audioEngineStatus, setAudioEngineStatus] = useState({
    initialized: false,
    message: ''
  });
  
  // Local state for recently processed files
  const [recentFiles, setRecentFiles] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  
  // Check AudioService initialization status on mount
  useEffect(() => {
    if (!audioService.isInitialized) {
      audioService.initialize();
    }
    
    setAudioEngineStatus({
      initialized: audioService.isInitialized,
      message: audioService.isInitialized 
        ? 'Audio engine ready for playback' 
        : 'Audio engine initialization in progress'
    });
  }, []);
  
  // Set start time when scanning begins
  useEffect(() => {
    if (state.isScanning && !startTime) {
      setStartTime(new Date());
    } else if (!state.isScanning) {
      setStartTime(null);
      setElapsedTime(0);
      setEstimatedTimeRemaining(null);
    }
  }, [state.isScanning, startTime]);
  
  // Update elapsed time and estimated time remaining
  useEffect(() => {
    let timer;
    
    if (state.isScanning && startTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate estimated time remaining
        if (state.scanProgress > 0 && state.scanTotal > 0) {
          const progress = state.scanProgress / state.scanTotal;
          const estimated = Math.floor((elapsed / progress) - elapsed);
          setEstimatedTimeRemaining(estimated);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isScanning, startTime, state.scanProgress, state.scanTotal]);
  
  // Add to recent files when current file changes
  useEffect(() => {
    if (state.currentFile && state.isScanning) {
      // Add to recent files with processing status
      setRecentFiles(prev => {
        // Keep only the most recent 10 files
        const newRecentFiles = [
          { name: state.currentFile, status: 'processing', timestamp: new Date() },
          ...prev.slice(0, 9)
        ];
        
        return newRecentFiles;
      });
    }
  }, [state.currentFile]);
  
  // Call onComplete when scanning finishes
  useEffect(() => {
    if (!state.isScanning && state.lastScanDate && onComplete) {
      // Update recent files with success status
      setRecentFiles(prev => prev.map(file => ({ ...file, status: 'success' })));
      
      // Call onComplete after a short delay
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.isScanning, state.lastScanDate, onComplete]);

  // Calculate percentage for progress bar
  const calculateProgress = () => {
    if (state.scanTotal === 0) return 0;
    return Math.round((state.scanProgress / state.scanTotal) * 100);
  };

  const progressPercent = calculateProgress();
  const isIndeterminate = state.isScanning && progressPercent === 0;

  // Format size in KB, MB, or GB
  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle cancel button
  const handleCancel = () => {
    // Update audio engine status
    setAudioEngineStatus({
      initialized: audioService.isInitialized,
      message: audioService.isInitialized 
        ? 'Audio engine ready for playback' 
        : 'Audio engine not initialized'
    });
    
    // Call onCancel
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <ProgressContainer>
      <ProgressHeader>
        <ProgressTitle>
          <Music size={18} color="var(--accentPrimary)" />
          {state.isScanning ? 'Scanning Library' : 'Scan Complete'}
        </ProgressTitle>

        <CloseButton onClick={handleCancel} disabled={state.isScanning}>
          <X size={18} />
        </CloseButton>
      </ProgressHeader>

      <ProgressBarContainer>
        <ProgressBarFill 
          $progress={progressPercent} 
          $isIndeterminate={isIndeterminate}
        />
      </ProgressBarContainer>

      <InfoSection>
        <InfoRow>
          <InfoLabel>Status:</InfoLabel>
          <InfoValue>
            {state.isScanning 
              ? 'Scanning in progress' 
              : state.error 
                ? 'Error during scan'
                : 'Scan complete'}
          </InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>Progress:</InfoLabel>
          <InfoValue>
            {state.scanProgress} of {state.scanTotal} files ({progressPercent}%)
          </InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Time elapsed:</InfoLabel>
          <InfoValue $monospace>{formatTime(elapsedTime)}</InfoValue>
        </InfoRow>
        
        {estimatedTimeRemaining !== null && (
          <InfoRow>
            <InfoLabel>Estimated time remaining:</InfoLabel>
            <InfoValue $monospace>{formatTime(estimatedTimeRemaining)}</InfoValue>
          </InfoRow>
        )}

        {state.currentFile && (
          <InfoRow>
            <InfoLabel>Current file:</InfoLabel>
            <InfoValue $monospace>{state.currentFile}</InfoValue>
          </InfoRow>
        )}

        {state.scannedFiles && (
          <InfoRow>
            <InfoLabel>Files found:</InfoLabel>
            <InfoValue>{state.scannedFiles.length} audio files</InfoValue>
          </InfoRow>
        )}

        {state.totalSize && (
          <InfoRow>
            <InfoLabel>Total size:</InfoLabel>
            <InfoValue>{formatSize(state.totalSize)}</InfoValue>
          </InfoRow>
        )}
        
        {/* Audio engine status */}
        <StatusBox $info={!state.error && audioEngineStatus.initialized}>
          {audioEngineStatus.initialized ? (
            <CheckCircle size={16} color="var(--accentSuccess)" />
          ) : (
            <Clock size={16} color="var(--accentInfo)" />
          )}
          {audioEngineStatus.message}
        </StatusBox>

        {state.error && (
          <StatusBox $error>
            <AlertCircle size={16} />
            {state.error}
          </StatusBox>
        )}
        
        {/* Recent files list */}
        {recentFiles.length > 0 && (
          <>
            <InfoRow>
              <InfoLabel>Recently processed files:</InfoLabel>
            </InfoRow>
            <RecentFiles>
              {recentFiles.map((file, index) => (
                <RecentFile key={index}>
                  <FileName>
                    <Music size={14} />
                    {file.name}
                  </FileName>
                  <FileStatus $success={file.status === 'success'} $error={file.status === 'error'}>
                    {file.status === 'processing' ? (
                      'Processing...'
                    ) : file.status === 'success' ? (
                      <>
                        <CheckCircle size={14} />
                        Success
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        Error
                      </>
                    )}
                  </FileStatus>
                </RecentFile>
              ))}
            </RecentFiles>
          </>
        )}
      </InfoSection>

      <ActionButtonRow>
        <ActionButton
          className="danger"
          onClick={handleCancel}
          disabled={!state.isScanning}
        >
          Cancel
        </ActionButton>
        
        {!state.isScanning && (
          <ActionButton
            className="primary"
            onClick={handleCancel}
          >
            Close
          </ActionButton>
        )}
      </ActionButtonRow>
    </ProgressContainer>
  );
};

export default ImportProgress;