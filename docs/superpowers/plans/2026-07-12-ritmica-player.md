# Rítmica Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/formacion/ritmica` — player interactivo con 5 ejercicios del manual, metrónomo Web Audio, dos sonidos toggleables y constructor de patrones personalizados.

**Architecture:** Server wrapper → client `RitmicaPage` → `useMetronome` hook con lookahead scheduler Web Audio API. Datos de ejercicios en `exercises.ts`. Visual sync vía `setTimeout` disparado al tiempo de audio programado.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Web Audio API (sin librerías externas), Lucide icons.

## Global Constraints

- Sin librerías de audio externas. Solo Web Audio API.
- Sin emojis. Usar Lucide icons.
- Clases brutalist del proyecto: `brutal-card`, `brutal-btn`, `brutal-btn-outline`, `brutal-input`.
- Next.js 16: `params` es `Promise`, usar `await params` en server components.
- Todas las medidas deben sumar exactamente 4 beats (4/4).
- BPM: 40–240, incrementos de 5.
- No Supabase — feature completamente stateless.

---

### Task 1: Tipos y datos de ejercicios

**Files:**
- Create: `nextapp/src/app/(app)/formacion/ritmica/exercises.ts`

**Interfaces:**
- Produces: `FigureType`, `Figure`, `FIGURE_DEFS`, `Measure`, `Exercise`, `EXERCISES`, `BUILDER_PALETTE`, `measureBeats()`

- [ ] **Step 1: Crear `exercises.ts`**

