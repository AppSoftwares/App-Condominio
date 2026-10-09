import React from 'react'

interface AsyncListProps<T> {
  isLoading: boolean
  error?: unknown
  data: T[] | null | undefined
  onRetry?: () => void
  emptyText?: string
  skeletonRows?: number
  children: (items: T[]) => React.ReactNode
}

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div role="status" aria-busy="true" aria-label="Cargando elementos..." style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ height: 56, background: 'var(--border-color)', borderRadius: 8, opacity: 0.4, animation: 'pulse 1.5s infinite ease-in-out' }} />
    ))}
    <style>{`
      @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.7; } 100% { opacity: 0.3; } }
      @media (prefers-reduced-motion: reduce) { div[aria-busy] div { animation: none !important; } }
    `}</style>
  </div>
)

export const ErrorState: React.FC<{ onRetry?: () => void; message?: string }> = ({ onRetry, message = 'Ocurrió un error al cargar los datos.' }) => (
  <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, textAlign: 'center', color: 'var(--text-color)' }}>
    <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--error-text, #B3261E)' }}>error</span>
    <p style={{ margin: 0, fontSize: 15 }}>{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
      >
        Reintentar
      </button>
    )}
  </div>
)

export const EmptyState: React.FC<{ text?: string }> = ({ text = 'No hay elementos para mostrar.' }) => (
  <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, textAlign: 'center', color: 'var(--text-sub)' }}>
    <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>inbox</span>
    <p style={{ margin: 0, fontSize: 15 }}>{text}</p>
  </div>
)

export function AsyncList<T>({
  isLoading,
  error,
  data,
  onRetry,
  emptyText = 'No hay elementos para mostrar.',
  skeletonRows = 3,
  children
}: AsyncListProps<T>) {
  if (isLoading) return <ListSkeleton rows={skeletonRows} />
  if (error) return <ErrorState onRetry={onRetry} />
  const items = Array.isArray(data) ? data : []
  if (items.length === 0) return <EmptyState text={emptyText} />
  return <>{children(items)}</>
}
