import { useState, useEffect, useRef } from 'react'
import type { ServerWithChannels } from '@discord/shared'
import { useAppStore } from '../../store'
import InviteModal from './InviteModal'
import CreateChannelModal from '../../components/channel/CreateChannelModal'
import { trpc } from '../../lib/trpc'

interface Props {
  server: ServerWithChannels
  isOpen: boolean
  onClose: () => void
}

export default function ServerDropdownMenu({ server, isOpen, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const currentUserId = useAppStore((s) => s.user?.id)
  const isOwner = server.ownerId === currentUserId

  const [showInvite, setShowInvite] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)

  const leaveMutation = trpc.server.leave.useMutation({
    onSuccess: () => {
      onClose()
      window.location.reload()
    },
  })

  const deleteMutation = trpc.server.delete.useMutation({
    onSuccess: () => {
      onClose()
      window.location.reload()
    },
  })

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        ref={menuRef}
        className="absolute top-full left-0 right-0 mt-1 mx-2 z-40
                   bg-bg-floating rounded-md shadow-xl border border-bg-tertiary/50
                   py-1.5 animate-[slideUp_150ms_ease-out]"
      >
        {/* Invite People */}
        <button
          id="menu-invite"
          onClick={() => { onClose(); setShowInvite(true) }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-blurple
                     hover:bg-blurple hover:text-white rounded-sm mx-auto transition-colors
                     cursor-pointer"
          style={{ width: 'calc(100% - 8px)', marginLeft: 4 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Invite People
        </button>

        <div className="h-px bg-bg-modifier-active mx-2 my-1" />

        {/* Create Channel (owner/admin only) */}
        {isOwner && (
          <button
            id="menu-create-channel"
            onClick={() => { onClose(); setShowCreateChannel(true) }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-text-secondary
                       hover:bg-blurple hover:text-white rounded-sm transition-colors cursor-pointer"
            style={{ width: 'calc(100% - 8px)', marginLeft: 4 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Channel
          </button>
        )}

        <div className="h-px bg-bg-modifier-active mx-2 my-1" />

        {/* Leave / Delete Server */}
        {isOwner ? (
          <button
            id="menu-delete-server"
            onClick={() => {
              if (confirm(`Delete "${server.name}"? This cannot be undone.`)) {
                deleteMutation.mutate({ serverId: server.id })
              }
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-red
                       hover:bg-red hover:text-white rounded-sm transition-colors cursor-pointer"
            style={{ width: 'calc(100% - 8px)', marginLeft: 4 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete Server
          </button>
        ) : (
          <button
            id="menu-leave-server"
            onClick={() => {
              if (confirm(`Leave "${server.name}"?`)) {
                leaveMutation.mutate({ serverId: server.id })
              }
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-red
                       hover:bg-red hover:text-white rounded-sm transition-colors cursor-pointer"
            style={{ width: 'calc(100% - 8px)', marginLeft: 4 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Leave Server
          </button>
        )}
      </div>

      {/* Sub-modals */}
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} inviteCode={server.inviteCode} serverName={server.name} />
      <CreateChannelModal isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} serverId={server.id} />
    </>
  )
}
