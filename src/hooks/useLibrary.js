import { useContext } from 'react';
import LibraryProvider, { LibraryContext } from '../features/library/providers/LibraryProvider';


/**
 * Custom hook for accessing the library context
 * Provides access to library state and functions from anywhere in the component tree
 * 
 * @returns {Object} Library context containing:
 *   - state: Current library state (tracks, albums, artists, playlists, etc.)
 *   - dispatch: Dispatch function for direct state updates
 *   - addFolder: Function to add a folder to the library
 *   - removeFolder: Function to remove a folder from the library
 *   - scanLibrary: Function to scan library folders for audio files
 *   - importTracks: Function to import tracks into the library
 *   - getMostPlayed: Function to get most played tracks
 *   - getRecentlyAdded: Function to get recently added tracks
 *   - getRecentlyPlayed: Function to get recently played tracks
 *   - getTracksByAlbum: Function to get tracks by album
 *   - getTracksByArtist: Function to get tracks by artist
 *   - getTracksByPlaylist: Function to get tracks by playlist
 *   - searchLibrary: Function to search the library
 *   - createPlaylist: Function to create a new playlist
 *   - addToPlaylist: Function to add tracks to a playlist
 *   - removeFromPlaylist: Function to remove tracks from a playlist
 *   - clearLibrary: Function to clear the entire library
 */
export const useLibrary = () => {
  const context = useContext(LibraryContext);

  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }

  return context;
};

export default useLibrary;