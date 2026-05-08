import { useRef, useState, useCallback, MouseEvent as ReactMouseEvent } from 'react'

export function useDragScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const onMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    // Ignore if clicked on an interactive element
    const target = e.target as HTMLElement
    const isInteractive =
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[role="menuitem"]') ||
      target.closest('[role="dialog"]')

    if (isInteractive) return

    setIsDragging(true)
    if (containerRef.current) {
      setStartX(e.pageX - containerRef.current.offsetLeft)
      setScrollLeft(containerRef.current.scrollLeft)
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return

      e.preventDefault()
      const x = e.pageX - containerRef.current.offsetLeft
      const walk = (x - startX) * 2 // Scroll speed
      containerRef.current.scrollLeft = scrollLeft - walk
    },
    [isDragging, startX, scrollLeft],
  )

  return {
    containerRef,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
    isDragging,
  }
}
