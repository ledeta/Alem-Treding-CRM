'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-danger">Something went wrong</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}
