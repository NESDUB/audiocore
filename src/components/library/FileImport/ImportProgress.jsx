import React from 'react';
import styled from 'styled-components';
import { useLibrary } from '../../../features/library/providers/LibraryProvider';
import { X, Music, AlertCircle } from 'lucide-react';

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
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--bgPrimary);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background-color: var(--accentPrimary);
  width: ${props => `${props.$progress}%`};
  transition: width 0.3s ease;
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
  background-color: ${props => props.$error ? 'rgba(242, 85, 90, 0.1)' : 'rgba(145, 242, 145, 0.1)'};
  border-left: 3px solid ${props => props.$error ? 'var(--accentError)' : 'var(--accentPrimary)'};
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
`;

const ActionButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 4px;
  background-color: transparent;
  color: var(--textSecondary);
  border: 1px solid var(--borderLight);
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
  
  &.danger {
    color: var(--accentError);
    border-color: var(--accentError);
    
    &:hover {
      background-color: rgba(242, 85, 90, 0.1);
    }
  }
`;

/**
 * ImportProgress component - Shows real-time progress of scanning/importing
 * @param {Function} onCancel - Callback to cancel import
 */
const ImportProgress = ({ onCancel }) => {
  // Get library state which contains scanning information
  const { state } = useLibrary();
  
  // Calculate percentage for progress bar
  const calculateProgress = () => {
    if (state.scanTotal === 0) return 0;
    return Math.round((state.scanProgress / state.scanTotal) * 100);
  };
  
  const progressPercent = calculateProgress();
  
  // Format size in KB, MB, or GB
  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <ProgressContainer>
      <ProgressHeader>
        <ProgressTitle>
          <Music size={18} color="var(--accentPrimary)" />
          Scanning Library
        </ProgressTitle>
        
        <CloseButton onClick={onCancel} disabled={state.isScanning}>
          <X size={18} />
        </CloseButton>
      </ProgressHeader>
      
      <ProgressBarContainer>
        <ProgressBarFill $progress={progressPercent} />
      </ProgressBarContainer>
      
      <InfoSection>
        <InfoRow>
          <InfoLabel>Status:</InfoLabel>
          <InfoValue>{state.isScanning ? 'Scanning in progress' : 'Ready'}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Progress:</InfoLabel>
          <InfoValue>{state.scanProgress} of {state.scanTotal} files ({progressPercent}%)</InfoValue>
        </InfoRow>
        
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
        
        {state.error && (
          <StatusBox $error>
            <AlertCircle size={16} />
            {state.error}
          </StatusBox>
        )}
      </InfoSection>
      
      <ActionButtonRow>
        <ActionButton 
          className="danger" 
          onClick={onCancel}
          disabled={!state.isScanning}
        >
          Cancel
        </ActionButton>
      </ActionButtonRow>
    </ProgressContainer>
  );
};

export default ImportProgress;