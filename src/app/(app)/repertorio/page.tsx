import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, Music2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Song } from '@/types/database'

export default async function RepertorioPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('songs')
    .select('*')
    .eq('active', true)
    .order('title')

  const songs = (data ?? []) as unknown as Song[]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-3xl">Repertorio</h1>
          <p className="text-gray-500 font-medium">{songs.length} canciones en catálogo</p>
        </div>
        <Link href="/repertorio/nueva" className="brutal-btn flex items-center gap-2">
          <Plus size={18} />
          Nueva canción
        </Link>
      </div>

      {songs.length === 0 ? (
        <Card size="lg" className="text-center py-12">
          <Music2 size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-400">Sin canciones aún.</p>
          <p className="text-sm text-gray-400">Agrega la primera al repertorio.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {songs.map(song => (
            <Card key={song.id} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-black truncate">{song.title}</p>
                {song.author && <p className="text-xs text-gray-500 font-medium">{song.author}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {song.key_note && <Badge>{song.key_note}</Badge>}
                {song.bpm && <Badge>{song.bpm} BPM</Badge>}
                {song.youtube_url && (
                  <a
                    href={song.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
                    aria-label="Ver en YouTube"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
