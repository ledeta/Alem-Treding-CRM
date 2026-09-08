'use client'

import AdminLayout from '@/components/AdminLayout'

export default function RequestsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-violet-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-violet-50 border-b border-violet-200 px-6 py-6 shadow-sm">
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Payment Requests
            </h1>
            <p className="text-sm text-violet-600 mt-1">Payment requests section</p>
          </div>
        </div>

        {/* Empty Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-violet-600 text-lg font-medium">No content available</p>
            <p className="text-violet-500 text-sm mt-2">This section is currently empty</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
