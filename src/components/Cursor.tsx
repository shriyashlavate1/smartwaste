import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Point {
  x: number
  y: number
}

function createTrailPath(points: Point[]): string {
  const trail = [...points].reverse()
  if (trail.length < 2) return ''

  let path = `M ${trail[0].x} ${trail[0].y}`
  for (let index = 1; index < trail.length - 1; index += 1) {
    const point = trail[index]
    const next = trail[index + 1]
    const midX = (point.x + next.x) / 2
    const midY = (point.y + next.y) / 2
    path += ` Q ${point.x} ${point.y} ${midX} ${midY}`
  }

  const tip = trail[trail.length - 1]
  return `${path} L ${tip.x} ${tip.y}`
}

export function CustomCursor() {
  const isReduced = useReducedMotion()
  const trailPathRef = useRef<SVGPathElement>(null)
  const haloPathRef = useRef<SVGPathElement>(null)
  const gradientRef = useRef<SVGLinearGradientElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [manualMotionReduced, setManualMotionReduced] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setManualMotionReduced(document.documentElement.dataset.motion === 'reduced')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    setManualMotionReduced(document.documentElement.dataset.motion === 'reduced')
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isReduced || manualMotionReduced || window.matchMedia('(pointer: coarse)').matches) {
      setIsVisible(false)
      return
    }

    const points = Array.from({ length: 11 }, () => ({ x: -100, y: -100 }))
    let pointerX = -100
    let pointerY = -100
    let hasMoved = false
    let animationFrameId: number

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      pointerX = event.clientX
      pointerY = event.clientY
      if (!hasMoved) {
        points.forEach((point) => {
          point.x = pointerX
          point.y = pointerY
        })
        hasMoved = true
      }

      setIsVisible(true)
      const target = event.target
      const interactive = target instanceof Element
        && Boolean(target.closest('[data-cursor], button, a, input, select, textarea, [role="button"]'))
      setIsInteractive((current) => current === interactive ? current : interactive)
    }

    const handlePointerLeave = () => setIsVisible(false)

    const render = () => {
      if (hasMoved) {
        points[0].x += (pointerX - points[0].x) * 0.72
        points[0].y += (pointerY - points[0].y) * 0.72

        for (let index = 1; index < points.length; index += 1) {
          points[index].x += (points[index - 1].x - points[index].x) * 0.28
          points[index].y += (points[index - 1].y - points[index].y) * 0.28
        }

        const path = createTrailPath(points)
        trailPathRef.current?.setAttribute('d', path)
        haloPathRef.current?.setAttribute('d', path)

        const gradient = gradientRef.current
        if (gradient) {
          const tail = points[points.length - 1]
          const tip = points[0]
          gradient.setAttribute('x1', String(tail.x))
          gradient.setAttribute('y1', String(tail.y))
          gradient.setAttribute('x2', String(tip.x))
          gradient.setAttribute('y2', String(tip.y))
        }

        if (cursorDotRef.current) {
          cursorDotRef.current.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('mouseleave', handlePointerLeave)
    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isReduced, manualMotionReduced])

  if (isReduced || manualMotionReduced) return null

  return (
    <div className={`custom-cursor-container ${isVisible ? 'is-visible' : ''}${isInteractive ? ' is-interactive' : ''}`} aria-hidden="true">
      <svg className="cursor-trail" width="100%" height="100%">
        <defs>
          <linearGradient ref={gradientRef} id="cursor-trail-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="1" />
          </linearGradient>
          <filter id="cursor-trail-blur" x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path ref={haloPathRef} className="cursor-trail-halo" />
        <path ref={trailPathRef} className="cursor-trail-core" />
      </svg>
      <div ref={cursorDotRef} className="cursor-dot" />
    </div>
  )
}
