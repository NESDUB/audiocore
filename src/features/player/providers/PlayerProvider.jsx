import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  repeatMode: 'off', // 'off', 'all', 'one'
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
  toggleFavorite: () => {},
  // Audio engine properties
  audioElement: null,
  analyser: null,
  audioEngine: null,
  errorState: { hasError: false, message: '' },
  bufferState: { progress: 0, isBuffering: false }
});

// Custom hook to use player context
export const usePlayer = () => useContext(PlayerContext);

/**
 * PlayerProvider component - Container for audio player state and controls
 * Integrates directly with AudioService for audio playback
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
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [errorState, setErrorState] = useState({ hasError: false, message: '' });
  const [bufferState, setBufferState] = useState({ progress: 0, isBuffering: false });

  // Store references to advanced audio engine components
  const engineRef = useRef(null);
  const analyserRef = useRef(null);
  const eventBusRef = useRef(null);
  const eventUnsubscribesRef = useRef([]);

  // Initialize audio service
  useEffect(() => {
    // Initialize the audio service if not already initialized
    if (!audioService.isInitialized) {
      audioService.initialize();
    }

    // Store references to engine components
    const components = audioService.getEngineComponents();
    engineRef.current = components;
    eventBusRef.current = components?.eventBus;

    // Get analyzer
    analyserRef.current = audioService.getAnalyser();

    // Set up event listeners
    const setupEvents = () => {
      if (!eventBusRef.current) return [];

      // Define event handlers
      const handlers = {
        'source:timeupdate': handleTimeUpdate,
        'source:ended': handleTrackEnded,
        'buffer:loaded': handleTrackLoaded,
        'source:error': handleAudioError,
        'buffer:progress': handleBufferProgress,
        'buffer:waiting': () => setBufferState(prev => ({ ...prev, isBuffering: true })),
        'buffer:playing': () => setBufferState(prev => ({ ...prev, isBuffering: false }))
      };

      // Subscribe to events
      const subscriptions = Object.entries(handlers).map(([event, handler]) => {
        const unsubscribe = eventBusRef.current.on(event, handler);
        return { event, unsubscribe };
      });

      return subscriptions;
    };

    // Set up event listeners
    const subscriptions = setupEvents();
    eventUnsubscribesRef.current = subscriptions;

    // Set initial volume
    audioService.setVolume(volume);

    // Load favorites from localStorage
    try {
      const storedFavorites = localStorage.getItem('audiocore_favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }

    return () => {
      // Clean up event listeners
      eventUnsubscribesRef.current.forEach(sub => {
        if (typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });

      // Clean up audio service
      audioService.cleanup();
    };
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (favorites.length > 0) {
      try {
        localStorage.setItem('audiocore_favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites]);

  // Handle time updates
  const handleTimeUpdate = useCallback((event) => {
    // Get current state from event data if available
    if (event && event.data) {
      setCurrentTime(event.data.currentTime);
      return;
    }
    
    // Otherwise get state from audio service
    const state = audioService.getState();
    setCurrentTime(state.currentTime);
  }, []);

  // Handle track ended
  const handleTrackEnded = useCallback(() => {
    // Check repeat mode
    if (repeatMode === 'one') {
      // Repeat one - seek to start and play again
      audioService.seek(0);
      audioService.play(currentTrack);
      return;
    }
    
    if (repeatMode === 'all' && queue.length === 0) {
      // If repeat all is on and queue is empty, move current track to queue
      if (currentTrack) {
        setQueue([currentTrack]);
      }
    }
    
    // Play next track
    next();
  }, [currentTrack, queue, repeatMode]);

  // Handle track loaded
  const handleTrackLoaded = useCallback((event) => {
    // Get duration from event data if available
    if (event && event.data) {
      setDuration(event.data.duration);
      return;
    }
    
    // Otherwise get state from audio service
    const state = audioService.getState();
    setDuration(state.duration || 0);
    
    // Reset error state
    setErrorState({ hasError: false, message: '' });
  }, []);

  // Handle audio errors
  const handleAudioError = useCallback((error) => {
    const errorMessage = error?.message || error?.data?.message || 'Audio playback error';
    console.error('Audio playback error:', errorMessage);
    
    // Set error state
    setErrorState({
      hasError: true,
      message: errorMessage
    });
    
    // Try to recover by playing next track after a short delay
    setTimeout(() => {
      next();
    }, 1000);
  }, []);

  // Handle buffer progress updates
  const handleBufferProgress = useCallback((event) => {
    if (event && event.data) {
      setBufferState({
        progress: event.data.percent || 0,
        isBuffering: event.data.isBuffering || false
      });
    }
  }, []);

  // Play function
  const play = useCallback(() => {
    if (currentTrack) {
      audioService.play(currentTrack)
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Play error:', err);
          setErrorState({
            hasError: true,
            message: err.message || 'Error playing track'
          });
        });
    } else if (queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);

      setCurrentTrack(nextTrack);
      setQueue(newQueue);

      audioService.play(nextTrack)
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Play error:', err);
          setErrorState({
            hasError: true,
            message: err.message || 'Error playing track'
          });
        });
    }
  }, [currentTrack, queue]);

  // Pause function
  const pause = useCallback(() => {
    audioService.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, pause, play]);

  // Stop playback
  const stop = useCallback(() => {
    audioService.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Play next track
  const next = useCallback(() => {
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
        .catch(err => {
          console.error('Play error:', err);
          setErrorState({
            hasError: true,
            message: err.message || 'Error playing next track'
          });
          
          // Try to play the next track in queue
          if (newQueue.length > 0) {
            setTimeout(() => {
              next();
            }, 1000);
          }
        });
    } else if (repeat) {
      // If repeat is on and queue is empty, get tracks from library or history
      if (libraryState.tracks && libraryState.tracks.length > 0) {
        // If shuffle is on, get random tracks
        if (shuffle) {
          const randomTracks = [...libraryState.tracks]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5); // Get 5 random tracks
          
          setQueue(randomTracks);
          next();
        } else {
          // Otherwise just queue all tracks
          setQueue(libraryState.tracks);
          next();
        }
      } else {
        // If no library tracks, use history
        setQueue([...history].reverse());
        setHistory([]);
        next();
      }
    } else {
      stop();
    }
  }, [currentTrack, history, queue, repeat, shuffle, stop, libraryState.tracks]);

  // Play previous track
  const previous = useCallback(() => {
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
        .catch(err => {
          console.error('Play error:', err);
          setErrorState({
            hasError: true,
            message: err.message || 'Error playing previous track'
          });
          
          // Try again with next in history
          if (newHistory.length > 0) {
            setTimeout(() => {
              previous();
            }, 1000);
          }
        });
    }
  }, [currentTime, currentTrack, history, queue]);

  // Seek to position
  const seek = useCallback((time) => {
    if (time >= 0 && time <= duration) {
      audioService.seek(time);
      setCurrentTime(time);
    }
  }, [duration]);

  // Set volume
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    audioService.setVolume(newVolume);

    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      audioService.setMuted(false);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audioService.setMuted(newMutedState);
  }, [isMuted]);

  // Toggle shuffle mode
  const toggleShuffle = useCallback(() => {
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
  }, [shuffle, queue]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    // Cycle through repeat modes: off -> all -> one -> off
    let newMode;
    
    if (repeatMode === 'off') {
      newMode = 'all';
      setRepeat(true);
    } else if (repeatMode === 'all') {
      newMode = 'one';
      // Keep repeat true
    } else {
      newMode = 'off';
      setRepeat(false);
    }
    
    setRepeatMode(newMode);
    
    // Set repeat mode in audio engine if it supports it
    if (engineRef.current?.sourceManager && engineRef.current.sourceManager.setRepeatMode) {
      engineRef.current.sourceManager.setRepeatMode(newMode);
    }
  }, [repeatMode]);

  // Play specific track
  const playTrack = useCallback((track) => {
    if (currentTrack) {
      setHistory([...history, currentTrack]);
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    
    // Clear error state
    setErrorState({ hasError: false, message: '' });

    audioService.play(track)
      .then(() => setIsPlaying(true))
      .catch(err => {
        console.error('Play error:', err);
        setErrorState({
          hasError: true,
          message: err.message || 'Error playing track'
        });
      });

    // Update track play count in library
    if (track.id && libraryDispatch) {
      const updatedTrack = {
        ...track,
        playCount: (track.playCount || 0) + 1,
        lastPlayed: new Date().toISOString()
      };

      libraryDispatch({
        type: 'UPDATE_TRACK',
        payload: updatedTrack
      });
    }
  }, [currentTrack, history, libraryDispatch]);

  // Play a track from the library by ID
  const playTrackById = useCallback((trackId) => {
    const track = libraryState.tracks.find(t => t.id === trackId);
    if (track) {
      playTrack(track);
    }
  }, [libraryState.tracks, playTrack]);

  // Add track to queue
  const addToQueue = useCallback((track) => {
    setQueue(prevQueue => [...prevQueue, track]);
  }, []);

  // Remove track from queue
  const removeFromQueue = useCallback((index) => {
    setQueue(prevQueue => {
      const newQueue = [...prevQueue];
      newQueue.splice(index, 1);
      return newQueue;
    });
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);
  
  // Toggle favorite status for a track
  const toggleFavorite = useCallback((trackId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(trackId)) {
        return prevFavorites.filter(id => id !== trackId);
      } else {
        return [...prevFavorites, trackId];
      }
    });
    
    // Update track in library if available
    if (libraryDispatch) {
      const track = libraryState.tracks.find(t => t.id === trackId);
      if (track) {
        const isFavorite = !favorites.includes(trackId);
        const updatedTrack = { ...track, isFavorite };
        
        libraryDispatch({
          type: 'UPDATE_TRACK',
          payload: updatedTrack
        });
      }
    }
  }, [favorites, libraryDispatch, libraryState.tracks]);

  // Get access to audio processing features
  const getAudioEffects = useCallback(() => {
    if (engineRef.current?.core) {
      return engineRef.current.core.getAudioEffects?.() || null;
    }
    return null;
  }, []);

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
    repeatMode,
    queue,
    history,
    favorites,
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
    toggleFavorite,
    // Expose audio element for compatibility with existing code
    audioElement: audioService.audioElement,
    // Expose analyzer for visualizations
    analyser: analyserRef.current,
    // Expose audio engine for advanced features
    audioEngine: engineRef.current?.engine,
    // Expose error state
    errorState,
    // Expose buffer state 
    bufferState,
    // Expose audio effects
    getAudioEffects
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;