import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ContextMenu({
  trigger,
  items = [],
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-52 glass-panel rounded-card bg-surface/95 shadow-floating border border-separator/40 py-1.5 z-50 overflow-hidden"
          >
            {items.map((item, index) => {
              if (item.separator) {
                return <div key={`sep-${index}`} className="my-1 border-t border-separator/30" />
              }
              const Icon = item.icon
              return (
                <button
                  key={item.label || index}
                  onClick={() => {
                    item.onClick && item.onClick()
                    setIsOpen(false)
                  }}
                  className={`w-full px-3.5 py-2 text-subheadline flex items-center justify-between text-left transition-colors select-none ${
                    item.destructive
                      ? 'text-system-destructive hover:bg-system-destructive-muted'
                      : 'text-label hover:bg-surface-elevated'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <span className="text-caption-1 text-label-tertiary">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
