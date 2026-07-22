import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary. Prevents a single component crash from taking
 * down the whole app. Shows a friendly recover screen and lets the user
 * retry or go home. Errors are logged to the console for developer triage;
 * we deliberately don't send them to a third-party service here.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">
            The page hit an unexpected error. You can try again or head back home.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={this.reset} variant="outline">Try again</Button>
            <Button onClick={() => (window.location.href = "/")}>Go home</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;