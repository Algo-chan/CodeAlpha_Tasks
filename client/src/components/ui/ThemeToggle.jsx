import React from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '../../lib/theme'
import { SegmentedControl } from './SegmentedControl'

export function ThemeToggle({ size = 'sm', className = '' }) {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'Auto', icon: Laptop },
  ]

  return (
    <SegmentedControl
      size={size}
      options={options}
      value={theme}
      onChange={setTheme}
      className={className}
    />
  )
}
