import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  File, 
  Music, 
  ArrowLeft, 
  Home,
  AlertCircle,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import {
  selectFolder,
  readFile,
  isFileSystemAccessSupported,
  SUPPORTED_AUDIO_TYPES
} from '../../../services/FileSystemService';
import { useLibrary } from '../../../hooks/useLibrary';
import { extractMetadata } from '../../../services/MetadataService';
import audioService from '../../../services/AudioService';

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
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--borderLight);
    border-radius: 4px;
  }
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
  margin-bottom: 2px;
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

const FileInfo = styled.div`
  font-size: 11px;
  color: var(--textSecondary);
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
  background-color: ${props => props.$primary ? 'var(--accentPrimary)' : 'transparent'};
  color: ${props => props.$primary ? 'black' : 'var(--textPrimary)'};
  border: ${props => props.$primary ? 'none' : '1px solid var(--borderLight)'};
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-top: 1px solid var(--borderSubtle);
  font-size: 12px;
  color: var(--textSecondary);
  background-color: var(--bgPrimary);
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const AudioPreview = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--bgRaised);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-sm);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  gap: var(--spacing-sm);
  z-index: 1000;
  border: 1px solid var(--borderMedium);
  max-width: 300px;
`;

const PreviewControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const PreviewButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$primary ? 'var(--accentPrimary)' : 'transparent'};
  color: ${props => props.$primary ? 'black' : 'var(--textPrimary)'};
  border: ${props => props.$primary ? 'none' : '1px solid var(--borderLight)'};
  
  &:hover {
    background-color: ${props => props.$primary ? 'var(--accentHighlight)' : 'var(--bgHover)'};
  }
