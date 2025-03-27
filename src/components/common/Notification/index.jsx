import React, { createContext, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

// Create context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotification was called outside a NotificationProvider');
    // Return a dummy implementation to prevent errors
    return {
      showNotification: () => console.warn('Notification system not available'),
      removeNotification: () => {}
    };
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const showNotification = ({ type = 'info', message, duration = 5000 }) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    return id;
  };

  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

// Individual notification item
const NotificationItem = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  return (
    <NotificationWrapper type={notification.type}>
      <NotificationMessage>{notification.message}</NotificationMessage>
      <CloseButton onClick={onClose}>×</CloseButton>
    </NotificationWrapper>
  );
};

// Styled components with hardcoded values
const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
`;

const NotificationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-width: 300px;
  max-width: 400px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return 'rgba(0, 168, 0, 0.9)';
      case 'error':
        return 'rgba(217, 64, 69, 0.9)';
      case 'warning':
        return 'rgba(217, 180, 4, 0.9)';
      case 'info':
      default:
        return 'rgba(64, 96, 217, 0.9)';
    }
  }};

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationMessage = styled.div`
  color: white;
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 16px;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

export default NotificationProvider;