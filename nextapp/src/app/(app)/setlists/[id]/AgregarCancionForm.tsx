'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import type { Song, Profile, KeyNote } from '@/types/database'

const KEY_NOTES: KeyNote[] = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B']

type Props =
  | { mode: 'song'; setlistId: string; songs: Song[]; currentCount: number; profiles?: never; currentMusicians?: never }
  | { mode: 'musician'; setlistId: string; profiles: Profile[]; currentMusicians: string[]; songs?: never; currentCount?: never }

export default function AgregarCancionForm(props: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [songId, setSongId] = useState('')
  const [keyOverride, setKeyOverride] = useState('')
  const [profileId, setProfileId] = useState('')

  async function handleAddSong(e: React.FormEvent) {
    e.preventDefault()
    if (!songId) return
    setLoading(true)
    const supabase = createClient()
    await (supabase.from('setlist_songs') as any).insert({
      setlist_id: props.setlistId,
      song_id: songId,
      position: (props.currentCount ?? 0),
      key_override: keyOverride || null,
    })
    setLoading(false)
    setOpen(false)
    setSongId('')
    setKeyOverride('')
    router.refresh()
  }

  async function handleAddMusician(e: React.FormEvent) {
    e.preventDefault()
    if (!profileId) return
    setLoading(true)
    const supabase = createClient()
    await (supabase.from('setlist_musicians') as any).insert({
      setlist_id: props.setlistId,
      musician_id: profileId,
    })
    setLoading(false)
    setOpen(false)
    setProfileId('')
    router.refresh()
  }

  if (props.mode === 'song') {
    return (
      <div>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="brutal-btn-outline w-full flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Agregar canción
          </button>
        ) : (
          <form onSubmit={handleAddSong} className="brutal-card flex flex-col gap-3">
            <select value={songId} onChange={e => setSongId(e.target.value)} className="brutal-input" required>
              <option value="">— Selecciona canción —</option>
              {props.songs.map(s => (
                <option key={s.id} value={s.id}>{s.title}{s.author ? ` · ${s.author}` : ''}</option>
              ))}
            </select>
            <select value={keyOverride} onChange={e => setKeyOverride(e.target.value)} className="brutal-input">
              <option value="">Tonalidad original</option>
              {KEY_NOTES.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="brutal-btn-outline flex-1 text-sm">Cancelar</button>
              <Button type="submit" loading={loading} className="flex-1 text-sm">Agregar</Button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="brutal-btn-outline w-full flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} /> Asignar músico
        </button>
      ) : (
        <form onSubmit={handleAddMusician} className="brutal-card flex flex-col gap-3">
          <select value={profileId} onChange={e => setProfileId(e.target.value)} className="brutal-input" required>
            <option value="">— Selecciona músico —</option>
            {props.profiles.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}{p.instrument ? ` · ${p.instrument}` : ''}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="brutal-btn-outline flex-1 text-sm">Cancelar</button>
            <Button type="submit" loading={loading} className="flex-1 text-sm">Asignar</Button>
          </div>
        </form>
      )}
    </div>
  )
}
