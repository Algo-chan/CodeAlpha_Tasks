import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoTile } from './VideoTile'
import { useRoomStore } from '../../store/room.store'
import { useMediaStore } from '../../store/media.store'

export function VideoGrid({ screenStream }) {
  const {
    peers,
    self,
    activeSpeakerId,
    pinnedPeerId,
    setPinnedPeerId,
    isSharingScreen,
    isWhiteboardOpen,
  } = useRoomStore()

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
  } = useMediaStore()

  const peerList = Object.values(peers)
  const totalCount = peerList.length + 1 // including self

  // Check if someone is pinned or presenting screen
  const isSpotlight = Boolean(pinnedPeerId || isSharingScreen || peerList.some((p) => p.isSharingScreen))

  // Determine which participant is the spotlight
  const spotlightPeer = isSharingScreen
    ? { isSelfScreen: true }
    : pinnedPeerId
    ? pinnedPeerId === 'self'
      ? { isSelf: true }
      : peers[pinnedPeerId]
    : peerList.find((p) => p.isSharingScreen) || null

  // If Whiteboard is open: show floating horizontal thumbnail strip at bottom
  if (isWhiteboardOpen) {
    return (
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-card glass-toolbar max-w-full overflow-x-auto shadow-floating">
        {/* Self Tile */}
        <div className="w-36 h-24 shrink-0">
          <VideoTile
            participant={self}
            isSelf
            stream={localStream}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isActiveSpeaker={activeSpeakerId === 'self'}
          />
        </div>

        {/* Remote Peer Tiles */}
        {peerList.map((peer) => (
          <div key={peer.socketId} className="w-36 h-24 shrink-0">
            <VideoTile
              participant={peer}
              stream={peer.stream}
              isAudioEnabled={peer.isAudioEnabled}
              isVideoEnabled={peer.isVideoEnabled}
              isSharingScreen={peer.isSharingScreen}
              isHandRaised={peer.isHandRaised}
              isActiveSpeaker={activeSpeakerId === peer.socketId}
            />
          </div>
        ))}
      </div>
    )
  }

  // Spotlight Layout
  if (isSpotlight && spotlightPeer) {
    const isSelfSpotlight = spotlightPeer.isSelf || spotlightPeer.isSelfScreen
    const otherPeers = peerList.filter((p) => p.socketId !== pinnedPeerId && !p.isSharingScreen)

    return (
      <div className="w-full h-full p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Large Spotlight Area */}
        <div className="lg:col-span-9 h-full min-h-[300px]">
          {isSelfSpotlight ? (
            <VideoTile
              participant={self}
              isSelf
              stream={spotlightPeer.isSelfScreen ? screenStream : localStream}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={spotlightPeer.isSelfScreen ? true : isVideoEnabled}
              isSharingScreen={spotlightPeer.isSelfScreen}
              isPinned={pinnedPeerId === 'self'}
              onTogglePin={() => setPinnedPeerId(pinnedPeerId === 'self' ? null : 'self')}
            />
          ) : (
            <VideoTile
              participant={spotlightPeer}
              stream={spotlightPeer.stream}
              isAudioEnabled={spotlightPeer.isAudioEnabled}
              isVideoEnabled={spotlightPeer.isVideoEnabled}
              isSharingScreen={spotlightPeer.isSharingScreen}
              isHandRaised={spotlightPeer.isHandRaised}
              isActiveSpeaker={activeSpeakerId === spotlightPeer.socketId}
              isPinned={pinnedPeerId === spotlightPeer.socketId}
              onTogglePin={() =>
                setPinnedPeerId(
                  pinnedPeerId === spotlightPeer.socketId ? null : spotlightPeer.socketId
                )
              }
            />
          )}
        </div>

        {/* Sidebar strip for other participants */}
        <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-auto max-h-full">
          {!isSelfSpotlight && (
            <div className="w-48 lg:w-full aspect-video shrink-0">
              <VideoTile
                participant={self}
                isSelf
                stream={localStream}
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                isActiveSpeaker={activeSpeakerId === 'self'}
                isPinned={pinnedPeerId === 'self'}
                onTogglePin={() => setPinnedPeerId('self')}
              />
            </div>
          )}

          {otherPeers.map((peer) => (
            <div key={peer.socketId} className="w-48 lg:w-full aspect-video shrink-0">
              <VideoTile
                participant={peer}
                stream={peer.stream}
                isAudioEnabled={peer.isAudioEnabled}
                isVideoEnabled={peer.isVideoEnabled}
                isSharingScreen={peer.isSharingScreen}
                isHandRaised={peer.isHandRaised}
                isActiveSpeaker={activeSpeakerId === peer.socketId}
                isPinned={pinnedPeerId === peer.socketId}
                onTogglePin={() => setPinnedPeerId(peer.socketId)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Dynamic Grid Layout (1 to 12 participants)
  const getGridClasses = () => {
    if (totalCount === 1) return 'grid-cols-1 grid-rows-1 max-w-4xl max-h-[80vh]'
    if (totalCount === 2) return 'grid-cols-1 sm:grid-cols-2 grid-rows-1'
    if (totalCount <= 4) return 'grid-cols-1 sm:grid-cols-2 grid-rows-2'
    if (totalCount <= 6) return 'grid-cols-2 sm:grid-cols-3 grid-rows-2'
    if (totalCount <= 9) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3'
    return 'grid-cols-3 sm:grid-cols-4'
  }

  return (
    <div className="w-full h-full p-3 sm:p-5 flex items-center justify-center overflow-hidden">
      <div className={`grid w-full h-full gap-3 sm:gap-4 ${getGridClasses()}`}>
        {/* Self Tile */}
        <AnimatePresence>
          <motion.div
            layout
            key="self-tile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-full h-full min-h-[160px]"
          >
            <VideoTile
              participant={self}
              isSelf
              stream={localStream}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              isSharingScreen={isSharingScreen}
              isActiveSpeaker={activeSpeakerId === 'self'}
              isPinned={pinnedPeerId === 'self'}
              onTogglePin={() => setPinnedPeerId('self')}
            />
          </motion.div>

          {/* Remote Peer Tiles */}
          {peerList.map((peer) => (
            <motion.div
              layout
              key={peer.socketId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full h-full min-h-[160px]"
            >
              <VideoTile
                participant={peer}
                stream={peer.stream}
                isAudioEnabled={peer.isAudioEnabled}
                isVideoEnabled={peer.isVideoEnabled}
                isSharingScreen={peer.isSharingScreen}
                isHandRaised={peer.isHandRaised}
                isActiveSpeaker={activeSpeakerId === peer.socketId}
                isPinned={pinnedPeerId === peer.socketId}
                onTogglePin={() => setPinnedPeerId(peer.socketId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
