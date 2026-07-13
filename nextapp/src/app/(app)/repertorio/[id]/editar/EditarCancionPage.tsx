'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import type { Song, KeyNote } from '@/types/database'

const KEY_NOTES: KeyNote[] = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B']

export default function EditarCancionPage({ song }: { song: Song }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title:       song.title,
    author:      song.author      ?? '',
    bpm:         song.bpm         ? String(song.bpm) : '',
    key_note:    song.key_note    ?? '' as KeyNote | '',
    genre:       song.genre       ?? '',
    youtube_url: song.youtube_url ?? '',
    lyrics:      song.lyrics      ?? '',
    notes:       song.notes       ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es requerido.'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await (supabase.from('songs') as any).update({
      title:       form.title.trim(),
      author:      form.author.trim()      || null,
      bpm:         form.bpm ? parseInt(form.bpm) : null,
      key_note:    form.key_note           || null,
      genre:       form.genre.trim()       || null,
      youtube_url: form.youtube_url.trim() || null,
      lyrics:      form.lyrics.trim()      || null,
      notes:       form.notes.trim()       || null,
    }).eq('id', song.id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/repertorio/${song.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/repertorio/${song.id}`} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-black text-3xl">Editar canción</h1>
      </div>

      <div className="brutal-card-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="title"
            label="Título *"
            placeholder="Nombre de la canción"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
          />
          <Input
            id="author"
            label="Autor / Artista"
            placeholder="Ej. Marcos Witt"
            value={form.author}
            onChange={e => set('author', e.target.value)}
          />

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="key_note" className="text-sm font-bold">Tonalidad</label>
              <select
                id="key_note"
                value={form.key_note}
                onChange={e => set('key_note', e.target.value)}
                className="brutal-input"
              >
                <option value="">— Sin definir —</option>
                {KEY_NOTES.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <Input
              id="bpm"
              label="BPM"
              type="number"
              placeholder="120"
              min={1}
              max={299}
              value={form.bpm}
              onChange={e => set('bpm', e.target.value)}
              className="flex-1"
            />
          </div>

          <Input
            id="genre"
            label="Género"
            placeholder="Ej. Worship, Gospel, Balada"
            value={form.genre}
            onChange={e => set('genre', e.target.value)}
          />
          <Input
            id="youtube_url"
            label="URL de YouTube"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={form.youtube_url}
            onChange={e => set('youtube_url', e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="lyrics" className="text-sm font-bold">Letra</label>
            <textarea
              id="lyrics"
              rows={8}
              placeholder="Letra de la canción..."
              value={form.lyrics}
              onChange={e => set('lyrics', e.target.value)}
              className="brutal-input resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="text-sm font-bold">Notas internas</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Notas para el equipo..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="brutal-input resize-none"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-600 border-2 border-red-600 px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <Link href={`/repertorio/${song.id}`} className="brutal-btn-outline flex-1 text-center">
              Cancelar
            </Link>
            <Button type="submit" loading={loading} className="flex-1">
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
