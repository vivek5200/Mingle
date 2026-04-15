import { useState, useRef, useCallback } from 'react'
import { getSocket } from '../../lib/socket'

interface Props {
  channelId: string
  channelName?: string
}

export default function MessageInput({ channelId, channelName }: Props) {
  const [content, setContent] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed) return

    const socket = getSocket()
    socket.emit('message:send', {
      channelId,
      content: trimmed,
      type: 'text',
    })

    setContent('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [content, channelId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    // Auto-resize textarea
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'

    // Emit typing indicator (debounced to every 2 seconds)
    if (!typingTimeoutRef.current) {
      const socket = getSocket()
      socket.emit('typing:start', { channelId })
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null
      }, 2000)
    }
  }

  return (
    <div className="flex items-end bg-bg-modifier-hover rounded-lg px-4 mx-4 mb-6">
      {/* Plus button (for future attachments) */}
      <button className="text-text-muted hover:text-text-secondary transition-colors mr-3 text-xl pb-2.5 shrink-0">
        +
      </button>

      <textarea
        ref={textareaRef}
        id="message-input"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={`Message ${channelName ? '#' + channelName : '#channel'}`}
        rows={1}
        className="flex-1 bg-transparent py-2.5 text-text-primary text-sm outline-none
                   placeholder:text-text-muted resize-none leading-relaxed max-h-[200px]"
      />

      {/* Emoji button placeholder */}
      <button className="text-text-muted hover:text-text-secondary transition-colors ml-2 pb-2.5 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      </button>

      {/* Send button (visible when there's content) */}
      {content.trim() && (
        <button
          onClick={handleSend}
          className="text-blurple hover:text-blurple-hover transition-colors ml-1 pb-2.5 shrink-0"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      )}
    </div>
  )
}

