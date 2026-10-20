import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { ToastProvider } from './components/ui'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

import { Landing } from './pages/Landing'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { PreJoin } from './pages/PreJoin'
import { Room } from './pages/Room'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface text-label selection:bg-accent/20 selection:text-accent font-sans">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/join/:id" element={<PreJoin />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastProvider />
      </div>
    </ThemeProvider>
  )
}

export default App
