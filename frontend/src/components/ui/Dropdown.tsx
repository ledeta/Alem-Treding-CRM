'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownItem {
  label: string
  value: string
  onClick?: () => void
  className?: string
}

interface DropdownProps {
  trigger: ReactNode | string
  items: DropdownItem[]
  className?: string
  align?: 'left' | 'right'
}

export function Dropdown({
  trigger,
  items,
  className,
  align = 'left',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {trigger}
      </button>

      {/* Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-soft-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.()
                setIsOpen(false)
              }}
              className={cn(
                'w-full text-left px-4 py-2 text-sm transition-colors',
                index === 0 ? 'rounded-t-lg' : '',
                index === items.length - 1 ? 'rounded-b-lg' : '',
                'hover:bg-gray-50',
                item.className
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
