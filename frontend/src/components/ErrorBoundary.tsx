import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside widget boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-red-950/20 backdrop-blur-md border border-red-500/30 rounded-xl p-6 text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-200">Widget Error</h4>
            <p className="text-xs text-red-400 mt-1 max-w-sm mx-auto leading-relaxed">
              This widget crashed during execution. {this.state.error?.message || 'Check browser console.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 border border-red-500/20 rounded text-[11px] font-semibold text-red-200 cursor-pointer transition-all"
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
