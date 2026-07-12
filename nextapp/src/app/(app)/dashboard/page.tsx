import { createClient } from '@/lib/supabase/server'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Music2, Users, Cake } from 'lucide-react'
import type { Event, Profile } from '@/types/database'

function getDaysUntilBirthday(birthday: string): number {
  const today = new Date()
  const bday = new Date(birthday)
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: eventsRaw }, { data: profilesRaw }, { data: setlistsRaw }] = await Promise.all([
    supabase.from('events').select('*').gte('starts_at', new Date().toISOString()).order('starts_at').limit(5),
    supabase.from('profiles').select('*').eq('active', true),
    supabase.from('setlists').select('*').order('created_at', { ascending: false }).limit(3),
  ])

  const events = eventsRaw as unknown as Event[]
  const profiles = profilesRaw as unknown as Profile[]
  const setlists = setlistsRaw as unknown as { id: string }[]

  const upcomingBirthdays = (profiles ?? [])
    .filter(p => p.birthday)
    .map(p => ({ ...p, daysUntil: getDaysUntilBirthday(p.birthday!) }))
    .filter(p => p.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-black text-3xl mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Músicos', value: profiles?.length ?? 0, icon: Users },
          { label: 'Próximos eventos', value: events?.length ?? 0, icon: Calendar },
          { label: 'Setlists', value: setlists?.length ?? 0, icon: Music2 },
          { label: 'Cumpleaños (30d)', value: upcomingBirthdays.length, icon: Cake },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
              <Icon size={16} />
            </div>
            <span className="text-4xl font-black">{value}</span>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximos eventos */}
        <Card size="lg">
          <CardTitle>Próximos eventos</CardTitle>
          <CardDescription className="mb-4">Ensayos y servicios</CardDescription>
          {events && events.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {events.map(event => (
                <li key={event.id} className="flex items-start justify-between border-b-2 border-black pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(event.starts_at).toLocaleDateString('es-SV', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    {event.location && <p className="text-xs text-gray-400">{event.location}</p>}
                  </div>
                  <Badge variant={event.type === 'servicio' ? 'filled' : 'default'} className="shrink-0 ml-2">
                    {event.type}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 font-medium">Sin eventos próximos.</p>
          )}
        </Card>

        {/* Cumpleaños */}
        <Card size="lg">
          <CardTitle>🎂 Cumpleaños</CardTitle>
          <CardDescription className="mb-4">Próximos 30 días</CardDescription>
          {upcomingBirthdays.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {upcomingBirthdays.map(p => (
                <li key={p.id} className="flex items-center justify-between border-b-2 border-black pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-sm">{p.full_name}</p>
                    <p className="text-xs text-gray-500 font-medium capitalize">{p.instrument ?? p.voice ?? 'músico'}</p>
                  </div>
                  <Badge variant={p.daysUntil === 0 ? 'filled' : 'default'} className="shrink-0 ml-2">
                    {p.daysUntil === 0 ? '¡Hoy!' : `${p.daysUntil}d`}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 font-medium">Sin cumpleaños en los próximos 30 días.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