```typescript
// nextapp/src/app/(app)/formacion/ritmica/exercises.ts

export type FigureType =
  | 'redonda' | 'blanca' | 'negra' | 'corchea' | 'semi-corchea'
  | 'corchea-unica'
  | 'silencio-redonda' | 'silencio-blanca' | 'silencio-negra' | 'silencio-corchea'

export type Figure = {
  readonly type:      FigureType
  readonly syllable:  string
  readonly beatsSpan: number
  readonly isSilence: boolean
}

export type Measure  = Figure[]
export type Exercise = { id: string; label: string; defaultBpm: number; measures: Measure[] }

export const FIGURE_DEFS: Record<FigureType, Figure> = {
  'redonda':          { type: 'redonda',          syllable: 'Taaaa',    beatsSpan: 4,   isSilence: false },
  'blanca':           { type: 'blanca',            syllable: 'Taa',      beatsSpan: 2,   isSilence: false },
  'negra':            { type: 'negra',             syllable: 'Ta',       beatsSpan: 1,   isSilence: false },
  'corchea':          { type: 'corchea',           syllable: 'Taka',     beatsSpan: 1,   isSilence: false },
  'semi-corchea':     { type: 'semi-corchea',      syllable: 'Takadimi', beatsSpan: 1,   isSilence: false },
  'corchea-unica':    { type: 'corchea-unica',     syllable: '-ka',      beatsSpan: 0.5, isSilence: false },
  'silencio-redonda': { type: 'silencio-redonda',  syllable: 'mhm',      beatsSpan: 4,   isSilence: true  },
  'silencio-blanca':  { type: 'silencio-blanca',   syllable: 'mhm',      beatsSpan: 2,   isSilence: true  },
  'silencio-negra':   { type: 'silencio-negra',    syllable: 'mhm',      beatsSpan: 1,   isSilence: true  },
  'silencio-corchea': { type: 'silencio-corchea',  syllable: 'Silencio', beatsSpan: 0.5, isSilence: true  },
}

export function measureBeats(m: Measure): number {
  return m.reduce((s, f) => s + f.beatsSpan, 0)
}

// Shortcuts
const R  = FIGURE_DEFS['redonda']
const B  = FIGURE_DEFS['blanca']
const N  = FIGURE_DEFS['negra']
const C  = FIGURE_DEFS['corchea']
const SC = FIGURE_DEFS['semi-corchea']
const CU = FIGURE_DEFS['corchea-unica']
const SR = FIGURE_DEFS['silencio-redonda']
const SB = FIGURE_DEFS['silencio-blanca']
const SN = FIGURE_DEFS['silencio-negra']
const SC2= FIGURE_DEFS['silencio-corchea']

export const EXERCISES: Exercise[] = [
  {
    id: 'calentamiento',
    label: 'Calentamiento',
    defaultBpm: 70,
    measures: [
      // Fila 1: introducción sistemática de figuras
      [R],
      [B, B],
      [N, N, N, N],
      [C, C, C, C],
      // Fila 2: silencios + semicorcheas
      [SR],
      [SC, SC, SC, SC],
      [SR],
      [N, SN, N, SN],
      // Fila 3: mezcla de silencios y figuras
      [SN, B, N],
      [B, SB],
      [SB, B],
      [SC, SC, SC, SC],
      // Fila 4: negra + corchea combinadas
      [N, C, N, C],
      [SR],
      [N, C, N, C],
      [SR],
      // Filas 5-6: síncopa — verificar con PDF p.29
      [SC2, CU, C, SC2, CU, C],
      [SR],
      [SC2, CU, C, SC2, CU, C],
      [SR],
      [C, SC, N, C],
      [SR],
      [N, SC, N, SC],
      [SC, SC, SC, SC],
    ],
  },
  {
    id: 'ejercicio-1',
    label: 'Ejercicio 1',
    defaultBpm: 70,
    measures: [
      // Fila 1 — verificar con PDF p.30
      [R],
      [B, N, N],
      [SC, SC, SC, SC],
      [C, C, B],
      // Fila 2
      [B, N, N],
      [R],
      [SC, SC, N, N],
      [SC, SC, N, N],
      // Fila 3
      [N, N, B],
      [SC, N, N, N],
      [N, N, SC, N],
      [SC, SC, SC, SC],
    ],
  },
  {
    id: 'ejercicio-2',
    label: 'Ejercicio 2',
    defaultBpm: 70,
    measures: [
      // Fila 1 — verificar con PDF p.30
      [SC, SC, N, N],
      [C, N, N, N],
      [SC, SC, N, N],
      [C, N, B],
      // Fila 2
      [C, N, C, N],
      [C, N, N, N],
      [R],
      [C, B, N],
      // Fila 3
      [N, C, C, N],
      [B, B],
      [C, C, N, N],
      [N, C, N, C],
    ],
  },
  {
    id: 'ejercicio-3',
    label: 'Ejercicio 3',
    defaultBpm: 70,
    measures: [
      // Fila 1 — verificar con PDF p.31
      [R],
      [SR],
      [SC, SC, SN, N],
      [N, N, SC2, CU, N],
      // Fila 2
      [B, SN, N],
      [SC, N, SN, SC],
      [SC, N, SC2, CU, N],
      [N, SN, SC, SC],
      // Fila 3
      [SN, N, N, N],
      [SC, SC2, CU, N, N],
      [N, N, SN, SC],
      [N, N, SN, SC],
    ],
  },
  {
    id: 'ejercicio-4',
    label: 'Ejercicio 4',
    defaultBpm: 70,
    measures: [
      // Fila 1 — verificar con PDF p.31
      [SC, N, SC2, CU, N],
      [N, SC2, CU, SC2, CU, N],
      [SC, N, B],
      [N, SN, SC2, CU, N],
      // Fila 2
      [SC2, CU, SC, SC2, CU, N],
      [SC2, CU, N, SC2, CU, N],
      [R],
      [SC, SC2, CU, SC],
      // Fila 3
      [SN, N, N, N],
      [B, SC2, CU, N],
      [SC, N, SC2, CU, N],
      [N, SC2, CU, B],
    ],
  },
]

export const BUILDER_PALETTE: FigureType[] = [
  'redonda', 'blanca', 'negra', 'corchea', 'semi-corchea',
  'silencio-redonda', 'silencio-blanca', 'silencio-negra', 'silencio-corchea',
]
```

- [ ] **Step 2: Verificar que todas las medidas sumen 4 beats**

```bash
node -e "
const { EXERCISES, measureBeats } = require('./nextapp/src/app/(app)/formacion/ritmica/exercises.ts')
// Si hay error de import, verificar manualmente en consola del browser
EXERCISES.forEach(ex => {
  ex.measures.forEach((m, i) => {
    const b = measureBeats(m)
    if (Math.abs(b - 4) > 0.001) console.error(ex.id, 'measure', i, 'sum=', b)
  })
})
console.log('done')
"
```

Si hay errores, ajustar las medidas afectadas hasta que todas sumen 4. Los ejercicios 3 y 4 en particular deben verificarse contra el PDF p.31.

- [ ] **Step 3: Commit**

```bash
git add nextapp/src/app/\(app\)/formacion/ritmica/exercises.ts
git commit -m "feat: add rhythm exercise data types and 5 exercises"
```

---

### Task 2: Hook de metrónomo con Web Audio API

**Files:**
- Create: `nextapp/src/app/(app)/formacion/ritmica/useMetronome.ts`

