import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Icon from '../Icon';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Animation for toast entry (slide up)
const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Animation for toast exit (fade out)
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Main toast container
const ToastContainer = styled.div`
  position: fixed;
  bottom: ${({ position }) => (position === 'top' ? 'auto' : '20px')};
  top: ${({ position }) => (position === 'top' ? '20px' : 'auto')};
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 90%;
  width: ${({ width }) => width || 'auto'};
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

// Individual toast item
const ToastItem = styled.div`
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return 'rgba(145, 242, 145, 0.1)';
      case 'error': return 'rgba(242, 85, 90, 0.1)';
      case 'warning': return 'rgba(242, 203, 5, 0.1)';
      default: return 'rgba(40, 40, 45, 0.85)';
    }
  }};
  border-left: 3px solid ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.brand.primary;
      case 'error': return theme.colors.brand.error;
      case 'warning': return theme.colors.brand.warning;
      default: return theme.colors.brand.secondary;
    }
  }};
  border-radius: 4px;
  padding: ${({ compact }) => (compact ? '8px 12px' : '12px 16px')};
  box-shadow: ${({ theme }) => theme.shadows.md};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 200px;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${({ isExiting }) => isExiting 
    ? css`${fadeOut} 0.3s forwards` 
    : css`${slideUp} 0.3s forwards`};
  
  &:hover {
    /* Slightly brighten on hover */
    filter: brightness(1.1);
  }
`;

// Progress bar that shows auto-dismiss timing
const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.brand.primary;
      case 'error': return theme.colors.brand.error;
      case 'warning': return theme.colors.brand.warning;
      default: return theme.colors.brand.secondary;
    }
  }};
  opacity: 0.7;
  width: ${({ progress }) => `${progress}%`};
  transition: width linear;
  border-radius: 0 0 0 4px;
`;

const IconContainer = styled.div`
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.brand.primary;
      case 'error': return theme.colors.brand.error;
      case 'warning': return theme.colors.brand.warning;
      default: return theme.colors.brand.secondary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToastContent = styled.div`
  flex: 1;
  ${({ compact }) => compact && 'display: flex; align-items: center;'}
`;

const ToastMessage = styled.div`
  font-size: ${({ theme, compact }) => 
    compact ? theme.typography.sizes.xs : theme.typography.sizes.sm};
  font-weight: ${({ theme, compact }) => 
    compact ? theme.typography.weights.regular : theme.typography.weights.medium};
  white-space: pre-line;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

/**
 * Toast component for displaying temporary notifications
 * 
 * @param {Object} props
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {string} props.message - Message to display
 * @param {boolean} props.isVisible - Whether the toast is visible
 * @param {function} props.onClose - Function to call when toast is closed
 * @param {boolean} props.autoClose - Whether to automatically close the toast
 * @param {number} props.duration - Duration before auto-close (in ms)
 * @param {string} props.position - Position of the toast (top or bottom)
 * @param {boolean} props.compact - Whether to use compact styling
 * @param {string} props.width - Width of the toast container
 */
const Toast = ({
  type = TOAST_TYPES.INFO,
  message,
  isVisible = false,
  onClose,
  autoClose = true,
  duration = 5000,
  position = 'bottom',
  compact = false,
  width,
  icon: CustomIcon
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [timeoutId, setTimeoutId] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  
  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      setProgress(100);
      
      // Set up auto-close if enabled
      if (autoClose) {
        // Calculate interval for progress bar updates
        const interval = 10; // Update every 10ms
        const steps = duration / interval;
        const progressStep = 100 / steps;
        
        // Set up progress bar interval
        const progressInterval = setInterval(() => {
          setProgress(current => {
            const newProgress = current - progressStep;
            return newProgress < 0 ? 0 : newProgress;
          });
        }, interval);
        
        setIntervalId(progressInterval);
        
        // Set up timeout for closing
        const timeout = setTimeout(() => {
          handleClose();
        }, duration);
        
        setTimeoutId(timeout);
        
        // Clean up on unmount
        return () => {
          clearInterval(progressInterval);
          clearTimeout(timeout);
        };
      }
    } else {
      // Clean up timeouts and intervals when not visible
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    }
  }, [isVisible, autoClose, duration]);
  
  // Handle close action
  const handleClose = () => {
    // Stop progress updates
    if (intervalId) clearInterval(intervalId);
    
    // Set exiting animation
    setIsExiting(true);
    
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  // Helper to get the appropriate icon
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <Icon name="Albums" size={compact ? "16px" : "20px"} />;
      case TOAST_TYPES.ERROR:
        return <Icon name="Close" size={compact ? "16px" : "20px"} />;
      case TOAST_TYPES.WARNING:
        return <Icon name="Albums" size={compact ? "16px" : "20px"} />;
      default:
        return <Icon name="Albums" size={compact ? "16px" : "20px"} />;
    }
  };
  
  if (!isVisible && !isExiting) return null;
  
  return (
    <ToastContainer position={position} width={width}>
      <ToastItem 
        type={type} 
        isExiting={isExiting}
        compact={compact}
      >
        <IconContainer type={type}>
          {getIcon()}
        </IconContainer>
        
        <ToastContent compact={compact}>
          <ToastMessage compact={compact}>
            {message}
          </ToastMessage>
        </ToastContent>
        
        {/* Close button */}
        <CloseButton 
          onClick={handleClose}
          aria-label="Close notification"
        >
          <Icon name="Close" size={compact ? "12px" : "14px"} />
        </CloseButton>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <ProgressBar 
            type={type} 
            progress={progress} 
          />
        )}
      </ToastItem>
    </ToastContainer>
  );
};

/**
 * Utility to show a toast notification
 * Can be used outside of React components
 */
export const showToast = (() => {
  let toastRoot = null;
  let currentToast = null;
  
  return (options) => {
    // Create toast root if not exists
    if (!toastRoot) {
      toastRoot = document.createElement('div');
      toastRoot.id = 'toast-root';
      document.body.appendChild(toastRoot);
    }
    
    // Remove existing toast
    if (currentToast) {
      document.body.removeChild(currentToast);
    }
    
    // Create new toast element
    currentToast = document.createElement('div');
    currentToast.id = 'toast-container';
    document.body.appendChild(currentToast);
    
    // Create toast with React
    const toast = <Toast {...options} isVisible={true} />;
    // ReactDOM.render(toast, currentToast); // In React 18, use createRoot instead
    
    // Return a function to close the toast
    return () => {
      if (currentToast) {
        document.body.removeChild(currentToast);
        currentToast = null;
      }
    };
  };
})();

export default Toast;