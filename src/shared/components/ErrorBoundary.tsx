import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Error desconocido' }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    try {
      ((window as any).__BOOT_ERRORS__ ||= []).push(String(error?.message).slice(0, 400))
    } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: 700 }}>Algo salió mal</h2>
          <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-sub)' }}>La aplicación se cerró por un error inesperado.</p>
          <details style={{ marginBottom: '20px', textAlign: 'left', width: '100%', maxWidth: '400px', fontSize: '12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--primary-color)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>Detalles técnicos</summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', background: 'var(--card-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
              {this.state.message}
            </pre>
          </details>
          <button onClick={() => window.location.reload()} style={{ minHeight: '44px', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 700, fontSize: '15px' }}>
            Recargar app
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
