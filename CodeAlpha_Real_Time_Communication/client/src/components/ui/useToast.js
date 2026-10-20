import { create } from 'zustand'

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info' | 'loading'
      message: toast.message,
      description: toast.description,
      duration: toast.duration !== undefined ? toast.duration : 4000,
    }

    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, 4), // max 4 stacked
    }))

    if (newToast.duration > 0 && newToast.type !== 'loading') {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }

    return id
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

export const toast = {
  success: (message, options = {}) =>
    useToastStore.getState().addToast({ message, type: 'success', ...options }),
  error: (message, options = {}) =>
    useToastStore.getState().addToast({ message, type: 'error', ...options }),
  info: (message, options = {}) =>
    useToastStore.getState().addToast({ message, type: 'info', ...options }),
  warning: (message, options = {}) =>
    useToastStore.getState().addToast({ message, type: 'warning', ...options }),
  loading: (message, options = {}) =>
    useToastStore.getState().addToast({ message, type: 'loading', duration: 0, ...options }),
  dismiss: (id) => useToastStore.getState().dismissToast(id),
}

export function useToast() {
  return toast
}
