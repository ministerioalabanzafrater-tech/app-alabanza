import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-bold">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`brutal-input ${error ? 'border-red-600' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
