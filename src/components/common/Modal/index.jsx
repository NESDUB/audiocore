import React, { useState, useContext, createContext, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import Icon from '../Icon';

// Create context for modal functionality
const ModalContext = createContext();

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(20px); opacity: 0; }
`;

// Backdrop component
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${({ isClosing }) => isClosing ? 
    css`${fadeOut} 0.3s forwards` : 
    css`${fadeIn} 0.3s forwards`
  };
`;

// Modal container
const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 6px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: ${({ size }) => {
    switch (size) {
      case 'small': return '400px';
      case 'large': return '800px';
      case 'fullscreen': return '90vw';
      default: return '600px'; // medium
    }
  }};
  max-width: 90vw;
  max-height: ${({ size }) => size === 'fullscreen' ? '90vh' : '80vh'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${({ isClosing }) => isClosing ? 
    css`${slideOut} 0.3s forwards` : 
    css`${slideIn} 0.3s forwards`
  };
  position: relative;
`;

// Modal header
const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 1.5px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.darker};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Modal content
const ModalContent = styled.div`
  padding: ${({ theme, noPadding }) => noPadding ? '0' : theme.spacing.md};
  overflow-y: auto;
  flex: 1;
`;

// Modal footer
const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  display: flex;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'left': return 'flex-start';
      case 'center': return 'center';
      default: return 'flex-end';
    }
  }};
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Modal component
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium',
  closeOnBackdrop = true,
  showCloseButton = true,
  footerAlign = 'right',
  noPadding = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle closing animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  }, [onClose]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);
  
  // Prevent scrolling of body when modal is open
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
  
  if (!isOpen && !isClosing) return null;
  
  return ReactDOM.createPortal(
    <Backdrop 
      isClosing={isClosing}
      onClick={closeOnBackdrop ? handleClose : undefined}
    >
      <ModalContainer 
        size={size} 
        isClosing={isClosing}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
      >
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            {showCloseButton && (
              <CloseButton onClick={handleClose}>
                <Icon name="Close" size="16px" />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        
        <ModalContent noPadding={noPadding}>
          {children}
        </ModalContent>
        
        {footer && (
          <ModalFooter align={footerAlign}>
            {footer}
          </ModalFooter>
        )}
      </ModalContainer>
    </Backdrop>,
    document.body
  );
};

// Modal provider component
export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);
  
  // Open a modal
  const openModal = useCallback((modalConfig) => {
    const id = Date.now();
    setModals(prev => [...prev, { id, ...modalConfig }]);
    return id;
  }, []);
  
  // Close a modal by id
  const closeModal = useCallback((id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);
  
  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);
  
  // Context value
  const contextValue = {
    openModal,
    closeModal,
    closeAllModals,
    modals
  };
  
  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Render all modals */}
      {modals.map(modal => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
          title={modal.title}
          size={modal.size}
          closeOnBackdrop={modal.closeOnBackdrop !== undefined ? modal.closeOnBackdrop : true}
          showCloseButton={modal.showCloseButton !== undefined ? modal.showCloseButton : true}
          footerAlign={modal.footerAlign || 'right'}
          noPadding={modal.noPadding || false}
          footer={modal.footer}
        >
          {typeof modal.content === 'function' 
            ? modal.content({ close: () => closeModal(modal.id) })
            : modal.content
          }
        </Modal>
      ))}
    </ModalContext.Provider>
  );
};

// Hook for using the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  
  return context;
};

// Export the Modal component as default
export default Modal;