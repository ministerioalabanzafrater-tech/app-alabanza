import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', size = 'md', ...props }: CardProps) {
  const base = size === 'lg' ? 'brutal-card-lg' : 'brutal-card'
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-black text-xl mb-1 ${className}`}>{children}</h2>
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-500 font-medium ${className}`}>{children}</p>
}
