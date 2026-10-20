import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Video, LogIn, Sparkles, RefreshCw, Calendar, ArrowRight } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Button, Input, Modal, SkeletonCard, EmptyState, useToast } from '../components/ui'
import { RoomCard } from '../components/room/RoomCard'
import { useAuthStore } from '../store/auth.store'
import api from '../lib/api'

export function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()

  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [roomName, setRoomName] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const [joinIdInput, setJoinIdInput] = useState('')

  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/rooms')
      setRooms(data.rooms || [])
    } catch (err) {
      toast.error('Could not load recent rooms')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) {
      toast.error('Please enter a meeting name')
      return
    }

    try {
      setIsSubmitting(true)
      const { data } = await api.post('/rooms', {
        name: roomName,
        password: roomPassword.trim() || undefined,
      })

      toast.success('Room created!')
      setIsCreateModalOpen(false)
      setRoomName('')
      setRoomPassword('')
      navigate(`/join/${data.room.shortId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create room')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinById = (e) => {
    e.preventDefault()
    const cleanId = joinIdInput.trim().toLowerCase()
    if (!cleanId) return
    navigate(`/join/${cleanId}`)
  }

  const handleDeleteRoom = async (shortId) => {
    try {
      await api.delete(`/rooms/${shortId}`)
      setRooms((prev) => prev.filter((r) => r.shortId !== shortId))
      toast.success('Room deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete room')
    }
  }

  const todayDateString = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-accent/20 selection:text-accent">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Header Greeting & macOS Workspace Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-separator/30">
          <div>
            <div className="inline-flex items-center gap-1.5 text-footnote text-label-secondary mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>{todayDateString}</span>
            </div>
            <h1 className="text-large-title font-bold text-label" style={{ letterSpacing: '-0.022em' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Friend'}
            </h1>
            <p className="text-body text-label-secondary mt-1">
              Start an instant session, connect via room code, or manage your recent collaborations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              leftIcon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-lg shadow-accent/25"
            >
              New Meeting
            </Button>
          </div>
        </div>

        {/* Join With Room Code Bar (Content Layer Standard Material) */}
        <div className="my-8 apple-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-accent-muted text-accent flex items-center justify-center shrink-0 border border-accent/20 shadow-xs">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-headline font-semibold text-label">Join with Room Code</h3>
              <p className="text-caption-1 text-label-secondary">
                Have an invitation code? Enter it below to join the room instantly.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinById} className="flex items-center gap-2.5 w-full sm:w-auto">
            <Input
              placeholder="e.g. abc-defg-hij"
              value={joinIdInput}
              onChange={(e) => setJoinIdInput(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button type="submit" variant="secondary" disabled={!joinIdInput.trim()}>
              Join
            </Button>
          </form>
        </div>

        {/* Recent Rooms Grid */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title-2 font-bold text-label" style={{ letterSpacing: '-0.018em' }}>
                Recent Meetings
              </h2>
              <p className="text-caption-1 text-label-secondary mt-0.5">
                Past conferences and persistent collaboration spaces.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchRooms}
              className="text-label-secondary hover:text-label"
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <RoomCard
                  key={room.shortId}
                  room={room}
                  onDelete={handleDeleteRoom}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Video}
              title="No recent meetings"
              description="Create your first room to generate an instant link you can share with your team."
              actionLabel="Start a Meeting"
              onAction={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Start a New Meeting"
        description="Create an instant WebRTC conference with optional password protection."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create & Join'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
          <Input
            label="Meeting Name"
            placeholder="e.g. Design Review, Sprint Planning"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Room Password (Optional)"
            type="password"
            placeholder="Leave empty for public access"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  )
}
