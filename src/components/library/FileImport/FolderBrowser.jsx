import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Folder, FolderOpen, ChevronRight, ChevronDown, File, Music, ArrowLeft, Home } from 'lucide-react';
import { 
  selectFolder, 
  readFile, 
  isFileSystemAccessSupported, 
  SUPPORTED_AUDIO_TYPES
} from '../../../services/FileSystemService';
import { useLibrary } from '../../../features/library/providers/LibraryProvider';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--borderSubtle);
  background-color: var(--bgSecondary);
`;

const BrowserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
`;

const PathNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  overflow-x: auto;
`;

const PathSegment = styled.button`
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  background-color: ${props => props.$active ? 'var(--bgHover)' : 'transparent'};
  color: ${props => props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  font-size: 14px;
  white-space: nowrap;
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const PathSeparator = styled.span`
  color: var(--textDimmed);
  margin: 0 2px;
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: var(--textSecondary);
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BrowserContent = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const FolderTree = styled.div`
  width: 240px;
  border-right: 1px solid var(--borderSubtle);
  overflow-y: auto;
  padding: var(--spacing-sm);
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
`;

const TreeItem = styled.div`
  padding-left: ${props => `${props.$level * 16}px`};
  user-select: none;
`;

const TreeItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.$selected ? 'var(--bgHover)' : 'transparent'};
  color: ${props => props.$selected ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-sm);
`;

const FileItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--bgHover);
  }
`;

const FileIconContainer = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isAudio ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
`;

const FileName = styled.div`
  font-size: 13px;
  color: var(--textPrimary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  text-align: center;
  color: var(--textSecondary);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  background-color: var(--accentPrimary);
  color: ${props => props.theme === 'dark' ? 'black' : 'white'};
  border: none;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--accentHighlight);
  }
`;

/**
 * FolderBrowser component - Allows users to browse and select folders
 * @param {Object} props - Component props
 * @param {Function} props.onFolderSelect - Callback when folder is selected
 * @param {Function} props.onCancel - Callback to cancel browsing
 */
