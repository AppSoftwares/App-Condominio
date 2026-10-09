// Creado por Jesús Pirela.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SplashScreen } from '@capacitor/splash-screen'
import App from './App'

// Ultimo recurso: si el JS del bootstrap jamas termina, no dejar splash infinito.
setTimeout(() => { SplashScreen.hide().catch(() => {}) }, 10_000)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
