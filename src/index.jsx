import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';

// Error handling for fatal errors
const handleFatalError = (error, errorInfo) => {
  // Log error to console
  console.error('Fatal application error:', error);
  
  // Could send to a monitoring service here
  
  // Display an error message in the DOM if the root can't render
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Fallback UI for catastrophic errors
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #111; color: #ddd; font-family: system-ui, sans-serif;">
        <h2 style="color: #f55;">Application Error</h2>
        <p>The application couldn't be loaded due to a critical error.</p>
        <p>Please refresh the page to try again.</p>
        <details>
          <summary style="cursor: pointer; margin: 10px 0;">Error Details</summary>
          <pre style="background: #000; padding: 10px; overflow: auto;">${error?.toString()}</pre>
        </details>
      </div>
    `;
  }
};

// Get root element
const rootElement = document.getElementById('root');

// Create React root
const root = createRoot(rootElement);

// Render the app with a top-level error boundary
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary 
        onError={handleFatalError}
        fallback={
          <div style={{ padding: '20px', color: '#ddd' }}>
            <h2>Application Error</h2>
            <p>Sorry, the application encountered a critical error and couldn't load properly.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', marginTop: '16px', cursor: 'pointer' }}
            >
              Reload Application
            </button>
          </div>
        }
      >
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  // Handle synchronous errors during initial render
  handleFatalError(error);
}

// Add global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Uncaught global error:', event.error);
  // Don't call handleFatalError here as it might interfere with React's own error handling
});

// Add handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});