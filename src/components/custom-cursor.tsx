import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Dot: raw motion values — zero-lag, no React re-render
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  // Ring: smooth spring trailing the dot
  const springConfig = { damping: 28, stiffness: 180, mass: 0.6 }
  const ringX = useSpring(dotX, springConfig)
  const ringY = useSpring(dotY, springConfig)

  useEffect(() => {
    setIsMounted(true)

    // No custom cursor on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)
      setIsVisible(true)

      const target = e.target as HTMLElement
      const clickable = target.closest(
        'a, button, input, select, textarea, [role="button"], label, .cursor-pointer'
      ) !== null
      setIsHovering(clickable)
    }

    const onDown  = () => setIsClicked(true)
    const onUp    = () => setIsClicked(false)
    const onLeave = () => setIsVisible(false)
    const onEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    document.body.style.cursor = 'none'

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.body.style.cursor = 'auto'
    }
  }, [dotX, dotY])

  if (!isMounted) return null

  return (
    <>
      {/* Dot — instant, zero lag */}
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full"
        style={{
          width: 8,
          height: 8,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: '#22c55e',
          willChange: 'transform',
        }}
        animate={{
          scale: isVisible ? (isHovering ? 0 : isClicked ? 0.4 : 1) : 0,
          opacity: isVisible ? (isHovering ? 0 : 1) : 0,
        }}
        transition={{ duration: 0.12 }}
      />

      {/* Ring — smooth spring trail */}
      <motion.div
        className="fixed pointer-events-none z-[9998] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          border: '1.5px solid rgba(34, 197, 94, 0.55)',
          willChange: 'transform',
        }}
        animate={{
          width:  isVisible ? (isHovering ? 44 : isClicked ? 22 : 32) : 0,
          height: isVisible ? (isHovering ? 44 : isClicked ? 22 : 32) : 0,
          opacity: isVisible ? 1 : 0,
          backgroundColor: isHovering
            ? 'rgba(34, 197, 94, 0.08)'
            : 'transparent',
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{ duration: 0.18 }}
      >
        {/* Inner dot on hover */}
        {isHovering && isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
