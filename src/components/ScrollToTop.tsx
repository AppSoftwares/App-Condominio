import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const ScrollToTop = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);

      const scrollables = document.querySelectorAll('*');
      scrollables.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || el.scrollTop > 0) {
          el.scrollTo(0, 0);
          el.scrollTop = 0;
        }
      });
    };

    scrollToTop();
    const timeout = setTimeout(scrollToTop, 10);
    const timeout2 = setTimeout(scrollToTop, 100);

    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [pathname, search])

  return null
}
