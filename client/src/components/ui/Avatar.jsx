import React from 'react'

export function Avatar({
  name = 'Guest',
  src,
  size = 'md',
  isOnline,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-caption-1',
    md: 'w-9 h-9 text-footnote',
    lg: 'w-12 h-12 text-headline',
    xl: 'w-16 h-16 text-title-2',
    '2xl': 'w-24 h-24 text-large-title',
  }

  const indicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  }

  // Generate deterministic gentle background color based on name
  const getInitials = (n) => {
    if (!n) return '?'
    const parts = n.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const getBgColor = (n) => {
    const colors = [
      'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    ]
    let hash = 0
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover ring-1 ring-separator/20`}
        />
      ) : (
        <div
          className={`${sizeClasses[size] || sizeClasses.md} ${getBgColor(
            name
          )} rounded-full flex items-center justify-center font-semibold select-none ring-1 ring-separator/10`}
        >
          {getInitials(name)}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSizes[size] || indicatorSizes.md} rounded-full ring-2 ring-surface ${
            isOnline ? 'bg-system-success' : 'bg-system-gray2'
          }`}
        />
      )}
    </div>
  )
}
