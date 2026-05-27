// Ocean View — Error Boundary Component
// Catches React rendering errors and shows a fallback UI

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Ocean View ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center bg-[#0a0f1e] rounded-xl p-6 border border-red-500/20">
          <div className="text-4xl mb-3">🌊💔</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm border border-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline error fallback for specific sections
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
      <span className="text-red-400 text-sm">⚠️ {message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-400 hover:text-red-300 underline ml-auto"
        >
          Retry
        </button>
      )}
    </div>
  );
}