import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error listener to report errors to backend
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    fetch('http://localhost:5050/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: e.message,
        stack: e.error?.stack || 'No stack',
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      })
    }).catch(() => {});
  });

  window.addEventListener('unhandledrejection', (e) => {
    fetch('http://localhost:5050/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Unhandled Promise: ' + (e.reason?.message || e.reason),
        stack: e.reason?.stack || 'No stack'
      })
    }).catch(() => {});
  });
}

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    fetch('http://localhost:5050/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'React ErrorBoundary caught: ' + error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack
      })
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '800px',
          margin: '40px auto',
          fontFamily: 'system-ui, sans-serif',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #fee2e2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>⚠️</span>
            <div>
              <h2 style={{ margin: 0, color: '#b91c1c', fontSize: 20 }}>Application Render Error</h2>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                An unexpected error occurred while rendering this page.
              </div>
            </div>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            marginBottom: '16px'
          }}>
            {this.state.error?.toString()}
          </div>

          {this.state.errorInfo?.componentStack && (
            <details style={{ marginBottom: 16 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: '#4b5563', fontWeight: 600 }}>
                View Component Stack Trace
              </summary>
              <pre style={{
                background: '#f3f4f6',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '11px',
                overflowX: 'auto',
                color: '#374151',
                marginTop: 8
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                window.location.hash = 'organization';
                window.location.reload();
              }}
              style={{
                padding: '8px 16px',
                background: '#0d9488',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Return to Organization
            </button>
            <button
              onClick={() => {
                window.location.hash = 'dashboard';
                window.location.reload();
              }}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
