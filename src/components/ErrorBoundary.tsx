import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev — swap for a real error service (Sentry etc.) in prod
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className="font-heading text-xl font-bold text-neutral-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
              An unexpected error occurred. This has been noted. Please refresh the page to
              continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <RefreshCw size={15} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
