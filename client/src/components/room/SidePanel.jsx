import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, FolderOpen, Users } from 'lucide-react'
import { SegmentedControl, Button } from '../ui'
import { ChatPanel } from './ChatPanel'
import { FilesPanel } from './FilesPanel'
import { ParticipantsPanel } from './ParticipantsPanel'
import { useRoomStore } from '../../store/room.store'

export function SidePanel({ socket, roomId }) {
  const { activeSideTab, setActiveSideTab, unreadMessagesCount } = useRoomStore()

  if (!activeSideTab) return null

  const tabs = [
    { value: 'chat', label: 'Chat', icon: MessageSquare },
    { value: 'files', label: 'Files', icon: FolderOpen },
    { value: 'people', label: 'People', icon: Users },
  ]

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Room details, chat, and files drawer"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="w-full sm:w-96 h-full liquid-glass-dense border-l border-separator/40 shadow-2xl flex flex-col z-30 shrink-0 select-none"
      >
        {/* Header with Segmented Tabs & Close button */}
        <div className="p-3.5 border-b border-separator/30 flex items-center justify-between gap-2.5">
          <SegmentedControl
            options={tabs}
            value={activeSideTab}
            onChange={setActiveSideTab}
            size="sm"
            className="flex-1"
          />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setActiveSideTab(null)}
            aria-label="Close sidebar panel"
            className="text-label-secondary hover:text-label shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-hidden">
          {activeSideTab === 'chat' && <ChatPanel socket={socket} />}
          {activeSideTab === 'files' && <FilesPanel roomId={roomId} />}
          {activeSideTab === 'people' && <ParticipantsPanel socket={socket} />}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
