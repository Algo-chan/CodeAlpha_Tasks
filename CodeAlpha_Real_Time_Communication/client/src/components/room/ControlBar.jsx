import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Palette,
  MessageSquare,
  Users,
  FolderOpen,
  Hand,
  PhoneOff,
} from 'lucide-react'
import { Button, Tooltip, Modal } from '../ui'
import { useRoomStore } from '../../store/room.store'
import { useMediaStore } from '../../store/media.store'

export function ControlBar({
  onToggleScreenShare,
  onLeaveRoom,
  socket,
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const hideTimerRef = useRef(null)

  const {
    isSharingScreen,
    isWhiteboardOpen,
    setIsWhiteboardOpen,
    activeSideTab,
    toggleSideTab,
    unreadMessagesCount,
    peers,
  } = useRoomStore()

  const {
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = useMediaStore()

  const participantCount = Object.keys(peers).length + 1

  // Auto-hide toolbar on inactivity (3.5s)
  const resetHideTimer = () => {
    setIsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      // Don't hide if leave modal is open
      if (!isLeaveModalOpen) {
        setIsVisible(false)
      }
    }, 3500)
  }

  useEffect(() => {
    window.addEventListener('mousemove', resetHideTimer)
    window.addEventListener('touchstart', resetHideTimer)
    resetHideTimer()

    return () => {
      window.removeEventListener('mousemove', resetHideTimer)
      window.removeEventListener('touchstart', resetHideTimer)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [isLeaveModalOpen])

  // Global Keyboard Shortcuts (M, V, S, W, C)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      const key = e.key.toLowerCase()
      if (key === 'm') {
        e.preventDefault()
        toggleAudio()
      } else if (key === 'v') {
        e.preventDefault()
        toggleVideo()
      } else if (key === 's') {
        e.preventDefault()
        onToggleScreenShare()
      } else if (key === 'w') {
        e.preventDefault()
        setIsWhiteboardOpen(!isWhiteboardOpen)
      } else if (key === 'c') {
        e.preventDefault()
        toggleSideTab('chat')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleAudio, toggleVideo, onToggleScreenShare, isWhiteboardOpen, setIsWhiteboardOpen, toggleSideTab])

  // Emit media state updates to peers
  useEffect(() => {
    if (socket) {
      socket.emit('media-state-changed', {
        isAudioEnabled,
        isVideoEnabled,
      })
    }
  }, [isAudioEnabled, isVideoEnabled, socket])

  const handleToggleHand = () => {
    const nextState = !isHandRaised
    setIsHandRaised(nextState)
    if (socket) {
      socket.emit('hand-raise-changed', { isHandRaised: nextState })
    }
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            aria-label="Meeting Controls"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            {/* Apple Floating Island Capsule */}
            <div className="liquid-glass-dense rounded-full p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 shadow-floating">
              {/* Mic Toggle with Voice Indicator */}
              <Tooltip content={isAudioEnabled ? 'Mute Mic (M)' : 'Unmute Mic (M)'}>
                <Button
                  variant={isAudioEnabled ? 'secondary' : 'destructive'}
                  size="icon"
                  onClick={toggleAudio}
                  aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  className="rounded-full shadow-sm"
                >
                  {isAudioEnabled ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
                </Button>
              </Tooltip>

              {/* Camera Toggle */}
              <Tooltip content={isVideoEnabled ? 'Stop Video (V)' : 'Start Video (V)'}>
                <Button
                  variant={isVideoEnabled ? 'secondary' : 'destructive'}
                  size="icon"
                  onClick={toggleVideo}
                  aria-label={isVideoEnabled ? 'Stop video camera' : 'Start video camera'}
                  className="rounded-full shadow-sm"
                >
                  {isVideoEnabled ? <VideoIcon className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
                </Button>
              </Tooltip>

              <div className="h-5 w-px bg-separator/50 mx-0.5" />

              {/* Screen Share */}
              <Tooltip content={isSharingScreen ? 'Stop Sharing (S)' : 'Share Screen (S)'}>
                <Button
                  variant={isSharingScreen ? 'primary' : 'ghost'}
                  size="icon"
                  onClick={onToggleScreenShare}
                  aria-label="Share screen"
                  className="rounded-full"
                >
                  <MonitorUp className="w-4.5 h-4.5" />
                </Button>
              </Tooltip>

              {/* Whiteboard */}
              <Tooltip content={isWhiteboardOpen ? 'Close Whiteboard (W)' : 'Open Whiteboard (W)'}>
                <Button
                  variant={isWhiteboardOpen ? 'tinted' : 'ghost'}
                  size="icon"
                  onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                  aria-label="Whiteboard canvas"
                  className="rounded-full"
                >
                  <Palette className="w-4.5 h-4.5" />
                </Button>
              </Tooltip>

              <div className="h-5 w-px bg-separator/50 mx-0.5" />

              {/* Chat with Unread Badge */}
              <Tooltip content="Chat (C)">
                <div className="relative">
                  <Button
                    variant={activeSideTab === 'chat' ? 'tinted' : 'ghost'}
                    size="icon"
                    onClick={() => toggleSideTab('chat')}
                    aria-label="Toggle chat"
                    className="rounded-full"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                  </Button>
                  {unreadMessagesCount > 0 && activeSideTab !== 'chat' && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </div>
              </Tooltip>

              {/* Files */}
              <Tooltip content="Shared Files">
                <Button
                  variant={activeSideTab === 'files' ? 'tinted' : 'ghost'}
                  size="icon"
                  onClick={() => toggleSideTab('files')}
                  aria-label="Shared files"
                  className="rounded-full"
                >
                  <FolderOpen className="w-4.5 h-4.5" />
                </Button>
              </Tooltip>

              {/* Participants */}
              <Tooltip content={`Participants (${participantCount})`}>
                <Button
                  variant={activeSideTab === 'people' ? 'tinted' : 'ghost'}
                  size="icon"
                  onClick={() => toggleSideTab('people')}
                  aria-label="Participants list"
                  className="rounded-full"
                >
                  <Users className="w-4.5 h-4.5" />
                </Button>
              </Tooltip>

              {/* Raise Hand */}
              <Tooltip content={isHandRaised ? 'Lower Hand' : 'Raise Hand'}>
                <Button
                  variant={isHandRaised ? 'primary' : 'ghost'}
                  size="icon"
                  onClick={handleToggleHand}
                  aria-label="Raise hand"
                  className={`rounded-full ${isHandRaised ? 'bg-amber-500 hover:bg-amber-600 shadow-md' : ''}`}
                >
                  <Hand className="w-4.5 h-4.5" />
                </Button>
              </Tooltip>

              <div className="h-5 w-px bg-separator/50 mx-0.5" />

              {/* Leave Call Button */}
              <Button
                variant="destructive"
                size="md"
                leftIcon={PhoneOff}
                onClick={() => setIsLeaveModalOpen(true)}
                className="rounded-pill px-4"
              >
                End
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Leave Conference?"
        description="Are you sure you want to exit the current meeting session?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLeaveModalOpen(false)}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLeaveModalOpen(false)
                onLeaveRoom()
              }}
            >
              Leave Call
            </Button>
          </>
        }
      />
    </>
  )
}
