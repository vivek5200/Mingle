import type { PresenceStatus } from '../../store'

interface Props {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  status?: PresenceStatus
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

const statusDotSize = {
  xs: 'w-2 h-2 border',
  sm: 'w-3 h-3 border-2',
  md: 'w-3.5 h-3.5 border-[2.5px]',
  lg: 'w-4 h-4 border-[3px]',
}

const statusColors: Record<PresenceStatus, string> = {
  online: 'bg-status-online',
  idle: 'bg-status-idle',
  dnd: 'bg-status-dnd',
  offline: 'bg-status-offline',
}

export default function Avatar({ src, alt, size = 'md', status, className = '' }: Props) {
  const initial = alt.charAt(0).toUpperCase()

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className={`${sizeMap[size]} rounded-full bg-blurple/70 flex items-center justify-center text-white font-semibold overflow-hidden`}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      {status && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-bg-primary
                      ${statusDotSize[size]} ${statusColors[status]}`}
        />
      )}
    </div>
  )
}
