import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Settings,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Button, Input, Avatar, useToast } from '../components/ui'
import { useMediaDevices } from '../hooks/useMediaDevices'
import { useMediaStore } from '../store/media.store'
import { useAuthStore } from '../store/auth.store'
import api from '../lib/api'

export function PreJoin() {
  const { id: shortId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { user, isAuthenticated } = useAuthStore()
  const {
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    setSelectedVideoDeviceId,
    setSelectedAudioDeviceId,
  } = useMediaStore()

  const {
    videoDevices,
    audioInputDevices,
    permissionError,
    localStream,
    isLoading: isMediaLoading,
  } = useMediaDevices()

  const videoRef = useRef(null)

  const [room, setRoom] = useState(null)
  const [displayName, setDisplayName] = useState(user?.name || localStorage.getItem('collabroom_guest_name') || '')
  const [password, setPassword] = useState('')
  const [isLoadingRoom, setIsLoadingRoom] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Bind local stream to video preview element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream, isVideoEnabled])

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoadingRoom(true)
        setErrorMsg('')
        const { data } = await api.get(`/rooms/${shortId}`)
        setRoom(data.room)
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/not-found', { replace: true })
        } else {
          setErrorMsg(err.response?.data?.error || 'Unable to load room details')
        }
      } finally {
        setIsLoadingRoom(false)
      }
    }
    fetchRoom()
  }, [shortId, navigate])

  const handleJoin = async (e) => {
    e.preventDefault()

    const name = displayName.trim()
    if (!name) {
      toast.error('Please enter your name to join')
      return
    }

    if (!user) {
      localStorage.setItem('collabroom_guest_name', name)
    }

    try {
      setIsJoining(true)
      const { data } = await api.post(`/rooms/${shortId}/join`, {
        password: password.trim() || undefined,
        guestName: name,
      })

      // Successfully authenticated into room with join token
      navigate(`/room/${shortId}`, {
        state: {
          joinToken: data.joinToken,
          room: data.room,
          participant: data.participant,
        },
      })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to join room'
      toast.error(msg)
      setErrorMsg(msg)
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoadingRoom) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-footnote text-label-secondary">Checking room status...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-accent/20 selection:text-accent">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Camera Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-card bg-neutral-900 border border-separator/40 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Live Video */}
              {isVideoEnabled && localStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Avatar name={displayName || 'User'} size="2xl" />
                  <p className="text-footnote text-white/70">Camera is turned off</p>
                </div>
              )}

              {/* Permission Alert Overlay */}
              {permissionError && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-10 h-10 text-system-warning mb-2" />
                  <p className="text-subheadline text-white font-medium max-w-xs mb-3">
                    {permissionError}
                  </p>
                  <p className="text-caption-1 text-white/70">
                    You can still join with audio or as an attendee.
                  </p>
                </div>
              )}

              {/* In-Preview Floating Quick Toggles (Apple Clear Liquid Glass) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <Button
                  variant={isAudioEnabled ? 'glass' : 'destructive'}
                  size="icon"
                  onClick={toggleAudio}
                  aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  className="shadow-md text-white"
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                <Button
                  variant={isVideoEnabled ? 'glass' : 'destructive'}
                  size="icon"
                  onClick={toggleVideo}
                  aria-label={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
                  className="shadow-md text-white"
                >
                  {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Device Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
              <div className="p-3 rounded-2xl bg-surface-elevated border border-separator/30 flex items-center gap-2.5 shadow-xs">
                <VideoIcon className="w-4 h-4 text-label-secondary shrink-0" />
                <select
                  value={selectedVideoDeviceId}
                  onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
                  className="w-full bg-transparent text-footnote text-label focus:outline-none cursor-pointer truncate"
                  disabled={videoDevices.length === 0}
                >
                  {videoDevices.length > 0 ? (
                    videoDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId} className="bg-surface text-label">
                        {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                      </option>
                    ))
                  ) : (
                    <option className="bg-surface text-label">Default Camera</option>
                  )}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-surface-elevated border border-separator/30 flex items-center gap-2.5 shadow-xs">
                <Mic className="w-4 h-4 text-label-secondary shrink-0" />
                <select
                  value={selectedAudioDeviceId}
                  onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
                  className="w-full bg-transparent text-footnote text-label focus:outline-none cursor-pointer truncate"
                  disabled={audioInputDevices.length === 0}
                >
                  {audioInputDevices.length > 0 ? (
                    audioInputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId} className="bg-surface text-label">
                        {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                      </option>
                    ))
                  ) : (
                    <option className="bg-surface text-label">Default Microphone</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Room Details & Form (Content Layer Standard Material) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="apple-card p-6 sm:p-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-accent-muted text-accent text-caption-1 font-semibold mb-2.5 border border-accent/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ready to join</span>
                </div>
                <h1 className="text-title-1 font-bold text-label" style={{ letterSpacing: '-0.021em' }}>
                  {room?.name}
                </h1>
                <p className="text-footnote text-label-secondary mt-1">
                  Room Code: <span className="font-mono text-label font-medium bg-surface-secondary px-1.5 py-0.5 rounded border border-separator/30">{shortId}</span>
                </p>
              </div>

              <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <Input
                  label="Your Display Name"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />

                {room?.hasPassword && (
                  <Input
                    label="Room Password"
                    type="password"
                    leftIcon={Lock}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}

                {errorMsg && (
                  <p className="text-footnote text-system-destructive">{errorMsg}</p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  rightIcon={ArrowRight}
                  disabled={isJoining}
                  className="mt-2 w-full shadow-lg shadow-accent/25"
                >
                  {isJoining ? 'Connecting...' : 'Join Meeting'}
                </Button>
              </form>

              {!isAuthenticated && (
                <div className="mt-5 pt-4 border-t border-separator/30 text-center text-caption-1 text-label-secondary">
                  <span>Want to host and record meetings? </span>
                  <Link to="/auth?mode=signup" className="text-accent font-medium hover:underline">
                    Create an account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
