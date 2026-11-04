import { useRef, type ReactNode, type MouseEvent, type HTMLAttributes } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface TiltCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  className?: string
  maxTilt?: number
  scale?: number
  spotlight?: boolean
  as?: keyof HTMLElementTagNameMap
  onClick?: () => void
  [key: string]: any
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  scale = 1.015,
  spotlight = true,
  as: Component = 'div',
  onClick,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const isReduced = useReducedMotion()

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (isReduced || !cardRef.current || window.matchMedia('(pointer: coarse)').matches) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const tiltX = -((y - centerY) / centerY) * maxTilt
    const tiltY = ((x - centerX) / centerX) * maxTilt

    cardRef.current.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  const Tag = Component as any

  return (
    <Tag
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`tilt-card ${spotlight && !isReduced ? 'with-spotlight' : ''} ${className}`}
      {...props}
    >
      {spotlight && !isReduced && <div className="card-spotlight-overlay" aria-hidden="true" />}
      {children}
    </Tag>
  )
}
