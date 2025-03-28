/**
 * FileSystemService.js
 * Service for handling file system operations in the browser environment
 * Enhanced with robust error handling, retries, and fallbacks
 */

// Audio file types that are supported with both extensions and MIME types
const SUPPORTED_AUDIO_TYPES = {
  extensions: ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.wma', '.alac', '.ape'],
  mimeTypes: [
    'audio/mpeg', 'audio/mp3', 
    'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/flac', 'audio/x-flac',
    'audio/ogg', 'audio/vorbis', 'application/ogg',
    'audio/mp4', 'audio/x-m4a', 'audio/m4a',
    'audio/aac', 'audio/x-aac',
    'audio/opus',
    'audio/x-ms-wma',
    'audio/alac',
    'audio/ape', 'audio/x-ape'
  ],
  // Map extensions to MIME types for fallback detection
  extensionToMime: {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.opus': 'audio/opus',
    '.wma': 'audio/x-ms-wma',
    '.alac': 'audio/alac',
    '.ape': 'audio/ape'
  }
};

// Maximum number of retries for file operations
const MAX_RETRIES = 3;

// Timeout for file operations in milliseconds
const OPERATION_TIMEOUT = 30000; // 30 seconds

// Check if the File System Access API is available
const isFileSystemAccessSupported = () => {
  return typeof window !== 'undefined' && 
    'showDirectoryPicker' in window && 
    'showOpenFilePicker' in window;
};

/**
 * Creates a promise with timeout rejection
 * @param {Promise} promise - The promise to add timeout to
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} errorMessage - Error message for timeout
 * @returns {Promise} Promise with timeout
 */
const promiseWithTimeout = (promise, timeoutMs, errorMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

/**
 * Implements a retry mechanism with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise} Result of the operation
 */
const withRetry = async (operation, maxRetries = MAX_RETRIES, initialDelay = 200) => {
  let lastError;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry for user cancellations or permission issues
      if (error.name === 'AbortError' || error.name === 'NotAllowedError' || 
          error.message?.includes('permission')) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempts === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = initialDelay * Math.pow(2, attempts) * (0.9 + Math.random() * 0.2);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }
  }
  
  throw lastError;
};

/**
 * Safely checks if a value is a valid File object
 * @param {any} value - Value to check
 * @returns {boolean} True if value is a valid File
 */
const isValidFile = (value) => {
  return value instanceof File && 
         typeof value.name === 'string' && 
         typeof value.size === 'number' && 
         value.size > 0;
};

/**
 * Checks if a file is an audio file based on extension and MIME type
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} True if it's an audio file
 */
const isAudioFile = (filename, mimeType) => {
  if (!filename) return false;
  
  // Check by extension
  const extension = ('.' + filename.split('.').pop()).toLowerCase();
  const isAudioByExtension = SUPPORTED_AUDIO_TYPES.extensions.includes(extension);
  
  // Check by MIME type if available
  const isAudioByMime = mimeType && SUPPORTED_AUDIO_TYPES.mimeTypes.includes(mimeType);
  
  // If MIME type is available but doesn't match extension, use a fallback check
  if (mimeType && !isAudioByMime && isAudioByExtension) {
    const expectedMime = SUPPORTED_AUDIO_TYPES.extensionToMime[extension];
    if (expectedMime && mimeType.includes('audio/')) {
      // MIME type contains 'audio/' but doesn't match our exact list
      // This handles variant MIME types from different browsers
      return true;
    }
  }
  
  return isAudioByExtension || isAudioByMime;
};

/**
 * Opens a folder picker dialog and returns the selected directory handle
 * @returns {Promise<FileSystemDirectoryHandle|null>} Directory handle or null if canceled/unsupported
 */
