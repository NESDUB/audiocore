import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../../hooks/useLibrary';
import audioService from '../../../services/AudioService';

// Create context for player
const PlayerContext = createContext({
  currentTrack: null,
  isPlaying: false,
  volume: 75,
  isMuted: false,
  duration: 0,
  currentTime: 0,
  shuffle: false,
  repeat: false,
  queue: [],
  history: [],
  play: () => {},
  pause: () => {},
  toggle: () => {},
  stop: () => {},
  next: () => {},
  previous: () => {},
  seek: () => {},
  setVolume: () => {},
  toggleMute: () => {},
  toggleShuffle: () => {},
  toggleRepeat: () => {},
  playTrack: () => {},
  playTrackById: () => {},
  addToQueue: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
});

// Custom hook to use player context
export const usePlayer = () => useContext(PlayerContext);

/**
 * PlayerProvider component - container for audio player state and controls
 */
export const PlayerProvider = ({ children }) => {
  // Access library context
  const { state: libraryState, dispatch: libraryDispatch } = useLibrary();

  // Player state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);

  // Initialize audio service
  useEffect(() => {
    // Set up event listeners for audio events
    audioService.addEventListener('timeupdate', handleTimeUpdate);
    audioService.addEventListener('ended', handleTrackEnded);
    audioService.addEventListener('loadedmetadata', handleTrackLoaded);
    audioService.addEventListener('error', handleAudioError);
    
    // Set initial volume
    audioService.setVolume(volume);
    
    return () => {
      // Clean up event listeners
      audioService.removeEventListener('timeupdate', handleTimeUpdate);
      audioService.removeEventListener('ended', handleTrackEnded);
      audioService.removeEventListener('loadedmetadata', handleTrackLoaded);
      audioService.removeEventListener('error', handleAudioError);
      
      // Clean up audio service
      audioService.cleanup();
    };
  }, []);

  // Handle time updates
  const handleTimeUpdate = () => {
    setCurrentTime(audioService.audioElement.currentTime);
  };
  
  // Handle track ended
  const handleTrackEnded = () => {
    if (repeat) {
      audioService.seek(0);
      audioService.play(currentTrack);
    } else {
      next();
    }
  };
  
  // Handle track loaded
  const handleTrackLoaded = () => {
    setDuration(audioService.audioElement.duration);
  };
  
  // Handle audio errors
  const handleAudioError = (error) => {
    console.error('Audio playback error:', error);
    // Try to recover by playing next track
    next();
  };

  // Play function
  const play = () => {
    if (currentTrack) {
      audioService.play(currentTrack)
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    } else if (queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      
      setCurrentTrack(nextTrack);
      setQueue(newQueue);
      
      audioService.play(nextTrack)
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  // Pause function
  const pause = () => {
    audioService.pause();
    setIsPlaying(false);
  };

  // Toggle play/pause
  const toggle = () => {
    isPlaying ? pause() : play();
  };

  // Stop playback
  const stop = () => {
    audioService.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Play next track
  const next = () => {
    if (queue.length > 0) {
      if (currentTrack) {
        setHistory([...history, currentTrack]);
      }

      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      
      setCurrentTrack(nextTrack);
      setQueue(newQueue);
      setCurrentTime(0);
      
      audioService.play(nextTrack)
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    } else {
      stop();
    }
  };

  // Play previous track
  const previous = () => {
    if (currentTime > 5) {
      // If more than 5 seconds in, restart current track
      audioService.seek(0);
      setCurrentTime(0);
    } else if (history.length > 0) {
      // Go to previous track
      const prevTrack = history[history.length - 1];
      const newHistory = history.slice(0, -1);

      if (currentTrack) {
        setQueue([currentTrack, ...queue]);
      }

      setCurrentTrack(prevTrack);
      setHistory(newHistory);
      setCurrentTime(0);
      
      audioService.play(prevTrack)
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  // Seek to position
  const seek = (time) => {
    if (time >= 0 && time <= duration) {
      audioService.seek(time);
      setCurrentTime(time);
    }
  };

  // Set volume
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    audioService.setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      audioService.setMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audioService.setMuted(newMutedState);
  };

  // Toggle shuffle mode
  const toggleShuffle = () => {
    setShuffle(!shuffle);
    
    // If turning shuffle on, shuffle the current queue
    if (!shuffle && queue.length > 1) {
      const shuffledQueue = [...queue];
      // Fisher-Yates shuffle algorithm
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
      }
      setQueue(shuffledQueue);
    }
  };

  // Toggle repeat mode
  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  // Play specific track
  const playTrack = (track) => {
    if (currentTrack) {
      setHistory([...history, currentTrack]);
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    
    audioService.play(track)
      .then(() => setIsPlaying(true))
      .catch(err => console.error('Play error:', err));
      
    // Update track play count in library
    if (track.id) {
      const updatedTrack = { 
        ...track, 
        playCount: (track.playCount || 0) + 1,
        lastPlayed: new Date().toISOString() 
      };
      
      // This will depend on your library state management structure
      if (libraryDispatch) {
        libraryDispatch({ 
          type: 'UPDATE_TRACK', 
          payload: updatedTrack 
        });
      }
    }
  };
  
  // Play a track from the library by ID
  const playTrackById = (trackId) => {
    const track = libraryState.tracks.find(t => t.id === trackId);
    if (track) {
      playTrack(track);
    }
  };

  // Add track to queue
  const addToQueue = (track) => {
    setQueue([...queue, track]);
  };

  // Remove track from queue
  const removeFromQueue = (index) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
  };

  // Clear queue
  const clearQueue = () => {
    setQueue([]);
  };

  // Context value
  const value = {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    duration,
    currentTime,
    shuffle,
    repeat,
    queue,
    history,
    play,
    pause,
    toggle,
    stop,
    next,
    previous,
    seek,
    setVolume: handleVolumeChange,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playTrack,
    playTrackById,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;