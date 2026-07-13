'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Music2, ExternalLink, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Song } from '@/types/database'

// ── Transposition ────────────────────────────────────────────────────────────

const SHARP    = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT     = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
const FLAT_IDX = new Set([1,3,6,8,10])

const TO_IDX: Record<string,number> = {
  C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,
  'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11,
}

function shiftNote(note: string, semitones: number): string {
  const i = TO_IDX[note]
  if (i === undefined) return note
  const j = ((i + semitones) % 12 + 12) % 12
  return FLAT_IDX.has(j) ? FLAT[j] : SHARP[j]
}

const CHORD_RE = /\b([A-G][b#]?)((?:maj|min|aug|dim|sus[24]?|add\d+|[Mm]?7|m|M|6|9|11|13)*)(\/[A-G][b#]?)?\b/g

function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  const origLen = trimmed.replace(/\s/g,'').length
  if (!origLen) return false
  const remaining = trimmed
    .replace(new RegExp(CHORD_RE.source,'g'), '')
    .replace(/[\s\-|/\\()|,.:]+/g,'')
    .length
  return remaining / origLen < 0.25
}

function shiftLine(line: string, semitones: number): string {
  return line.replace(new RegExp(CHORD_RE.source,'g'), (_,root:string,quality:string,bass:string) =>
    shiftNote(root, semitones) + (quality ?? '') + (bass ? '/' + shiftNote(bass.slice(1), semitones) : '')
  )
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CancionDetail({ song }: { song: Song }) {
  const [offset, setOffset] = useState(0)

  const effectiveKey = song.key_note ? shiftNote(song.key_note, offset) : null
  const offsetLabel  = offset > 0 ? `+${offset}` : `${offset}`
  const videoId      = song.youtube_url ? extractVideoId(song.youtube_url) : null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/repertorio" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shrink-0 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-3xl leading-tight">{song.title}</h1>
          {song.author && <p className="text-gray-500 font-medium text-sm mt-0.5">{song.author}</p>}
        </div>
        <Link href={`/repertorio/${song.id}/editar`}
          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shrink-0 mt-1"
          aria-label="Editar canción">
          <Pencil size={18} />
        </Link>
      </div>

      {/* Meta */}
      {(song.genre || song.bpm || song.youtube_url) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {song.genre && <Badge>{song.genre}</Badge>}
          {song.bpm   && <Badge>{song.bpm} BPM</Badge>}
          {song.youtube_url && (
            <a href={song.youtube_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors">
              <ExternalLink size={12} /> YouTube
            </a>
          )}
        </div>
      )}

      {/* YouTube player */}
      {videoId && (
        <div className="mb-6 border-4 border-black shadow-[4px_4px_0px_#000]">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={song.title}
            />
          </div>
        </div>
      )}

      {/* Key transposition */}
      {song.key_note && (
        <Card className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tonalidad</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <p className="text-xs text-gray-400 font-medium leading-none mb-1">Original</p>
                <p className="font-black text-3xl leading-none">{song.key_note}</p>
              </div>
              {offset !== 0 && (
                <>
                  <span className="text-gray-300 font-black text-xl">→</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium leading-none mb-1">{offsetLabel} sem.</p>
                    <p className="font-black text-3xl leading-none">{effectiveKey}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setOffset(o => o - 1)}
                className="w-10 h-10 border-2 border-black font-black text-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center">
                −
              </button>
              {offset !== 0 && (
                <button onClick={() => setOffset(0)}
                  className="text-xs font-bold border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors">
                  Reset
                </button>
              )}
              <button onClick={() => setOffset(o => o + 1)}
                className="w-10 h-10 border-2 border-black font-black text-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center">
                +
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Lyrics */}
      {song.lyrics && (
        <div className="mb-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
            <Music2 size={13} /> Letra
          </h2>
          <Card>
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {song.lyrics.split('\n').map((line, i) => {
                const chord = isChordLine(line)
                const text  = chord && offset !== 0 ? shiftLine(line, offset) : line
                return (
                  <span key={i} className={chord ? 'font-bold text-blue-600 dark:text-blue-400' : ''}>
                    {text}{'\n'}
                  </span>
                )
              })}
            </pre>
          </Card>
        </div>
      )}

      {/* Notes */}
      {song.notes && (
        <Card>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notas internas</p>
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{song.notes}</p>
        </Card>
      )}
    </div>
  )
}