**Interfaces:**
- Consumes: `Exercise`, `Measure`, `measureBeats` de `exercises.ts`
- Produces: `useMetronome()` → `{ isPlaying, cursor, play, stop }`
  - `cursor: { measureIdx: number; figureIdx: number } | null`
  - `play(exercise, bpm, metroOn, figureOn): void`
  - `stop(): void`

- [ ] **Step 1: Crear `useMetronome.ts`**

```typescript
// nextapp/src/app/(app)/formacion/ritmica/useMetronome.ts
'use client'

import { useRef, useState, useCallback } from 'react'
import type { Exercise } from './exercises'

const LOOKAHEAD_S  = 0.1   // segundos hacia adelante para programar
const INTERVAL_MS  = 25    // intervalo del scheduler

export type Cursor = { measureIdx: number; figureIdx: number } | null

type TimelineEvent =
  | { kind: 'metro';  time: number; accent: boolean }
  | { kind: 'tone';   time: number }
  | { kind: 'visual'; time: number; mi: number; fi: number }

function buildTimeline(exercise: Exercise, bpm: number): TimelineEvent[] {
  const beatDur = 60 / bpm
  const events: TimelineEvent[] = []
  let measureStart = 0

  exercise.measures.forEach((measure, mi) => {
    // Metro clicks independientes: 1 por beat en 4/4
    for (let b = 0; b < 4; b++) {
      events.push({ kind: 'metro', time: measureStart + b * beatDur, accent: b === 0 })
    }
    // Tono y visual por figura
    let figureStart = measureStart
    measure.forEach((figure, fi) => {
      events.push({ kind: 'visual', time: figureStart, mi, fi })
      if (!figure.isSilence) {
        events.push({ kind: 'tone', time: figureStart })
      }
      figureStart += figure.beatsSpan * beatDur
    })
    measureStart += 4 * beatDur
  })

  return events.sort((a, b) => a.time - b.time)
}

function exerciseDuration(exercise: Exercise, bpm: number): number {
  return exercise.measures.length * 4 * (60 / bpm)
}

export function useMetronome() {
  const ctxRef           = useRef<AudioContext | null>(null)
  const schedulerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visualTimersRef  = useRef<ReturnType<typeof setTimeout>[]>([])
  const startTimeRef     = useRef(0)
  const nextEventIdxRef  = useRef(0)
  const timelineRef      = useRef<TimelineEvent[]>([])
  const exerciseRef      = useRef<Exercise | null>(null)
  const bpmRef           = useRef(70)
  const metroOnRef       = useRef(true)
  const figureOnRef      = useRef(true)

  const [isPlaying, setIsPlaying] = useState(false)
  const [cursor,    setCursor]    = useState<Cursor>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }

  function scheduleClick(when: number, accent: boolean) {
    const ctx  = getCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.value = accent ? 1100 : 770
    gain.gain.setValueAtTime(0.3, when)
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.02)
    osc.start(when)
    osc.stop(when + 0.02)
  }

  function scheduleTone(when: number) {
    const ctx  = getCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 440
    gain.gain.setValueAtTime(0.15, when)
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.08)
    osc.start(when)
    osc.stop(when + 0.08)
  }

  function runScheduler() {
    const ctx      = getCtx()
    const timeline = timelineRef.current
    const windowEnd = ctx.currentTime + LOOKAHEAD_S

    while (
      nextEventIdxRef.current < timeline.length &&
      startTimeRef.current + timeline[nextEventIdxRef.current].time < windowEnd
    ) {
      const ev        = timeline[nextEventIdxRef.current]
      const audioTime = startTimeRef.current + ev.time

      if (ev.kind === 'metro' && metroOnRef.current) {
        scheduleClick(audioTime, ev.accent)
      } else if (ev.kind === 'tone' && figureOnRef.current) {
        scheduleTone(audioTime)
      } else if (ev.kind === 'visual') {
        const delayMs = Math.max(0, (audioTime - ctx.currentTime) * 1000)
        const t = setTimeout(() => setCursor({ measureIdx: ev.mi, figureIdx: ev.fi }), delayMs)
        visualTimersRef.current.push(t)
      }

      nextEventIdxRef.current++
    }

    // Loop al terminar el ejercicio
    if (nextEventIdxRef.current >= timeline.length) {
      const dur = exerciseDuration(exerciseRef.current!, bpmRef.current)
      startTimeRef.current += dur
      nextEventIdxRef.current = 0
    }

    schedulerRef.current = setTimeout(runScheduler, INTERVAL_MS)
  }

  const play = useCallback((
    exercise: Exercise,
    bpm: number,
    metroOn: boolean,
    figureOn: boolean,
  ) => {
    // Limpiar estado previo
    if (schedulerRef.current) clearTimeout(schedulerRef.current)
    visualTimersRef.current.forEach(clearTimeout)
    visualTimersRef.current = []

    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()

    exerciseRef.current    = exercise
    bpmRef.current         = bpm
    metroOnRef.current     = metroOn
    figureOnRef.current    = figureOn
    timelineRef.current    = buildTimeline(exercise, bpm)
    startTimeRef.current   = ctx.currentTime + 0.05
    nextEventIdxRef.current = 0

    setIsPlaying(true)
    setCursor({ measureIdx: 0, figureIdx: 0 })
    runScheduler()
  }, [])

  const stop = useCallback(() => {
    if (schedulerRef.current) clearTimeout(schedulerRef.current)
    visualTimersRef.current.forEach(clearTimeout)
    visualTimersRef.current = []
    setIsPlaying(false)
    setCursor(null)
  }, [])

  return { isPlaying, cursor, play, stop }
}
```

