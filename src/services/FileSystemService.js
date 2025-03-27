/**
 * FileSystemService.js
 * Service for handling file system operations in the browser environment
 */

// Audio file types that are supported
const SUPPORTED_AUDIO_TYPES = [
  '.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.wma'
];

// Check if the File System Access API is available
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
};

/**
 * Opens a folder picker dialog and returns the selected directory handle
 * @returns {Promise<FileSystemDirectoryHandle|null>} Directory handle or null if canceled/unsupported
 */
const selectFolder = async () => {
  try {
    // Check for File System Access API support
    if (!isFileSystemAccessSupported()) {
      throw new Error('File System Access API is not supported in this browser');
    }

    // Show directory picker dialog
    const handle = await window.showDirectoryPicker({
      id: 'audiocore-music-library',
      mode: 'readwrite',
      startIn: 'music'
    });

    // Verify we have read permission
    if ((await handle.queryPermission({ mode: 'read' })) !== 'granted') {
      const permission = await handle.requestPermission({ mode: 'read' });
      if (permission !== 'granted') {
        throw new Error('Read permission denied for selected folder');
      }
    }

    return handle;
  } catch (error) {
    console.error('Error selecting folder:', error);
    // Don't throw if user cancelled
    if (error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
};

/**
 * Opens a file picker dialog for selecting multiple audio files
 * @returns {Promise<FileSystemFileHandle[]|null>} Array of file handles or null if canceled/unsupported
 */
const selectAudioFiles = async () => {
  try {
    // Check for File System Access API support
    if (!isFileSystemAccessSupported()) {
      throw new Error('File System Access API is not supported in this browser');
    }

    // File types array for the file picker
    const acceptedTypes = {
      'audio/*': SUPPORTED_AUDIO_TYPES
    };

    // Show file picker dialog
    const handles = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Audio Files',
          accept: acceptedTypes
        }
      ]
    });

    return handles;
  } catch (error) {
    console.error('Error selecting files:', error);
    // Don't throw if user cancelled
    if (error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
};

/**
 * Recursively scans a directory for audio files
 * @param {FileSystemDirectoryHandle} directoryHandle - Handle to the directory to scan
 * @param {Function} onFileFound - Callback function called when an audio file is found
 * @param {Function} onProgress - Callback function for progress updates
 * @param {string} [basePath=''] - Base path for relative file paths
 * @returns {Promise<Array>} Array of found audio files with metadata
 */
const scanDirectoryForAudioFiles = async (
  directoryHandle,
  onFileFound = () => {},
  onProgress = () => {},
  basePath = ''
) => {
  const audioFiles = [];

  try {
    // Iterate through all entries in the directory
    for await (const [name, handle] of directoryHandle.entries()) {
      // Build the current path
      const path = basePath ? `${basePath}/${name}` : name;

      if (handle.kind === 'directory') {
        // Recursively scan subdirectories
        const filesInSubDir = await scanDirectoryForAudioFiles(
          handle,
          onFileFound,
          onProgress,
          path
        );
        audioFiles.push(...filesInSubDir);
      } else if (handle.kind === 'file') {
        // Check if the file is an audio file
        const isAudioFile = SUPPORTED_AUDIO_TYPES.some(ext =>
          name.toLowerCase().endsWith(ext)
        );

        if (isAudioFile) {
          try {
            // Get file object
            const file = await handle.getFile();

            // Create file object with path information
            const audioFile = {
              name: file.name,
              path: path,
              directory: basePath,
              size: file.size,
              lastModified: file.lastModified,
              type: file.type,
              handle: handle,
              file: file
            };

            audioFiles.push(audioFile);
            onFileFound(audioFile);
          } catch (fileError) {
            console.error(`Error reading file ${name}:`, fileError);
          }
        }
      }

      // Report progress
      onProgress({
        currentFile: path,
        filesFound: audioFiles.length
      });
    }

    return audioFiles;
  } catch (error) {
    console.error('Error scanning directory:', error);
    throw error;
  }
};

/**
 * Process a dropped directory entry (from drag and drop)
 * @param {FileSystemDirectoryHandle|DataTransferItem} entry - Directory entry or DataTransferItem
 * @param {Function} onFileFound - Callback function called when an audio file is found
 * @param {Function} onProgress - Callback function for progress updates
 * @returns {Promise<Array>} Array of found audio files
 */
const processDroppedDirectory = async (entry, onFileFound = () => {}, onProgress = () => {}) => {
  const audioFiles = [];

  // For File System Access API
  if (entry.kind === 'directory' && entry.entries) {
    return scanDirectoryForAudioFiles(entry, onFileFound, onProgress);
  }

  // For older API (webkitGetAsEntry)
  if (entry.isDirectory) {
    const dirReader = entry.createReader();
    
    // Read entries recursively
    const readEntries = async () => {
      return new Promise((resolve, reject) => {
        dirReader.readEntries(
          async (entries) => {
            if (entries.length === 0) {
              resolve([]);
            } else {
              const results = [];
              
              for (const childEntry of entries) {
                if (childEntry.isDirectory) {
                  const subdirFiles = await processDroppedDirectory(
                    childEntry, 
                    onFileFound,
                    (progress) => onProgress({
                      ...progress,
                      currentFile: `${entry.fullPath}/${progress.currentFile}`
                    })
                  );
                  results.push(...subdirFiles);
                } else if (childEntry.isFile) {
                  await new Promise(resolve => {
                    childEntry.file(file => {
                      const isAudioFile = SUPPORTED_AUDIO_TYPES.some(ext =>
                        file.name.toLowerCase().endsWith(ext)
                      );
                      
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
                        onFileFound(audioFile);
                      }
                      
                      resolve();
                    }, reject);
                  });
                }
              }
              
              // Continue reading more entries
              const moreResults = await readEntries();
              resolve([...results, ...moreResults]);
            }
          },
          reject
        );
      });
    };
    
    const allFiles = await readEntries();
    return [...audioFiles, ...allFiles];
  }
  
  return audioFiles;
};

