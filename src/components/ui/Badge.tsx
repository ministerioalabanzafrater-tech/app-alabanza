interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'filled'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'brutal-badge bg-white text-black',
    outline: 'brutal-badge bg-white text-black',
    filled: 'brutal-badge bg-black text-white',
  }
  return <span className={`${variants[variant]} ${className}`}>{children}</span>
}
