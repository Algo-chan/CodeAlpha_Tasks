import React from 'react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto select-none ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-3xl bg-surface-elevated flex items-center justify-center text-label-secondary mb-4 border border-separator/40 shadow-xs">
          <Icon className="w-8 h-8 stroke-[1.75]" />
        </div>
      )}
      <h3 className="text-title-2 text-label font-bold mb-1" style={{ letterSpacing: '-0.018em' }}>
        {title}
      </h3>
      {description && (
        <p className="text-footnote text-label-secondary leading-relaxed mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="shadow-md shadow-accent/20">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
