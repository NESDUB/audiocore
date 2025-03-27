/**
 * Library Reducer for managing library state
 * Handles actions for tracks, albums, artists, playlists, and folders
 */

// Action Types
export const LIBRARY_ACTIONS = {
  // Track actions
  SET_TRACKS: 'SET_TRACKS',
  ADD_TRACKS: 'ADD_TRACKS',
  REMOVE_TRACKS: 'REMOVE_TRACKS',
  UPDATE_TRACK: 'UPDATE_TRACK',
  
  // Album actions
  SET_ALBUMS: 'SET_ALBUMS',
  ADD_ALBUMS: 'ADD_ALBUMS',
  REMOVE_ALBUMS: 'REMOVE_ALBUMS',
  UPDATE_ALBUM: 'UPDATE_ALBUM',
  
  // Artist actions
  SET_ARTISTS: 'SET_ARTISTS',
  ADD_ARTISTS: 'ADD_ARTISTS',
  REMOVE_ARTISTS: 'REMOVE_ARTISTS',
  
  // Playlist actions
  SET_PLAYLISTS: 'SET_PLAYLISTS',
  ADD_PLAYLISTS: 'ADD_PLAYLISTS',
  REMOVE_PLAYLISTS: 'REMOVE_PLAYLISTS',
  UPDATE_PLAYLIST: 'UPDATE_PLAYLIST',
  
  // Folder actions
  ADD_FOLDER: 'ADD_FOLDER',
  REMOVE_FOLDER: 'REMOVE_FOLDER',
  
  // Scanning actions
  SET_SCANNING: 'SET_SCANNING',
  SET_SCAN_PROGRESS: 'SET_SCAN_PROGRESS',
  SET_SCAN_TOTAL: 'SET_SCAN_TOTAL',
  SET_CURRENT_FILE: 'SET_CURRENT_FILE',
  SET_SCAN_COMPLETE: 'SET_SCAN_COMPLETE',
  ADD_SCANNED_FILE: 'ADD_SCANNED_FILE',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Library management
  RESET_LIBRARY: 'RESET_LIBRARY',
  INITIALIZE: 'INITIALIZE',
  SET_TOTAL_SIZE: 'SET_TOTAL_SIZE'
};

// Initial library state
export const initialLibraryState = {
  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
  folders: [],
  isScanning: false,
  scanProgress: 0,
  scanTotal: 0,
  currentFile: null,
  lastScanDate: null,
  error: null,
  isInitialized: false,
  scannedFiles: [],
  totalSize: 0
};

/**
 * Library reducer function
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
export const libraryReducer = (state, action) => {
  switch (action.type) {
    // Track actions
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
    
    // Album actions
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
      
    case LIBRARY_ACTIONS.UPDATE_ALBUM:
      return {
        ...state,
        albums: state.albums.map(album => 
          album.id === action.payload.id ? { ...album, ...action.payload } : album
        )
      };
    
    // Artist actions
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
    
    // Playlist actions
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
      
    case LIBRARY_ACTIONS.UPDATE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.map(playlist => 
          playlist.id === action.payload.id ? { ...playlist, ...action.payload } : playlist
        )
      };
    
    // Folder actions
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
    
    // Scanning actions
    case LIBRARY_ACTIONS.SET_SCANNING:
      return { ...state, isScanning: action.payload };
      
    case LIBRARY_ACTIONS.SET_SCAN_PROGRESS:
      return { ...state, scanProgress: action.payload };
      
    case LIBRARY_ACTIONS.SET_SCAN_TOTAL:
      return { ...state, scanTotal: action.payload };
      
    case LIBRARY_ACTIONS.SET_CURRENT_FILE:
      return { ...state, currentFile: action.payload };
      
    case LIBRARY_ACTIONS.SET_SCAN_COMPLETE:
      return { 
        ...state, 
        isScanning: false, 
        scanProgress: 0,
        currentFile: null,
        lastScanDate: new Date().toISOString() 
      };
      
    case LIBRARY_ACTIONS.ADD_SCANNED_FILE:
      return {
        ...state,
        scannedFiles: [...state.scannedFiles, action.payload]
      };
    
    // Error handling
    case LIBRARY_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
      
    case LIBRARY_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Library management
    case LIBRARY_ACTIONS.RESET_LIBRARY:
      return { 
        ...initialLibraryState,
        isInitialized: state.isInitialized,
        folders: state.folders // Keep folders on reset
      };
      
    case LIBRARY_ACTIONS.INITIALIZE:
      return { ...state, isInitialized: true };
      
    case LIBRARY_ACTIONS.SET_TOTAL_SIZE:
      return { ...state, totalSize: action.payload };
    
    // Default case
    default:
      return state;
  }
};

/**
 * Creates action objects for library management
 */
