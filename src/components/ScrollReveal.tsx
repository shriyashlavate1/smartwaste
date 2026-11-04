import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'zoom-in' | 'mask-up'
  delay?: number
  threshold?: number
  cascade?: boolean
  as?: keyof HTMLElementTagNameMap
  [key: string]: any
}

export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
  cascade = false,
  as: Component = 'div',
  ...props
}: ScrollRevealProps) {
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
      {
        threshold,
        rootMargin: '20px 0px 20px 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const style = {
    transitionDelay: isReduced ? '0ms' : `${delay}ms`,
  }

  const TagName = Component as any

  return (
    <TagName
      ref={ref}
      style={style}
      className={`scroll-reveal ${animation} ${isRevealed ? 'is-revealed' : ''} ${cascade && !isReduced ? 'cascade-children' : ''} ${isReduced ? 'reduced-motion' : ''} ${className}`}
      {...props}
    >
      {children}
    </TagName>
  )
}
