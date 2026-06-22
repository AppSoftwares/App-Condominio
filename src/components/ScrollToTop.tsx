import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const ScrollToTop = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Intentar hacer scroll al inicio en el window
    window.scrollTo(0, 0);

    // En esta app, el scroll lo maneja un contenedor interno.
    // Buscamos cualquier elemento con scroll y lo reseteamos.
    const scrollables = document.querySelectorAll('div');
    scrollables.forEach(el => {
      if (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll') {
        el.scrollTo(0, 0);
      }
    });
  }, [pathname, search])

  return null
}
