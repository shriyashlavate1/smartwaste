import { useState, useEffect } from 'react'

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const getInitial = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(REDUCE_QUERY).matches
  }

  const [reduced, setReduced] = useState<boolean>(getInitial)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mq = window.matchMedia(REDUCE_QUERY)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    
    // Sync initial state after mount
    setReduced(mq.matches)

    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
