import React, { useState } from 'react';
import styled from 'styled-components';
import { FolderOpen, Plus, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
import { useLibrary } from '../../../features/library/providers/LibraryProvider';
import { selectFolder, isFileSystemAccessSupported, legacyFolderSelect, filterAudioFilesFromFileList } from '../../../services/FileSystemService';
import ImportProgress from './ImportProgress';

const ImportContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  height: 100%;
`;

const ImportHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--borderSubtle);
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  color: var(--textPrimary);
  font-weight: 500;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  background-color: var(--accentPrimary);
  color: ${(props) => (props.theme === 'dark' ? 'black' : 'white')};
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--accentHighlight);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImportOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ImportOption = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderSubtle);
  color: var(--textPrimary);
  cursor: pointer;
  
  &:hover {
    background-color: var(--bgHover);
  }
  
  svg {
    color: var(--textSecondary);
  }
`;

const FoldersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
  overflow-y: auto;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border-radius: 4px;
  background-color: var(--bgSecondary);
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FolderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--textSecondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
  
  &.danger:hover {
    color: var(--accentError);
  }
`;

const ImportActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
`;

const ImportButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  background-color: ${(props) => (props.$primary ? 'var(--accentPrimary)' : 'transparent')};
  color: ${(props) => (props.$primary ? 'black' : 'var(--textPrimary)')};
  border: ${(props) => (props.$primary ? 'none' : '1px solid var(--borderLight)')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${(props) => (props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)')};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoFoldersMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--textSecondary);
  
  svg {
    color: var(--textDimmed);
    width: 48px;
    height: 48px;
  }
`;

const MessageTitle = styled.h3`
  font-size: 16px;
  color: var(--textPrimary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
`;

const MessageText = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  max-width: 400px;
`;

const FileImport = () => {
  const { state, addFolder, removeFolder, scanLibrary } = useLibrary();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportOptions, setShowImportOptions] = useState(false);
  
  // Handle folder selection
  const handleSelectFolder = async () => {
    try {
      // Close import options dropdown
      setShowImportOptions(false);
      
      // Use File System Access API if supported
      if (isFileSystemAccessSupported()) {
        const folderHandle = await selectFolder();
        
        if (folderHandle) {
          // Add folder to library
          await addFolder({
            path: folderHandle.name,
            name: folderHandle.name,
            handle: folderHandle
          });
        }
      } else {
        // Fallback to legacy folder selection
        const files = await legacyFolderSelect();
        
        if (files && files.length > 0) {
          // Get folder name from the first file's path
          const firstFile = files[0];
          const pathParts = firstFile.webkitRelativePath.split('/');
          const folderName = pathParts[0];
          
          // Add folder to library
          await addFolder({
            path: folderName,
            name: folderName,
            legacy: true,
            files: filterAudioFilesFromFileList(files)
          });
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      // Handle error (could show an error notification)
    }
  };
  
  // Handle folder removal
  const handleRemoveFolder = (folderPath) => {
    removeFolder(folderPath);
  };
  
  // Start library scan
  const handleStartScan = async () => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      // Start scanning library
      await scanLibrary();
    } catch (error) {
      console.error('Error scanning library:', error);
    } finally {
      setIsImporting(false);
    }
  };
  
  // Update progress during scan
  const updateProgress = (progress) => {
    setImportProgress(progress);
  };
  
  return (
    <ImportContainer>
      <ImportHeader>
        <HeaderTitle>Import Music</HeaderTitle>
        
        <div style={{ position: 'relative' }}>
          <AddButton onClick={() => setShowImportOptions(!showImportOptions)}>
            <Plus size={16} />
            <span>Add Source</span>
          </AddButton>
          
          {showImportOptions && (
            <ImportOptionsContainer style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              zIndex: 10,
              width: '200px',
              marginTop: '4px',
              padding: 'var(--spacing-xs)',
              backgroundColor: 'var(--bgSecondary)',
              border: '1px solid var(--borderSubtle)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px var(--shadowColor)'
            }}>
              <ImportOption onClick={handleSelectFolder}>
                <FolderOpen size={16} />
                <span>Select Folder</span>
              </ImportOption>
            </ImportOptionsContainer>
          )}
        </div>
      </ImportHeader>
      
      {isImporting ? (
        <ImportProgress 
          progress={importProgress} 
          onCancel={() => setIsImporting(false)} 
        />
      ) : (
        <>
          {state.folders.length > 0 ? (
            <>
              <FoldersContainer>
                {state.folders.map((folder) => (
                  <FolderItem key={folder.path}>
                    <FolderInfo>
                      <FolderOpen size={18} />
                      <FolderPath>{folder.path}</FolderPath>
                    </FolderInfo>
                    <FolderActions>
                      <ActionButton 
                        className="danger"
                        onClick={() => handleRemoveFolder(folder.path)}
                        aria-label="Remove folder"
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </FolderActions>
                  </FolderItem>
                ))}
              </FoldersContainer>
              
              <ImportActions>
                <ImportButton>
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </ImportButton>
                <ImportButton $primary onClick={handleStartScan}>
                  <ArrowRight size={16} />
                  <span>Scan Library</span>
                </ImportButton>
              </ImportActions>
            </>
          ) : (
            <NoFoldersMessage>
              <FolderOpen size={48} />
              <div>
                <MessageTitle>No music folders added</MessageTitle>
                <MessageText>
                  Select a folder containing your music files to begin building your library.
                </MessageText>
              </div>
              <ImportButton $primary onClick={handleSelectFolder}>
                <FolderOpen size={16} />
                <span>Select Folder</span>
              </ImportButton>
            </NoFoldersMessage>
          )}
        </>
      )}
    </ImportContainer>
  );
};

export default FileImport;