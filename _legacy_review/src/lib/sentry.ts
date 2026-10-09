import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  const dsn = (import.meta as any).env.VITE_SENTRY_DSN || ''
  if (!dsn || dsn === 'your-sentry-dsn') return

  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1,
  })
}
