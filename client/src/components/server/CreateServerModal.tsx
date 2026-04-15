import { useState } from 'react'
import { trpc } from '../../lib/trpc'
import { useAppStore } from '../../store'
import Modal from '../ui/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CreateServerModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const addServer = useAppStore((s) => s.addServer)

  const createMutation = trpc.server.create.useMutation({
    onSuccess: (data) => {
      // Add to Zustand with defaults for a brand new server
      addServer({
        id: data.id,
        name: data.name,
        iconUrl: data.iconUrl ?? null,
        ownerId: data.ownerId,
        inviteCode: data.inviteCode,
        channels: [],
        memberCount: 1,
        onlineMemberCount: 1,
        voiceStates: [],
      })
      setName('')
      setError('')
      onClose()
      // Reload app to get fresh READY data with the new server + auto-created #general
      window.location.href = '/'
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    createMutation.mutate({ name: name.trim() })
  }

  const handleClose = () => {
    setName('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a Server">
      <p className="text-text-muted text-sm text-center mb-6">
        Your server is where you and your friends hang out. Make yours and start talking.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red/10 border border-red/30 px-4 py-2 text-red text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-text-muted mb-2 tracking-wide">
            Server Name
          </label>
          <input
            id="create-server-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full rounded-sm bg-bg-tertiary px-3 py-2.5 text-text-primary text-base outline-none
                       transition-colors focus:ring-2 focus:ring-blurple placeholder:text-text-muted"
            placeholder="Enter a server name"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            id="create-server-submit"
            type="submit"
            disabled={!name.trim() || createMutation.isPending}
            className="px-6 py-2 rounded-sm bg-blurple text-white text-sm font-medium
                       hover:bg-blurple-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
