'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  badge?: number | string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
  onChange?: (tabId: string) => void
}

export function Tabs({
  tabs,
  defaultTab,
  className,
  onChange,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabData = tabs.find((t) => t.id === activeTab)

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabData && (
        <div className="mt-4 animate-fade-in">
          {activeTabData.content}
        </div>
      )}
    </div>
  )
}