export const libraryActions = {
  // Track actions
  setTracks: (tracks) => ({ 
    type: LIBRARY_ACTIONS.SET_TRACKS, 
    payload: tracks 
  }),
  
  addTracks: (tracks) => ({ 
    type: LIBRARY_ACTIONS.ADD_TRACKS, 
    payload: tracks 
  }),
  
  removeTracks: (trackIds) => ({ 
    type: LIBRARY_ACTIONS.REMOVE_TRACKS, 
    payload: trackIds 
  }),
  
  updateTrack: (track) => ({ 
    type: LIBRARY_ACTIONS.UPDATE_TRACK, 
    payload: track 
  }),
  
  // Album actions
  setAlbums: (albums) => ({ 
    type: LIBRARY_ACTIONS.SET_ALBUMS, 
    payload: albums 
  }),
  
  addAlbums: (albums) => ({ 
    type: LIBRARY_ACTIONS.ADD_ALBUMS, 
    payload: albums 
  }),
  
  removeAlbums: (albumIds) => ({ 
    type: LIBRARY_ACTIONS.REMOVE_ALBUMS, 
    payload: albumIds 
  }),
  
  updateAlbum: (album) => ({ 
    type: LIBRARY_ACTIONS.UPDATE_ALBUM, 
    payload: album 
  }),
  
  // Artist actions
  setArtists: (artists) => ({ 
    type: LIBRARY_ACTIONS.SET_ARTISTS, 
    payload: artists 
  }),
  
  addArtists: (artists) => ({ 
    type: LIBRARY_ACTIONS.ADD_ARTISTS, 
    payload: artists 
  }),
  
  removeArtists: (artistIds) => ({ 
    type: LIBRARY_ACTIONS.REMOVE_ARTISTS, 
    payload: artistIds 
  }),
  
  // Playlist actions
  setPlaylists: (playlists) => ({ 
    type: LIBRARY_ACTIONS.SET_PLAYLISTS, 
    payload: playlists 
  }),
  
  addPlaylists: (playlists) => ({ 
    type: LIBRARY_ACTIONS.ADD_PLAYLISTS, 
    payload: playlists 
  }),
  
  removePlaylists: (playlistIds) => ({ 
    type: LIBRARY_ACTIONS.REMOVE_PLAYLISTS, 
    payload: playlistIds 
  }),
  
  updatePlaylist: (playlist) => ({ 
    type: LIBRARY_ACTIONS.UPDATE_PLAYLIST, 
    payload: playlist 
  }),
  
  // Folder actions
  addFolder: (folder) => ({ 
    type: LIBRARY_ACTIONS.ADD_FOLDER, 
    payload: folder 
  }),
  
  removeFolder: (folderPath) => ({ 
    type: LIBRARY_ACTIONS.REMOVE_FOLDER, 
    payload: folderPath 
  }),
  
  // Scanning actions
  setScanning: (isScanning) => ({ 
    type: LIBRARY_ACTIONS.SET_SCANNING, 
    payload: isScanning 
  }),
  
  setScanProgress: (progress) => ({ 
    type: LIBRARY_ACTIONS.SET_SCAN_PROGRESS, 
    payload: progress 
  }),
  
  setScanTotal: (total) => ({ 
    type: LIBRARY_ACTIONS.SET_SCAN_TOTAL, 
    payload: total 
  }),
  
  setCurrentFile: (filePath) => ({ 
    type: LIBRARY_ACTIONS.SET_CURRENT_FILE, 
    payload: filePath 
  }),
  
  setScanComplete: () => ({ 
    type: LIBRARY_ACTIONS.SET_SCAN_COMPLETE 
  }),
  
  addScannedFile: (file) => ({
    type: LIBRARY_ACTIONS.ADD_SCANNED_FILE,
    payload: file
  }),
  
  // Error handling
  setError: (error) => ({ 
    type: LIBRARY_ACTIONS.SET_ERROR, 
    payload: error 
  }),
  
  clearError: () => ({ 
    type: LIBRARY_ACTIONS.CLEAR_ERROR 
  }),
  
  // Library management
  resetLibrary: () => ({ 
    type: LIBRARY_ACTIONS.RESET_LIBRARY 
  }),
  
  initialize: () => ({ 
    type: LIBRARY_ACTIONS.INITIALIZE 
  }),
  
  setTotalSize: (size) => ({
    type: LIBRARY_ACTIONS.SET_TOTAL_SIZE,
    payload: size
  })
};

export default libraryReducer;