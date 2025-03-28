import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { UploadCloud, Music, AlertCircle, CheckCircle, Folder, File } from 'lucide-react';
import { useLibrary } from '../../../hooks/useLibrary';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';
import {
  filterAudioFilesFromFileList,
  isFileSystemAccessSupported
} from '../../../services/FileSystemService';
import { extractMetadata } from '../../../services/MetadataService';
import audioService from '../../../services/AudioService';

// Styled Components
const DropZoneContainer = styled.div`
  width: 100%;
  min-height: 200px;
  border: 2px dashed ${props =>
    props.$isDragging
      ? 'var(--accentPrimary)'
      : props.$hasError
        ? 'var(--accentError)'
        : 'var(--borderLight)'
  };
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background-color: ${props =>
    props.$isDragging
      ? props.$isDarkTheme
        ? 'rgba(var(--accentPrimaryRgb), 0.05)'
        : 'rgba(var(--accentPrimaryRgb), 0.05)'
      : props.$hasError
        ? props.$isDarkTheme
          ? 'rgba(var(--accentErrorRgb), 0.05)'
          : 'rgba(var(--accentErrorRgb), 0.05)'
        : 'transparent'
  };
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  text-align: center;
  max-width: 400px;
  z-index: 1;
`;

const DropZoneIcon = styled.div`
  color: ${props =>
    props.$isDragging
      ? 'var(--accentPrimary)'
      : props.$hasError
        ? 'var(--accentError)'
        : 'var(--textSecondary)'
  };
  font-size: 48px;
  transition: color 0.2s ease;
`;

const DropZoneText = styled.div`
  color: var(--textPrimary);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
`;

const DropZoneSubtext = styled.div`
  color: var(--textSecondary);
  font-size: 14px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const SuccessOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props =>
    props.$isDarkTheme
      ? 'rgba(0, 0, 0, 0.8)'
      : 'rgba(255, 255, 255, 0.8)'
  };
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  transition: opacity 0.3s ease;
  opacity: ${props => props.$show ? '1' : '0'};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  z-index: 5;
`;

const SuccessIcon = styled.div`
  color: var(--accentPrimary);
  font-size: 64px;
`;

const SuccessText = styled.div`
  color: var(--textPrimary);
  font-size: 18px;
  font-weight: 500;
`;

const SuccessSubtext = styled.div`
  color: var(--textSecondary);
  font-size: 14px;
`;

const ErrorText = styled.div`
  color: var(--accentError);
  font-size: 14px;
  margin-top: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const FilesPreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  max-height: ${props => props.$show ? '120px' : '0'};
  width: 100%;
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: ${props => props.$show ? 'var(--spacing-md)' : '0'};
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bgSecondary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--textSecondary);
  max-width: 180px;
  
  svg {
    flex-shrink: 0;
  }
`;

const FileName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * FileDropZone component - Handles drag and drop of audio files
 * Integrates with AudioService for playback
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFilesImported - Callback when files are successfully imported
 */
