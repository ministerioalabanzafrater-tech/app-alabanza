'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { EventType } from '@/types/database'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'servicio', label: 'Servicio' },
  { value: 'ensayo',  label: 'Ensayo'   },
  { value: 'retiro',  label: 'Retiro'   },
  { value: 'otro',    label: 'Otro'      },
]

export default function NuevoEventoForm() {
  const router  = useRouter()
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [title,    setTitle]    = useState('')
  const [type,     setType]     = useState<EventType>('servicio')
  const [date,     setDate]     = useState('')
  const [time,     setTime]     = useState('09:00')
  const [location, setLocation] = useState('')
  const [desc,     setDesc]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) { setError('Título y fecha son requeridos.'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const starts_at = new Date(`${date}T${time}:00`).toISOString()

    const { data, error: err } = await (supabase.from('events') as any)
      .insert({
        title:       title.trim(),
        type,
        starts_at,
        location:    location.trim() || null,
        description: desc.trim() || null,
        created_by:  user?.id ?? null,
      })
      .select('id')
      .single()

    setLoading(false)
    if (err) { setError(err.message); return }
    router.push(`/eventos/${data.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/eventos" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-black text-3xl">Nuevo evento</h1>
      </div>

      <div className="brutal-card-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="title"
            label="Título *"
            placeholder="Ej. Servicio dominical"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as EventType)}
              className="brutal-input"
            >
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="date"
              label="Fecha *"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
            <Input
              id="time"
              label="Hora"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          <Input
            id="location"
            label="Lugar"
            placeholder="Ej. Templo central"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="desc" className="text-sm font-bold">Descripción</label>
            <textarea
              id="desc"
              rows={3}
              placeholder="Detalles adicionales del evento..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="brutal-input resize-none"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-600 border-2 border-red-600 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <Link href="/eventos" className="brutal-btn-outline flex-1 text-center">
              Cancelar
            </Link>
            <Button type="submit" loading={loading} className="flex-1">
              Crear evento
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
