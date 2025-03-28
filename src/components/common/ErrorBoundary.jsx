import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Self-contained ErrorBoundary component for AudioCore
 * Captures React component errors and displays them with inline styling
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      expanded: false,
      copySuccess: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false, 
      error: null,
      errorInfo: null,
      expanded: false,
      copySuccess: false
    });

    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  }

  toggleExpanded = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded
    }));
  }
  
  // Add method to copy error details to clipboard
  copyErrorToClipboard = () => {
    const { error, errorInfo } = this.state;
    
    // Format error information for clipboard
    const errorText = `
Error: ${error?.toString() || 'Unknown error'}

Component Stack:
${errorInfo?.componentStack || 'No stack trace available'}
    `.trim();
    
    // Use clipboard API to copy text
    navigator.clipboard.writeText(errorText).then(
      () => {
        // Show success message briefly
        this.setState({ copySuccess: true });
        setTimeout(() => {
          this.setState({ copySuccess: false });
        }, 2000);
      },
      (err) => {
        console.error('Could not copy error details: ', err);
      }
    );
  };

  render() {
    const { 
      children, 
      fallback, 
      showDetails = false,
      maxErrorCount = 3,
      disableReset = false,
      theme = 'dark'  // Default to dark theme
    } = this.props;
    
    const { hasError, error, errorInfo, errorCount, expanded, copySuccess } = this.state;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return typeof fallback === 'function' 
        ? fallback(error, errorInfo, this.handleReset)
        : fallback;
    }

    // Self-contained theme that doesn't depend on external variables
    const themeColors = theme === 'dark' 
      ? {
          bgPrimary: '#0A0A0A',
          bgSecondary: 'rgba(15, 15, 15, 0.8)',
          bgContent: 'rgba(0, 0, 0, 0.4)',
          textPrimary: '#E0E0E0',
          textSecondary: '#888888',
          accentPrimary: '#91F291',
          accentError: '#F2555A',
          accentHighlight: '#5D7DF2',
          borderSubtle: 'rgba(255, 255, 255, 0.05)',
          borderLight: '#333333',
          borderMedium: 'rgba(255, 255, 255, 0.1)',
          borderFocus: 'rgba(145, 242, 145, 0.4)',
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        }
      : {
          bgPrimary: '#FDFDFD',
          bgSecondary: 'rgba(245, 245, 247, 0.9)',
          bgContent: 'rgba(255, 255, 255, 0.6)',
          textPrimary: '#1A1A1C',
          textSecondary: '#555558',
          accentPrimary: '#00A000',
          accentError: '#D94045',
          accentHighlight: '#4060D9',
          borderSubtle: 'rgba(0, 0, 0, 0.06)',
          borderLight: '#D0D0D5',
          borderMedium: 'rgba(0, 0, 0, 0.1)',
          borderFocus: 'rgba(0, 160, 0, 0.4)',
          shadowColor: 'rgba(100, 100, 110, 0.15)',
        };

    const spacing = {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px'
    };

    const typography = {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      fontFamilyMono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    };

    // SVG icons as inline components to avoid external dependencies
    const AlertTriangleIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
      </svg>
    );
    
    const AlertCircleIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    );
    
    const RefreshCwIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
      </svg>
    );
    
    const ChevronDownIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    );
    
    const ChevronUpIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6"></path>
      </svg>
    );
    
    // New Copy icon for the copy button
    const CopyIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    );
    
    // Check icon for copy success
    const CheckIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );

    const isPermanentError = errorCount >= maxErrorCount;
    const shouldShowDetails = showDetails || expanded;

    // Inline styles for error container
    const containerStyle = {
      backgroundColor: themeColors.bgContent,
      borderRadius: spacing.sm,
      border: `1px solid ${themeColors.borderSubtle}`,
      boxShadow: `0 2px 6px ${themeColors.shadowColor}`,
      overflow: 'hidden',
      margin: spacing.md,
      transition: 'all 0.3s ease',
      width: 'calc(100% - 32px)',
      animation: 'fadeIn 0.3s ease',
    };

    // Inline styles for error header
    const headerStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: 'rgba(242, 85, 90, 0.1)',
      borderBottom: `1px solid ${themeColors.borderSubtle}`,
    };

    // Inline styles for header icon
    const iconStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: themeColors.accentError,
      marginRight: spacing.sm,
    };

    // Inline styles for header content
    const contentStyle = {
      flex: 1,
    };

    // Inline styles for header title
    const titleStyle = {
      fontSize: '16px',
      fontWeight: 500,
      color: themeColors.textPrimary,
      marginBottom: '2px',
      fontFamily: typography.fontFamily,
    };

    // Inline styles for header description
    const descriptionStyle = {
      fontSize: '14px',
      color: themeColors.textSecondary,
      margin: 0,
      fontFamily: typography.fontFamily,
    };

    // Inline styles for button wrapper (for header buttons)
    const buttonWrapperStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
    };

    // Inline styles for reset button
    const buttonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.xs} ${spacing.md}`,
      backgroundColor: themeColors.bgSecondary,
      border: `1px solid ${themeColors.borderLight}`,
      borderRadius: '4px',
      color: themeColors.textSecondary,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: typography.fontFamily,
    };

    // Inline styles for error body
    const bodyStyle = {
      padding: spacing.md,
    };

    // Inline styles for error message
    const messageStyle = {
      padding: spacing.sm,
      backgroundColor: themeColors.bgSecondary,
      borderRadius: '4px',
      fontFamily: typography.fontFamilyMono,
      fontSize: '13px',
      color: themeColors.accentError,
      marginBottom: spacing.md,
      whiteSpace: 'pre-wrap',
      overflowX: 'auto',
    };

    // Inline styles for error stack
    const stackStyle = {
      backgroundColor: themeColors.bgSecondary,
      borderRadius: '4px',
      border: `1px solid ${themeColors.borderLight}`,
      marginBottom: spacing.md,
      overflow: 'hidden',
    };

    // Inline styles for stack header container
    const stackHeaderContainerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: themeColors.bgPrimary,
      borderBottom: `1px solid ${themeColors.borderSubtle}`,
      padding: `${spacing.xs} ${spacing.sm}`,
    };

    // Inline styles for stack header
    const stackHeaderStyle = {
      fontSize: '12px',
      color: themeColors.textSecondary,
      fontWeight: 500,
      fontFamily: typography.fontFamily,
    };

    // Style for the copy button in the stack header
    const copyButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.xs} ${spacing.sm}`,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '4px',
      color: copySuccess ? themeColors.accentPrimary : themeColors.textSecondary,
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: typography.fontFamily,
    };

    // Inline styles for stack content
    const stackContentStyle = {
      margin: 0,
      padding: spacing.sm,
      fontFamily: typography.fontFamilyMono,
      fontSize: '12px',
      color: themeColors.textSecondary,
      overflowX: 'auto',
      maxHeight: '200px',
      overflowY: 'auto',
    };

    // Inline styles for details toggle
    const toggleStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
      border: 'none',
      background: 'none',
      color: themeColors.accentPrimary,
      fontSize: '13px',
      cursor: 'pointer',
      padding: 0,
      transition: 'color 0.2s ease',
      fontFamily: typography.fontFamily,
    };

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>
            {isPermanentError ? <AlertCircleIcon /> : <AlertTriangleIcon />}
          </div>
          <div style={contentStyle}>
            <h3 style={titleStyle}>Component Error</h3>
            <p style={descriptionStyle}>
              {isPermanentError 
                ? "This component has experienced multiple errors and cannot recover automatically." 
                : "An error occurred in this component."}
            </p>
          </div>
          
          <div style={buttonWrapperStyle}>
            {/* Copy button is available regardless of error state */}
            <button 
              style={buttonStyle}
              onClick={this.copyErrorToClipboard}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.bgHover || 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = themeColors.textPrimary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.bgSecondary;
                e.currentTarget.style.color = themeColors.textSecondary;
              }}
              title="Copy error details to clipboard"
            >
              {copySuccess ? <CheckIcon /> : <CopyIcon />}
              <span>{copySuccess ? 'Copied!' : 'Copy Error'}</span>
            </button>
            
            {!disableReset && !isPermanentError && (
              <button 
                style={buttonStyle}
                onClick={this.handleReset}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.bgHover || 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = themeColors.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.bgSecondary;
                  e.currentTarget.style.color = themeColors.textSecondary;
                }}
                title="Try to reset this component"
              >
                <RefreshCwIcon />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div style={bodyStyle}>
          <div style={messageStyle}>
            {error?.toString() || 'Unknown error'}
          </div>
          
          {shouldShowDetails && (
            <div style={stackStyle}>
              <div style={stackHeaderContainerStyle}>
                <div style={stackHeaderStyle}>Component Stack</div>
                <button 
                  style={copyButtonStyle}
                  onClick={this.copyErrorToClipboard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = themeColors.accentPrimary;
                  }}
                  onMouseOut={(e) => {
                    if (!copySuccess) {
                      e.currentTarget.style.color = themeColors.textSecondary;
                    }
                  }}
                  title="Copy error details to clipboard"
                >
                  {copySuccess ? <CheckIcon /> : <CopyIcon />}
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre style={stackContentStyle}>
                {errorInfo?.componentStack || 'No stack trace available'}
              </pre>
            </div>
          )}
          
          {!showDetails && (
            <button 
              style={toggleStyle}
              onClick={this.toggleExpanded}
              onMouseOver={(e) => {
                e.currentTarget.style.color = themeColors.accentHighlight;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = themeColors.accentPrimary;
              }}
            >
              {expanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUpIcon />
                </>
              ) : (
                <>
                  <span>Show Details</span>
                  <ChevronDownIcon />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  showDetails: PropTypes.bool,
  maxErrorCount: PropTypes.number,
  disableReset: PropTypes.bool,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  theme: PropTypes.oneOf(['dark', 'light']),
};

export default ErrorBoundary;