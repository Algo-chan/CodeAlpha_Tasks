import React, { useState } from 'react'
import { motion } from 'framer-motion'

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = ' ',
  value,
  defaultValue,
  onChange,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  const isFilled = Boolean(value !== undefined ? value : defaultValue)

  return (
    <div className={`relative flex flex-col gap-1 w-full ${className}`}>
      <div
        className={`relative flex items-center w-full rounded-[14px] border transition-all duration-200 bg-surface-elevated/80 shadow-xs ${
          error
            ? 'border-system-destructive focus-within:ring-2 focus-within:ring-system-destructive/30'
            : isFocused
            ? 'border-accent ring-2 ring-accent/25 bg-surface'
            : 'border-separator/50 hover:border-separator'
        }`}
      >
        {LeftIcon && (
          <div className="pl-3.5 text-label-tertiary">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <div className="relative flex-1">
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ' '}
            required={required}
            className={`w-full bg-transparent px-3.5 pt-5 pb-2 text-subheadline text-label placeholder:text-label-tertiary focus:outline-none ${
              LeftIcon ? 'pl-2' : ''
            }`}
            {...props}
          />
          {label && (
            <motion.label
              htmlFor={inputId}
              animate={{
                y: isFocused || isFilled ? -8 : 6,
                scale: isFocused || isFilled ? 0.75 : 1,
                color: error
                  ? 'var(--color-destructive)'
                  : isFocused
                  ? 'var(--color-accent)'
                  : 'var(--color-label-secondary)',
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`absolute left-3.5 top-2 pointer-events-none origin-top-left font-normal select-none ${
                LeftIcon ? 'left-2' : ''
              }`}
            >
              {label}
              {required && <span className="text-system-destructive ml-0.5">*</span>}
            </motion.label>
          )}
        </div>

        {RightIcon && (
          <div className="pr-3.5 text-label-tertiary">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-footnote text-system-destructive px-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})
