import React from 'react'
import { Link } from 'react-router-dom'
import { Video, Home, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui'

export function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-accent-muted text-accent flex items-center justify-center mb-6 shadow-sm">
        <Video className="w-8 h-8" />
      </div>

      <h1 className="text-large-title font-bold text-label mb-2">404</h1>
      <h2 className="text-title-2 font-semibold text-label mb-3">Room or page not found</h2>
      <p className="text-body text-label-secondary max-w-md mb-8">
        The meeting URL might be expired, mistyped, or the host may have ended the room.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="secondary" leftIcon={ArrowLeft}>
            Go to Landing
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={Home}>
            My Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
