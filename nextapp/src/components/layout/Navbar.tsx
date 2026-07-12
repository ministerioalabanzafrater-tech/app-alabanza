'use client'

import { Menu, Bell } from 'lucide-react'
import InstrumentIcon from '@/components/InstrumentIcon'
import type { Profile } from '@/types/database'

interface NavbarProps {
  profile: Profile | null
  onMenuClick: () => void
}

export default function Navbar({ profile, onMenuClick }: NavbarProps) {
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header className="h-14 border-b-2 border-black bg-white flex items-center justify-between px-4 shrink-0">
      {/* Mobile menu btn */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Title placeholder — páginas inyectan su título via slot */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors relative">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 border-2 border-black px-3 py-1.5">
          <div className="w-7 h-7 bg-black text-white flex items-center justify-center text-xs font-black">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold leading-tight">{profile?.full_name ?? 'Usuario'}</p>
            <p className="text-xs text-gray-500 leading-tight capitalize flex items-center gap-1">
              <InstrumentIcon instrument={profile?.instrument} size={13} />
              {profile?.role === 'admin' ? 'Admin' : profile?.instrument ?? 'Músico'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
