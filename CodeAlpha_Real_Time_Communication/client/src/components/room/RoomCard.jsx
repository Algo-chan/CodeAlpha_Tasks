import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Video, Lock, MoreVertical, Copy, Trash2, ArrowRight, Check } from 'lucide-react'
import { Button, ContextMenu, useToast } from '../ui'

export function RoomCard({ room, onDelete }) {
  const toast = useToast()
  const [hasCopied, setHasCopied] = useState(false)

  const copyRoomLink = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    const url = `${window.location.origin}/join/${room.shortId}`
    navigator.clipboard.writeText(url)
    setHasCopied(true)
    toast.success('Room link copied to clipboard')
    setTimeout(() => setHasCopied(false), 2000)
  }

  const menuItems = [
    {
      label: 'Copy Invitation Link',
      icon: Copy,
      onClick: copyRoomLink,
    },
    { separator: true },
    {
      label: 'Delete Room',
      icon: Trash2,
      destructive: true,
      onClick: () => onDelete && onDelete(room.shortId),
    },
  ]

  const formattedDate = new Date(room.lastActivity || room.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="apple-card p-5 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-muted text-accent flex items-center justify-center shrink-0 border border-accent/20 shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-headline text-label font-semibold truncate max-w-[190px]">
                {room.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-caption-1 font-mono text-label-secondary bg-surface-secondary px-2 py-0.5 rounded-pill border border-separator/30">
                  {room.shortId}
                </span>
                {room.hasPassword && (
                  <span title="Password protected" className="text-label-tertiary">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <ContextMenu
            trigger={
              <button
                className="p-1.5 rounded-full text-label-tertiary hover:text-label hover:bg-surface-secondary transition-colors"
                aria-label="Room options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            items={menuItems}
          />
        </div>

        <p className="text-caption-1 text-label-secondary">
          Active: {formattedDate}
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-separator/30 flex items-center justify-between">
        <button
          onClick={copyRoomLink}
          className="text-footnote font-medium text-accent hover:underline flex items-center gap-1.5 transition-colors"
        >
          {hasCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-system-success" />
              <span className="text-system-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy link</span>
            </>
          )}
        </button>

        <Link to={`/join/${room.shortId}`}>
          <Button size="sm" variant="primary" rightIcon={ArrowRight}>
            Join
          </Button>
        </Link>
      </div>
    </div>
  )
}
