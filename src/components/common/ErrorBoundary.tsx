import React, { Component, ReactNode } from 'react';
import Button from './Button';
import { ButtonVariant } from '../../enums';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Boundary component to catch and handle React component errors
 * Follows React 18 best practices for error handling
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // TODO: Log to error reporting service in production
    // logErrorToService(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-container">
            <div className="error-boundary-icon" aria-hidden="true">
              ⚠️
            </div>
            <div className="error-boundary-content">
              <h1 className="error-boundary-title">
                Oops! Something went wrong
              </h1>
              <p className="error-boundary-message">
                We're sorry, but something unexpected happened. This error has been logged and our team will look into it.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-boundary-details">
                  <summary>Technical Details (Development Mode)</summary>
                  <div className="error-boundary-stack">
                    <h3>Error:</h3>
                    <pre>{this.state.error.message}</pre>
                    
                    {this.state.error.stack && (
                      <>
                        <h3>Stack Trace:</h3>
                        <pre>{this.state.error.stack}</pre>
                      </>
                    )}
                    
                    {this.state.errorInfo && (
                      <>
                        <h3>Component Stack:</h3>
                        <pre>{this.state.errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}
              
              <div className="error-boundary-actions">
                <Button
                  variant={ButtonVariant.PRIMARY}
                  onClick={this.handleRetry}
                  aria-label="Try to recover from error"
                >
                  Try Again
                </Button>
                <Button
                  variant={ButtonVariant.SECONDARY}
                  onClick={this.handleReload}
                  aria-label="Reload the entire page"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;