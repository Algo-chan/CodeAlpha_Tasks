import React from 'react'

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  valueDisplay,
  className = '',
  disabled = false,
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {(label || valueDisplay) && (
        <div className="flex justify-between items-center text-footnote text-label-secondary font-medium">
          {label && <span>{label}</span>}
          {valueDisplay && <span className="text-label">{valueDisplay}</span>}
        </div>
      )}
      <div className="relative flex items-center h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percentage}%, var(--color-gray-4) ${percentage}%, var(--color-gray-4) 100%)`,
          }}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-separator/20"
        />
      </div>
    </div>
  )
}
