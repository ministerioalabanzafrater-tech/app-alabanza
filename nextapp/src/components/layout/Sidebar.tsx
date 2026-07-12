'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Music2, ListMusic, Mic2,
  BookOpen, GraduationCap, Users, LogOut, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/repertorio',   label: 'Repertorio',    icon: Music2 },
  { href: '/setlists',     label: 'Setlists',      icon: ListMusic },
  { href: '/audio',        label: 'Lab de Audio',  icon: Mic2 },
  { href: '/fundamentos',  label: 'Fundamentos',   icon: BookOpen },
  { href: '/formacion',    label: 'Formación',     icon: GraduationCap },
  { href: '/equipo',       label: 'Equipo',        icon: Users },
]

interface SidebarProps {
  onClose?: () => void
  mobile?: boolean
}

export default function Sidebar({ onClose, mobile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col h-full w-64 border-r-2 border-black bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-black text-lg leading-tight">Alabanza<br />Frater</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 font-semibold text-sm transition-all duration-100 border-2 ${
                active
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_#555]'
                  : 'bg-white text-black border-transparent hover:border-black hover:shadow-[2px_2px_0px_#000]'
              }`}
            >
              <Icon size={18} strokeWidth={2.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t-2 border-black">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 font-semibold text-sm border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all duration-100"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
