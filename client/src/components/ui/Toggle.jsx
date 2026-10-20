import React from 'react'
import { motion } from 'framer-motion'

export function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  className = '',
}) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="relative inline-block">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-12 h-7 rounded-pill transition-colors duration-200 ease-in-out ${
            checked ? 'bg-system-success' : 'bg-system-gray4 dark:bg-system-gray3'
          }`}
        >
          <motion.div
            animate={{ x: checked ? 22 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-6 h-6 mt-0.5 rounded-full bg-white shadow-md"
          />
        </div>
      </div>
      {label && <span className="text-subheadline text-label font-medium">{label}</span>}
    </label>
  )
}