- [ ] **Step 2: Verificar compilación TypeScript**

```bash
cd nextapp && npx tsc --noEmit 2>&1 | grep -v node_modules | grep error
```

No debe haber errores.

- [ ] **Step 3: Commit**

```bash
git add nextapp/src/app/\(app\)/formacion/ritmica/useMetronome.ts
git commit -m "feat: add Web Audio metronome hook with lookahead scheduler"
```

---

### Task 3: Server page wrapper

**Files:**
- Create: `nextapp/src/app/(app)/formacion/ritmica/page.tsx`

**Interfaces:**
- Consumes: `RitmicaPage` (Task 4)
- Produces: server component exportable

- [ ] **Step 1: Crear `page.tsx`**

```typescript
// nextapp/src/app/(app)/formacion/ritmica/page.tsx
import RitmicaPage from './RitmicaPage'

export const metadata = { title: 'Figuras y Tiempo' }

export default function Page() {
  return <RitmicaPage />
}
```

- [ ] **Step 2: Commit**

```bash
git add nextapp/src/app/\(app\)/formacion/ritmica/page.tsx
git commit -m "feat: add /formacion/ritmica server page"
```

---

### Task 4: Componente principal RitmicaPage

**Files:**
- Create: `nextapp/src/app/(app)/formacion/ritmica/RitmicaPage.tsx`

**Interfaces:**
- Consumes: `useMetronome` → `{ isPlaying, cursor, play, stop }`
- Consumes: `EXERCISES`, `BUILDER_PALETTE`, `FIGURE_DEFS`, `measureBeats`, `FigureType`, `Figure`, `Measure` de `exercises.ts`

- [ ] **Step 1: Crear `RitmicaPage.tsx`**

```tsx
// nextapp/src/app/(app)/formacion/ritmica/RitmicaPage.tsx
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

// ── Utilidades ─────────────────────────────────────────────────────────────

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

// ── Subcomponente: una figura en la grilla ──────────────────────────────────

function FigureCell({
  figure,
  active,
  inActiveMeasure,
}: {
  figure: Figure
  active: boolean
  inActiveMeasure: boolean
}) {
  const widthClass =
    figure.beatsSpan === 4   ? 'col-span-4' :
    figure.beatsSpan === 2   ? 'col-span-2' :
    figure.beatsSpan === 0.5 ? 'col-span-1' :  // corchea-unica / silencio-corchea: compartir columna
    'col-span-2'  // beatsSpan=1 → col-span-2 en grid de 8 columnas

  return (
    <div
      className={`
        flex flex-col items-center justify-center py-2 px-1 border-2 rounded text-center transition-all
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

// ── Subcomponente: un compás en la grilla ─────────────────────────────────

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
      {/* Grid de 8 columnas: cada beat = 2 cols, cada medio-beat = 1 col */}
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

// ── Componente principal ───────────────────────────────────────────────────

