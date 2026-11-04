import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface KineticTextProps {
  children: string | ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  delay?: number
}

export function KineticText({
  children,
  className = '',
  as: Component = 'div',
  delay = 0,
}: KineticTextProps) {
  const ref = useRef<HTMLElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const isReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Immediately reveal if already within viewport on mount
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsRevealed(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = Component as any

  return (
    <Tag
      ref={ref}
      className={`kinetic-text-wrap ${isRevealed ? 'is-revealed' : ''} ${isReduced ? 'reduced-motion' : ''} ${className}`}
      style={{ '--kinetic-delay': `${isReduced ? 0 : delay}ms` } as any}
    >
      <span className="kinetic-text-inner">{children}</span>
    </Tag>
  )
}
