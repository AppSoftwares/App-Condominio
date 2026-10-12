// Creado por Jesús Pirela.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SplashScreen } from '@capacitor/splash-screen'
import App from './App'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

;(window as any).__APP_VERSION__ = __APP_VERSION__

// Ultimo recurso: si a los 9 s la app no monto, ocultar el splash para que se vea el
// panel de boot-guard (que aparece a los 8 s) en vez de quedar tapado.
setTimeout(() => {
  SplashScreen.hide().catch(() => {})
  ;(window as any).__bootGuardShow?.()
}, 9_000)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </React.StrictMode>
)
