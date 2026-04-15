import { useState } from 'react'
import Modal from '../ui/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  inviteCode: string
  serverName: string
}

export default function InviteModal({ isOpen, onClose, inviteCode, serverName }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = inviteCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite friends to ${serverName}`}>
      <p className="text-text-muted text-sm mb-4">
        Share this invite code with others so they can join your server.
      </p>

      <div>
        <label className="block text-xs font-bold uppercase text-text-muted mb-2 tracking-wide">
          Invite Code
        </label>
        <div className="flex gap-2">
          <input
            id="invite-code-display"
            type="text"
            value={inviteCode}
            readOnly
            className="flex-1 rounded-sm bg-bg-tertiary px-3 py-2.5 text-text-primary text-base
                       font-mono tracking-wider outline-none select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            id="copy-invite-code"
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-sm text-sm font-medium transition-colors
                       ${copied
                         ? 'bg-green text-white'
                         : 'bg-blurple text-white hover:bg-blurple-hover'
                       }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
