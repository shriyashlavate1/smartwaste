import { useState, useEffect, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  reverse?: boolean
  className?: string
  pauseOnHover?: boolean
}

export function Marquee({
  children,
  speed = 28,
  reverse = false,
  className = '',
  pauseOnHover = true,
}: MarqueeProps) {
  const isReduced = useReducedMotion()
  const [isPlaying, setIsPlaying] = useState(!isReduced)

  // React to OS reduced motion setting changes
  useEffect(() => {
    if (isReduced) {
      setIsPlaying(false)
    }
  }, [isReduced])

  return (
    <div
      className={`marquee-container ${pauseOnHover ? 'pause-on-hover' : ''} ${className}`}
      data-playing={isPlaying ? 'true' : 'false'}
      style={{ '--marquee-speed': `${speed}s` } as any}
    >
      <button
        type="button"
        className="marquee-control-btn"
        onClick={() => setIsPlaying(!isPlaying)}
        aria-pressed={!isPlaying}
        aria-label={isPlaying ? 'Pause ticker animation' : 'Play ticker animation'}
        title={isPlaying ? 'Pause ticker' : 'Play ticker'}
      >
        <span className="marquee-control-dot" />
        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
      </button>

      <div className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}>
        <div className="marquee-content">{children}</div>
        <div className="marquee-content" aria-hidden="true">{children}</div>
        <div className="marquee-content" aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}
