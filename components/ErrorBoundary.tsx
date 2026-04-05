"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { ErrorBoundaryFallbackProps } from "../lib/errors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errorProps: ErrorBoundaryFallbackProps = {
      error: this.state.error!,
      resetErrorBoundary: this.handleReset,
      componentStack: this.state.errorInfo?.componentStack as string | undefined,
    };

    if (typeof this.props.fallback === "function") {
      return this.props.fallback(errorProps);
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white  -lg shadow-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100  -full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Une erreur est survenue
          </h2>

          <p className="text-gray-600 mb-6">
            Nous sommes désolés, quelque chose s&apos;est mal passé. Nous travaillons à résoudre ce problème.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-100   p-4 mb-6 text-left text-sm text-gray-700 overflow-auto max-h-60">
              <h3 className="font-bold mb-2">Error Details:</h3>
              <p className="mb-2">{this.state.error?.message}</p>
              <p className="mb-2">{this.state.error?.name}</p>
              {this.state.errorInfo?.componentStack && (
                <div>
                  <h4 className="font-bold mt-2 mb-1">Component Stack:</h4>
                  <pre className="whitespace-pre-wrap text-xs overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4  -lg transition-colors duration-200"
          >
            Réessayer
          </button>

          <button
            onClick={() => globalThis.location.reload()}
            className="mt-3 text-blue-600 hover:text-blue-700 font-medium py-2 px-4  -lg transition-colors duration-200"
          >
            Recharger la page
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Si le problème persiste, n&apos;hésitez pas à nous contacter pour que nous puissions vous aider.
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;