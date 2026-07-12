'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Music2, ExternalLink, Play, Pause, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Song } from '@/types/database'

// ── Transposition ────────────────────────────────────────────────────────────

const SHARP   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT    = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
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

function fmtTime(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2,'0')}`
}

// ── Component ────────────────────────────────────────────────────────────────

type AudioState = 'idle' | 'loading' | 'ready' | 'playing' | 'error'

const CACHE_NAME = 'alabanza-audio-v1'

export default function CancionDetail({ song }: { song: Song }) {
  const [offset, setOffset] = useState(0)

  // Audio
  const [audioState, setAudioState] = useState<AudioState>('idle')
  const [audioError, setAudioError] = useState('')
  const [duration,   setDuration]   = useState(0)
  const [elapsed,    setElapsed]    = useState(0)
  const ctxRef    = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const srcRef    = useRef<AudioBufferSourceNode | null>(null)
  const pausedAt  = useRef(0)
  const startedAt = useRef(0)
  const fileRef   = useRef<HTMLInputElement | null>(null)

  const cacheKey = `/audio/${song.id}`

  // Real-time detune while playing
  useEffect(() => {
    if (srcRef.current && audioState === 'playing') {
      srcRef.current.detune.value = offset * 100
    }
  }, [offset, audioState])

  // Elapsed timer
  useEffect(() => {
    if (audioState !== 'playing') return
    const id = setInterval(() => {
      if (ctxRef.current) setElapsed(ctxRef.current.currentTime - startedAt.current)
    }, 500)
    return () => clearInterval(id)
  }, [audioState])

  const decodeAndReady = useCallback(async (ab: ArrayBuffer) => {
    const buffer = await ctxRef.current!.decodeAudioData(ab)
    bufferRef.current = buffer
    setDuration(buffer.duration)
    setAudioState('ready')
  }, [])

  async function loadFromYouTube() {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    setAudioError('')
    setAudioState('loading')

    try {
      // 1. Check local cache first
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(cacheKey)
      if (cached) {
        const ab = await cached.arrayBuffer()
        return await decodeAndReady(ab)
      }

      // 2. Get signed CDN URL from server
      const meta = await fetch(`/api/audio/extract?url=${encodeURIComponent(song.youtube_url!)}`)
      if (!meta.ok) {
        const { error } = await meta.json().catch(() => ({ error: `HTTP ${meta.status}` }))
        throw new Error(error)
      }
      const { audioUrl, mimeType } = await meta.json()

      // 3. Client fetches directly from YouTube CDN (avoids server IP block)
      const res = await fetch(audioUrl)
      if (!res.ok) throw new Error(`CDN HTTP ${res.status}`)

      const ab = await res.arrayBuffer()

      // 4. Store in device cache
      await cache.put(cacheKey, new Response(ab.slice(0), { headers: { 'Content-Type': mimeType } }))

      await decodeAndReady(ab)
    } catch (e: any) {
      console.error('[loadFromYouTube]', e)
      setAudioError(e?.message ?? 'Error desconocido')
      setAudioState('error')
    }
  }

  async function loadFromFile(file: File) {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    setAudioError('')
    setAudioState('loading')

    try {
      const ab = await file.arrayBuffer()
      // Store in device cache for next time
      const cache = await caches.open(CACHE_NAME)
      await cache.put(cacheKey, new Response(ab.slice(0), { headers: { 'Content-Type': file.type || 'audio/mpeg' } }))
      await decodeAndReady(ab)
    } catch (e: any) {
      console.error('[loadFromFile]', e)
      setAudioError(e?.message ?? 'Error al leer archivo')
      setAudioState('error')
    }
  }

  function play(from: number) {
    const ctx = ctxRef.current
    const buf = bufferRef.current
    if (!ctx || !buf) return
    if (ctx.state === 'suspended') ctx.resume()

    const src = ctx.createBufferSource()
    src.buffer       = buf
    src.detune.value = offset * 100
    src.connect(ctx.destination)
    src.start(0, from)

    srcRef.current    = src
    startedAt.current = ctx.currentTime - from
    setElapsed(from)
    setAudioState('playing')

    src.onended = () => {
      if (srcRef.current === src) {
        pausedAt.current = 0
        setElapsed(0)
        setAudioState('ready')
      }
    }
  }

  function handlePlay()  { play(pausedAt.current) }

  function handlePause() {
    if (!ctxRef.current || !srcRef.current) return
    pausedAt.current = ctxRef.current.currentTime - startedAt.current
    srcRef.current.onended = null
    srcRef.current.stop()
    setAudioState('ready')
  }

  async function deleteAudio() {
    srcRef.current?.stop()
    srcRef.current = null
    bufferRef.current = null
    pausedAt.current = 0
    setElapsed(0)
    const cache = await caches.open(CACHE_NAME)
    await cache.delete(cacheKey)
    setAudioState('idle')
  }

  const effectiveKey = song.key_note ? shiftNote(song.key_note, offset) : null
  const offsetLabel  = offset > 0 ? `+${offset}` : `${offset}`

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

      {/* Key transposition widget */}
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

      {/* Audio player */}
      {/* Audio player — shown when there's a YouTube URL or always (file picker) */}
      <Card className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Reproducción</p>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) loadFromFile(f); e.target.value = '' }}
        />

        {audioState === 'idle' && (
          <div className="flex flex-col gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="brutal-btn flex items-center gap-2 w-full justify-center">
              <FolderOpen size={15} /> Cargar archivo de audio
            </button>
            <p className="text-xs text-gray-400 text-center">
              MP3, M4A, OGG u otro formato de audio
            </p>
          </div>
        )}

        {audioState === 'loading' && (
          <div className="flex items-center gap-2 justify-center py-1 text-sm font-bold text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Cargando audio…
          </div>
        )}

        {audioState === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2">
              {audioError || 'Error al leer el archivo'}
            </p>
            <button onClick={() => fileRef.current?.click()} className="brutal-btn flex items-center gap-2 justify-center">
              <FolderOpen size={14} /> Cargar otro archivo
            </button>
          </div>
        )}

        {(audioState === 'ready' || audioState === 'playing') && (
          <div className="flex items-center gap-3">
            {audioState === 'playing' ? (
              <button onClick={handlePause}
                className="w-11 h-11 bg-black text-white flex items-center justify-center border-2 border-black hover:bg-gray-800 transition-colors shrink-0">
                <Pause size={18} />
              </button>
            ) : (
              <button onClick={handlePlay}
                className="w-11 h-11 bg-black text-white flex items-center justify-center border-2 border-black hover:bg-gray-800 transition-colors shrink-0">
                <Play size={18} />
              </button>
            )}

            <div className="flex-1 min-w-0">
              <div className="h-1.5 bg-gray-200 w-full">
                <div
                  className="h-full bg-black transition-all"
                  style={{ width: duration ? `${Math.min((elapsed / duration) * 100, 100)}%` : '0%' }}
                />
              </div>
              <p className="text-xs font-mono text-gray-400 mt-1">
                {fmtTime(elapsed)} / {fmtTime(duration)}
                {offset !== 0 && <span className="ml-2 font-bold text-black">{effectiveKey}</span>}
              </p>
            </div>

            <button onClick={deleteAudio}
              className="p-2 text-gray-300 hover:text-red-600 transition-colors shrink-0"
              title="Borrar audio del dispositivo">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </Card>

      {/* Lyrics */}
      {song.lyrics && (
        <div className="mb-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
            <Music2 size={13} /> Letra
          </h2>
          <Card>
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {song.lyrics.split('\n').map((line, i) => {
                const chord   = isChordLine(line)
                const text    = chord && offset !== 0 ? shiftLine(line, offset) : line
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
