'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, X } from 'lucide-react'
import type { Event, EventType } from '@/types/database'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'servicio',  label: 'Servicio' },
  { value: 'ensayo',   label: 'Ensayo' },
  { value: 'retiro',   label: 'Retiro' },
  { value: 'otro',     label: 'Otro' },
]

export default function NuevoSetlistForm({ events: initialEvents }: { events: Event[] }) {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [title, setTitle]       = useState('')
  const [eventId, setEventId]   = useState('')
  const [notes, setNotes]       = useState('')
  const [events, setEvents]     = useState<Event[]>(initialEvents)

  // Inline event creation
  const [creating, setCreating]           = useState(false)
  const [evTitle, setEvTitle]             = useState('')
  const [evType, setEvType]               = useState<EventType>('servicio')
  const [evDate, setEvDate]               = useState('')
  const [evTime, setEvTime]               = useState('09:00')
  const [evLocation, setEvLocation]       = useState('')
  const [evLoading, setEvLoading]         = useState(false)
  const [evError, setEvError]             = useState('')

  async function createEvent() {
    if (!evTitle.trim() || !evDate) { setEvError('Título y fecha son requeridos.'); return }
    setEvError('')
    setEvLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const starts_at = new Date(`${evDate}T${evTime}:00`).toISOString()
    const { data, error } = await (supabase.from('events') as any)
      .insert({
        title: evTitle.trim(),
        type: evType,
        starts_at,
        location: evLocation.trim() || null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single()

    setEvLoading(false)
    if (error) { setEvError(error.message); return }

    const newEvent = data as Event
    setEvents(prev => [newEvent, ...prev])
    setEventId(newEvent.id)
    setCreating(false)
    setEvTitle(''); setEvDate(''); setEvTime('09:00'); setEvLocation(''); setEvType('servicio')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es requerido.'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await (supabase.from('setlists') as any).insert({
      title: title.trim(),
      event_id: eventId || null,
      notes: notes.trim() || null,
      created_by: user?.id ?? null,
    }).select('id').single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/setlists/${data.id}`)
    router.refresh()
  }

  return (
    <div className="brutal-card-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="title"
          label="Título *"
          placeholder="Ej. Servicio dominical 13 julio"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        {/* Evento asociado */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="event" className="text-sm font-bold">Evento asociado</label>
            {!creating && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex items-center gap-1 text-xs font-bold border-2 border-black rounded-lg px-2 py-0.5 hover:bg-black hover:text-white transition-colors"
              >
                <Plus size={11} /> Crear evento
              </button>
            )}
          </div>

          <select
            id="event"
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            className="brutal-input"
          >
            <option value="">— Sin evento —</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} · {new Date(ev.starts_at).toLocaleDateString('es-SV', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Mini formulario de evento inline */}
        {creating && (
          <div className="border-2 border-black rounded-xl p-4 flex flex-col gap-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="font-black text-sm">Nuevo evento</p>
              <button type="button" onClick={() => { setCreating(false); setEvError('') }}>
                <X size={15} />
              </button>
            </div>

            <Input
              id="ev_title"
              label="Título del evento *"
              placeholder="Ej. Servicio dominical"
              value={evTitle}
              onChange={e => setEvTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold">Tipo</label>
                <select
                  value={evType}
                  onChange={e => setEvType(e.target.value as EventType)}
                  className="brutal-input"
                >
                  {EVENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <Input
                id="ev_date"
                label="Fecha *"
                type="date"
                value={evDate}
                onChange={e => setEvDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="ev_time"
                label="Hora"
                type="time"
                value={evTime}
                onChange={e => setEvTime(e.target.value)}
              />
              <Input
                id="ev_location"
                label="Lugar"
                placeholder="Ej. Templo central"
                value={evLocation}
                onChange={e => setEvLocation(e.target.value)}
              />
            </div>

            {evError && (
              <p className="text-xs font-bold text-red-600 border-2 border-red-600 rounded-lg px-3 py-2">{evError}</p>
            )}

            <button
              type="button"
              onClick={createEvent}
              disabled={evLoading}
              className="brutal-btn text-sm disabled:opacity-50"
            >
              {evLoading ? 'Creando...' : 'Crear y seleccionar evento'}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-bold">Notas</label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Indicaciones para el equipo..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="brutal-input resize-none"
          />
        </div>

        {error && (
          <p className="text-sm font-bold text-red-600 border-2 border-red-600 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 mt-2">
          <Link href="/setlists" className="brutal-btn-outline flex-1 text-center">
            Cancelar
          </Link>
          <Button type="submit" loading={loading} className="flex-1">
            Crear setlist
          </Button>
        </div>
      </form>
    </div>
  )
}
