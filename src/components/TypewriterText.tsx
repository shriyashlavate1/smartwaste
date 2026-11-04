import { useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface TypewriterTextProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  emptyPauseDuration?: number
  className?: string
}

export function TypewriterText({
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 1800,
  emptyPauseDuration = 450,
  className = '',
}: TypewriterTextProps) {
  const osReduced = useReducedMotion()
  const [manualReduced, setManualReduced] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.motion === 'reduced'
    }
    return false
  })

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setManualReduced(document.documentElement.dataset.motion === 'reduced')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    setManualReduced(document.documentElement.dataset.motion === 'reduced')
    return () => observer.disconnect()
  }, [])

  const isReduced = osReduced || manualReduced

  const [wordIndex, setWordIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isReduced) return

    const currentWord = words[wordIndex % words.length]
    let timer: number

    if (!isDeleting) {
      if (displayText.length < currentWord.length) {
        timer = window.setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        }, typingSpeed)
      } else {
        timer = window.setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    } else {
      if (displayText.length > 0) {
        timer = window.setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1))
        }, deletingSpeed)
      } else {
        timer = window.setTimeout(() => {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        }, emptyPauseDuration)
      }
    }

    return () => window.clearTimeout(timer)
  }, [displayText, isDeleting, wordIndex, words, isReduced, typingSpeed, deletingSpeed, pauseDuration, emptyPauseDuration])

  if (isReduced) {
    return (
      <span className={`typewriter-animated-wrapper ${className}`}>
        <span className="typewriter-text-content">{words[0]}</span>
      </span>
    )
  }

  return (
    <span className={`typewriter-animated-wrapper ${className}`}>
      <span className="typewriter-text-content">{displayText}</span>
      <span className="typewriter-blinking-cursor" aria-hidden="true" />
    </span>
  )
}