/**
 * Reads a file from a handle and returns its contents
 * @param {FileSystemFileHandle} fileHandle - Handle to the file
 * @returns {Promise<File>} The file object
 */
const readFile = async (fileHandle) => {
  try {
    return await fileHandle.getFile();
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

/**
 * Reads a file as ArrayBuffer
 * @param {FileSystemFileHandle|File} fileHandleOrFile - Handle to the file or File object
 * @returns {Promise<ArrayBuffer>} The file contents as ArrayBuffer
 */
const readFileAsArrayBuffer = async (fileHandleOrFile) => {
  try {
    // Get the File object if a handle was provided
    const file = fileHandleOrFile instanceof File
      ? fileHandleOrFile
      : await fileHandleOrFile.getFile();

    return await file.arrayBuffer();
  } catch (error) {
    console.error('Error reading file as array buffer:', error);
    throw error;
  }
};

/**
 * Utility function to convert File System Access API paths to app-relative paths
 * @param {FileSystemDirectoryHandle} rootHandle - The root directory handle
 * @param {FileSystemFileHandle} fileHandle - The file handle to get path for
 * @returns {Promise<string>} Relative path from the root
 */
const getRelativePath = async (rootHandle, fileHandle) => {
  try {
    // This is a simplified implementation
    // In a full implementation, we would need to traverse the directory tree
    const rootPath = rootHandle.name;
    const filePath = fileHandle.name;

    return `${rootPath}/${filePath}`;
  } catch (error) {
    console.error('Error getting relative path:', error);
    return fileHandle.name;
  }
};

/**
 * Gets the MIME type for a file extension
 * @param {string} filename - Filename or extension
 * @returns {string} MIME type or empty string if unknown
 */
const getMimeTypeFromFileName = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();

  const mimeTypes = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'aac': 'audio/aac',
    'opus': 'audio/opus',
    'wma': 'audio/x-ms-wma'
  };

  return mimeTypes[ext] || '';
};

/**
 * Creates a blob URL for a file
 * @param {File} file - File object
 * @returns {string} Blob URL
 */
const createBlobURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a previously created blob URL
 * @param {string} url - Blob URL to revoke
 */
const revokeBlobURL = (url) => {
  URL.revokeObjectURL(url);
};

/**
 * Legacy folder input for browsers that don't support File System Access API
 * @returns {Promise<FileList|null>} Selected files or null if canceled/unsupported
 */
const legacyFolderSelect = () => {
  return new Promise((resolve) => {
    // Create a temporary file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    input.directory = true;

    input.onchange = () => {
      resolve(input.files);
    };

    input.oncancel = () => {
      resolve(null);
    };

    // Trigger click event to open file dialog
    input.click();
  });
};

/**
 * Takes a FileList object and filters for audio files
 * @param {FileList} fileList - FileList object from input element
 * @returns {Array} Array of audio files
 */
const filterAudioFilesFromFileList = (fileList) => {
  const audioFiles = [];

  if (!fileList) return audioFiles;

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    // Check if file is an audio file
    const isAudioFile = SUPPORTED_AUDIO_TYPES.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (isAudioFile) {
      const path = file.webkitRelativePath || file.name;
      const pathParts = path.split('/');
      const directory = pathParts.slice(0, -1).join('/');

      const audioFile = {
        name: file.name,
        path: path,
        directory: directory,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type,
        file: file
      };

      audioFiles.push(audioFile);
    }
  }

  return audioFiles;
};

/**
 * Check if an item from a drop event is a directory
 * @param {DataTransferItem} item - Item from drop event
 * @returns {boolean} True if the item is a directory
 */
const isItemDirectory = (item) => {
  if (!item) return false;
  
  // Modern browsers with File System Access API
  if ('getAsFileSystemHandle' in DataTransferItem.prototype) {
    return item.kind === 'directory';
  }
  
  // WebKit based browsers
  if (item.webkitGetAsEntry) {
    const entry = item.webkitGetAsEntry();
    return entry && entry.isDirectory;
  }
  
  return false;
};

// Export the service functions
export {
  selectFolder,
  selectAudioFiles,
  scanDirectoryForAudioFiles,
  processDroppedDirectory,
  readFile,
  readFileAsArrayBuffer,
  getRelativePath,
  getMimeTypeFromFileName,
  createBlobURL,
  revokeBlobURL,
  legacyFolderSelect,
  filterAudioFilesFromFileList,
  isFileSystemAccessSupported,
  isItemDirectory,
  SUPPORTED_AUDIO_TYPES
};

export default {
  selectFolder,
  selectAudioFiles,
  scanDirectoryForAudioFiles,
  processDroppedDirectory,
  readFile,
  readFileAsArrayBuffer,
  getRelativePath,
  getMimeTypeFromFileName,
  createBlobURL,
  revokeBlobURL,
  legacyFolderSelect,
  filterAudioFilesFromFileList,
  isFileSystemAccessSupported,
  isItemDirectory,
  SUPPORTED_AUDIO_TYPES
};