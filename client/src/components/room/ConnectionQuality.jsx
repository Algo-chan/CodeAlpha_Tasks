import React from 'react'

export function ConnectionQuality({ quality = 'good', className = '' }) {
  const getQualityDetails = () => {
    switch (quality) {
      case 'poor':
        return {
          color: 'bg-system-destructive',
          bars: 1,
          label: 'Poor connection (high packet loss)',
        }
      case 'fair':
        return {
          color: 'bg-system-warning',
          bars: 2,
          label: 'Fair connection',
        }
      case 'good':
      default:
        return {
          color: 'bg-system-success',
          bars: 3,
          label: 'Strong connection',
        }
    }
  }

  const { color, bars, label } = getQualityDetails()

  return (
    <div
      className={`inline-flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm ${className}`}
      title={label}
    >
      <span className={`w-0.5 h-1.5 rounded-full ${bars >= 1 ? color : 'bg-white/20'}`} />
      <span className={`w-0.5 h-2 rounded-full ${bars >= 2 ? color : 'bg-white/20'}`} />
      <span className={`w-0.5 h-2.5 rounded-full ${bars >= 3 ? color : 'bg-white/20'}`} />
    </div>
  )
}
