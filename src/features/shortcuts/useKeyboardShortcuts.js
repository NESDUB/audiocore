import { useEffect } from 'react';
import { usePlayer } from '../player/providers/PlayerProvider';
import { useNotification } from '../../components/common/Notification';

/**
 * Custom hook to handle keyboard shortcuts
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether shortcuts are enabled
 * @param {boolean} options.showNotifications - Whether to show notifications for shortcuts
 * @returns {Object} - Methods to enable/disable shortcuts
 */
const useKeyboardShortcuts = ({
  enabled = true,
  showNotifications = true
} = {}) => {
  const {
    play,
    pause,
    isPlaying,
    stop,
    skipNext,
    skipPrevious,
    volume,
    setVolume,
    toggleShuffle,
    toggleRepeat
  } = usePlayer();

  const { success } = useNotification();

  // Define keyboard shortcut handlers
  useEffect(() => {
    if (!enabled) return;

    // Move the notification function inside useEffect
    const showShortcutNotification = (message) => {
      if (showNotifications) {
        success(message, {
          autoClose: true,
          duration: 1500
        });
      }
    };

    const handleKeyDown = (e) => {
      // Skip if typing in an input field
      if (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable) {
        return;
      }

      // Prevent default behavior for media keys
      if (e.key.startsWith('Media')) {
        e.preventDefault();
      }

      switch (e.key) {
        // Play/Pause - Space or MediaPlayPause
        case ' ':
          e.preventDefault(); // Prevent scrolling
          if (isPlaying) {
            pause();
            showShortcutNotification('Paused');
          } else {
            play();
            showShortcutNotification('Playing');
          }
          break;

        case 'MediaPlayPause':
          if (isPlaying) {
            pause();
            showShortcutNotification('Paused');
          } else {
            play();
            showShortcutNotification('Playing');
          }
          break;

        // Stop - S key
        case 's':
        case 'S':
          stop();
          showShortcutNotification('Stopped');
          break;

        // Next track - Right Arrow or N or MediaTrackNext
        case 'ArrowRight':
          if (e.altKey) {
            skipNext();
            showShortcutNotification('Next track');
          }
          break;

        case 'n':
        case 'N':
        case 'MediaTrackNext':
          skipNext();
          showShortcutNotification('Next track');
          break;

        // Previous track - Left Arrow or P or MediaTrackPrevious
        case 'ArrowLeft':
          if (e.altKey) {
            skipPrevious();
            showShortcutNotification('Previous track');
          }
          break;

        case 'p':
        case 'P':
        case 'MediaTrackPrevious':
          skipPrevious();
          showShortcutNotification('Previous track');
          break;

        // Volume Up - Arrow Up or + or MediaVolumeUp
        case 'ArrowUp':
          if (e.altKey) {
            {
              const volumeUp = Math.min(volume + 5, 100);
              setVolume(volumeUp);
              showShortcutNotification(`Volume: ${volumeUp}%`);
            }
          }
          break;

        case '+':
        case '=': // Same key as + without shift
        case 'MediaVolumeUp':
          {
            const volumeUp = Math.min(volume + 5, 100);
            setVolume(volumeUp);
            showShortcutNotification(`Volume: ${volumeUp}%`);
          }
          break;

        // Volume Down - Arrow Down or - or MediaVolumeDown
        case 'ArrowDown':
          if (e.altKey) {
            {
              const volumeDown = Math.max(volume - 5, 0);
              setVolume(volumeDown);
              showShortcutNotification(`Volume: ${volumeDown}%`);
            }
          }
          break;

        case '-':
        case 'MediaVolumeDown':
          {
            const volumeDown = Math.max(volume - 5, 0);
            setVolume(volumeDown);
            showShortcutNotification(`Volume: ${volumeDown}%`);
          }
          break;

        // Mute - M key or MediaVolumeMute
        case 'm':
        case 'M':
        case 'MediaVolumeMute':
          if (volume === 0) {
            setVolume(50); // Unmute to 50%
            showShortcutNotification('Unmuted');
          } else {
            setVolume(0); // Mute
            showShortcutNotification('Muted');
          }
          break;

        // Toggle shuffle - H key
        case 'h':
        case 'H':
          toggleShuffle();
          showShortcutNotification('Shuffle toggled');
          break;

        // Toggle repeat - R key
        case 'r':
        case 'R':
          toggleRepeat();
          showShortcutNotification('Repeat toggled');
          break;

        default:
          // No matching shortcut
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, play, pause, stop, skipNext, skipPrevious, volume, setVolume, toggleShuffle, toggleRepeat, showNotifications, enabled, success]);

  // Return methods to enable/disable shortcuts
  return {
    enableShortcuts: () => enabled = true,
    disableShortcuts: () => enabled = false,
    toggleShortcuts: () => enabled = !enabled
  };
};

export default useKeyboardShortcuts;