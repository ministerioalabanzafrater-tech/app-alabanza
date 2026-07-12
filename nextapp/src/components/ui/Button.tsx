import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = variant === 'outline' ? 'brutal-btn-outline' : 'brutal-btn'
  const sizes = { sm: 'text-sm px-3 py-1.5', md: '', lg: 'text-lg px-7 py-3' }

  return (
    <button
      className={`${base} ${sizes[size]} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Cargando…' : children}
    </button>
  )
}
