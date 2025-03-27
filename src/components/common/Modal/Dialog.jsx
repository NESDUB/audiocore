import React, { useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Icon from '../Icon';
import Title from '../Typography/Title';

// Animation for dialog entry
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Animation for dialog exit
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
`;

// Overlay backdrop
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${({ isOpen }) => isOpen && `
    opacity: 1;
    visibility: visible;
  `}
`;

// Dialog container
const DialogContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.elevated};
  border-radius: 6px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: ${({ width }) => width || 'auto'};
  max-width: ${({ maxWidth }) => maxWidth || '500px'};
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${({ isExiting }) => isExiting 
    ? css`${fadeOut} 0.2s forwards` 
    : css`${fadeIn} 0.3s forwards`
  };
  
  /* Size variants */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return 'max-width: 400px;';
      case 'large':
        return 'max-width: 700px;';
      case 'full':
        return 'max-width: 90vw; width: 90vw; height: 90vh;';
      default:
        return '';
    }
  }}
`;

// Dialog header
const DialogHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

// Dialog title
const DialogTitle = styled.div`
  flex: 1;
`;

// Close button
const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Dialog content
const DialogContent = styled.div`
  padding: ${({ theme, noPadding }) => noPadding ? '0' : theme.spacing.md};
  overflow-y: auto;
  flex: 1;
`;

// Dialog footer
const DialogFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'between':
        return 'space-between';
      default:
        return 'flex-end';
    }
  }};
  gap: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

/**
 * Dialog component for modals, alerts, and forms
 */
const Dialog = ({
  isOpen = false,
  title,
  children,
  footer,
  footerAlign = 'right',
  onClose,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  width,
  maxWidth,
  size,
  noPadding = false,
  className,
  contentClassName,
  ...props
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const dialogRef = useRef(null);
  
  // Handle dialog closing with animation
  const handleClose = () => {
    if (!onClose) return;
    
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 200);
  };
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleClose();
    }
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (isOpen && e.key === 'Escape' && closeOnEscape) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeOnEscape]);
  
  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    
    // Get all focusable elements
    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus the first element
    firstElement.focus();
    
    // Handle tab key navigation
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);
  
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen && !isExiting) return null;
  
  return (
    <DialogOverlay 
      isOpen={isOpen} 
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
    >
      <DialogContainer
        ref={dialogRef}
        isExiting={isExiting}
        width={width}
        maxWidth={maxWidth}
        size={size}
        className={className}
        {...props}
      >
        {title && (
          <DialogHeader>
            <DialogTitle id="dialog-title">
              {typeof title === 'string' ? (
                <Title variant="subsection" margin="0">
                  {title}
                </Title>
              ) : (
                title
              )}
            </DialogTitle>
            
            {showCloseButton && (
              <CloseButton onClick={handleClose} aria-label="Close dialog">
                <Icon name="Close" size="20px" />
              </CloseButton>
            )}
          </DialogHeader>
        )}
        
        <DialogContent 
          noPadding={noPadding}
          className={contentClassName}
        >
          {children}
        </DialogContent>
        
        {footer && (
          <DialogFooter align={footerAlign}>
            {footer}
          </DialogFooter>
        )}
      </DialogContainer>
    </DialogOverlay>
  );
};

export default Dialog;