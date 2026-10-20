import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pen,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle,
  ArrowRight,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Palette as PaletteIcon,
} from 'lucide-react'
import { Button, Tooltip, Slider, Modal } from '../ui'

export function WhiteboardToolbar({
  activeTool,
  setActiveTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo,
  canRedo,
}) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)

  const tools = [
    { id: 'pen', label: 'Pen', icon: Pen },
    { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
    { id: 'eraser', label: 'Eraser', icon: Eraser },
    { id: 'line', label: 'Line', icon: Minus },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'ellipse', label: 'Circle', icon: Circle },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
    { id: 'text', label: 'Text', icon: Type },
  ]

  const swatches = [
    '#000000',
    '#007AFF', // Apple Blue
    '#34C759', // Apple Green
    '#FF9500', // Apple Orange
    '#FF3B30', // Apple Red
    '#AF52DE', // Apple Purple
    '#5856D6', // Apple Indigo
    '#8E8E93', // Apple Gray
    '#FFFFFF', // White
  ]

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 select-none">
        <div className="liquid-glass rounded-pill p-1.5 sm:p-2 flex items-center gap-1 sm:gap-1.5 shadow-2xl">
          {/* Tool Buttons with Spring Layout Pill */}
          <div className="flex items-center gap-1">
            {tools.map((t) => {
              const Icon = t.icon
              const isSelected = activeTool === t.id
              return (
                <Tooltip key={t.id} content={t.label}>
                  <button
                    onClick={() => setActiveTool(t.id)}
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'text-white' : 'text-label-secondary hover:text-label hover:bg-surface-secondary'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeToolPill"
                        className="absolute inset-0 bg-accent rounded-full shadow-xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">
                      <Icon className="w-4 h-4" />
                    </span>
                  </button>
                </Tooltip>
              )
            })}
          </div>

          <div className="h-5 w-px bg-separator/50 mx-1" />

          {/* Color Well & Popover Trigger */}
          <div className="relative">
            <Tooltip content="Color & Stroke Width">
              <button
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="w-8 h-8 rounded-full border-2 border-white/60 dark:border-white/20 flex items-center justify-center shadow-xs transition-transform active:scale-95"
                style={{ backgroundColor: color }}
              >
                {color === '#FFFFFF' && <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />}
              </button>
            </Tooltip>

            {/* Apple Pencil / Freeform Color Popover */}
            <AnimatePresence>
              {isColorPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute top-full mt-3 left-1/2 -translate-x-1/2 liquid-glass-dense p-4 rounded-card w-60 shadow-2xl z-50"
                >
                  <p className="text-caption-1 font-semibold text-label-secondary mb-2.5">
                    Color Palette
                  </p>
                  <div className="grid grid-cols-5 gap-2.5 mb-4">
                    {swatches.map((swatch) => (
                      <button
                        key={swatch}
                        onClick={() => {
                          setColor(swatch)
                          setIsColorPickerOpen(false)
                        }}
                        className={`w-7 h-7 rounded-full border transition-transform hover:scale-110 shadow-xs ${
                          color === swatch
                            ? 'ring-2 ring-accent ring-offset-2 scale-105'
                            : 'border-separator/40'
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>

                  <div className="pt-3 border-t border-separator/30">
                    <Slider
                      label="Stroke Width"
                      valueDisplay={`${strokeWidth}px`}
                      min={1}
                      max={24}
                      step={1}
                      value={strokeWidth}
                      onChange={setStrokeWidth}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-5 w-px bg-separator/50 mx-1" />

          {/* Undo / Redo Actions */}
          <div className="flex items-center gap-0.5">
            <Tooltip content="Undo">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo canvas change"
                className="text-label-secondary hover:text-label"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Redo">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo canvas change"
                className="text-label-secondary hover:text-label"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>

          <div className="h-5 w-px bg-separator/50 mx-1" />

          {/* Clear & Export PNG */}
          <div className="flex items-center gap-0.5">
            <Tooltip content="Export PNG">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onExport}
                aria-label="Export canvas as image"
                className="text-label-secondary hover:text-label"
              >
                <Download className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Clear Canvas">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsClearModalOpen(true)}
                aria-label="Clear whiteboard"
                className="text-system-destructive hover:bg-system-destructive-muted"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Whiteboard?"
        description="This will clear all shapes, strokes, and text for every participant in the room. This action cannot be undone."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsClearModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClear()
                setIsClearModalOpen(false)
              }}
            >
              Clear for Everyone
            </Button>
          </div>
        }
      />
    </>
  )
}
