import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Music2, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import AgregarCancionForm from './AgregarCancionForm'
import type { Song, Profile, KeyNote } from '@/types/database'

type SetlistSongRow = {
  id: string
  position: number
  key_override: KeyNote | null
  notes: string | null
  songs: { title: string; author: string | null; key_note: KeyNote | null }
}

type SetlistMusicianRow = {
  id: string
  confirmed: boolean
  instrument: string | null
  profiles: { full_name: string }
}

export default async function SetlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: setlist }, { data: songsRaw }, { data: musiciansRaw }, { data: allSongs }, { data: allProfiles }] =
    await Promise.all([
      supabase.from('setlists').select('*, events(title, starts_at, type)').eq('id', id).single(),
      supabase.from('setlist_songs').select('id, position, key_override, notes, songs(title, author, key_note)').eq('setlist_id', id).order('position'),
      supabase.from('setlist_musicians').select('id, confirmed, instrument, profiles(full_name)').eq('setlist_id', id),
      supabase.from('songs').select('id, title, author, key_note').eq('active', true).order('title'),
      supabase.from('profiles').select('id, full_name, instrument').eq('active', true).order('full_name'),
    ])

  if (!setlist) notFound()

  const sl = setlist as any
  const songs = (songsRaw ?? []) as unknown as SetlistSongRow[]
  const musicians = (musiciansRaw ?? []) as unknown as SetlistMusicianRow[]
  const songOptions = (allSongs ?? []) as unknown as Song[]
  const profileOptions = (allProfiles ?? []) as unknown as Profile[]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/setlists" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-black text-3xl">{sl.title}</h1>
      </div>

      {sl.events && (
        <div className="flex items-center gap-2 mb-6">
          <Badge variant={sl.events.type === 'servicio' ? 'filled' : 'default'}>{sl.events.type}</Badge>
          <span className="text-sm text-gray-500 font-medium">
            {sl.events.title} · {new Date(sl.events.starts_at).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      )}
      {sl.notes && <p className="text-sm text-gray-500 font-medium mb-6">{sl.notes}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Canciones */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Music2 size={18} />
            <h2 className="font-black text-lg">Canciones</h2>
            <span className="text-sm text-gray-400 font-medium">({songs.length})</span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {songs.length === 0 && (
              <p className="text-sm text-gray-400 font-medium">Sin canciones aún.</p>
            )}
            {songs.map((ss, i) => (
              <Card key={ss.id} className="flex items-center gap-3">
                <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{ss.songs.title}</p>
                  {ss.songs.author && <p className="text-xs text-gray-400">{ss.songs.author}</p>}
                </div>
                <Badge>{ss.key_override ?? ss.songs.key_note ?? '—'}</Badge>
              </Card>
            ))}
          </div>

          <AgregarCancionForm
            setlistId={id}
            songs={songOptions}
            currentCount={songs.length}
            mode="song"
          />
        </div>

        {/* Músicos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} />
            <h2 className="font-black text-lg">Músicos</h2>
            <span className="text-sm text-gray-400 font-medium">({musicians.length})</span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {musicians.length === 0 && (
              <p className="text-sm text-gray-400 font-medium">Sin músicos asignados.</p>
            )}
            {musicians.map(m => (
              <Card key={m.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm">{m.profiles.full_name}</p>
                  {m.instrument && <p className="text-xs text-gray-400 capitalize">{m.instrument}</p>}
                </div>
                <Badge variant={m.confirmed ? 'filled' : 'default'}>
                  {m.confirmed ? 'Confirmado' : 'Pendiente'}
                </Badge>
              </Card>
            ))}
          </div>

          <AgregarCancionForm
            setlistId={id}
            profiles={profileOptions}
            currentMusicians={musicians.map(m => m.profiles.full_name)}
            mode="musician"
          />
        </div>
      </div>
    </div>
  )
}
