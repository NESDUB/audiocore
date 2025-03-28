import React, { createContext, useContext, useState, useEffect, useReducer } from 'react';
import { scanDirectoryForAudioFiles } from '../../../services/FileSystemService';
import { extractMetadata } from '../../../services/MetadataService';

// Define library item types
export const LIBRARY_ITEM_TYPES = {
  TRACK: 'track',
  ALBUM: 'album',
  ARTIST: 'artist',
  PLAYLIST: 'playlist',
  FOLDER: 'folder'
};

// Initial library state
const initialLibraryState = {
  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
  folders: [],
  isScanning: false,
  scanProgress: 0,
  scanTotal: 0,
  lastScanDate: null,
  error: null,
  isInitialized: false
};

// Library action types
export const LIBRARY_ACTIONS = {
  SET_TRACKS: 'SET_TRACKS',
  ADD_TRACKS: 'ADD_TRACKS',
  REMOVE_TRACKS: 'REMOVE_TRACKS',
  UPDATE_TRACK: 'UPDATE_TRACK',
  SET_ALBUMS: 'SET_ALBUMS',
  ADD_ALBUMS: 'ADD_ALBUMS',
  REMOVE_ALBUMS: 'REMOVE_ALBUMS',
  SET_ARTISTS: 'SET_ARTISTS',
  ADD_ARTISTS: 'ADD_ARTISTS',
  REMOVE_ARTISTS: 'REMOVE_ARTISTS',
  SET_PLAYLISTS: 'SET_PLAYLISTS',
  ADD_PLAYLISTS: 'ADD_PLAYLISTS',
  REMOVE_PLAYLISTS: 'REMOVE_PLAYLISTS',
  ADD_FOLDER: 'ADD_FOLDER',
  REMOVE_FOLDER: 'REMOVE_FOLDER',
  SET_SCANNING: 'SET_SCANNING',
  SET_SCAN_PROGRESS: 'SET_SCAN_PROGRESS',
  SET_SCAN_TOTAL: 'SET_SCAN_TOTAL',
  SET_SCAN_COMPLETE: 'SET_SCAN_COMPLETE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_LIBRARY: 'RESET_LIBRARY',
  INITIALIZE: 'INITIALIZE'
};

// Library reducer
const libraryReducer = (state, action) => {
  switch (action.type) {
    case LIBRARY_ACTIONS.SET_TRACKS:
      return { ...state, tracks: action.payload };
    case LIBRARY_ACTIONS.ADD_TRACKS:
      return {
        ...state,
        tracks: [...state.tracks, ...action.payload.filter(
          track => !state.tracks.some(t => t.id === track.id)
        )]
      };
    case LIBRARY_ACTIONS.REMOVE_TRACKS:
      return {
        ...state,
        tracks: state.tracks.filter(track => !action.payload.includes(track.id))
      };
    case LIBRARY_ACTIONS.UPDATE_TRACK:
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === action.payload.id ? { ...track, ...action.payload } : track
        )
      };
    case LIBRARY_ACTIONS.SET_ALBUMS:
      return { ...state, albums: action.payload };
    case LIBRARY_ACTIONS.ADD_ALBUMS:
      return {
        ...state,
        albums: [...state.albums, ...action.payload.filter(
          album => !state.albums.some(a => a.id === album.id)
        )]
      };
    case LIBRARY_ACTIONS.REMOVE_ALBUMS:
      return {
        ...state,
        albums: state.albums.filter(album => !action.payload.includes(album.id))
      };
    case LIBRARY_ACTIONS.SET_ARTISTS:
      return { ...state, artists: action.payload };
    case LIBRARY_ACTIONS.ADD_ARTISTS:
      return {
        ...state,
        artists: [...state.artists, ...action.payload.filter(
          artist => !state.artists.some(a => a.id === artist.id)
        )]
      };
    case LIBRARY_ACTIONS.REMOVE_ARTISTS:
      return {
        ...state,
        artists: state.artists.filter(artist => !action.payload.includes(artist.id))
      };
    case LIBRARY_ACTIONS.SET_PLAYLISTS:
      return { ...state, playlists: action.payload };
    case LIBRARY_ACTIONS.ADD_PLAYLISTS:
      return {
        ...state,
        playlists: [...state.playlists, ...action.payload.filter(
          playlist => !state.playlists.some(p => p.id === playlist.id)
        )]
      };
    case LIBRARY_ACTIONS.REMOVE_PLAYLISTS:
      return {
        ...state,
        playlists: state.playlists.filter(playlist => !action.payload.includes(playlist.id))
      };
    case LIBRARY_ACTIONS.ADD_FOLDER:
      return {
        ...state,
        folders: [...state.folders, action.payload].filter(
          (folder, index, self) =>
            self.findIndex(f => f.path === folder.path) === index
        )
      };
    case LIBRARY_ACTIONS.REMOVE_FOLDER:
      return {
        ...state,
        folders: state.folders.filter(folder => folder.path !== action.payload)
      };
    case LIBRARY_ACTIONS.SET_SCANNING:
      return { ...state, isScanning: action.payload };
    case LIBRARY_ACTIONS.SET_SCAN_PROGRESS:
      return { ...state, scanProgress: action.payload };
    case LIBRARY_ACTIONS.SET_SCAN_TOTAL:
      return { ...state, scanTotal: action.payload };
    case LIBRARY_ACTIONS.SET_SCAN_COMPLETE:
      return {
        ...state,
        isScanning: false,
        scanProgress: 0,
        lastScanDate: new Date().toISOString()
      };
    case LIBRARY_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case LIBRARY_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case LIBRARY_ACTIONS.RESET_LIBRARY:
      return {
        ...initialLibraryState,
        isInitialized: state.isInitialized
      };
    case LIBRARY_ACTIONS.INITIALIZE:
      return { ...state, isInitialized: true };
    default:
      return state;
  }
};

