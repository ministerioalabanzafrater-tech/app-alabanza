'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import PushSubscribePrompt from '@/components/PushSubscribePrompt'
import type { Profile } from '@/types/database'

export default function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile | null
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profile={profile} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white">
          {children}
        </main>
      </div>
      <PushSubscribePrompt />
    </div>
  )
}
