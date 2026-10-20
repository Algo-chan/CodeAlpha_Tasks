import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  // Apple HIG: Standard touch targets minimum 28x28 desktop, 44x44 mobile
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-pill transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none select-none active:scale-[0.97]'

  const sizeClasses = {
    sm: 'text-footnote px-3 py-1.5 gap-1.5 h-8 min-w-[32px]',
    md: 'text-subheadline px-4 py-2 gap-2 h-10 min-w-[40px]',
    lg: 'text-headline px-6 py-2.5 gap-2.5 h-12 min-w-[48px]',
    icon: 'p-2.5 h-10 w-10 justify-center shrink-0',
    'icon-sm': 'p-1.5 h-8 w-8 justify-center shrink-0',
    'icon-lg': 'p-3 h-12 w-12 justify-center shrink-0',
  }

  const variantClasses = {
    // Prominent primary action with specular rim lighting (HIG Prominent Button)
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/25 active:bg-accent-hover shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.38)]',
    
    // Standard secondary material button
    secondary: 'bg-surface-elevated text-label border border-separator/40 hover:bg-system-gray5/50 active:bg-system-gray4/60 shadow-sm shadow-black/[0.03]',
    
    // Tinted button
    tinted: 'bg-accent-muted text-accent hover:bg-accent/[0.18] active:bg-accent/[0.24]',
    
    // Destructive semantic action
    destructive: 'bg-system-destructive text-white hover:opacity-90 active:opacity-100 shadow-sm shadow-system-destructive/25 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.35)]',
    'destructive-tinted': 'bg-system-destructive-muted text-system-destructive hover:bg-system-destructive/20 active:bg-system-destructive/25',
    
    // Ghost action
    ghost: 'bg-transparent text-label hover:bg-surface-elevated active:bg-system-gray5/50',
    
    // Liquid Glass functional button (for toolbars and floating controllers)
    glass: 'liquid-glass text-label hover:bg-surface-elevated/80 active:bg-surface-elevated',
    'glass-clear': 'liquid-glass-clear text-white hover:bg-white/20 active:bg-white/25',
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 450, damping: 26 }}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
          {children && <span>{children}</span>}
          {RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'
