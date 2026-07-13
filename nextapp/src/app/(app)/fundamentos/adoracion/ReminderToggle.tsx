'use client'

import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'

const TIMES = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
]

export default function ReminderToggle({
  userId,
  initial,
}: {
  userId: string
  initial: { time: string; active: boolean } | null
}) {
  const [active, setActive]     = useState(initial?.active ?? false)
  const [time,   setTime]       = useState(initial?.time?.slice(0, 5) ?? '08:00')
  const [saving, setSaving]     = useState(false)

  async function save(nextActive: boolean, nextTime: string) {
    setSaving(true)
    const supabase = createClient()
    await (supabase.from('reading_subscriptions') as any).upsert(
      { user_id: userId, reminder_time: nextTime, active: nextActive },
      { onConflict: 'user_id' }
    )
    setSaving(false)
  }

  async function toggle() {
    const next = !active
    setActive(next)
    await save(next, time)
  }

  async function changeTime(t: string) {
    setTime(t)
    if (active) await save(true, t)
  }

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-black text-sm">Recordatorio diario</p>
          <p className="text-xs text-gray-400 font-medium">Notificación para leer el siguiente capítulo</p>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          className={`flex items-center gap-2 px-3 py-2 border-2 font-bold text-sm transition-colors ${
            active
              ? 'border-black bg-black text-white hover:bg-gray-800'
              : 'border-black hover:bg-black hover:text-white'
          }`}
        >
          {active ? <Bell size={15} /> : <BellOff size={15} />}
          {active ? 'Activo' : 'Activar'}
        </button>
      </div>

      {active && (
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2">Hora del recordatorio (hora El Salvador)</p>
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map(t => (
              <button
                key={t.value}
                onClick={() => changeTime(t.value)}
                disabled={saving}
                className={`text-xs font-bold py-1.5 border-2 transition-colors ${
                  time === t.value
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