export default function RitmicaPage() {
  const { isPlaying, cursor, play, stop } = useMetronome()

  const [exerciseId, setExerciseId] = useState('calentamiento')
  const [bpm,        setBpm]        = useState(70)
  const [metroOn,    setMetroOn]    = useState(true)
  const [figureOn,   setFigureOn]   = useState(true)
  const [custom,     setCustom]     = useState<Measure[]>([])

  const allExercises: Exercise[] = [...EXERCISES, { ...CUSTOM_TEMPLATE, measures: custom }]
  const currentExercise = allExercises.find(e => e.id === exerciseId) ?? allExercises[0]

  function handlePlay() {
    if (currentExercise.measures.length === 0) return
    play(currentExercise, bpm, metroOn, figureOn)
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

  // ── Custom builder helpers ──────────────────────────────────────────────

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
    if (beats + fig.beatsSpan > 4 + 0.001) return  // no cabe
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

  // ── Render ──────────────────────────────────────────────────────────────

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
            <button onClick={clearCustom} className="text-xs font-bold text-red-600 border border-red-600 px-2 py-1">
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
                  className="p-1 border border-gray-400 text-gray-500 hover:border-red-600 hover:text-red-600 transition-colors text-xs font-bold"
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
              if (isPlaying) { stop(); /* reiniciar con nuevo toggle */ }
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
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd nextapp && npx tsc --noEmit 2>&1 | grep -v node_modules | grep error
```

- [ ] **Step 3: Probar manualmente en browser**

1. Iniciar dev server: abrir `/formacion/ritmica`
2. Verificar que los pills de ejercicio funcionan
3. Click "Reproducir" → confirmar que se escucha click de metrónomo
4. Verificar highlight visual (figura activa → fondo negro)
5. Toggle metrónomo off → silencio del click
6. Toggle figuras off → silencio del tono
7. Cambiar BPM → detiene y al reproducir usa nuevo BPM
8. Ir a "Personalizado" → agregar figuras → reproducir patrón propio

- [ ] **Step 4: Commit**

```bash
git add nextapp/src/app/\(app\)/formacion/ritmica/RitmicaPage.tsx
git commit -m "feat: add RitmicaPage with player, grid display and custom builder"
```

---

### Task 5: Card en Formación + push

**Files:**
- Modify: `nextapp/src/app/(app)/formacion/page.tsx`

**Interfaces:**
- Consumes: `/formacion/ritmica` route (Task 3)

- [ ] **Step 1: Agregar import de `Timer` y card en `formacion/page.tsx`**

Abrir `nextapp/src/app/(app)/formacion/page.tsx`. Cambiar:

```typescript
import { Download, Music, GraduationCap } from 'lucide-react'
```

por:

```typescript
import { Download, Music, GraduationCap, Timer } from 'lucide-react'
```

Agregar después del card de "Grados Musicales" (antes de la sección `{/* Notas musicales */}`):

```tsx
{/* Figuras y Tiempo */}
<Link href="/formacion/ritmica" className="brutal-card-lg flex items-center gap-4 mb-8 hover:shadow-[8px_8px_0px_#000] transition-shadow cursor-pointer">
  <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0">
    <Timer size={24} className="text-white" />
  </div>
  <div>
    <p className="font-black text-lg">Figuras y Tiempo</p>
    <p className="text-sm text-gray-500 font-medium">Metrónomo, ejercicios rítmicos y constructor de patrones</p>
  </div>
  <span className="ml-auto font-black text-xl">→</span>
</Link>
```

- [ ] **Step 2: Verificar TypeScript y compilación**

```bash
cd nextapp && npx tsc --noEmit 2>&1 | grep -v node_modules | grep error
```

- [ ] **Step 3: Probar navegación completa**

1. Ir a `/formacion` → verificar que aparece card "Figuras y Tiempo"
2. Click en card → navega a `/formacion/ritmica`
3. Probar flujo completo: seleccionar ejercicio → ajustar BPM → reproducir → detener

- [ ] **Step 4: Commit y push**

```bash
git add nextapp/src/app/\(app\)/formacion/page.tsx
git commit -m "feat: add Figuras y Tiempo card to Formacion page"
git push origin main
```

---

## Notas de implementación

**Exercises 3 y 4 (síncopa avanzada):** Los compases marcados con `// placeholder — verificar` deben revisarse contra el PDF p.31 y ajustarse. El assertion de development en `measureBeats()` detectará cualquier medida que no sume a 4 beats.

**iOS AudioContext:** El `getCtx()` se crea lazy al primer click de Play, lo que respeta el requisito de iOS de que el AudioContext se cree desde un gesto de usuario.

**Sidebar offset en sticky bar:** La clase `lg:left-64` en la barra de controles asume que el sidebar desktop tiene 256px (w-64). Verificar contra el Sidebar actual.

**Loop:** El ejercicio hace loop automático. Para detener, presionar "Detener".

**BPM mientras suena:** Cambiar BPM mientras el ejercicio está reproduciendo lo detiene automáticamente. El usuario debe presionar Play de nuevo con el nuevo BPM.
