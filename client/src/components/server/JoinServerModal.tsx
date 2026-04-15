import { useState } from 'react'
import { trpc } from '../../lib/trpc'
import Modal from '../ui/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function JoinServerModal({ isOpen, onClose }: Props) {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  const joinMutation = trpc.server.join.useMutation({
    onSuccess: () => {
      setInviteCode('')
      setError('')
      onClose()
      // Reload to get fresh READY data with the new server
      window.location.reload()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setError('')
    joinMutation.mutate({ inviteCode: inviteCode.trim() })
  }

  const handleClose = () => {
    setInviteCode('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join a Server">
      <p className="text-text-muted text-sm text-center mb-6">
        Enter an invite code below to join an existing server.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red/10 border border-red/30 px-4 py-2 text-red text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-text-muted mb-2 tracking-wide">
            Invite Code
          </label>
          <input
            id="join-server-code"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            className="w-full rounded-sm bg-bg-tertiary px-3 py-2.5 text-text-primary text-base outline-none
                       transition-colors focus:ring-2 focus:ring-blurple placeholder:text-text-muted
                       font-mono tracking-wider"
            placeholder="e.g. TESTCODE"
            autoFocus
          />
        </div>

        <div className="bg-bg-secondary rounded-sm p-3 mt-3">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="text-text-secondary font-semibold">Invites look like:&nbsp;</span>
            TESTCODE, abc123, myserver
          </p>
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
            id="join-server-submit"
            type="submit"
            disabled={!inviteCode.trim() || joinMutation.isPending}
            className="px-6 py-2 rounded-sm bg-blurple text-white text-sm font-medium
                       hover:bg-blurple-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joinMutation.isPending ? 'Joining...' : 'Join Server'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
