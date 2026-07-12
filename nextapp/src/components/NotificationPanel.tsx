'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, Calendar, Cake } from 'lucide-react'
import Link from 'next/link'
import type { Event, Profile } from '@/types/database'

function upcomingBirthdayDays(birthday: string): number | null {
  const today = new Date()
  const b = new Date(birthday)
  const next = new Date(today.getFullYear(), b.getMonth(), b.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  const diff = Math.ceil((next.getTime() - today.getTime()) / 86400000)
  return diff <= 30 ? diff : null
}

export default function NotificationPanel() {
  const [open, setOpen]         = useState(false)
  const [events, setEvents]     = useState<Event[]>([])
  const [birthdays, setBirthdays] = useState<{ profile: Profile; days: number }[]>([])
  const [loaded, setLoaded]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const load = useCallback(async () => {
    if (loaded) return
    const supabase = createClient()
    const now = new Date().toISOString()
    const in7 = new Date(Date.now() + 7 * 86400000).toISOString()

    const [{ data: evs }, { data: profs }] = await Promise.all([
      supabase.from('events').select('*').gte('starts_at', now).lte('starts_at', in7).order('starts_at').limit(10),
      supabase.from('profiles').select('*').not('birthday', 'is', null).eq('active', true),
    ])

    const upcoming = ((profs ?? []) as unknown as Profile[])
      .map(p => ({ profile: p, days: upcomingBirthdayDays(p.birthday!) }))
      .filter((x): x is { profile: Profile; days: number } => x.days !== null)
      .sort((a, b) => a.days - b.days)

    setEvents((evs ?? []) as unknown as Event[])
    setBirthdays(upcoming)
    setLoaded(true)
  }, [loaded])

  useEffect(() => { if (open) load() }, [open, load])

  const count = events.length + birthdays.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors relative"
        aria-label="Notificaciones"
      >
        <Bell size={18} />
        {count > 0 && loaded && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 border-2 border-black rounded-2xl bg-white z-50 shadow-[6px_6px_0px_#000] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-black text-white">
            <p className="font-black text-sm">Notificaciones</p>
            <button onClick={() => setOpen(false)} className="hover:opacity-60 transition-opacity">
              <X size={15} />
            </button>
          </div>

          {!loaded ? (
            <div className="py-8 text-center text-xs text-gray-400">Cargando...</div>
          ) : count === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">Sin notificaciones pendientes</div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
              {events.map(e => (
                <li key={e.id}>
                  <Link
                    href="/agenda"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={13} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{e.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(e.starts_at).toLocaleDateString('es-SV', {
                          weekday: 'short', day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              {birthdays.map(({ profile: p, days }) => (
                <li key={p.id}>
                  <Link
                    href="/equipo"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Cake size={13} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{p.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {days === 0 ? '¡Hoy es su cumpleaños!' : days === 1 ? 'Mañana es su cumpleaños' : `Cumpleaños en ${days} días`}
                        {' · '}{new Date(p.birthday!).toLocaleDateString('es-SV', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