const FileDropZone = ({ onFilesImported }) => {
  // Get contexts
  const { importTracks, addFolder } = useLibrary();
  const { playTrack, addToQueue } = usePlayer();

  // Component state
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [importStats, setImportStats] = useState({ total: 0, success: 0 });
  const [isProcessingFolder, setIsProcessingFolder] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Determine theme from CSS variables (improved approach)
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      // Get background color and determine if it's dark
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bgPrimary')
        .trim();
      
      // Simple check - if it starts with #, check value
      if (bgColor.startsWith('#')) {
        // Convert to RGB and check brightness
        const hex = bgColor.substring(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Calculate perceived brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        setIsDarkTheme(brightness < 128);
      } else {
        // Default to checking data-theme attribute
        setIsDarkTheme(document.documentElement.getAttribute('data-theme') === 'dark');
      }
    };
    
    detectTheme();
    
    // Add listener for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['data-theme', 'class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setHasError(false);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if the drag leaves the entire drop zone
    const rect = dropZoneRef.current.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure the drop effect is 'copy' to indicate we're copying files
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Process directory using webkitGetAsEntry API
  const processWebkitDirectory = async (entry) => {
    if (!entry || !entry.isDirectory) {
      return [];
    }

    const audioFiles = [];
    const reader = entry.createReader();

    // Read all entries recursively
    const readEntries = async () => {
      return new Promise((resolve, reject) => {
        reader.readEntries(async (entries) => {
          try {
            if (entries.length === 0) {
              resolve([]);
            } else {
              const results = [];

              for (const childEntry of entries) {
                if (childEntry.isDirectory) {
                  // Process subdirectories recursively
                  const subdirFiles = await processWebkitDirectory(childEntry);
                  results.push(...subdirFiles);
                } else if (childEntry.isFile) {
                  // Process file if it's an audio file
                  await new Promise(resolve => {
                    childEntry.file(file => {
                      // Check if it's an audio file based on extension
                      const isAudioFile = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.wma']
                        .some(ext => file.name.toLowerCase().endsWith(ext));

                      if (isAudioFile) {
                        const fullPath = childEntry.fullPath;
                        const pathParts = fullPath.split('/');
                        const directory = pathParts.slice(0, -1).join('/');

                        const audioFile = {
                          name: file.name,
                          path: fullPath.substring(1), // Remove leading slash
                          directory: directory.substring(1), // Remove leading slash
                          size: file.size,
                          lastModified: file.lastModified,
                          type: file.type,
                          file: file
                        };

                        audioFiles.push(audioFile);
                      }

                      resolve();
                    }, error => {
                      console.error('Error accessing file:', error);
                      resolve();
                    });
                  });
                }
              }

              // Continue reading more entries (directory readers may return entries in chunks)
              const moreEntries = await readEntries();
              resolve([...results, ...moreEntries]);
            }
          } catch (error) {
            console.error('Error reading entries:', error);
            resolve([]);
          }
        }, error => {
          console.error('Error reading directory:', error);
          resolve([]);
        });
      });
    };

    await readEntries();
    return audioFiles;
  };

  // Handle file drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Clear previous errors and preview
    setHasError(false);
    setErrorMessage('');
    setPreviewFiles([]);
    setShowPreview(false);

    try {
      const items = e.dataTransfer.items;
      const files = e.dataTransfer.files;

      if (items.length === 0 && files.length === 0) {
        setHasError(true);
        setErrorMessage('No files or folders were dropped');
        return;
      }

      // Check for directory drops using webkitGetAsEntry API
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();

        if (entry && entry.isDirectory) {
          setIsProcessingFolder(true);

          // Process directory using webkit API
          const folderName = entry.name;
          const audioFiles = await processWebkitDirectory(entry);

          // Add folder to library
          if (audioFiles.length > 0) {
            // Show preview of files
            setPreviewFiles(audioFiles.slice(0, 5));
            setShowPreview(true);
            
            await addFolder({
              path: folderName,
              name: folderName,
              files: audioFiles
            });

            // Process the audio files for the library
            const tracksToImport = [];
            let successCount = 0;

            for (const audioFile of audioFiles) {
              try {
                // Extract metadata
                const metadata = await extractMetadata(audioFile.file);

                // Create track object
                const track = {
                  id: metadata.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title: metadata.title || audioFile.name,
                  artist: metadata.artist || null,
                  album: metadata.album || null,
                  year: metadata.year || null,
                  track: metadata.track || null,
                  genre: metadata.genre || null,
                  duration: metadata.duration || null,
                  artwork: metadata.artwork || null,
                  path: audioFile.path,
                  fileName: audioFile.name,
                  fileSize: audioFile.size,
                  fileType: audioFile.type,
                  dateAdded: new Date().toISOString(),
                  playCount: 0,
                  lastPlayed: null,
                  file: audioFile.file // Keep reference to file for direct playback
                };

                tracksToImport.push(track);
                successCount++;
              } catch (error) {
                console.error(`Error processing file ${audioFile.name}:`, error);
              }
            }

            // Import tracks to library
            if (tracksToImport.length > 0) {
              const importResult = await importTracks(tracksToImport);

              if (importResult) {
                // Show success state
                setImportStats({
                  total: audioFiles.length,
                  success: successCount
                });
                setShowSuccess(true);

                // Hide success state after 3 seconds
                setTimeout(() => {
                  setShowSuccess(false);
                }, 3000);

                // Call onFilesImported callback with the imported tracks
                if (onFilesImported) {
                  // Prepare tracks for audio playback
                  const playableTracks = tracksToImport.map(track => {
                    // If we have a file, create a playable URL
                    if (track.file && !track.url) {
                      track.url = audioService.createBlobURL(track.file);
                    }
                    return track;
                  });
                  
                  onFilesImported(playableTracks);
                }
              }
            }
          } else {
            setHasError(true);
            setErrorMessage('No audio files found in the selected folder');
          }

          setIsProcessingFolder(false);
          return;
        }
      }

      // If we get here, it's a regular file drop (not a directory)
      await processFiles(files);
    } catch (error) {
      console.error('Error handling drop:', error);
      setHasError(true);
      setErrorMessage(`Error: ${error.message}`);
      setIsProcessingFolder(false);
    }
  }, [addFolder, importTracks, onFilesImported]);

  // Handle click to open file selector
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = async (e) => {
    const files = e.target.files;

    if (files.length === 0) return;

    // Process the selected files
    await processFiles(files);

    // Reset the input value to allow selecting the same files again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Process files (filtering and importing)
  const processFiles = async (fileList) => {
    try {
      // Clear preview
      setPreviewFiles([]);
      setShowPreview(false);
      
      // Filter for audio files
      const audioFiles = filterAudioFilesFromFileList(fileList);

      if (audioFiles.length === 0) {
        setHasError(true);
        setErrorMessage('No supported audio files found');
        return;
      }

      // Show preview of files
      setPreviewFiles(audioFiles.slice(0, 5));
      setShowPreview(true);
      
      // Extract metadata and prepare for import
      const tracksToImport = [];
      let successCount = 0;

      for (const audioFile of audioFiles) {
        try {
          // Extract metadata using AudioService & MetadataService
          const metadata = await extractMetadata(audioFile.file);

          // Create blob URL for direct playback if needed
          const blobUrl = audioService.isInitialized
            ? audioService.createBlobURL(audioFile.file)
            : null;

          // Create track object
          const track = {
            id: metadata.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: metadata.title || audioFile.name,
            artist: metadata.artist || null,
            album: metadata.album || null,
            year: metadata.year || null,
            track: metadata.track || null,
            genre: metadata.genre || null,
            duration: metadata.duration || null,
            artwork: metadata.artwork || null,
            path: blobUrl || null, // Use blob URL for playback
            fileName: audioFile.name,
            fileSize: audioFile.size,
            fileType: audioFile.type,
            dateAdded: new Date().toISOString(),
            playCount: 0,
            lastPlayed: null,
            file: audioFile.file // Keep file reference for AudioService
          };

          tracksToImport.push(track);
          successCount++;
        } catch (error) {
          console.error(`Error processing file ${audioFile.name}:`, error);
        }
      }

      // Import tracks to library
      if (tracksToImport.length > 0) {
        const importResult = await importTracks(tracksToImport);

        if (importResult) {
          // Show success state
          setImportStats({
            total: audioFiles.length,
            success: successCount
          });
          setShowSuccess(true);

          // Hide success state after 3 seconds
          setTimeout(() => {
            setShowSuccess(false);
            // Hide file preview after success
            setShowPreview(false);
          }, 3000);

          // Call onFilesImported callback
          if (onFilesImported) {
            onFilesImported(tracksToImport);
          }
        } else {
          setHasError(true);
          setErrorMessage('Failed to import tracks to library');
        }
      } else {
        setHasError(true);
        setErrorMessage('No tracks could be processed for import');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      setHasError(true);
      setErrorMessage('Error processing files: ' + error.message);
    }
  };

  return (
    <>
      <DropZoneContainer
        ref={dropZoneRef}
        $isDragging={isDragging}
        $hasError={hasError}
        $isDarkTheme={isDarkTheme}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DropZoneContent>
          <DropZoneIcon $isDragging={isDragging} $hasError={hasError}>
            {isDragging ? (
              <UploadCloud size={48} />
            ) : hasError ? (
              <AlertCircle size={48} />
            ) : isProcessingFolder ? (
              <Folder size={48} />
            ) : (
              <Music size={48} />
            )}
          </DropZoneIcon>

          <DropZoneText>
            {isDragging
              ? 'Drop files or folders here'
              : hasError
                ? 'Error importing files'
                : isProcessingFolder
                  ? 'Processing folder...'
                  : 'Drag and drop audio files here'}
          </DropZoneText>

          <DropZoneSubtext>
            {isDragging
              ? 'Files will be added to your library'
              : hasError
                ? errorMessage
                : isProcessingFolder
                  ? 'Scanning for audio files...'
                  : 'Or click to select files from your computer'}
          </DropZoneSubtext>
        </DropZoneContent>

        {/* File preview */}
        <FilesPreviewContainer $show={showPreview}>
          {previewFiles.map((file, index) => (
            <FilePreview key={index}>
              <File size={14} />
              <FileName>{file.name}</FileName>
            </FilePreview>
          ))}
          {previewFiles.length < importStats.total && (
            <FilePreview>+{importStats.total - previewFiles.length} more files</FilePreview>
          )}
        </FilesPreviewContainer>

        <SuccessOverlay $show={showSuccess} $isDarkTheme={isDarkTheme}>
          <SuccessIcon>
            <CheckCircle size={64} />
          </SuccessIcon>
          <SuccessText>Files Imported Successfully</SuccessText>
          <SuccessSubtext>
            Imported {importStats.success} of {importStats.total} files to your library
          </SuccessSubtext>
        </SuccessOverlay>
      </DropZoneContainer>

      {/* Hidden file input */}
      <HiddenInput
        ref={inputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.flac,.ogg,.m4a,.aac,.opus,.wma"
        onChange={handleFileInputChange}
      />

      {/* Error display outside drop zone */}
      {hasError && (
        <ErrorText>
          <AlertCircle size={14} />
          {errorMessage}
        </ErrorText>
      )}
    </>
  );
};

export default FileDropZone;