const selectFolder = async () => {
  return withRetry(async () => {
    try {
      // Check for File System Access API support
      if (!isFileSystemAccessSupported()) {
        throw new Error('File System Access API is not supported in this browser');
      }

      // Show directory picker dialog with timeout
      const handle = await promiseWithTimeout(
        window.showDirectoryPicker({
          id: 'audiocore-music-library',
          mode: 'readwrite',
          startIn: 'music'
        }),
        OPERATION_TIMEOUT,
        'Folder selection timed out'
      );

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
  });
};

/**
 * Opens a file picker dialog for selecting multiple audio files
 * @returns {Promise<FileSystemFileHandle[]|null>} Array of file handles or null if canceled/unsupported
 */
const selectAudioFiles = async () => {
  return withRetry(async () => {
    try {
      // Check for File System Access API support
      if (!isFileSystemAccessSupported()) {
        throw new Error('File System Access API is not supported in this browser');
      }

      // File types array for the file picker
      const acceptedTypes = {
        'audio/*': SUPPORTED_AUDIO_TYPES.extensions
      };

      // Show file picker dialog with timeout
      const handles = await promiseWithTimeout(
        window.showOpenFilePicker({
          multiple: true,
          types: [
            {
              description: 'Audio Files',
              accept: acceptedTypes
            }
          ]
        }),
        OPERATION_TIMEOUT,
        'File selection timed out'
      );

      return handles;
    } catch (error) {
      console.error('Error selecting files:', error);
      // Don't throw if user cancelled
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  });
};

/**
 * Recursively scans a directory for audio files with chunking for large directories
 * @param {FileSystemDirectoryHandle} directoryHandle - Handle to the directory to scan
 * @param {Function} onFileFound - Callback function called when an audio file is found
 * @param {Function} onProgress - Callback function for progress updates
 * @param {string} [basePath=''] - Base path for relative file paths
 * @param {AbortSignal} [signal] - Signal for aborting the operation
 * @returns {Promise<Array>} Array of found audio files with metadata
 */
const scanDirectoryForAudioFiles = async (
  directoryHandle,
  onFileFound = () => {},
  onProgress = () => {},
  basePath = '',
  signal = null
) => {
  const audioFiles = [];
  const entriesCache = [];
  
  try {
    // Validate input
    if (!directoryHandle || typeof directoryHandle.entries !== 'function') {
      throw new Error('Invalid directory handle provided for scanning');
    }
    
    // Check if operation was aborted
    if (signal && signal.aborted) {
      throw new Error('Directory scan was aborted');
    }
    
    // First collect all entries to avoid iterator issues with large directories
    for await (const entry of directoryHandle.entries()) {
      entriesCache.push(entry);
      
      // Check for abort periodically
      if (signal && signal.aborted) {
        throw new Error('Directory scan was aborted');
      }
    }
    
    let entriesProcessed = 0;
    const totalEntries = entriesCache.length;
    
    // Process entries in chunks to avoid blocking the main thread
    for (let i = 0; i < entriesCache.length; i += 20) {
      const chunk = entriesCache.slice(i, i + 20);
      
      // Process each entry in the chunk
      await Promise.all(chunk.map(async ([name, handle]) => {
        try {
          // Build the current path
          const path = basePath ? `${basePath}/${name}` : name;
          
          if (handle.kind === 'directory') {
            // Recursively scan subdirectories
            const filesInSubDir = await scanDirectoryForAudioFiles(
              handle,
              onFileFound,
              (subProgress) => {
                onProgress({
                  ...subProgress,
                  currentFile: `${path}/${subProgress.currentFile || ''}`.replace(/\/+/g, '/'),
                  parentDirectory: basePath
                });
              },
              path,
              signal
            );
            
            // Merge results
            audioFiles.push(...filesInSubDir);
          } else if (handle.kind === 'file') {
            try {
              // Get file object
              const file = await handle.getFile();
              
              // Check if the file is an audio file (using both name and type)
              const isAudio = isAudioFile(name, file.type);
              
              if (isAudio) {
                // Create file object with path information
                const audioFile = {
                  name: file.name,
                  path: path,
                  directory: basePath,
                  size: file.size,
                  lastModified: file.lastModified,
                  type: file.type || getMimeTypeFromFileName(file.name),
                  handle: handle,
                  file: file
                };
                
                // Verify the file is valid
                if (isValidFile(file)) {
                  audioFiles.push(audioFile);
                  onFileFound(audioFile);
                } else {
                  console.warn(`Skipping invalid audio file: ${path}`, file);
                }
              }
            } catch (fileError) {
              console.error(`Error reading file ${name}:`, fileError);
              // Continue processing other files even if one fails
            }
          }
          
          // Update progress
          entriesProcessed++;
          onProgress({
            currentFile: path,
            filesFound: audioFiles.length,
            entriesProcessed,
            totalEntries,
            percentComplete: Math.round((entriesProcessed / totalEntries) * 100)
          });
        } catch (entryError) {
          console.error(`Error processing entry ${name}:`, entryError);
          // Continue with other entries
        }
      }));
      
      // Check for abort between chunks
      if (signal && signal.aborted) {
        throw new Error('Directory scan was aborted');
      }
      
      // Yield to main thread periodically
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return audioFiles;
  } catch (error) {
    console.error('Error scanning directory:', error);
    if (signal && signal.aborted) {
      // Return partial results when aborted
      return audioFiles;
    }
    throw error;
  }
};

/**
 * Process a dropped directory entry (from drag and drop) with improved reliability
 * @param {FileSystemDirectoryHandle|DataTransferItem} entry - Directory entry or DataTransferItem
 * @param {Function} onFileFound - Callback function called when an audio file is found
 * @param {Function} onProgress - Callback function for progress updates
 * @param {AbortSignal} [signal] - Signal for aborting the operation
 * @returns {Promise<Array>} Array of found audio files
 */
const processDroppedDirectory = async (entry, onFileFound = () => {}, onProgress = () => {}, signal = null) => {
  return withRetry(async () => {
    const audioFiles = [];
    
    // Check for abort
    if (signal && signal.aborted) {
      return audioFiles;
    }
    
    // For File System Access API
    if (entry.kind === 'directory' && typeof entry.entries === 'function') {
      return scanDirectoryForAudioFiles(entry, onFileFound, onProgress, '', signal);
    }
    
    // For older API (webkitGetAsEntry)
    if (entry.isDirectory) {
      const dirReader = entry.createReader();
      
      // Read entries recursively with chunking and error handling
      const readEntries = async () => {
        return new Promise((resolve, reject) => {
          const attemptRead = (retryCount = 0) => {
            dirReader.readEntries(
              async (entries) => {
                try {
                  // Check for abort
                  if (signal && signal.aborted) {
                    resolve([]);
                    return;
                  }
                  
                  if (entries.length === 0) {
                    resolve([]);
                    return;
                  }
                  
                  const results = [];
                  const entriesProcessed = { count: 0 };
                  const totalEntries = entries.length;
                  
                  // Process in smaller batches
                  for (let i = 0; i < entries.length; i += 5) {
                    const batch = entries.slice(i, i + 5);
                    
                    // Process each batch sequentially to avoid overwhelming the browser
                    for (const childEntry of batch) {
                      try {
                        if (signal && signal.aborted) {
                          break;
                        }
                        
                        if (childEntry.isDirectory) {
                          const subdirFiles = await processDroppedDirectory(
                            childEntry,
                            onFileFound,
                            (progress) => onProgress({
                              ...progress,
                              currentFile: `${entry.fullPath}/${progress.currentFile || ''}`.replace(/\/+/g, '/'),
                              parentDirectory: entry.fullPath
                            }),
                            signal
                          );
                          results.push(...subdirFiles);
                        } else if (childEntry.isFile) {
                          await new Promise((resolveFile, rejectFile) => {
                            childEntry.file(file => {
                              try {
                                // Check if it's an audio file based on name and type
                                const isAudioFileType = isAudioFile(file.name, file.type);
                                
                                if (isAudioFileType && isValidFile(file)) {
                                  const fullPath = childEntry.fullPath;
                                  const pathParts = fullPath.split('/');
                                  const directory = pathParts.slice(0, -1).join('/');
                                  
                                  const audioFile = {
                                    name: file.name,
                                    path: fullPath.substring(1), // Remove leading slash
                                    directory: directory.substring(1), // Remove leading slash
                                    size: file.size,
                                    lastModified: file.lastModified,
                                    type: file.type || getMimeTypeFromFileName(file.name),
                                    file: file
                                  };
                                  
                                  audioFiles.push(audioFile);
                                  onFileFound(audioFile);
                                }
                                resolveFile();
                              } catch (fileError) {
                                console.warn(`Error processing file ${file.name}:`, fileError);
                                resolveFile(); // Continue despite errors
                              }
                            }, error => {
                              console.warn('Error accessing file:', error);
                              resolveFile(); // Continue despite errors
                            });
                          });
                        }
                        
                        // Update progress
                        entriesProcessed.count++;
                        onProgress({
                          currentFile: childEntry.fullPath,
                          filesFound: audioFiles.length,
                          entriesProcessed: entriesProcessed.count,
                          totalEntries,
                          percentComplete: Math.round((entriesProcessed.count / totalEntries) * 100)
                        });
                      } catch (childError) {
                        console.warn(`Error processing entry: ${childEntry.fullPath || 'unknown'}`, childError);
                        // Continue with other entries
                      }
                      
                      // Yield to main thread periodically
                      await new Promise(resolve => setTimeout(resolve, 0));
                    }
                  }
                  
                  // Continue reading more entries (directory readers may return entries in chunks)
                  const moreResults = await readEntries();
                  resolve([...results, ...moreResults]);
                } catch (processError) {
                  console.error('Error processing entries:', processError);
                  // Partial results are better than no results
                  resolve(results || []);
                }
              },
              (error) => {
                // Retry on transient errors
                if (retryCount < MAX_RETRIES) {
                  console.warn(`Error reading entries, retrying (${retryCount + 1}/${MAX_RETRIES}):`, error);
                  setTimeout(() => attemptRead(retryCount + 1), 200 * Math.pow(2, retryCount));
                } else {
                  console.error('Failed to read directory entries after retries:', error);
                  // Resolve with empty array rather than failing completely
                  resolve([]);
                }
              }
            );
          };
          
          attemptRead();
        });
      };
      
      await readEntries();
      return audioFiles;
    }
    
    return audioFiles;
  });
};

/**
 * Reads a file from a handle and returns its contents
 * @param {FileSystemFileHandle} fileHandle - Handle to the file
 * @returns {Promise<File>} The file object
 */
const readFile = async (fileHandle) => {
  return withRetry(async () => {
    try {
      if (!fileHandle || typeof fileHandle.getFile !== 'function') {
        throw new Error('Invalid file handle provided');
      }
      
      const file = await promiseWithTimeout(
        fileHandle.getFile(),
        OPERATION_TIMEOUT,
        'File read operation timed out'
      );
      
      if (!isValidFile(file)) {
        throw new Error('Invalid file object received from file handle');
      }
      
      return file;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  });
};

/**
 * Reads a file as ArrayBuffer with chunking for large files
 * @param {FileSystemFileHandle|File} fileHandleOrFile - Handle to the file or File object
 * @param {Object} options - Options for reading
 * @param {boolean} options.useChunks - Whether to use chunking for large files
 * @param {number} options.chunkSize - Size of chunks in bytes
 * @param {Function} options.onProgress - Progress callback for chunked reading
 * @returns {Promise<ArrayBuffer>} The file contents as ArrayBuffer
 */
const readFileAsArrayBuffer = async (fileHandleOrFile, options = {}) => {
  return withRetry(async () => {
    try {
      const {
        useChunks = false,
        chunkSize = 1024 * 1024, // 1MB chunks
        onProgress = null
      } = options;
      
      // Get the File object if a handle was provided
      const file = fileHandleOrFile instanceof File
        ? fileHandleOrFile
        : await readFile(fileHandleOrFile);
      
      // Validate file
      if (!isValidFile(file)) {
        throw new Error('Invalid file object provided');
      }
      
      // For smaller files or when chunking is disabled, use standard method
      if (!useChunks || file.size <= chunkSize) {
        return await file.arrayBuffer();
      }
      
      // For larger files, read in chunks
      const chunks = [];
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        
        // Read chunk
        const blob = file.slice(start, end);
        const chunkArrayBuffer = await blob.arrayBuffer();
        chunks.push(chunkArrayBuffer);
        
        // Report progress
        if (onProgress) {
          onProgress({
            bytesRead: end,
            totalBytes: file.size,
            progress: Math.round((end / file.size) * 100),
            chunk: i + 1,
            totalChunks
          });
        }
        
        // Yield to main thread between chunks
        if (i < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }
      
      return result.buffer;
    } catch (error) {
      console.error('Error reading file as array buffer:', error);
      throw error;
    }
  });
};

/**
 * Utility function to convert File System Access API paths to app-relative paths
 * @param {FileSystemDirectoryHandle} rootHandle - The root directory handle
 * @param {FileSystemFileHandle} fileHandle - The file handle to get path for
 * @returns {Promise<string>} Relative path from the root
 */
const getRelativePath = async (rootHandle, fileHandle) => {
  try {
    // Check for the File System Access API's native relativePath method
    if (rootHandle && fileHandle && 'resolve' in rootHandle) {
      try {
        const relativePath = await rootHandle.resolve(fileHandle);
        if (relativePath !== null) {
          return relativePath.join('/');
        }
      } catch (resolveError) {
        console.warn('Native resolve path failed, falling back to manual method:', resolveError);
        // Fall back to name-based path
      }
    }
    
    // Fallback to simple name-based path
    const rootPath = rootHandle ? rootHandle.name : '';
    const filePath = fileHandle ? fileHandle.name : '';
    
    return rootPath ? `${rootPath}/${filePath}` : filePath;
  } catch (error) {
    console.error('Error getting relative path:', error);
    // Return a best-effort path instead of failing
    return fileHandle ? fileHandle.name : 'unknown';
  }
};

/**
 * Gets the MIME type for a file extension with fallbacks
 * @param {string} filename - Filename or extension
 * @returns {string} MIME type or audio/unknown if unknown
 */
const getMimeTypeFromFileName = (filename) => {
  if (!filename) return 'application/octet-stream';
  
  const ext = ('.' + filename.toLowerCase().split('.').pop());
  
  // Use our mapping from the audio types object
  const mimeType = SUPPORTED_AUDIO_TYPES.extensionToMime[ext];
  
  // Fallback for unknown audio extensions
  if (!mimeType && SUPPORTED_AUDIO_TYPES.extensions.includes(ext)) {
    return 'audio/unknown';
  }
  
  // Return mapped type or generic binary
  return mimeType || 'application/octet-stream';
};

/**
 * Creates a blob URL for a file with validation
 * @param {File|Blob} file - File or Blob object
 * @returns {string|null} Blob URL or null if invalid
 */
const createBlobURL = (file) => {
  try {
    if (!(file instanceof Blob)) {
      console.warn('Invalid file object provided to createBlobURL');
      return null;
    }
    
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Error creating blob URL:', error);
    return null;
  }
};

/**
 * Safely revokes a previously created blob URL
 * @param {string} url - Blob URL to revoke
 */
const revokeBlobURL = (url) => {
  try {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.warn('Error revoking blob URL:', error);
  }
};

/**
 * Legacy folder input for browsers that don't support File System Access API
 * @returns {Promise<FileList|null>} Selected files or null if canceled/unsupported
 */
const legacyFolderSelect = () => {
  return new Promise((resolve) => {
    try {
      // Create a temporary file input
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      
      // Try to set directory properties with fallbacks
      try {
        input.webkitdirectory = true;
      } catch (e) {}
      
      try {
        input.directory = true;
      } catch (e) {}
      
      // If neither directory property is supported, show warning
      if (!('webkitdirectory' in input) && !('directory' in input)) {
        console.warn('Directory selection not supported in this browser');
      }
      
      // Set up timeout to handle case where dialog is closed without selection
      let timeoutId = setTimeout(() => {
        document.body.removeChild(input);
        resolve(null);
      }, OPERATION_TIMEOUT);
      
      input.onchange = () => {
        clearTimeout(timeoutId);
        resolve(input.files);
        // Clean up input
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };
      
      input.oncancel = () => {
        clearTimeout(timeoutId);
        resolve(null);
        // Clean up input
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };
      
      // Need to add to DOM for some browsers
      input.style.display = 'none';
      document.body.appendChild(input);
      
      // Trigger click event to open file dialog
      input.click();
    } catch (error) {
      console.error('Error in legacy folder select:', error);
      resolve(null);
    }
  });
};

/**
 * Takes a FileList object and filters for audio files with improved validation
 * @param {FileList|Array<File>} fileList - FileList object from input element or array of Files
 * @returns {Array} Array of audio files
 */
const filterAudioFilesFromFileList = (fileList) => {
  const audioFiles = [];
  
  if (!fileList || fileList.length === 0) return audioFiles;
  
  // Convert FileList to Array for easier processing
  const files = Array.from(fileList);
  
  for (const file of files) {
    try {
      // Skip invalid files
      if (!isValidFile(file)) {
        console.warn(`Skipping invalid file object:`, file);
        continue;
      }
      
      // Check if file is an audio file
      if (isAudioFile(file.name, file.type)) {
        // Get path information
        const path = file.webkitRelativePath || file.name;
        const pathParts = path.split('/');
        const directory = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : '';
        
        const audioFile = {
          name: file.name,
          path: path,
          directory: directory,
          size: file.size,
          lastModified: file.lastModified,
          type: file.type || getMimeTypeFromFileName(file.name),
          file: file
        };
        
        audioFiles.push(audioFile);
      }
    } catch (error) {
      console.warn(`Error processing file ${file?.name || 'unknown'}:`, error);
      // Continue with other files
    }
  }
  
  return audioFiles;
};

/**
 * Check if an item from a drop event is a directory with better browser compatibility
 * @param {DataTransferItem} item - Item from drop event
 * @returns {Promise<boolean>} True if the item is a directory
 */
const isItemDirectory = async (item) => {
  if (!item) return false;
  
  try {
    // Modern browsers with File System Access API
    if ('getAsFileSystemHandle' in DataTransferItem.prototype) {
      try {
        const handle = await item.getAsFileSystemHandle();
        return handle && handle.kind === 'directory';
      } catch (e) {
        console.warn('getAsFileSystemHandle failed, trying alternative methods', e);
      }
    }
    
    // WebKit based browsers
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      return entry && entry.isDirectory;
    }
    
    // If we can't determine, assume it's not a directory
    return false;
  } catch (error) {
    console.warn('Error checking if item is directory:', error);
    return false;
  }
};

/**
 * Read binary file data in chunks
 * @param {File|Blob} file - File or blob to read
 * @param {Object} options - Reading options
 * @param {number} options.chunkSize - Size of chunks to read (default: 2MB)
 * @param {Function} options.onProgress - Progress callback
 * @param {AbortSignal} options.signal - AbortSignal to cancel reading
 * @returns {Promise<ArrayBuffer>} File data as ArrayBuffer
 */
const readBinaryFile = async (file, { 
  chunkSize = 2 * 1024 * 1024, 
  onProgress = null,
  signal = null
} = {}) => {
  return withRetry(async () => {
    if (!isValidFile(file)) {
      throw new Error('Invalid file provided to readBinaryFile');
    }
    
    // For small files, use the simple approach
    if (file.size <= chunkSize) {
      return await file.arrayBuffer();
    }
    
    const chunks = [];
    let bytesRead = 0;
    const fileSize = file.size;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Check for abort
      if (signal && signal.aborted) {
        throw new Error('File reading aborted');
      }
      
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = file.slice(start, end);
      
      try {
        const chunkBuffer = await chunk.arrayBuffer();
        chunks.push(chunkBuffer);
        bytesRead += chunkBuffer.byteLength;
        
        // Report progress
        if (onProgress) {
          onProgress({
            bytesRead,
            totalBytes: fileSize,
            progress: Math.round((bytesRead / fileSize) * 100),
            chunk: chunkIndex + 1,
            totalChunks
          });
        }
      } catch (chunkError) {
        console.error(`Error reading chunk ${chunkIndex}:`, chunkError);
        throw chunkError;
      }
      
      // Yield to main thread between chunks
      if (chunkIndex < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Combine all chunks into a single ArrayBuffer
    const result = new Uint8Array(bytesRead);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    
    return result.buffer;
  });
};

/**
 * Creates an AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Controller object with signal and abort method
 */
const createTimeoutController = (timeoutMs = OPERATION_TIMEOUT) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  // Extend the controller with a cleanup method
  const extendedController = {
    signal,
    abort: () => controller.abort(),
    cleanup: () => clearTimeout(timeoutId)
  };
  
  // Add event listener to clean up timeout when aborted
  signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return extendedController;
};

// Export the service functions
export {
  selectFolder,
  selectAudioFiles,
  scanDirectoryForAudioFiles,
  processDroppedDirectory,
  readFile,
  readFileAsArrayBuffer,
  readBinaryFile,
  getRelativePath,
  getMimeTypeFromFileName,
  createBlobURL,
  revokeBlobURL,
  legacyFolderSelect,
  filterAudioFilesFromFileList,
  isFileSystemAccessSupported,
  isItemDirectory,
  isAudioFile,
  isValidFile,
  createTimeoutController,
  withRetry,
  promiseWithTimeout,
  SUPPORTED_AUDIO_TYPES
};

export default {
  selectFolder,
  selectAudioFiles,
  scanDirectoryForAudioFiles,
  processDroppedDirectory,
  readFile,
  readFileAsArrayBuffer,
  readBinaryFile,
  getRelativePath,
  getMimeTypeFromFileName,
  createBlobURL,
  revokeBlobURL,
  legacyFolderSelect,
  filterAudioFilesFromFileList,
  isFileSystemAccessSupported,
  isItemDirectory,
  isAudioFile,
  isValidFile,
  createTimeoutController,
  withRetry,
  promiseWithTimeout,
  SUPPORTED_AUDIO_TYPES
};