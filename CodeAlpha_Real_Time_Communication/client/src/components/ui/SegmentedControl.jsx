import React from 'react'
import { motion } from 'framer-motion'

export function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'p-0.5 text-footnote',
    md: 'p-1 text-subheadline',
    lg: 'p-1.5 text-headline',
  }

  const itemSizeClasses = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  }

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-system-gray5/80 dark:bg-system-gray4/50 rounded-pill border border-separator/20 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={`relative rounded-pill font-medium transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${itemSizeClasses[size] || itemSizeClasses.md} ${
              isSelected ? 'text-label' : 'text-label-secondary hover:text-label'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-control-active"
                className="absolute inset-0 bg-surface-elevated rounded-pill shadow-[0_1px_4px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon && <option.icon className="w-3.5 h-3.5" />}
              <span>{option.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
