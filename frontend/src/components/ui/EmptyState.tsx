'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from './Card'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {icon && (
          <div className="flex justify-center mb-4 text-gray-400 text-4xl">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-4">{description}</p>
        )}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  )
}
