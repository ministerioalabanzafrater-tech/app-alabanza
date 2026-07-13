'use client'

import { useState } from 'react'

const CHROMATIC = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const ENHARMONIC: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }

const MAJOR_STEPS  = [0, 2, 4, 5, 7, 9, 11]
const MINOR_STEPS  = [0, 2, 3, 5, 7, 8, 10]
const MAJOR_CHORDS = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] as const
const MINOR_CHORDS = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'] as const
const ROMAN        = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

type Quality = 'maj' | 'min' | 'dim'

function noteAt(root: string, semitones: number): string {
  const rootIdx = CHROMATIC.indexOf(root)
  return CHROMATIC[((rootIdx + semitones) % 12 + 12) % 12]
}

function chordName(note: string, quality: Quality): string {
  if (quality === 'maj') return note
  if (quality === 'min') return `${note}m`
  return `${note}°`
}

const QUALITY_STYLE: Record<Quality, string> = {
  maj: 'bg-black text-white',
  min: 'border-2 border-black',
  dim: 'border-2 border-gray-400 text-gray-500',
}

export default function EscalaArmonica() {
  const [root, setRoot]   = useState('C')
  const [mode, setMode]   = useState<'mayor' | 'menor'>('mayor')

  const steps  = mode === 'mayor' ? MAJOR_STEPS  : MINOR_STEPS
  const quals  = mode === 'mayor' ? MAJOR_CHORDS : MINOR_CHORDS
  const notes  = steps.map(s => noteAt(root, s))
  const chords = notes.map((n, i) => ({ roman: ROMAN[i], note: n, quality: quals[i] as Quality }))

  return (
    <section className="mb-8">
      <h2 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Escala Armónica</h2>
      <p className="text-sm font-medium text-gray-500 mb-4">
        Selecciona una tónica y modo para ver los grados y acordes de la escala.
      </p>

      {/* Tónica */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tónica</p>
        <div className="grid grid-cols-6 gap-2">
          {CHROMATIC.map(note => (
            <button
              key={note}
              onClick={() => setRoot(note)}
              className={`brutal-card py-3 text-center font-black text-sm transition-all ${
                root === note
                  ? 'bg-black text-white shadow-[3px_3px_0px_#555]'
                  : 'hover:shadow-[3px_3px_0px_#000]'
              }`}
            >
              {note}
              {ENHARMONIC[note] && (
                <span className="block text-[9px] font-medium opacity-50">{ENHARMONIC[note]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modo */}
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Modo</p>
        <div className="flex gap-2">
          {(['mayor', 'menor'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 font-black text-sm border-2 border-black transition-all capitalize ${
                mode === m ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div className="border-4 border-black p-4 shadow-[4px_4px_0px_#000]">
        <p className="font-black text-base mb-4">
          Escala de{' '}
          <span className="underline underline-offset-4">{root} {mode}</span>
        </p>

        {/* Notas */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notas</p>
          <div className="flex gap-2 flex-wrap">
            {notes.map((n, i) => (
              <span key={i} className="px-3 py-1 border-2 border-black font-black text-sm">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Acordes */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Acordes</p>
          <div className="grid grid-cols-7 gap-1.5">
            {chords.map(({ roman, note, quality }) => (
              <div key={roman} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400">{roman}</span>
                <div className={`w-full py-2 text-center font-black text-xs rounded ${QUALITY_STYLE[quality]}`}>
                  {chordName(note, quality)}
                </div>
                <span className="text-[9px] font-medium text-gray-400 capitalize">{quality}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="inline-block w-3 h-3 bg-black rounded-sm" /> Mayor
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="inline-block w-3 h-3 border-2 border-black rounded-sm" /> Menor
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="inline-block w-3 h-3 border-2 border-gray-400 rounded-sm" /> Disminuido
          </span>
        </div>
      </div>
    </section>
  )
}
