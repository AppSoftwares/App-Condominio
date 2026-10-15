// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

beforeAll(() => {
  // jsdom no implementa estas APIs que un WebView real si tiene
  Element.prototype.scrollTo = () => {}
  window.scrollTo = () => {}
  window.matchMedia = window.matchMedia || ((() => ({
    matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })) as any)
  // Peor caso: sin internet
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
})

describe('arranque de la app', () => {
  it('pinta contenido y no cae en la pantalla de error', async () => {
    const { default: App } = await import('../../src/App')
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)

    await act(async () => { createRoot(root).render(<App />) })
    await act(async () => { await new Promise((r) => setTimeout(r, 8000)) })

    expect(root.innerHTML.length).toBeGreaterThan(0)            // no pantalla blanca
    expect(root.textContent).not.toContain('Algo salió mal')    // no cayó el ErrorBoundary
  }, 12000)
})
