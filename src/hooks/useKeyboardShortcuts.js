import { useEffect } from 'react';
import { usePlayer } from '../player/providers/PlayerProvider';

/**
 * Custom hook for keyboard shortcuts
 * @returns {Object} Keyboard shortcuts state
 */
const useKeyboardShortcuts = () => {
  const {
    isPlaying,
    toggle,
    next,
    previous,
    toggleMute,
    volume,
    setVolume,
  } = usePlayer();

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only process shortcuts if no input element is focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Prevent default behavior for media keys
      if (
        event.key === ' ' || 
        event.key === 'MediaPlayPause' || 
        event.key === 'MediaTrackNext' || 
        event.key === 'MediaTrackPrevious'
      ) {
        event.preventDefault();
      }

      switch (event.key) {
        // Play/pause
        case ' ':
        case 'MediaPlayPause':
          toggle();
          break;

        // Next track
        case 'ArrowRight':
        case 'MediaTrackNext':
          if (event.ctrlKey || event.key === 'MediaTrackNext') {
            next();
          }
          break;

        // Previous track
        case 'ArrowLeft':
        case 'MediaTrackPrevious':
          if (event.ctrlKey || event.key === 'MediaTrackPrevious') {
            previous();
          }
          break;

        // Volume up
        case 'ArrowUp':
          if (event.ctrlKey) {
            setVolume(Math.min(100, volume + 5));
          }
          break;

        // Volume down
        case 'ArrowDown':
          if (event.ctrlKey) {
            setVolume(Math.max(0, volume - 5));
          }
          break;

        // Mute
        case 'm':
          if (!event.ctrlKey && !event.metaKey) {
            toggleMute();
          }
          break;

        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, toggle, next, previous, toggleMute, volume, setVolume]);

  return {
    shortcuts: [
      { key: 'Space', description: 'Play/Pause' },
      { key: 'Ctrl + →', description: 'Next track' },
      { key: 'Ctrl + ←', description: 'Previous track' },
      { key: 'Ctrl + ↑', description: 'Volume up' },
      { key: 'Ctrl + ↓', description: 'Volume down' },
      { key: 'M', description: 'Mute/Unmute' },
    ],
  };
};

export default useKeyboardShortcuts;