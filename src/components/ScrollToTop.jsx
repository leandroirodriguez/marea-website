import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the previous scroll position on navigation; reset to the
// top whenever the route changes (in-page #anchors are left alone).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
