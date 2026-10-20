import React from 'react'

export function Skeleton({
  className = '',
  variant = 'shimmer', // 'shimmer' | 'pulse'
}) {
  if (variant === 'shimmer') {
    return (
      <div
        className={`relative overflow-hidden bg-system-gray5/50 dark:bg-system-gray6/40 rounded-lg ${className}`}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
      </div>
    )
  }

  return (
    <div
      className={`animate-pulse bg-system-gray5/60 dark:bg-system-gray6/40 rounded-lg ${className}`}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="apple-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-pill" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48 rounded" />
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-separator/20">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-9 w-24 rounded-pill" />
      </div>
    </div>
  )
}
