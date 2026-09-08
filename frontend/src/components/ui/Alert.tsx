'use client'

import { ReactNode } from 'react'
import { AlertCircle, CheckCircle, InfoIcon, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      Icon: XCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      Icon: InfoIcon,
    },
  }

  const style = variants[variant]
  const Icon = style.Icon

  return (
    <div
      className={cn(
        'border rounded-lg p-4 flex gap-3',
        style.bg,
        style.border,
        style.text,
        className
      )}
    >
      <Icon className={cn('flex-shrink-0 w-5 h-5 mt-0.5', style.icon)} />
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
