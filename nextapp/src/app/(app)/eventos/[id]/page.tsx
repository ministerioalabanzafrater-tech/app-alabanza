import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, CalendarDays, MapPin, ListMusic } from 'lucide-react'
import Link from 'next/link'
import type { Event, Setlist } from '@/types/database'

const TYPE_LABEL: Record<string, string> = {
  servicio: 'Servicio',
  ensayo:   'Ensayo',
  retiro:   'Retiro',
  otro:     'Otro',
}

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ev } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!ev) notFound()

  const event = ev as unknown as Event

  const { data: setlistsData } = await supabase
    .from('setlists')
    .select('id, title, notes, created_at')
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  const setlists = (setlistsData ?? []) as unknown as Setlist[]
  const date = new Date(event.starts_at)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/eventos" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-3xl leading-tight truncate">{event.title}</h1>
        </div>
        <Badge variant={event.type === 'servicio' ? 'filled' : 'default'}>
          {TYPE_LABEL[event.type] ?? event.type}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm mb-1">
            <CalendarDays size={15} />
            Fecha y hora
          </div>
          <p className="font-bold capitalize">
            {date.toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500 font-medium">
            {date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </Card>

        {event.location && (
          <Card>
            <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm mb-1">
              <MapPin size={15} />
              Lugar
            </div>
            <p className="font-bold">{event.location}</p>
          </Card>
        )}
      </div>

      {event.description && (
        <Card className="mb-8">
          <p className="text-sm font-semibold text-gray-500 mb-1">Descripción</p>
          <p className="font-medium text-sm leading-relaxed">{event.description}</p>
        </Card>
      )}

      {/* Setlists asociados */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg flex items-center gap-2">
            <ListMusic size={18} />
            Setlists
          </h2>
          <Link
            href={`/setlists/nuevo?event_id=${event.id}`}
            className="text-xs font-bold border-2 border-black rounded-lg px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            + Nuevo setlist
          </Link>
        </div>

        {setlists.length === 0 ? (
          <Card className="text-center py-8 text-gray-400">
            <p className="font-bold text-sm">Sin setlists para este evento.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {setlists.map(sl => (
              <Link key={sl.id} href={`/setlists/${sl.id}`}>
                <Card className="hover:shadow-[6px_6px_0px_#000] transition-shadow duration-100 cursor-pointer">
                  <p className="font-bold">{sl.title}</p>
                  {sl.notes && <p className="text-xs text-gray-400 font-medium mt-1 line-clamp-1">{sl.notes}</p>}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
