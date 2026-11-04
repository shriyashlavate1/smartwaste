import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function CustomCursor() {
  const isReduced = useReducedMotion()
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorFollowerRef = useRef<HTMLDivElement>(null)
  const [cursorText, setCursorText] = useState('')
  const [cursorVariant, setCursorVariant] = useState<'default' | 'pointer' | 'text' | 'card' | 'action'>('default')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // If reduced motion is active or on touch device, disable custom cursor entirely
    if (isReduced || window.matchMedia('(pointer: coarse)').matches) {
      setIsVisible(false)
      return
    }

    let mouseX = -100
    let mouseY = -100
    let followerX = -100
    let followerY = -100
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!isVisible) setIsVisible(true)

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      const target = e.target as HTMLElement | null
      if (target) {
        const interactive = target.closest('[data-cursor]') as HTMLElement | null
        if (interactive) {
          const type = interactive.dataset.cursor || 'pointer'
          const label = interactive.dataset.cursorLabel || ''
          setCursorVariant(type as any)
          setCursorText(label)
        } else if (target.closest('button, a, input, select, textarea, [role="button"]')) {
          setCursorVariant('pointer')
          setCursorText('')
        } else {
          setCursorVariant('default')
          setCursorText('')
        }
      }
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    const render = () => {
      followerX += (mouseX - followerX) * 0.2
      followerY += (mouseY - followerY) * 0.2

      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`
      }

      animationFrameId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isVisible, isReduced])

  if (isReduced) return null

  return (
    <div className={`custom-cursor-container ${isVisible ? 'is-visible' : ''} cursor-${cursorVariant}`}>
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorFollowerRef} className="cursor-follower">
        {cursorText && <span className="cursor-label">{cursorText}</span>}
      </div>
    </div>
  )
}
