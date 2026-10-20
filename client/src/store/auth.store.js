import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('collabroom_user') || 'null'),
  accessToken: localStorage.getItem('collabroom_access_token') || null,
  guestName: localStorage.getItem('collabroom_guest_name') || '',
  isAuthenticated: Boolean(localStorage.getItem('collabroom_access_token')),
  isLoading: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('collabroom_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('collabroom_user')
    }
    set({ user, isAuthenticated: Boolean(user && get().accessToken) })
  },

  setAccessToken: (accessToken) => {
    if (accessToken) {
      localStorage.setItem('collabroom_access_token', accessToken)
    } else {
      localStorage.removeItem('collabroom_access_token')
    }
    set({ accessToken, isAuthenticated: Boolean(accessToken && get().user) })
  },

  setGuestName: (guestName) => {
    if (guestName) {
      localStorage.setItem('collabroom_guest_name', guestName)
    } else {
      localStorage.removeItem('collabroom_guest_name')
    }
    set({ guestName })
  },

  setAuth: (user, accessToken) => {
    localStorage.setItem('collabroom_user', JSON.stringify(user))
    localStorage.setItem('collabroom_access_token', accessToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('collabroom_user')
    localStorage.removeItem('collabroom_access_token')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
}))
