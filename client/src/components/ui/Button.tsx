import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'bg-blurple text-white hover:bg-blurple-hover',
  secondary: 'bg-bg-modifier-hover text-text-primary hover:bg-bg-modifier-active',
  danger: 'bg-red text-white hover:bg-red-hover',
  ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-modifier-hover',
}

const sizes = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={`rounded-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
