import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Video, LogOut, User, Plus } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { Button, Avatar, ThemeToggle, ContextMenu } from '../ui'
import api from '../../lib/api'

export function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      logout()
      navigate('/auth')
    }
  }

  const userMenuItems = [
    {
      label: user?.name || 'Account',
      icon: User,
      onClick: () => navigate('/dashboard'),
    },
    { separator: true },
    {
      label: 'Sign out',
      icon: LogOut,
      destructive: true,
      onClick: handleLogout,
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full liquid-glass border-b border-separator/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center text-white shadow-sm shadow-accent/20 group-hover:scale-105 transition-transform duration-200 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.4)]">
            <Video className="w-4.5 h-4.5" />
          </div>
          <span className="text-title-2 font-bold tracking-tight text-label">
            Collab<span className="text-accent">Room</span>
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard">
                <Button variant="secondary" size="sm" leftIcon={Plus} className="hidden sm:inline-flex">
                  New Meeting
                </Button>
              </Link>
              <ContextMenu
                trigger={
                  <button className="flex items-center gap-2 p-1 rounded-pill hover:bg-surface-elevated/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <Avatar name={user.name} size="sm" isOnline />
                    <span className="text-subheadline font-medium text-label hidden md:inline">
                      {user.name}
                    </span>
                  </button>
                }
                items={userMenuItems}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
