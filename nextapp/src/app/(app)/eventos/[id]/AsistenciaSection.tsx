'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Users } from 'lucide-react'

interface Attendee {
  musician_id: string
  confirmed: boolean | null
  profiles: { full_name: string; instrument: string | null; role: string } | null
}

interface Props {
  eventId: string
  userId: string
  myAttendance: { id: string; confirmed: boolean | null } | null
  attendees: Attendee[]
}

export default function AsistenciaSection({ eventId, userId, myAttendance, attendees: initial }: Props) {
  const [status, setStatus]     = useState<boolean | null>(myAttendance?.confirmed ?? null)
  const [attendees, setAttendees] = useState<Attendee[]>(initial)
  const [loading, setLoading]   = useState(false)

  async function confirm(value: boolean) {
    if (loading) return
    setLoading(true)
    const supabase = createClient()

    await (supabase.from('event_attendance') as any).upsert(
      { event_id: eventId, musician_id: userId, confirmed: value },
      { onConflict: 'event_id,musician_id' }
    )

    setStatus(value)

    // Refresh attendees list
    const { data } = await (supabase
      .from('event_attendance') as any)
      .select('musician_id, confirmed, profiles(full_name, instrument, role)')
      .eq('event_id', eventId)

    if (data) setAttendees(data)
    setLoading(false)
  }

  const confirmed = attendees.filter(a => a.confirmed === true)
  const declined  = attendees.filter(a => a.confirmed === false)

  return (
    <div className="flex flex-col gap-6">
      {/* Mi asistencia */}
      <div className="border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
        <p className="font-black text-sm mb-4">¿Asistirás a este evento?</p>

        <div className="flex gap-3">
          <button
            onClick={() => confirm(true)}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-sm border-2 rounded-xl transition-all disabled:opacity-50 ${
              status === true
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black hover:bg-gray-50'
            }`}
          >
            <Check size={16} strokeWidth={3} />
            {status === true ? 'Confirmado' : 'Confirmar'}
          </button>
          <button
            onClick={() => confirm(false)}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-sm border-2 rounded-xl transition-all disabled:opacity-50 ${
              status === false
                ? 'bg-gray-200 text-gray-600 border-gray-400'
                : 'bg-white text-black border-black hover:bg-gray-50'
            }`}
          >
            <X size={16} strokeWidth={3} />
            {status === false ? 'No podré ir' : 'No podré'}
          </button>
        </div>
      </div>

      {/* Lista de asistentes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} strokeWidth={2.5} />
          <h3 className="font-black text-sm">
            Asistentes
            {confirmed.length > 0 && (
              <span className="ml-2 font-medium text-gray-500">({confirmed.length} confirmados)</span>
            )}
          </h3>
        </div>

        {attendees.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium">Nadie ha confirmado aún.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {confirmed.map(a => (
              <AttendeeRow key={a.musician_id} a={a} confirmed={true} />
            ))}
            {declined.map(a => (
              <AttendeeRow key={a.musician_id} a={a} confirmed={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AttendeeRow({ a, confirmed }: { a: Attendee; confirmed: boolean }) {
  const name = a.profiles?.full_name ?? 'Usuario'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
        confirmed ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {initials}
      </span>
      <span className={`text-sm font-semibold flex-1 ${confirmed ? '' : 'text-gray-400 line-through'}`}>
        {name}
      </span>
      {a.profiles?.instrument && (
        <span className="text-xs text-gray-400 font-medium">{a.profiles.instrument}</span>
      )}
      <span className={`text-xs font-bold ${confirmed ? 'text-green-600' : 'text-gray-400'}`}>
        {confirmed ? '✓' : '✗'}
      </span>
    </div>
  )
}
