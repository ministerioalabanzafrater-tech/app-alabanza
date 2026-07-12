'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Event } from '@/types/database'

export default function NuevoSetlistForm({ events }: { events: Event[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [eventId, setEventId] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es requerido.'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('setlists').insert({
      title: title.trim(),
      event_id: eventId || null,
      notes: notes.trim() || null,
      created_by: user?.id ?? null,
    }).select('id').single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

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

        <div className="flex flex-col gap-1">
          <label htmlFor="event" className="text-sm font-bold">Evento asociado</label>
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
          <p className="text-sm font-bold text-red-600 border-2 border-red-600 px-3 py-2">{error}</p>
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