`;

const PreviewInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const PreviewTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--textPrimary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewArtist = styled.div`
  font-size: 11px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * FolderBrowser component - Allows users to browse and select folders
 * Integrates with AudioService for playback and metadata extraction
 * 
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
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  
  // Audio preview state
  const [previewTrack, setPreviewTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  // File System Access API support
  const fsaSupported = isFileSystemAccessSupported();
  
  // Initialize audio service if needed
  useEffect(() => {
    if (!audioService.isInitialized) {
      audioService.initialize();
      setStatus('Audio engine initialized');
    }
  }, []);

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
          setStatus(`Selected folder: ${handle.name}`);

          // Load folder content
          await loadFolderContent(handle);
        }
      } catch (error) {
        console.error('Error initializing folder browser:', error);
        setError('Error accessing folder. Please try again.');
      }
    };

    initBrowser();
  }, [fsaSupported]);

  // Load folder content
  const loadFolderContent = async (folderHandle) => {
    if (!folderHandle) return;

    try {
      setStatus(`Loading content from ${folderHandle.name}...`);
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

          // Get file size if it's an audio file for display
          let fileSize = null;
          if (isAudio) {
            try {
              const file = await handle.getFile();
              fileSize = file.size;
            } catch (err) {
              console.warn('Could not get file size:', err);
            }
          }

          files.push({ 
            name, 
            handle, 
            isAudio,
            size: fileSize
          });
        }
      }

      // Sort folders and files alphabetically
      folders.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));

      setFolderTree(folders);
      setFileList(files);
      setStatus(`Found ${folders.length} folders and ${files.length} files (${files.filter(f => f.isAudio).length} audio files)`);
    } catch (error) {
      console.error('Error loading folder content:', error);
      setError('Error loading folder content');
      setStatus('Failed to load folder content');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
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
      setError('Error navigating to folder');
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
  
  // Handle file selection for preview
  const handleFileSelect = async (fileItem) => {
    if (!fileItem.isAudio) return;
    
    try {
      setStatus(`Loading preview for ${fileItem.name}...`);
      setIsPreviewReady(false);
      
      // Get the file object
      const file = await fileItem.handle.getFile();
      
      // Extract basic metadata
      const metadata = await extractMetadata(file);
      
      // Create blob URL for playback
      const blobUrl = audioService.createBlobURL(file);
      
      // Set preview track
      setPreviewTrack({
        title: metadata.title || fileItem.name,
        artist: metadata.artist || 'Unknown Artist',
        album: metadata.album || '',
        url: blobUrl,
        file: file
      });
      
      setIsPreviewReady(true);
      setStatus(`Preview ready for ${fileItem.name}`);
      
      // Auto-play the preview
      playPreview(blobUrl);
    } catch (error) {
      console.error('Error loading audio preview:', error);
      setError('Could not load audio preview');
    }
  };
  
  // Play preview
  const playPreview = async (url) => {
    try {
      if (!url && previewTrack) {
        url = previewTrack.url;
      }
      
      if (!url) return;
      
      await audioService.play(url);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing preview:', error);
      setError('Could not play audio preview');
    }
  };
  
  // Pause preview
  const pausePreview = () => {
    audioService.pause();
    setIsPlaying(false);
  };
  
  // Toggle play/pause for preview
  const togglePreview = () => {
    if (isPlaying) {
      pausePreview();
    } else {
      playPreview();
    }
  };
  
  // Handle preview close
  const closePreview = () => {
    // Stop playback
    audioService.stop();
    setIsPlaying(false);
    
    // Revoke blob URL if it exists
    if (previewTrack && previewTrack.url) {
      audioService.revokeBlobURL(previewTrack.url);
    }
    
    // Clear preview track
    setPreviewTrack(null);
  };

  // Confirm folder selection
  const confirmFolderSelection = async () => {
    if (!selectedFolder) return;

    try {
      setStatus(`Adding folder ${selectedFolder.name} to library...`);
      
      // Stop any preview playback
      closePreview();
      
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
      
      setStatus(`Folder ${selectedFolder.name} added to library`);
    } catch (error) {
      console.error('Error selecting folder:', error);
      setError('Error adding folder to library');
    }
  };
  
  // Refresh current folder
  const refreshFolder = async () => {
    if (currentHandle) {
      await loadFolderContent(currentHandle);
    }
  };

  // Check if File System Access API is supported
  if (!fsaSupported) {
    return (
      <EmptyState>
        <AlertCircle size={32} color="var(--accentWarning)" />
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
        
        <NavigationButton
          onClick={refreshFolder}
          aria-label="Refresh folder"
        >
          <RefreshCw size={18} />
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
          
          {folderTree.length === 0 && (
            <EmptyState>
              <p>No subfolders</p>
            </EmptyState>
          )}
        </FolderTree>

        <FileList>
          <FileGrid>
            {fileList.map((file) => (
              <FileItem 
                key={file.name}
                onClick={() => file.isAudio && handleFileSelect(file)}
              >
                <FileIconContainer $isAudio={file.isAudio}>
                  {file.isAudio ? <Music size={24} /> : <File size={24} />}
                </FileIconContainer>
                <FileName>{file.name}</FileName>
                {file.isAudio && file.size && (
                  <FileInfo>{formatFileSize(file.size)}</FileInfo>
                )}
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
          $primary
          onClick={confirmFolderSelection}
          disabled={!selectedFolder}
        >
          Add Folder
        </ActionButton>
      </div>
      
      <StatusBar>
        <StatusInfo>
          {error ? (
            <>
              <AlertCircle size={14} color="var(--accentError)" />
              <span style={{ color: 'var(--accentError)' }}>{error}</span>
            </>
          ) : (
            <>
              <HardDrive size={14} />
              <span>{status}</span>
            </>
          )}
        </StatusInfo>
        
        <div>
          {fileList.filter(f => f.isAudio).length} audio files
        </div>
      </StatusBar>
      
      {/* Audio preview */}
      {previewTrack && (
        <AudioPreview $show={true}>
          <PreviewControls>
            <PreviewButton 
              $primary 
              onClick={togglePreview}
              disabled={!isPreviewReady}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </PreviewButton>
          </PreviewControls>
          
          <PreviewInfo>
            <PreviewTitle>{previewTrack.title}</PreviewTitle>
            <PreviewArtist>{previewTrack.artist}</PreviewArtist>
          </PreviewInfo>
          
          <PreviewButton 
            onClick={closePreview}
          >
            <X size={14} />
          </PreviewButton>
        </AudioPreview>
      )}
    </BrowserContainer>
  );
};

export default FolderBrowser;