'use client'
import { useState, useRef, useCallback } from 'react'

interface UseSwipeToCloseOptions {
  onClose: () => void
  direction?: 'right' | 'down'
  threshold?: number
}

export function useSwipeToClose({ onClose, direction = 'right', threshold = 100 }: UseSwipeToCloseOptions) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const startPos = useRef(0)
  const swiping = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startPos.current = direction === 'right' ? e.touches[0].clientX : e.touches[0].clientY
    swiping.current = true
  }, [direction])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return
    const currentPos = direction === 'right' ? e.touches[0].clientX : e.touches[0].clientY
    const diff = currentPos - startPos.current
    if (diff > 0) {
      setSwipeOffset(diff)
    }
  }, [direction])

  const onTouchEnd = useCallback(() => {
    if (!swiping.current) return
    swiping.current = false
    if (swipeOffset >= threshold) {
      onClose()
    }
    setSwipeOffset(0)
  }, [swipeOffset, threshold, onClose])

  return {
    swipeOffset,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
