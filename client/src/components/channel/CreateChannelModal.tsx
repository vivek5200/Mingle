import { useState } from 'react'
import { trpc } from '../../lib/trpc'
import Modal from '../ui/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  serverId: string
}

export default function CreateChannelModal({ isOpen, onClose, serverId }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'voice'>('text')
  const [error, setError] = useState('')

  const createMutation = trpc.channel.create.useMutation({
    onSuccess: () => {
      setName('')
      setType('text')
      setError('')
      onClose()
      // Reload to get fresh data with new channel
      window.location.reload()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    createMutation.mutate({
      serverId,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      type,
    })
  }

  const handleClose = () => {
    setName('')
    setType('text')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red/10 border border-red/30 px-4 py-2 text-red text-sm">
            {error}
          </div>
        )}

        {/* Channel type selection */}
        <div>
          <label className="block text-xs font-bold uppercase text-text-muted mb-2 tracking-wide">
            Channel Type
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-colors
                         ${type === 'text' ? 'bg-bg-modifier-active' : 'bg-bg-tertiary hover:bg-bg-modifier-hover'}`}
            >
              <input
                type="radio"
                name="channel-type"
                value="text"
                checked={type === 'text'}
                onChange={() => setType('text')}
                className="sr-only"
              />
              <span className="text-text-muted text-xl">#</span>
              <div>
                <p className="text-text-primary text-sm font-medium">Text</p>
                <p className="text-text-muted text-xs">Send messages, images, GIFs, and more</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${type === 'text' ? 'border-blurple' : 'border-text-muted'}`}>
                {type === 'text' && <div className="w-2.5 h-2.5 rounded-full bg-blurple" />}
              </div>
            </label>

            <label
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-colors
                         ${type === 'voice' ? 'bg-bg-modifier-active' : 'bg-bg-tertiary hover:bg-bg-modifier-hover'}`}
            >
              <input
                type="radio"
                name="channel-type"
                value="voice"
                checked={type === 'voice'}
                onChange={() => setType('voice')}
                className="sr-only"
              />
              <span className="text-xl">🔊</span>
              <div>
                <p className="text-text-primary text-sm font-medium">Voice</p>
                <p className="text-text-muted text-xs">Hang out with voice, video, and screen share</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${type === 'voice' ? 'border-blurple' : 'border-text-muted'}`}>
                {type === 'voice' && <div className="w-2.5 h-2.5 rounded-full bg-blurple" />}
              </div>
            </label>
          </div>
        </div>

        {/* Channel name */}
        <div>
          <label className="block text-xs font-bold uppercase text-text-muted mb-2 tracking-wide">
            Channel Name
          </label>
          <div className="flex items-center gap-1 bg-bg-tertiary rounded-sm px-3 py-2.5">
            <span className="text-text-muted text-lg shrink-0">{type === 'text' ? '#' : '🔊'}</span>
            <input
              id="create-channel-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="flex-1 bg-transparent text-text-primary text-base outline-none
                         placeholder:text-text-muted"
              placeholder="new-channel"
              autoFocus
            />
          </div>
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
            id="create-channel-submit"
            type="submit"
            disabled={!name.trim() || createMutation.isPending}
            className="px-6 py-2 rounded-sm bg-blurple text-white text-sm font-medium
                       hover:bg-blurple-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
