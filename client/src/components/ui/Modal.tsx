import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  /** Width preset */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Reusable modal with backdrop, animation, close-on-escape, and focus trap.
 */
export default function Modal({ isOpen, onClose, children, title, size = 'md' }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Focus trap — focus the modal content when opened
  useEffect(() => {
    if (isOpen) {
      contentRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 animate-[fadeIn_150ms_ease-out]" />

      {/* Modal content */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`relative w-full ${widths[size]} bg-bg-primary rounded-md shadow-2xl
                    animate-[slideUp_200ms_ease-out] outline-none`}
      >
        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-0">
            <h2 className="text-xl font-bold text-text-primary text-center">{title}</h2>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                     text-text-muted hover:text-text-primary transition-colors rounded-sm"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
