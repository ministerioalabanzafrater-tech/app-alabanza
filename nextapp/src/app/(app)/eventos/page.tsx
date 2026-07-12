import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/types/database'

const TYPE_LABEL: Record<string, string> = {
  servicio: 'Servicio',
  ensayo:   'Ensayo',
  retiro:   'Retiro',
  otro:     'Otro',
}

export default async function EventosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false })

  const events = (data ?? []) as unknown as Event[]

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.starts_at) >= now)
  const past     = events.filter(e => new Date(e.starts_at) <  now)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-3xl">Eventos</h1>
          <p className="text-gray-500 font-medium">{events.length} eventos registrados</p>
        </div>
        <Link href="/eventos/nuevo" className="brutal-btn flex items-center gap-2">
          <Plus size={18} />
          Nuevo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <Card size="lg" className="text-center py-12">
          <CalendarDays size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-400">Sin eventos aún.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-3">Próximos</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {upcoming.reverse().map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-3">Pasados</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {past.map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ ev }: { ev: Event }) {
  const date = new Date(ev.starts_at)
  return (
    <Link href={`/eventos/${ev.id}`}>
      <Card className="hover:shadow-[8px_8px_0px_#000] transition-shadow duration-100 cursor-pointer h-full">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="font-black text-lg leading-tight">{ev.title}</p>
          <Badge variant={ev.type === 'servicio' ? 'filled' : 'default'} className="shrink-0">
            {TYPE_LABEL[ev.type] ?? ev.type}
          </Badge>
        </div>
        <p className="text-sm font-semibold text-gray-500">
          {date.toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}
          {date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
        </p>
        {ev.location && (
          <p className="text-xs text-gray-400 font-medium mt-1">{ev.location}</p>
        )}
      </Card>
    </Link>
  )
}
