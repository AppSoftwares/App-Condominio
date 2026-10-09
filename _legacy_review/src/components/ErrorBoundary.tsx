import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '12px' }}>Algo salió mal</h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>La aplicación se cerró por un error inesperado.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: '#0f5551', color: 'white' }}>
            Recargar app
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
