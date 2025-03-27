// Example 1: Using the Toast component directly in a component

import React, { useState } from 'react';
import Toast, { TOAST_TYPES } from '../components/common/Modal/Toast';

const ExampleComponent = () => {
  const [toastVisible, setToastVisible] = useState(false);
  
  const showToast = () => {
    setToastVisible(true);
  };
  
  const hideToast = () => {
    setToastVisible(false);
  };
  
  return (
    <div>
      <button onClick={showToast}>Show Toast</button>
      
      <Toast
        type={TOAST_TYPES.SUCCESS}
        message="Operation completed successfully!"
        isVisible={toastVisible}
        onClose={hideToast}
        autoClose={true}
        duration={5000}
      />
    </div>
  );
};

// Example 2: Using the useToast hook for more convenience

import React from 'react';
import useToast from '../hooks/useToast';
import { SecondaryButton } from '../components/common/Button';

const ToastExamplePage = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const handleSuccessClick = () => {
    showSuccess('Track successfully added to playlist', {
      duration: 3000
    });
  };
  
  const handleErrorClick = () => {
    showError('Could not connect to audio device', {
      position: 'top',
      compact: false
    });
  };
  
  const handleWarningClick = () => {
    showWarning('Low disk space available', {
      compact: true
    });
  };
  
  const handleInfoClick = () => {
    showInfo('3 new tracks have been imported', {
      duration: 4000
    });
  };
  
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2>Toast Examples</h2>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <SecondaryButton onClick={handleSuccessClick}>Success Toast</SecondaryButton>
        <SecondaryButton onClick={handleErrorClick}>Error Toast</SecondaryButton>
        <SecondaryButton onClick={handleWarningClick}>Warning Toast</SecondaryButton>
        <SecondaryButton onClick={handleInfoClick}>Info Toast</SecondaryButton>
      </div>
    </div>
  );
};

// Example 3: Using Toast in a non-component context (like a utility function)

import { showToast, TOAST_TYPES } from '../components/common/Modal/Toast';

// In an async function like an API call
const fetchData = async () => {
  try {
    // Simulate API call
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    
    // Show success toast
    showToast({
      type: TOAST_TYPES.SUCCESS,
      message: 'Data loaded successfully',
      duration: 3000,
      position: 'bottom',
      compact: true
    });
    
    return data;
  } catch (error) {
    // Show error toast
    showToast({
      type: TOAST_TYPES.ERROR,
      message: `Error: ${error.message}`,
      duration: 5000
    });
    
    return null;
  }
};