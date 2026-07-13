'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Square, Volume2, VolumeX, Music, Minus, Plus } from 'lucide-react'
import { useMetronome } from './useMetronome'
import {
  EXERCISES, BUILDER_PALETTE, FIGURE_DEFS,
  measureBeats,
  type Exercise, type Figure, type FigureType, type Measure,
} from './exercises'

const FIGURE_LABEL: Partial<Record<FigureType, string>> = {
  'redonda':          'Redonda',
  'blanca':           'Blanca',
  'negra':            'Negra',
  'corchea':          'Corchea',
  'semi-corchea':     'Semi-corchea',
  'silencio-redonda': 'Sil. Redonda',
  'silencio-blanca':  'Sil. Blanca',
  'silencio-negra':   'Sil. Negra',
  'silencio-corchea': 'Sil. Corchea',
}

const CUSTOM_TEMPLATE: Exercise = {
  id: 'personalizado',
  label: 'Personalizado',
  defaultBpm: 70,
  measures: [],
}

function FigureCell({
  figure,
  active,
  inActiveMeasure,
}: {
  figure: Figure
  active: boolean
  inActiveMeasure: boolean
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center py-2 px-1 border-2 text-center transition-all
        ${figure.isSilence
          ? active
            ? 'border-dashed border-gray-600 bg-gray-100'
            : 'border-dashed border-gray-300'
          : active
            ? 'border-black bg-black text-white'
            : inActiveMeasure
              ? 'border-gray-800 bg-gray-50'
              : 'border-gray-300'
        }
      `}
    >
      <span className="font-black text-xs leading-tight">{figure.syllable}</span>
      <span className={`text-[9px] font-medium mt-0.5 ${active ? 'text-gray-300' : 'text-gray-400'}`}>
        {figure.type.replace('silencio-', '').replace('-unica', '')}
      </span>
    </div>
  )
}

function MeasureRow({
  measure,
  measureIdx,
  cursor,
}: {
  measure: Measure
  measureIdx: number
  cursor: { measureIdx: number; figureIdx: number } | null
}) {
  const isActive = cursor?.measureIdx === measureIdx

  return (
    <div className={`flex items-center gap-2 p-2 rounded border-2 transition-all ${isActive ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
      <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{measureIdx + 1}</span>
      <div className="grid grid-cols-8 gap-1 flex-1">
        {measure.map((figure, fi) => {
          const spanCols =
            figure.beatsSpan === 4   ? 8 :
            figure.beatsSpan === 2   ? 4 :
            figure.beatsSpan === 1   ? 2 :
            /* 0.5 */                  1

          return (
            <div
              key={fi}
              style={{ gridColumn: `span ${spanCols}` }}
            >
              <FigureCell
                figure={figure}
                active={isActive && cursor?.figureIdx === fi}
                inActiveMeasure={isActive}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RitmicaPage() {
  const { isPlaying, cursor, play, stop } = useMetronome()

  const [exerciseId, setExerciseId] = useState('calentamiento')
  const [bpm,        setBpm]        = useState(70)
  const [metroOn,    setMetroOn]    = useState(true)
  const [figureOn,   setFigureOn]   = useState(true)
  const [custom,     setCustom]     = useState<Measure[]>([])

  const allExercises: Exercise[] = [...EXERCISES, { ...CUSTOM_TEMPLATE, measures: custom }]
  const currentExercise = allExercises.find(e => e.id === exerciseId) ?? allExercises[0]

  async function handlePlay() {
    if (currentExercise.measures.length === 0) return
    await play(currentExercise, bpm, metroOn, figureOn)
  }

  function handleStop() { stop() }

  function changeBpm(delta: number) {
    if (isPlaying) stop()
    setBpm(prev => Math.max(40, Math.min(240, prev + delta)))
  }

  function selectExercise(id: string) {
    if (isPlaying) stop()
    setExerciseId(id)
  }

  const currentMeasureBeats = custom.length > 0
    ? measureBeats(custom[custom.length - 1])
    : 0

  const currentMeasureFull = Math.abs(currentMeasureBeats - 4) < 0.001

  function addFigure(type: FigureType) {
    const fig = FIGURE_DEFS[type]
    if (custom.length === 0) {
      setCustom([[fig]])
      return
    }
    const last = custom[custom.length - 1]
    const beats = measureBeats(last)
    if (beats + fig.beatsSpan > 4 + 0.001) return
    const updated = [...custom]
    updated[updated.length - 1] = [...last, fig]
    setCustom(updated)
  }

  function addMeasure() {
    if (!currentMeasureFull && custom.length > 0) return
    setCustom(prev => [...prev, []])
  }

  function removeMeasure(idx: number) {
    if (isPlaying) stop()
    setCustom(prev => prev.filter((_, i) => i !== idx))
  }

  function clearCustom() {
    if (isPlaying) stop()
    setCustom([])
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/formacion" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-black text-3xl leading-tight">Figuras y Tiempo</h1>
          <p className="text-sm font-medium text-gray-500">Metrónomo · Ejercicios rítmicos · Constructor de patrones</p>
        </div>
      </div>

      {/* Selector de ejercicio */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {allExercises.map(ex => (
          <button
            key={ex.id}
            onClick={() => selectExercise(ex.id)}
            className={`px-4 py-2 font-black text-sm border-2 border-black shrink-0 transition-all ${
              exerciseId === ex.id ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Grilla de ejercicio */}
      {exerciseId !== 'personalizado' && (
        <div className="flex flex-col gap-2 mb-6">
          {currentExercise.measures.map((measure, mi) => (
            <MeasureRow
              key={mi}
              measure={measure}
              measureIdx={mi}
              cursor={cursor}
            />
          ))}
        </div>
      )}

      {/* Constructor personalizado */}
      {exerciseId === 'personalizado' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-base">Constructor de Patrón</h2>
            <button onClick={clearCustom} className="text-xs font-bold text-red-600 border-2 border-red-600 px-2 py-1">
              Limpiar
            </button>
          </div>

          {/* Paleta de figuras */}
          <div className="border-2 border-black p-3 mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Agregar figura</p>
            <div className="flex flex-wrap gap-2">
              {BUILDER_PALETTE.map(type => {
                const fig = FIGURE_DEFS[type]
                const wouldFit = custom.length === 0
                  ? true
                  : currentMeasureFull
                    ? false
                    : currentMeasureBeats + fig.beatsSpan <= 4 + 0.001
                return (
                  <button
                    key={type}
                    onClick={() => addFigure(type)}
                    disabled={!wouldFit}
                    className={`px-3 py-1.5 border-2 text-xs font-black transition-all ${
                      fig.isSilence
                        ? 'border-dashed border-gray-400 hover:bg-gray-100 disabled:opacity-30'
                        : 'border-black hover:bg-black hover:text-white disabled:opacity-30'
                    }`}
                  >
                    <span className="block">{fig.syllable}</span>
                    <span className="text-[9px] font-medium opacity-60">{FIGURE_LABEL[type]}</span>
                  </button>
                )
              })}
            </div>
            {custom.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  Compás actual: {currentMeasureBeats.toFixed(1)} / 4 beats
                </span>
                {currentMeasureFull && (
                  <button
                    onClick={addMeasure}
                    className="text-xs font-bold border-2 border-black px-2 py-0.5 hover:bg-black hover:text-white transition-all"
                  >
                    + Compás
                  </button>
                )}
              </div>
            )}
            {custom.length === 0 && (
              <button
                onClick={addMeasure}
                className="mt-2 text-xs font-bold border-2 border-black px-2 py-0.5 hover:bg-black hover:text-white transition-all"
              >
                + Primer compás
              </button>
            )}
          </div>

          {/* Grilla de compases personalizados */}
          <div className="flex flex-col gap-2">
            {custom.map((measure, mi) => (
              <div key={mi} className="flex items-center gap-2">
                <div className="flex-1">
                  <MeasureRow measure={measure} measureIdx={mi} cursor={cursor} />
                </div>
                <button
                  onClick={() => removeMeasure(mi)}
                  className="p-1 border-2 border-gray-400 text-gray-500 hover:border-red-600 hover:text-red-600 transition-colors text-xs font-bold"
                >
                  x
                </button>
              </div>
            ))}
            {custom.length === 0 && (
              <p className="text-sm font-medium text-gray-400 text-center py-8 border-2 border-dashed border-gray-200">
                Agrega figuras para construir tu patrón
              </p>
            )}
          </div>
        </div>
      )}

      {/* Barra de controles — sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-40 lg:left-64">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* BPM */}
          <div className="flex items-center gap-1 border-2 border-black">
            <button
              onClick={() => changeBpm(-5)}
              className="px-2 py-2 hover:bg-gray-100 transition-colors"
              aria-label="Bajar BPM"
            >
              <Minus size={14} />
            </button>
            <span className="font-black text-sm w-16 text-center">{bpm} BPM</span>
            <button
              onClick={() => changeBpm(5)}
              className="px-2 py-2 hover:bg-gray-100 transition-colors"
              aria-label="Subir BPM"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Play / Stop */}
          <button
            onClick={isPlaying ? handleStop : handlePlay}
            disabled={currentExercise.measures.length === 0}
            className={`flex items-center gap-2 px-5 py-2 border-2 border-black font-black text-sm transition-all disabled:opacity-40 ${
              isPlaying ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
            }`}
          >
            {isPlaying ? <Square size={14} /> : <Play size={14} />}
            {isPlaying ? 'Detener' : 'Reproducir'}
          </button>

          {/* Toggle metrónomo */}
          <button
            onClick={() => {
              setMetroOn(v => !v)
              if (isPlaying) { stop() }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border-2 font-bold text-xs transition-all ${
              metroOn ? 'border-black bg-black text-white' : 'border-gray-400 text-gray-500'
            }`}
          >
            {metroOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            Metrónomo
          </button>

          {/* Toggle figuras */}
          <button
            onClick={() => {
              setFigureOn(v => !v)
              if (isPlaying) stop()
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border-2 font-bold text-xs transition-all ${
              figureOn ? 'border-black bg-black text-white' : 'border-gray-400 text-gray-500'
            }`}
          >
            <Music size={13} />
            Figuras
          </button>
        </div>
      </div>
    </div>
  )
}
