import { useRef, type ReactNode, type MouseEvent } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 0.22, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isReduced = useReducedMotion()

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isReduced || !ref.current || window.matchMedia('(pointer: coarse)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = (e.clientX - centerX) * strength
    const distanceY = (e.clientY - centerY) * strength

    ref.current.style.transform = `translate3d(${distanceX}px, ${distanceY}px, 0)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate3d(0px, 0px, 0px)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-wrapper ${className}`}
      style={{
        display: 'inline-block',
        transition: isReduced ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isReduced ? 'auto' : 'transform',
      }}
    >
      {children}
    </div>
  )
}
