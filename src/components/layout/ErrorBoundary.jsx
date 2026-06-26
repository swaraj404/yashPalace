import { Component } from 'react';

/**
 * Catches render/runtime errors in its subtree so a single failing component
 * can never blank the whole site. Use `silent` for decorative widgets (renders
 * nothing on failure); omit it at the app root to show a recoverable fallback.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface in the console for debugging; swap for a logger in production.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.silent) return null;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
        <p className="font-serif text-3xl text-forest">Something went sideways.</p>
        <p className="max-w-md text-sm text-forest/70">
          The page hit an unexpected error. Please refresh — if it keeps happening, let us know.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-forest px-6 py-3 text-sm font-medium text-ivory transition hover:bg-forest/90"
        >
          Reload page
        </button>
      </div>
    );
  }
}
