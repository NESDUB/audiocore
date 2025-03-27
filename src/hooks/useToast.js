import { useState, useCallback } from 'react';
import { TOAST_TYPES } from '../components/common/Modal/Toast';

/**
 * Custom hook for managing Toast notifications
 * Provides a simple API for showing and hiding toasts
 * 
 * @returns {Object} Toast management functions and state
 */
const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: TOAST_TYPES.INFO,
    duration: 5000,
    position: 'bottom',
    compact: false,
    icon: null
  });

  /**
   * Show a toast notification
   * 
   * @param {Object} options Toast configuration options
   * @param {string} options.message The message to display
   * @param {string} options.type Toast type (success, error, warning, info)
   * @param {number} options.duration Duration in ms
   * @param {string} options.position Position (top, bottom)
   * @param {boolean} options.compact Whether to use compact mode
   * @param {React.ReactNode} options.icon Custom icon to display
   */
  const showToast = useCallback((options) => {
    // Hide any existing toast first
    if (toast.visible) {
      setToast(prev => ({ ...prev, visible: false }));
      
      // Small delay to allow exit animation
      setTimeout(() => {
        setToast({
          visible: true,
          message: options.message || '',
          type: options.type || TOAST_TYPES.INFO,
          duration: options.duration || 5000,
          position: options.position || 'bottom',
          compact: options.compact || false,
          icon: options.icon || null
        });
      }, 300);
    } else {
      // Show new toast immediately
      setToast({
        visible: true,
        message: options.message || '',
        type: options.type || TOAST_TYPES.INFO,
        duration: options.duration || 5000,
        position: options.position || 'bottom',
        compact: options.compact || false,
        icon: options.icon || null
      });
    }
  }, [toast.visible]);

  /**
   * Hide the currently displayed toast
   */
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  /**
   * Show a success toast
   * 
   * @param {string} message The message to display
   * @param {Object} options Additional toast options
   */
  const showSuccess = useCallback((message, options = {}) => {
    showToast({
      ...options,
      message,
      type: TOAST_TYPES.SUCCESS
    });
  }, [showToast]);

  /**
   * Show an error toast
   * 
   * @param {string} message The message to display
   * @param {Object} options Additional toast options
   */
  const showError = useCallback((message, options = {}) => {
    showToast({
      ...options,
      message,
      type: TOAST_TYPES.ERROR
    });
  }, [showToast]);

  /**
   * Show a warning toast
   * 
   * @param {string} message The message to display
   * @param {Object} options Additional toast options
   */
  const showWarning = useCallback((message, options = {}) => {
    showToast({
      ...options,
      message,
      type: TOAST_TYPES.WARNING
    });
  }, [showToast]);

  /**
   * Show an info toast
   * 
   * @param {string} message The message to display
   * @param {Object} options Additional toast options
   */
  const showInfo = useCallback((message, options = {}) => {
    showToast({
      ...options,
      message,
      type: TOAST_TYPES.INFO
    });
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useToast;