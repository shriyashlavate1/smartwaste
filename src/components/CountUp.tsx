import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({ to, duration = 1200, prefix = '', suffix = '', className = '' }: CountUpProps) {
  const [current, setCurrent] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()

          const update = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setCurrent(Math.floor(easeOut * to))

            if (progress < 1) {
              requestAnimationFrame(update)
            } else {
              setCurrent(to)
            }
          }

          requestAnimationFrame(update)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [to, duration])

  return (
    <span ref={ref} className={`count-up ${className}`}>
      {prefix}{current}{suffix}
    </span>
  )
}
