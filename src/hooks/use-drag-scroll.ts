import { useRef, useState, useCallback, PointerEvent as ReactPointerEvent } from 'react'

export function useDragScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return // Let native touch scrolling happen seamlessly

    const target = e.target as HTMLElement
    const isInteractive =
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[role="menuitem"]') ||
      target.closest('[role="dialog"]') ||
      target.closest('.kanban-card') // Ignore kanban cards so they can be dragged

    if (isInteractive) return

    setIsDragging(true)
    if (containerRef.current) {
      setStartX(e.pageX - containerRef.current.offsetLeft)
      setScrollLeft(containerRef.current.scrollLeft)
      containerRef.current.setPointerCapture(e.pointerId)
    }
  }, [])

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    setIsDragging(false)
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return
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
      onPointerDown,
      onPointerUp,
      onPointerMove,
      onPointerCancel: onPointerUp,
    },
    isDragging,
  }
}
