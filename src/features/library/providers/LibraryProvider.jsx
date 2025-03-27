import React, { createContext, useContext, useState, useEffect, useReducer } from 'react';

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
        // Load library data from localStorage or IndexedDB
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
        
        localStorage.setItem('audiocore_library', JSON.stringify(libraryData));
      } catch (error) {
        console.error('Failed to save library:', error);
      }
    }
  }, [state.tracks, state.albums, state.artists, state.playlists, state.folders, state.lastScanDate, state.isInitialized]);
  
  /**
   * Add a folder to the library
   * @param {Object} folder - Folder object with path and name
   */
  const addFolder = async (folder) => {
    try {
      dispatch({ type: LIBRARY_ACTIONS.ADD_FOLDER, payload: folder });
      return true;
    } catch (error) {
      dispatch({ type: LIBRARY_ACTIONS.SET_ERROR, payload: 'Failed to add folder' });
      return false;
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
   * Scan library folders for music files
   */
  const scanLibrary = async () => {
    if (state.isScanning) return false;
    
    try {
      // Start scanning
      dispatch({ type: LIBRARY_ACTIONS.SET_SCANNING, payload: true });
      dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, payload: 0 });
      dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_TOTAL, payload: 0 });
      
      // Placeholder for actual scanning implementation
      // In a real implementation, this would:
      // 1. Read folders from the file system
      // 2. Find audio files
      // 3. Extract metadata
      // 4. Create track/album/artist objects
      // 5. Update the library state
      
      // Simulate scanning with a timeout
      setTimeout(() => {
        dispatch({ type: LIBRARY_ACTIONS.SET_SCAN_COMPLETE });
      }, 2000);
      
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