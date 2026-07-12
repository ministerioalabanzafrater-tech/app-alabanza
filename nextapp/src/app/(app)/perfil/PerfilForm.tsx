'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Profile, InstrumentType, VoiceType } from '@/types/database'

const INSTRUMENTS: { value: InstrumentType; label: string }[] = [
  { value: 'guitarra', label: 'Guitarra' },
  { value: 'bajo',     label: 'Bajo' },
  { value: 'bateria',  label: 'Batería' },
  { value: 'teclado',  label: 'Teclado' },
  { value: 'piano',    label: 'Piano' },
  { value: 'violin',   label: 'Violín' },
  { value: 'cello',    label: 'Cello' },
  { value: 'trompeta', label: 'Trompeta' },
  { value: 'saxofon',  label: 'Saxofón' },
  { value: 'flauta',   label: 'Flauta' },
  { value: 'voz',      label: 'Voz' },
  { value: 'director', label: 'Director' },
  { value: 'otro',     label: 'Otro' },
]

const VOICES: { value: VoiceType; label: string }[] = [
  { value: 'soprano', label: 'Soprano' },
  { value: 'alto', label: 'Alto' },
  { value: 'tenor', label: 'Tenor' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'otro', label: 'Otro' },
]

export default function PerfilForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    birthday: profile?.birthday ?? '',
    instrument: profile?.instrument ?? '',
    voice: profile?.voice ?? '',
    bio: profile?.bio ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('El nombre es requerido.'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    // ponytail: cast because Database Update type resolves to never on this supabase-js version
    const { error } = await (supabase.from('profiles') as any).update({
      full_name: form.full_name.trim(),
      phone: form.phone?.trim() || null,
      birthday: form.birthday || null,
      instrument: form.instrument || null,
      voice: form.voice || null,
      bio: form.bio.trim() || null,
    }).eq('id', userId)

    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess(true)
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-black text-3xl mb-6">Mi perfil</h1>

      <div className="brutal-card-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="full_name"
            label="Nombre completo *"
            placeholder="Juan Pérez"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            required
          />

          <Input
            id="phone"
            label="Teléfono"
            type="tel"
            placeholder="+503 7000-0000"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />

          <Input
            id="birthday"
            label="Fecha de nacimiento"
            type="date"
            value={form.birthday}
            onChange={e => set('birthday', e.target.value)}
          />

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="instrument" className="text-sm font-bold">Instrumento</label>
              <select
                id="instrument"
                value={form.instrument}
                onChange={e => set('instrument', e.target.value)}
                className="brutal-input"
              >
                <option value="">— Sin definir —</option>
                {INSTRUMENTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="voice" className="text-sm font-bold">Tipo de voz</label>
              <select
                id="voice"
                value={form.voice}
                onChange={e => set('voice', e.target.value)}
                className="brutal-input"
              >
                <option value="">— Sin definir —</option>
                {VOICES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="bio" className="text-sm font-bold">Bio / Descripción</label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              className="brutal-input resize-none"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-600 border-2 border-red-600 px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm font-bold text-green-700 border-2 border-green-700 px-3 py-2">Perfil actualizado.</p>
          )}

          <Button type="submit" loading={loading} className="w-full mt-1">
            Guardar cambios
          </Button>
        </form>
      </div>

      {profile && (
        <p className="text-xs text-gray-400 font-medium text-center mt-4">
          Rol: <strong>{profile.role}</strong> · Miembro desde {new Date(profile.created_at).toLocaleDateString('es-SV', { month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}
