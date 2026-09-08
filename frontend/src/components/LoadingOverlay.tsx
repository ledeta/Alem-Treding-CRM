'use client'

import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      timer = setTimeout(() => setShow(true), 100)
    } else {
      setShow(false)
    }
    return () => clearTimeout(timer)
  }, [isLoading])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <Loader className="animate-spin mx-auto mb-4 text-secondary" size={32} />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}
