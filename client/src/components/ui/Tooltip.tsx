import type { ReactNode } from 'react'

interface Props {
  content: string
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
}

export default function Tooltip({ content, children, side = 'top' }: Props) {
  return (
    <div className="relative group">
      {children}
      <div
        className={`absolute ${positionClasses[side]} z-50 px-3 py-1.5 rounded-md shadow-xl
                    bg-bg-floating text-text-primary text-xs font-medium whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  )
}
