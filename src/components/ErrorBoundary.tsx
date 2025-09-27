import { Component, ReactNode } from "react";
import { Card, Alert } from "./ui";
import { Icon } from "./ui/Icon";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card variant="danger" className="m-4">
          <div className="flex items-start space-x-3">
            <Icon name="loading" size={24} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-danger mb-2">Something went wrong</h3>
              <p className="text-sm text-text-secondary mb-4">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Alert variant="danger" className="mb-4">
                  <code className="text-xs">{this.state.error.message}</code>
                </Alert>
              )}
              <button
                onClick={this.handleRetry}
                className="bg-danger hover:bg-danger-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}