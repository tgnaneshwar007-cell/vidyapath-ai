import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('VidyaPath ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-brand-warmWhite text-brand-black">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-brand-border bg-white shadow-elevated text-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-subtle">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold font-display text-brand-black">Something went wrong</h2>
            <p className="text-xs text-brand-mutedText leading-relaxed">
              An unexpected display error occurred while rendering this view.
            </p>

            {this.state.error && (
              <pre className="text-left p-3 rounded-lg bg-brand-black text-amber-300 text-[11px] font-mono overflow-x-auto max-h-36">
                {this.state.error.message}
              </pre>
            )}

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-brand-black text-white text-xs font-mono font-bold hover:bg-brand-orange transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-brand-border bg-white text-brand-black text-xs font-mono font-bold hover:bg-brand-storm-subtle transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
