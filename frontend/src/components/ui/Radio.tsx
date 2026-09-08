'use client'

import { cn } from '@/lib/utils'

interface RadioItem {
  label: string
  value: string
}

interface RadioGroupProps {
  name: string
  items: RadioItem[]
  value?: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export function RadioGroup({
  name,
  items,
  value,
  onChange,
  error,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div key={item.value} className="flex items-center gap-3">
          <input
            type="radio"
            id={`${name}-${item.value}`}
            name={name}
            value={item.value}
            checked={value === item.value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-5 h-5 text-secondary cursor-pointer',
              'focus:ring-2 focus:ring-secondary focus:ring-offset-0',
              'border-gray-300',
              error && 'border-red-500'
            )}
          />
          <label
            htmlFor={`${name}-${item.value}`}
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            {item.label}
          </label>
        </div>
      ))}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