// Create library context
export const LibraryContext = createContext({
  state: initialLibraryState,
  dispatch: () => {},
  addFolder: () => {},
  removeFolder: () => {},
  scanLibrary: () => {},
  importTracks: () => {},
  getMostPlayed: () => [],
  getRecentlyAdded: () => [],
  getRecentlyPlayed: () => [],
  getTracksByAlbum: () => [],
  getTracksByArtist: () => [],
  getTracksByPlaylist: () => [],
  searchLibrary: () => ({ tracks: [], albums: [], artists: [], playlists: [] }),
  createPlaylist: () => {},
  addToPlaylist: () => {},
  removeFromPlaylist: () => {},
  clearLibrary: () => {},
});

// Hook to use the library context
export const useLibrary = () => useContext(LibraryContext);

/**
 * LibraryProvider component - manages the library state
 */
export const LibraryProvider = ({ children }) => {
  // Use reducer for library state management
  const [state, dispatch] = useReducer(libraryReducer, initialLibraryState);

  // Load library from storage on mount
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        // Check if library exists in IndexedDB
        if (localStorage.getItem('audiocore_library_exists')) {
          const db = await openLibraryDB();
          const tx = db.transaction('library', 'readonly');
          const store = tx.objectStore('library');
          const request = store.get('main');
          
          const result = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          
          if (result && result.data) {
            const parsedLibrary = result.data;
            
            // Dispatch actions to set up library state
            if (parsedLibrary.tracks) dispatch({ type: LIBRARY_ACTIONS.SET_TRACKS, payload: parsedLibrary.tracks });
            if (parsedLibrary.albums) dispatch({ type: LIBRARY_ACTIONS.SET_ALBUMS, payload: parsedLibrary.albums });
            if (parsedLibrary.artists) dispatch({ type: LIBRARY_ACTIONS.SET_ARTISTS, payload: parsedLibrary.artists });
            if (parsedLibrary.playlists) dispatch({ type: LIBRARY_ACTIONS.SET_PLAYLISTS, payload: parsedLibrary.playlists });
            if (parsedLibrary.folders) {
              parsedLibrary.folders.forEach(folder => {
                dispatch({ type: LIBRARY_ACTIONS.ADD_FOLDER, payload: folder });
              });
            }
            
            // Attempt to restore persisted handles
            await restorePersistedHandles(parsedLibrary.folders || []);
          }
        } else {
          // Legacy: try loading from localStorage (for backward compatibility)
          const storedLibrary = localStorage.getItem('audiocore_library');
          
          if (storedLibrary) {
            const parsedLibrary = JSON.parse(storedLibrary);
            
            // Dispatch actions to set up library state
            if (parsedLibrary.tracks) dispatch({ type: LIBRARY_ACTIONS.SET_TRACKS, payload: parsedLibrary.tracks });
            if (parsedLibrary.albums) dispatch({ type: LIBRARY_ACTIONS.SET_ALBUMS, payload: parsedLibrary.albums });
            if (parsedLibrary.artists) dispatch({ type: LIBRARY_ACTIONS.SET_ARTISTS, payload: parsedLibrary.artists });
            if (parsedLibrary.playlists) dispatch({ type: LIBRARY_ACTIONS.SET_PLAYLISTS, payload: parsedLibrary.playlists });
            if (parsedLibrary.folders) {
              parsedLibrary.folders.forEach(folder => {
                dispatch({ type: LIBRARY_ACTIONS.ADD_FOLDER, payload: folder });
              });
            }
            
            // Attempt to restore persisted handles
            await restorePersistedHandles(parsedLibrary.folders || []);
          }
        }
        
        // Mark library as initialized
        dispatch({ type: LIBRARY_ACTIONS.INITIALIZE });
      } catch (error) {
        console.error('Failed to load library:', error);
        dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to load library' });
      }
    };
    
    loadLibrary();
  }, []);

  // Save library to storage when it changes
  useEffect(() => {
    if (state.isInitialized) {
      try {
        const libraryData = {
          tracks: state.tracks,
          albums: state.albums,
          artists: state.artists,
          playlists: state.playlists,
          folders: state.folders,
          lastScanDate: state.lastScanDate
        };

        // Save to IndexedDB instead of localStorage
        const saveToIndexedDB = async () => {
          const db = await openLibraryDB();
          const tx = db.transaction('library', 'readwrite');
          const store = tx.objectStore('library');
          await store.put({ id: 'main', data: libraryData });
          await tx.complete;
        };
        
        saveToIndexedDB().catch(err => console.error('Failed to save library to IndexedDB:', err));
        
        // Store a small flag in localStorage that library exists in IndexedDB
        localStorage.setItem('audiocore_library_exists', 'true');
      } catch (error) {
        console.error('Failed to save library:', error);
      }
    }
  }, [state.tracks, state.albums, state.artists, state.playlists, state.folders, state.lastScanDate, state.isInitialized]);

  // Add this function to open the library database
  const openLibraryDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('audiocore_library', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('library')) {
          db.createObjectStore('library', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  /**
   * Open IndexedDB database for folder handles
   */
  const openFolderHandlesDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('audiocore_folder_handles', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles', { keyPath: 'path' });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  /**
   * Persist folder handle permissions
   * @param {FileSystemHandle} handle - The folder handle to persist
   */
  const persistFolderHandle = async (handle) => {
    try {
      // Request persistent storage permission
      const persistencePermission = await navigator.storage.persist();

      // Store the handle in IndexedDB for persistence
      const db = await openFolderHandlesDB();
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      await store.put({
        path: handle.name,
        handle: handle
      });
      await tx.complete;

      return true;
    } catch (error) {
      console.error('Failed to persist folder handle:', error);
      return false;
    }
  };

  /**
   * Retrieve persisted folder handles
   */
  const retrievePersistedHandles = async () => {
    try {
      const db = await openFolderHandlesDB();
      const tx = db.transaction('handles', 'readonly');
      const store = tx.objectStore('handles');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to retrieve persisted handles:', error);
      return [];
    }
  };

  /**
   * Add a folder to the library
   * @param {Object} folder - Folder object with path and name
   */
  const addFolder = async (folder) => {
    try {
      // For folders with a File System Access API handle,
      // store a flag indicating it's a FileSystemDirectoryHandle
      if (folder.handle && typeof folder.handle.entries === 'function') {
        // Attempt to persist the handle
        await persistFolderHandle(folder.handle);

        folder = {
          ...folder,
          hasValidHandle: true,
          // Keep the handle in memory for this session
          _handle: folder.handle,
          // Store a timestamp for handle validation
          handleTimestamp: Date.now()
        };

        // Remove the handle from the stored object
        const { handle, ...folderToStore } = folder;
        dispatch({ type: LIBRARY_ACTIONS.ADD_FOLDER, payload: folderToStore });
      } else {
        dispatch({ type: LIBRARY_ACTIONS.ADD_FOLDER, payload: folder });
      }
      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to add folder' });
      return false;
    }
  };

  /**
   * Restore persisted folder handles
   * @param {Array} folders - Array of folder objects
   */
  const restorePersistedHandles = async (folders) => {
    try {
      const persistedHandles = await retrievePersistedHandles();
      
      // Mark all folders with potential handles for restoration on next user interaction
      for (const folder of folders) {
        if (folder.hasValidHandle) {
          const match = persistedHandles.find(h => h.path === folder.path);
          
          if (match && match.handle) {
            // Store the handle but mark it as needing permission verification
            dispatch({
              type: LIBRARY_ACTIONS.REMOVE_FOLDER,
              payload: folder.path
            });
            
            dispatch({
              type: LIBRARY_ACTIONS.ADD_FOLDER,
              payload: {
                ...folder,
                _handle: match.handle,
                handleTimestamp: Date.now(),
                needsPermissionVerification: true
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error restoring folder handles:', error);
    }
  };

  /**
   * Remove a folder from the library
   * @param {string} folderPath - Path of the folder to remove
   */
  const removeFolder = (folderPath) => {
    try {
      dispatch({ type: LIBRARY_ACTIONS.REMOVE_FOLDER, payload: folderPath });
      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to remove folder' });
      return false;
    }
  };

  /**
   * Verify folder permissions after user interaction
   * This should be called on first user interaction (e.g., click on scan button)
   */
  const verifyFolderPermissions = async () => {
    try {
      const foldersNeedingVerification = state.folders.filter(f => f.needsPermissionVerification && f._handle);
      
      if (foldersNeedingVerification.length === 0) return;
      
      // Process each folder that needs verification
      for (const folder of foldersNeedingVerification) {
        try {
          // Try to request permission now that we have user interaction
          const permission = await folder._handle.requestPermission({ mode: 'read' });
          
          // Update the folder status based on permission result
          dispatch({
            type: LIBRARY_ACTIONS.REMOVE_FOLDER,
            payload: folder.path
          });
          
          dispatch({
            type: LIBRARY_ACTIONS.ADD_FOLDER,
            payload: {
              ...folder,
              needsPermissionVerification: false,
              hasValidHandle: permission === 'granted'
            }
          });
        } catch (permError) {
          console.warn(`Cannot verify permissions for folder ${folder.path}:`, permError);
          // Mark as invalid handle
          dispatch({
            type: LIBRARY_ACTIONS.REMOVE_FOLDER,
            payload: folder.path
          });
          
          dispatch({
            type: LIBRARY_ACTIONS.ADD_FOLDER,
            payload: {
              ...folder,
              needsPermissionVerification: false,
              hasValidHandle: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error verifying folder permissions:', error);
    }
  };

  /**
   * Scan library folders for music files
   */
  const scanLibrary = async () => {
    if (state.isScanning) return false;

    try {
      // First verify folder permissions since we now have user interaction
      await verifyFolderPermissions();
      
      // Start scanning
      dispatch({ type: LIBRARY_ACTIONS.SET_SCANNING, payload: true });
      dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, payload: 0 });
      dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_TOTAL, payload: 0 });

      // Track total expected work (discovery + metadata + import)
      // Each file needs to go through these phases
      let totalExpectedWork = 0;

      // Process each folder in the library
      const allAudioFiles = [];
      let filesProcessed = 0;
      let processedFolders = 0;

      // Track progress for each folder
      for (const folder of state.folders) {
        try {
          // For folders with a valid File System API handle in memory
          if (folder._handle && typeof folder._handle.entries === 'function') {
            const onFileFound = (audioFile) => {
              allAudioFiles.push(audioFile);
              filesProcessed++;

              // Update progress
              dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, payload: filesProcessed });
            };

            const onProgress = (progress) => {
              // Each file needs to go through 3 phases
              const totalExpectedWork = progress.filesFound * 3;
              dispatch({
                type: LIBRARY_ACTIONS.SET_SCAN_TOTAL,
                payload: totalExpectedWork
              });
            };

            // Use the scanDirectoryForAudioFiles function from FileSystemService
            await scanDirectoryForAudioFiles(
              folder._handle,
              onFileFound,
              onProgress
            );

            processedFolders++;
          }
          // For a folder that had a handle but was serialized (lost the handle)
          else if (folder.hasValidHandle) {
            // We need to inform the user they need to re-add the folder
            console.warn(`Folder handle for ${folder.path} was lost due to page reload. Please re-add the folder.`);

            // We can attempt to display a message to the user here,
            // but for now we'll just skip this folder
          }
          // For legacy folders or folders with files already collected
          else if (folder.files) {
            allAudioFiles.push(...folder.files);

            // Update progress for legacy folders
            filesProcessed += folder.files.length;
            dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, payload: filesProcessed });
            dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_TOTAL, payload: filesProcessed });

            processedFolders++;
          }
        } catch (error) {
          console.error(`Error scanning folder ${folder.path}:`, error);
        }
      }

      // If no folders could be processed, show an appropriate error
      if (processedFolders === 0) {
        dispatch({
          type: LIBRARY_ACTIONS.SET_ERROR,
          payload: 'No valid folders to scan. Please try adding your music folders again.'
        });
        dispatch({ type: LIBRARY_ACTIONS.SET_SCANNING, payload: false });
        return false;
      }

      // Process all found audio files
      const tracksToImport = [];

      for (const audioFile of allAudioFiles) {
        try {
          // Extract metadata using MetadataService
          const metadata = await extractMetadata(audioFile.file);

          // Update progress for metadata extraction phase
          filesProcessed++;
          dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, payload: filesProcessed });

          // Create track object - FIXED DUPLICATE PATH PROPERTY
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
            url: audioFile.file ? URL.createObjectURL(audioFile.file) : null,
            fileName: audioFile.name,
            fileSize: audioFile.size,
            fileType: audioFile.type,
            dateAdded: new Date().toISOString(),
            playCount: 0,
            lastPlayed: null
          };

          tracksToImport.push(track);
        } catch (error) {
          console.error(`Error processing file ${audioFile.name}:`, error);
        }
      }

      // Import tracks into library
      if (tracksToImport.length > 0) {
        // Update progress for the final import phase
        const importPhaseProgress = tracksToImport.length;
        filesProcessed += importPhaseProgress;
        dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, payload: filesProcessed });

        // Use existing importTracks function
        await importTracks(tracksToImport);
      } else {
        // No tracks found
        dispatch({
          type: LIBRARY_ACTIONS.SET_ERROR,
          payload: 'No audio files found in the selected folders.'
        });
      }

      // Mark scan as complete
      dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_COMPLETE });
      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Scan failed: ' + error.message });
      dispatch({ type: LIBRARY_ACTIONS.SET_SCANNING, payload: false });
      return false;
    }
  };

  /**
   * Import tracks into the library
   * @param {Array} tracks - Array of track objects to import
   */
  const importTracks = (tracks) => {
    try {
      // Process tracks to extract albums and artists
      const albums = {};
      const artists = {};

      tracks.forEach(track => {
        // Process album
        if (track.album) {
          const albumId = `album-${track.album.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          if (!albums[albumId]) {
            albums[albumId] = {
              id: albumId,
              title: track.album,
              artist: track.artist,
              year: track.year,
              tracks: []
            };
          }

          albums[albumId].tracks.push(track.id);
        }

        // Process artist
        if (track.artist) {
          const artistId = `artist-${track.artist.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          if (!artists[artistId]) {
            artists[artistId] = {
              id: artistId,
              name: track.artist,
              albums: []
            };
          }

          if (track.album && !artists[artistId].albums.includes(track.album)) {
            artists[artistId].albums.push(track.album);
          }
        }
      });

      // Add tracks to library
      dispatch({ type: LIBRARY_ACTIONS.ADD_TRACKS, payload: tracks });

      // Add albums to library
      dispatch({
        type: LIBRARY_ACTIONS.ADD_ALBUMS,
        payload: Object.values(albums)
      });

      // Add artists to library
      dispatch({
        type: LIBRARY_ACTIONS.ADD_ARTISTS,
        payload: Object.values(artists)
      });

      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Import failed: ' + error.message });
      return false;
    }
  };

  /**
   * Get most played tracks
   * @param {number} limit - Maximum number of tracks to return
   * @returns {Array} Array of track objects
   */
  const getMostPlayed = (limit = 10) => {
    return [...state.tracks]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, limit);
  };

  /**
   * Get recently added tracks
   * @param {number} limit - Maximum number of tracks to return
   * @returns {Array} Array of track objects
   */
  const getRecentlyAdded = (limit = 10) => {
    return [...state.tracks]
      .sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0))
      .slice(0, limit);
  };

  /**
   * Get recently played tracks
   * @param {number} limit - Maximum number of tracks to return
   * @returns {Array} Array of track objects
   */
  const getRecentlyPlayed = (limit = 10) => {
    return [...state.tracks]
      .filter(track => track.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
      .slice(0, limit);
  };

  /**
   * Get tracks by album
   * @param {string} albumId - Album ID
   * @returns {Array} Array of track objects
   */
  const getTracksByAlbum = (albumId) => {
    const album = state.albums.find(a => a.id === albumId);
    if (!album) return [];

    return state.tracks.filter(track => album.tracks.includes(track.id));
  };

  /**
   * Get tracks by artist
   * @param {string} artistId - Artist ID
   * @returns {Array} Array of track objects
   */
  const getTracksByArtist = (artistId) => {
    const artist = state.artists.find(a => a.id === artistId);
    if (!artist) return [];

    return state.tracks.filter(track => track.artist === artist.name);
  };

  /**
   * Get tracks by playlist
   * @param {string} playlistId - Playlist ID
   * @returns {Array} Array of track objects
   */
  const getTracksByPlaylist = (playlistId) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (!playlist) return [];

    return state.tracks.filter(track => playlist.tracks.includes(track.id));
  };

  /**
   * Search library for tracks, albums, artists, and playlists
   * @param {string} query - Search query
   * @returns {Object} Object with tracks, albums, artists, and playlists arrays
   */
  const searchLibrary = (query) => {
    if (!query) return { tracks: [], albums: [], artists: [], playlists: [] };

    const lowercaseQuery = query.toLowerCase();

    const filteredTracks = state.tracks.filter(track =>
      (track.title && track.title.toLowerCase().includes(lowercaseQuery)) ||
      (track.artist && track.artist.toLowerCase().includes(lowercaseQuery)) ||
      (track.album && track.album.toLowerCase().includes(lowercaseQuery))
    );

    const filteredAlbums = state.albums.filter(album =>
      (album.title && album.title.toLowerCase().includes(lowercaseQuery)) ||
      (album.artist && album.artist.toLowerCase().includes(lowercaseQuery))
    );

    const filteredArtists = state.artists.filter(artist =>
      (artist.name && artist.name.toLowerCase().includes(lowercaseQuery))
    );

    const filteredPlaylists = state.playlists.filter(playlist =>
      (playlist.name && playlist.name.toLowerCase().includes(lowercaseQuery))
    );

    return {
      tracks: filteredTracks,
      albums: filteredAlbums,
      artists: filteredArtists,
      playlists: filteredPlaylists
    };
  };

  /**
   * Create a new playlist
   * @param {Object} playlist - Playlist object with name and description
   */
  const createPlaylist = (playlist) => {
    try {
      const newPlaylist = {
        ...playlist,
        id: `playlist-${Date.now()}`,
        tracks: [],
        dateCreated: new Date().toISOString()
      };

      dispatch({ type: LIBRARY_ACTIONS.ADD_PLAYLISTS, payload: [newPlaylist] });
      return newPlaylist.id;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to create playlist' });
      return null;
    }
  };

  /**
   * Add tracks to a playlist
   * @param {string} playlistId - Playlist ID
   * @param {Array} trackIds - Array of track IDs to add
   */
  const addToPlaylist = (playlistId, trackIds) => {
    try {
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');

      const updatedPlaylist = {
        ...playlist,
        tracks: [...new Set([...playlist.tracks, ...trackIds])]
      };

      dispatch({
        type: LIBRARY_ACTIONS.SET_PLAYLISTS,
        payload: state.playlists.map(p => p.id === playlistId ? updatedPlaylist : p)
      });

      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to add to playlist' });
      return false;
    }
  };

  /**
   * Remove tracks from a playlist
   * @param {string} playlistId - Playlist ID
   * @param {Array} trackIds - Array of track IDs to remove
   */
  const removeFromPlaylist = (playlistId, trackIds) => {
    try {
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');

      const updatedPlaylist = {
        ...playlist,
        tracks: playlist.tracks.filter(id => !trackIds.includes(id))
      };

      dispatch({
        type: LIBRARY_ACTIONS.SET_PLAYLISTS,
        payload: state.playlists.map(p => p.id === playlistId ? updatedPlaylist : p)
      });

      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to remove from playlist' });
      return false;
    }
  };

  /**
   * Clear the entire library
   */
  const clearLibrary = () => {
    try {
      dispatch({ type: LIBRARY_ACTIONS.RESET_LIBRARY });
      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to clear library' });
      return false;
    }
  };

  // Create context value
  const contextValue = {
    state,
    dispatch,
    addFolder,
    removeFolder,
    scanLibrary,
    importTracks,
    getMostPlayed,
    getRecentlyAdded,
    getRecentlyPlayed,
    getTracksByAlbum,
    getTracksByArtist,
    getTracksByPlaylist,
    searchLibrary,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    clearLibrary
  };

  return (
    <LibraryContext.Provider value={contextValue}>
      {children}
    </LibraryContext.Provider>
  );
};

export default LibraryProvider;