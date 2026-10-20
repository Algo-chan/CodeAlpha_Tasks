import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react'
import { useToastStore } from './useToast'

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  if (typeof document === 'undefined') return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-system-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-system-destructive shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-system-warning shrink-0" />,
    info: <Info className="w-5 h-5 text-accent shrink-0" />,
    loading: <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />,
  }

  return createPortal(
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto w-full glass-toolbar rounded-pill py-2.5 px-4 flex items-center justify-between gap-3 shadow-floating border border-separator/40"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {icons[t.type]}
              <div className="flex flex-col truncate">
                <span className="text-subheadline font-medium text-label truncate">
                  {t.message}
                </span>
                {t.description && (
                  <span className="text-caption-1 text-label-secondary truncate">
                    {t.description}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-label-secondary hover:text-label p-1 rounded-full hover:bg-surface-elevated transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
