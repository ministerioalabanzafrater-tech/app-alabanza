'use client'

import { useState, useRef } from 'react'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Download, Music, AlertCircle } from 'lucide-react'

const KEY_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

function semitonesToKey(base: string, semitones: number): string {
  const idx = KEY_NOTES.indexOf(base)
  if (idx === -1) return '?'
  return KEY_NOTES[(idx + semitones + 12 * 3) % 12]
}

export default function AudioPage() {
  const [url, setUrl] = useState('')
  const [semitones, setSemitones] = useState(0)
  const [originalKey, setOriginalKey] = useState('C')
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  const targetKey = semitonesToKey(originalKey, semitones)

  async function handleProcess(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAudioUrl(null)

    const res = await fetch('/api/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeUrl: url, semitones }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al procesar el audio')
      return
    }
    setAudioUrl(data.url)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-black text-3xl mb-2">🎚️ Laboratorio de Audio</h1>
      <p className="text-gray-500 font-medium mb-6">Extrae el audio de YouTube y transpónlo a otra tonalidad.</p>

      <Card size="lg" className="mb-6">
        <form onSubmit={handleProcess} className="flex flex-col gap-5">
          <Input
            id="yt-url"
            label="URL de YouTube"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />

          {/* Tonalidad original */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold">Tonalidad original</label>
            <div className="grid grid-cols-6 gap-1.5">
              {KEY_NOTES.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setOriginalKey(k)}
                  className={`py-2 text-sm font-bold border-2 border-black transition-all duration-100 ${
                    originalKey === k
                      ? 'bg-black text-white shadow-none'
                      : 'bg-white hover:shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Semitonos */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold">Semitonos</label>
              <div className="flex items-center gap-2">
                <span className="brutal-badge">{originalKey}</span>
                <span className="font-black">→</span>
                <span className="brutal-badge bg-black text-white">{targetKey}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold w-6">-12</span>
              <input
                type="range"
                min={-12}
                max={12}
                value={semitones}
                onChange={e => setSemitones(Number(e.target.value))}
                className="flex-1 accent-black"
              />
              <span className="text-sm font-bold w-6">+12</span>
            </div>
            <p className="text-center font-black text-xl">
              {semitones > 0 ? `+${semitones}` : semitones} semitonos
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 border-2 border-black bg-white p-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Procesando… puede tardar 1-2 min' : '⚡ Procesar audio'}
          </Button>
        </form>
      </Card>

      {/* Resultado */}
      {audioUrl && (
        <Card size="lg">
          <div className="flex items-center gap-2 mb-4">
            <Music size={20} />
            <CardTitle className="mb-0">Resultado</CardTitle>
          </div>
          <CardDescription className="mb-4">
            Audio transpuesto de <strong>{originalKey}</strong> a <strong>{targetKey}</strong> ({semitones > 0 ? '+' : ''}{semitones} semitonos)
          </CardDescription>
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full border-2 border-black"
          />
          <a
            href={audioUrl}
            download={`audio-${targetKey}.mp3`}
            className="brutal-btn w-full flex items-center justify-center gap-2 mt-4"
          >
            <Download size={18} />
            Descargar MP3
          </a>
        </Card>
      )}
    </div>
  )
}
