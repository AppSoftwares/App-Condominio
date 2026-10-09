import { useConsentStore } from '../../features/legal/useConsentStore'

function scrub(event: any) {
  const str = JSON.stringify(event)
  const scrubbed = str
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]')
  return JSON.parse(scrubbed)
}

export async function initSentryIfConsented() {
  const { diagnostics } = useConsentStore.getState()
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!diagnostics || !dsn || dsn === 'your-sentry-dsn') return
  try {
    const Sentry = await import('@sentry/react')
    Sentry.init({
      dsn,
      sendDefaultPii: false,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        delete event.user
        if (event.request) {
          delete (event.request as any).cookies
          delete (event.request as any).headers
          delete (event.request as any).data
        }
        return scrub(event)
      },
      beforeBreadcrumb(b) {
        if (b.category === 'fetch' || b.category === 'xhr') {
          b.data = { method: b.data?.method }
        }
        return b
      },
    })
  } catch (err) {
    console.warn('Failed to initialize Sentry:', err)
  }
}