const FolderBrowser = ({ onFolderSelect, onCancel }) => {
  const { addFolder } = useLibrary();
  
  // State for folder navigation
  const [rootHandle, setRootHandle] = useState(null);
  const [currentHandle, setCurrentHandle] = useState(null);
  const [pathSegments, setPathSegments] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // File System Access API support
  const fsaSupported = isFileSystemAccessSupported();
  
  // Initialize folder browser
  useEffect(() => {
    const initBrowser = async () => {
      // Check if File System Access API is supported
      if (!fsaSupported) return;
      
      try {
        // Show directory picker to select root folder
        const handle = await selectFolder();
        
        if (handle) {
          setRootHandle(handle);
          setCurrentHandle(handle);
          setPathSegments([{ name: handle.name, handle }]);
          setHistory([handle]);
          setHistoryIndex(0);
          
          // Load folder content
          await loadFolderContent(handle);
        }
      } catch (error) {
        console.error('Error initializing folder browser:', error);
      }
    };
    
    initBrowser();
  }, [fsaSupported]);
  
  // Load folder content
  const loadFolderContent = async (folderHandle) => {
    if (!folderHandle) return;
    
    try {
      const folders = [];
      const files = [];
      
      // Iterate through folder entries
      for await (const [name, handle] of folderHandle.entries()) {
        if (handle.kind === 'directory') {
          folders.push({ name, handle });
        } else if (handle.kind === 'file') {
          // Check if file is an audio file
          const isAudio = SUPPORTED_AUDIO_TYPES.some(ext => 
            name.toLowerCase().endsWith(ext)
          );
          
          files.push({ name, handle, isAudio });
        }
      }
      
      // Sort folders and files alphabetically
      folders.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
      
      setFolderTree(folders);
      setFileList(files);
    } catch (error) {
      console.error('Error loading folder content:', error);
    }
  };
  
  // Navigate to folder
  const navigateToFolder = async (folderHandle) => {
    if (!folderHandle) return;
    
    try {
      // Build path segments
      let newPathSegments = [{ name: rootHandle.name, handle: rootHandle }];
      
      if (folderHandle !== rootHandle) {
        // This is a simplified version - in a real implementation,
        // you would need to recursively find the path from root to current folder
        newPathSegments.push({ name: folderHandle.name, handle: folderHandle });
      }
      
      setCurrentHandle(folderHandle);
      setPathSegments(newPathSegments);
      
      // Add to history
      if (historyIndex < history.length - 1) {
        // If we navigated back and then to a new location, truncate the forward history
        setHistory([...history.slice(0, historyIndex + 1), folderHandle]);
      } else {
        setHistory([...history, folderHandle]);
      }
      setHistoryIndex(historyIndex + 1);
      
      // Load folder content
      await loadFolderContent(folderHandle);
    } catch (error) {
      console.error('Error navigating to folder:', error);
    }
  };
  
  // Navigate to path segment
  const navigateToPathSegment = async (index) => {
    if (index < 0 || index >= pathSegments.length) return;
    
    const segment = pathSegments[index];
    await navigateToFolder(segment.handle);
  };
  
  // Navigate back
  const navigateBack = async () => {
    if (historyIndex <= 0) return;
    
    const previousIndex = historyIndex - 1;
    const previousHandle = history[previousIndex];
    
    setCurrentHandle(previousHandle);
    setHistoryIndex(previousIndex);
    
    // Load folder content
    await loadFolderContent(previousHandle);
  };
  
  // Navigate forward
  const navigateForward = async () => {
    if (historyIndex >= history.length - 1) return;
    
    const nextIndex = historyIndex + 1;
    const nextHandle = history[nextIndex];
    
    setCurrentHandle(nextHandle);
    setHistoryIndex(nextIndex);
    
    // Load folder content
    await loadFolderContent(nextHandle);
  };
  
  // Select folder
  const handleFolderSelect = async (folderHandle) => {
    setSelectedFolder(folderHandle);
    
    // Navigate to folder
    await navigateToFolder(folderHandle);
  };
  
  // Confirm folder selection
  const confirmFolderSelection = async () => {
    if (!selectedFolder) return;
    
    try {
      // Add folder to library
      await addFolder({
        path: selectedFolder.name,
        name: selectedFolder.name,
        handle: selectedFolder
      });
      
      // Call onFolderSelect callback
      if (onFolderSelect) {
        onFolderSelect(selectedFolder);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };
  
  // Check if File System Access API is supported
  if (!fsaSupported) {
    return (
      <EmptyState>
        <div>
          <h3 style={{ color: 'var(--textPrimary)', marginBottom: 'var(--spacing-sm)' }}>
            Advanced Folder Browser Not Supported
          </h3>
          <p>
            Your browser doesn't support the File System Access API needed for folder browsing.
            Please use the basic folder selection dialog instead.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <ActionButton onClick={onCancel}>Go Back</ActionButton>
        </div>
      </EmptyState>
    );
  }
  
  // If no root handle is selected yet
  if (!rootHandle) {
    return (
      <EmptyState>
        <FolderOpen size={48} color="var(--textDimmed)" />
        <div>
          <h3 style={{ color: 'var(--textPrimary)', marginBottom: 'var(--spacing-sm)' }}>
            Select a root folder
          </h3>
          <p>
            Choose a folder to start browsing your music library.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
        </div>
      </EmptyState>
    );
  }
  
  return (
    <BrowserContainer>
      <BrowserHeader>
        <NavigationButton 
          onClick={navigateBack}
          disabled={historyIndex <= 0}
          aria-label="Navigate back"
        >
          <ArrowLeft size={18} />
        </NavigationButton>
        
        <NavigationButton
          onClick={() => navigateToFolder(rootHandle)}
          aria-label="Navigate to home"
        >
          <Home size={18} />
        </NavigationButton>
        
        <PathNavigator>
          {pathSegments.map((segment, index) => (
            <React.Fragment key={segment.name}>
              {index > 0 && <PathSeparator>/</PathSeparator>}
              <PathSegment
                $active={index === pathSegments.length - 1}
                onClick={() => navigateToPathSegment(index)}
              >
                {segment.name}
              </PathSegment>
            </React.Fragment>
          ))}
        </PathNavigator>
      </BrowserHeader>
      
      <BrowserContent>
        <FolderTree>
          {folderTree.map((folder) => (
            <TreeItem key={folder.name} $level={0}>
              <TreeItemContent
                $selected={selectedFolder && selectedFolder.name === folder.name}
                onClick={() => handleFolderSelect(folder.handle)}
              >
                <Folder size={16} />
                <span>{folder.name}</span>
              </TreeItemContent>
            </TreeItem>
          ))}
        </FolderTree>
        
        <FileList>
          <FileGrid>
            {fileList.map((file) => (
              <FileItem key={file.name}>
                <FileIconContainer $isAudio={file.isAudio}>
                  {file.isAudio ? <Music size={24} /> : <File size={24} />}
                </FileIconContainer>
                <FileName>{file.name}</FileName>
              </FileItem>
            ))}
            
            {fileList.length === 0 && (
              <EmptyState style={{ gridColumn: '1 / -1' }}>
                <p>No files in this folder</p>
              </EmptyState>
            )}
          </FileGrid>
        </FileList>
      </BrowserContent>
      
      <div style={{ 
        padding: 'var(--spacing-sm)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--spacing-sm)',
        borderTop: '1px solid var(--borderSubtle)'
      }}>
        <button
          style={{
            padding: 'var(--spacing-xs) var(--spacing-md)',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'var(--textPrimary)',
            border: '1px solid var(--borderLight)',
            fontSize: '14px'
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <ActionButton
          onClick={confirmFolderSelection}
          disabled={!selectedFolder}
        >
          Add Folder
        </ActionButton>
      </div>
    </BrowserContainer>
  );
};

export default FolderBrowser;