import { useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function MotionToggle() {
  const osReduced = useReducedMotion()
  const [manualOverride, setManualOverride] = useState<boolean | null>(null)

  const isReduced = manualOverride !== null ? manualOverride : osReduced

  useEffect(() => {
    if (isReduced) {
      document.documentElement.setAttribute('data-motion', 'reduced')
    } else {
      document.documentElement.setAttribute('data-motion', 'full')
    }
  }, [isReduced])

  const toggle = () => {
    setManualOverride(!isReduced)
  }

  return (
    <button
      type="button"
      className={`motion-toggle-btn ${isReduced ? 'motion-reduced' : 'motion-full'}`}
      onClick={toggle}
      aria-pressed={isReduced}
      aria-label={isReduced ? 'Switch to full motion animations' : 'Switch to accessible reduced motion'}
      title={isReduced ? 'Motion is reduced (WCAG accessible). Click for full motion.' : 'Full motion active. Click for reduced motion.'}
    >
      <span className="motion-indicator-dot" aria-hidden="true" />
      <span>{isReduced ? 'MOTION: REDUCED' : 'MOTION: ACTIVE'}</span>
    </button>
  )
}
