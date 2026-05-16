import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-center flex-column" style={{
          padding: '2rem',
          textAlign: 'center',
          height: '100vh',
          background: 'var(--bg-gradient)',
          color: 'var(--on-surface)'
        }}>
          <span className="material-icons" style={{ fontSize: '5rem', color: 'var(--danger)', marginBottom: '1rem' }}>error_outline</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Epic Toolbox Error</h1>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
            We've encountered an unexpected error. Please try refreshing the page or resetting the application if the issue persists.
          </p>
          <div className="flex-gap">
              <button
                className="btn-primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Try Again
              </button>
              <button
                className="pill"
                onClick={() => {
                  if (window.confirm("This will clear all your settings and bookmarks. Continue?")) {
                      localStorage.clear();
                      window.location.reload();
                  }
                }}
              >
                Reset App
              </button>
          </div>
          {import.meta.env.DEV && (
            <div className="card mt-20 p-20" style={{ maxWidth: '90%', overflow: 'auto', textAlign: 'left' }}>
              <pre className="font-mono smallest">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
