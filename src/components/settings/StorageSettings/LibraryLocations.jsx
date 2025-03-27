import React, { useState } from 'react';
import styled from 'styled-components';
import { FolderOpen, Trash2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useLibrary } from '../../../features/library/hooks/useLibrary';
import { selectFolder, isFileSystemAccessSupported } from '../../../services/FileSystemService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FoldersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bgSecondary);
  border-radius: 6px;
  border: 1px solid var(--borderSubtle);
`;

const FolderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    color: var(--textSecondary);
  }
`;

const FolderPath = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
`;

const FolderActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--textSecondary);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    color: var(--textPrimary);
    background-color: var(--bgHover);
  }
  
  &.remove:hover {
    color: var(--accentError);
    background-color: rgba(242, 85, 90, 0.1);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddFolderButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: transparent;
  color: var(--textPrimary);
  border: 1px dashed var(--borderLight);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--accentPrimary);
    color: var(--accentPrimary);
  }
  
  svg {
    color: var(--textSecondary);
  }
  
  &:hover svg {
    color: var(--accentPrimary);
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 4px;
  background-color: ${props => props.$primary ? 'var(--accentPrimary)' : 'transparent'};
  color: ${props => props.$primary ? 'black' : 'var(--textSecondary)'};
  border: ${props => props.$primary ? 'none' : '1px solid var(--borderLight)'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)'};
    color: ${props => props.$primary ? 'black' : 'var(--textPrimary)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  background-color: ${props => 
    props.$type === 'success' 
      ? 'rgba(145, 242, 145, 0.1)' 
      : props.$type === 'error'
        ? 'rgba(242, 85, 90, 0.1)'
        : 'rgba(242, 203, 5, 0.1)'
  };
  color: ${props => 
    props.$type === 'success' 
      ? 'var(--accentPrimary)' 
      : props.$type === 'error'
        ? 'var(--accentError)'
        : 'var(--accentWarning)'
  };
  font-size: 14px;
  margin-bottom: var(--spacing-md);
`;

const NoFoldersMessage = styled.div`
  padding: var(--spacing-md);
  text-align: center;
  color: var(--textSecondary);
  font-size: 14px;
  background-color: var(--bgSecondary);
  border-radius: 6px;
  border: 1px solid var(--borderSubtle);
`;

/**
 * LibraryLocations component - Manages music library folder locations
 */
const LibraryLocations = () => {
  const { state, addFolder, removeFolder, scanLibrary } = useLibrary();
  const [statusMessage, setStatusMessage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Handle folder selection
  const handleAddFolder = async () => {
    try {
      // Check if File System Access API is supported
      if (!isFileSystemAccessSupported()) {
        setStatusMessage({
          type: 'error',
          text: 'Your browser does not support folder selection. Please try using a modern browser like Chrome or Edge.'
        });
        return;
      }
      
      // Show folder picker
      const folderHandle = await selectFolder();
      
      if (folderHandle) {
        // Check if folder already exists in library
        const folderExists = state.folders.some(folder => folder.path === folderHandle.name);
        
        if (folderExists) {
          setStatusMessage({
            type: 'error',
            text: 'This folder is already in your library.'
          });
          return;
        }
        
        // Add folder to library
        const result = await addFolder({
          path: folderHandle.name,
          name: folderHandle.name,
          handle: folderHandle
        });
        
        if (result) {
          setStatusMessage({
            type: 'success',
            text: 'Folder added successfully.'
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Failed to add folder to library.'
          });
        }
      }
    } catch (error) {
      console.error('Error adding folder:', error);
      setStatusMessage({
        type: 'error',
        text: `Error adding folder: ${error.message}`
      });
    }
  };
  
  // Handle folder removal
  const handleRemoveFolder = async (path) => {
    try {
      const result = await removeFolder(path);
      
      if (result) {
        setStatusMessage({
          type: 'success',
          text: 'Folder removed successfully.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to remove folder from library.'
        });
      }
    } catch (error) {
      console.error('Error removing folder:', error);
      setStatusMessage({
        type: 'error',
        text: `Error removing folder: ${error.message}`
      });
    }
  };
  
  // Handle library scan
  const handleScanLibrary = async () => {
    try {
      setIsScanning(true);
      setStatusMessage({
        type: 'info',
        text: 'Scanning library folders...'
      });
      
      await scanLibrary();
      
      setStatusMessage({
        type: 'success',
        text: 'Library scan completed successfully.'
      });
    } catch (error) {
      console.error('Error scanning library:', error);
      setStatusMessage({
        type: 'error',
        text: `Error scanning library: ${error.message}`
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  // Clear status message
  const clearStatusMessage = () => {
    setStatusMessage(null);
  };
  
  return (
    <Container>
      {/* Status message */}
      {statusMessage && (
        <StatusMessage $type={statusMessage.type}>
          {statusMessage.type === 'success' && <Check size={16} />}
          {statusMessage.type === 'error' && <AlertCircle size={16} />}
          {statusMessage.type === 'info' && <RefreshCw size={16} />}
          <span>{statusMessage.text}</span>
        </StatusMessage>
      )}
      
      {/* Folders list */}
      <FoldersContainer>
        {state.folders.length > 0 ? (
          state.folders.map((folder, index) => (
            <FolderItem key={index}>
              <FolderInfo>
                <FolderOpen size={18} />
                <FolderPath>{folder.path}</FolderPath>
              </FolderInfo>
              <FolderActions>
                <ActionButton 
                  className="remove"
                  onClick={() => handleRemoveFolder(folder.path)}
                  aria-label="Remove folder"
                >
                  <Trash2 size={16} />
                </ActionButton>
              </FolderActions>
            </FolderItem>
          ))
        ) : (
          <NoFoldersMessage>
            No music folders added to your library.
          </NoFoldersMessage>
        )}
      </FoldersContainer>
      
      {/* Add folder button */}
      <AddFolderButton onClick={handleAddFolder}>
        <FolderOpen size={18} />
        <span>Add Music Folder</span>
      </AddFolderButton>
      
      {/* Action bar */}
      <ActionBar>
        <div></div>
        <Button 
          $primary
          onClick={handleScanLibrary}
          disabled={isScanning || state.folders.length === 0}
        >
          <RefreshCw size={16} />
          <span>Scan Library</span>
        </Button>
      </ActionBar>
    </Container>
  );
};

export default LibraryLocations;