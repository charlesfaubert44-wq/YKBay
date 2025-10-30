import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-midnight-dark to-midnight-blue p-4">
          <div className="max-w-2xl w-full card-glass p-8 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-safety-red/20 mb-6">
              <AlertTriangle className="w-10 h-10 text-safety-red" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-display font-bold text-ice-white mb-3">
              Oops! Something went wrong
            </h1>

            {/* Message */}
            <p className="text-lg text-ice-blue mb-6">
              We encountered an unexpected error. The navigation crew has been notified
              and is working to fix the issue.
            </p>

            {/* Error details (dev mode only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-midnight-dark/50 rounded-lg p-4 border border-ice-blue/20">
                <summary className="text-tundra-gold font-semibold cursor-pointer mb-2">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-sm text-ice-white overflow-auto custom-scrollbar">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                leftIcon={<RefreshCw className="w-5 h-5" />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Home className="w-5 h-5" />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
            </div>

            {/* Support text */}
            <p className="mt-8 text-sm text-ice-blue/70">
              If this problem persists, please contact support with the error details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
