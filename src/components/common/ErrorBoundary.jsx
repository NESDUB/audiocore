import React, { Component } from 'react';
import styled from 'styled-components';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You could also log to an error reporting service here
  }

  render() {
    const { children, fallback, showDetails = false } = this.props;
    
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return (
        <ErrorContainer>
          <ErrorHeader>Component Error</ErrorHeader>
          <ErrorMessage>
            {showDetails ? (
              <>
                <p>{this.state.error && this.state.error.toString()}</p>
                <ErrorDetails>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </ErrorDetails>
              </>
            ) : (
              <p>This component encountered an error. The application will continue to function.</p>
            )}
          </ErrorMessage>
          <ResetButton onClick={() => this.setState({ hasError: false })}>
            Try Again
          </ResetButton>
        </ErrorContainer>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

// Simple styled components without theme dependencies
const ErrorContainer = styled.div`
  margin: 12px;
  padding: 16px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid #F2555A;
  color: #E0E0E0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

const ErrorHeader = styled.h4`
  margin: 0 0 12px 0;
  color: #F2555A;
  font-size: 16px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  margin-bottom: 12px;
`;

const ErrorDetails = styled.details`
  margin-top: 12px;
  padding: 12px;
  background-color: #0A0A0A;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
`;

const ResetButton = styled.button`
  background-color: transparent;
  border: 1px solid #333333;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  color: #888888;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    border-color: #888888;
    color: #E0E0E0;
  }
`;

export default ErrorBoundary;