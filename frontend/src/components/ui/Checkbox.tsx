'use client'

import { InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Checkbox({
  label,
  error,
  className,
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="pt-1">
        <input
          type="checkbox"
          className={cn(
            'w-5 h-5 rounded border-gray-300 cursor-pointer',
            'focus:ring-2 focus:ring-secondary focus:ring-offset-0',
            'text-secondary bg-white',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {label && (
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-900 cursor-pointer">
            {label}
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}

export function CheckboxGroup({
  items,
  value,
  onChange,
  error,
}: {
  items: { label: string; value: string }[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Checkbox
          key={item.value}
          label={item.label}
          checked={value.includes(item.value)}
          onChange={(e) => {
            if (e.target.checked) {
              onChange([...value, item.value])
            } else {
              onChange(value.filter((v) => v !== item.value))
            }
          }}
          error={error}
        />
      ))}
    </div>
  )
}
