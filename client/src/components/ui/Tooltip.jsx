import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 0.2,
}) {
  const [isVisible, setIsVisible] = useState(false)
  let timeoutId

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay * 1000)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutId)
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none px-2.5 py-1 text-caption-1 font-medium text-white bg-black/85 dark:bg-white/90 dark:text-black rounded-pill whitespace-nowrap shadow-md backdrop-blur-md`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
