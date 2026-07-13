// nextapp/src/app/(app)/formacion/ritmica/useMetronome.ts
'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { Exercise } from './exercises'

const LOOKAHEAD_S  = 0.1
const INTERVAL_MS  = 25
const FADE_OUT_S   = 0.05  // fade-out al final de cada figura

export type Cursor = { measureIdx: number; figureIdx: number } | null

type TimelineEvent =
  | { kind: 'metro';  time: number; accent: boolean }
  | { kind: 'tone';   time: number; duration: number }
  | { kind: 'visual'; time: number; mi: number; fi: number }

function buildTimeline(exercise: Exercise, bpm: number): TimelineEvent[] {
  const beatDur = 60 / bpm
  const events: TimelineEvent[] = []
  let measureStart = 0

  exercise.measures.forEach((measure, mi) => {
    for (let b = 0; b < 4; b++) {
      events.push({ kind: 'metro', time: measureStart + b * beatDur, accent: b === 0 })
    }
    let figureStart = measureStart
    measure.forEach((figure, fi) => {
      events.push({ kind: 'visual', time: figureStart, mi, fi })
      if (!figure.isSilence) {
        events.push({ kind: 'tone', time: figureStart, duration: figure.beatsSpan * beatDur })
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
  const ctxRef          = useRef<AudioContext | null>(null)
  const schedulerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visualTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const startTimeRef    = useRef(0)
  const nextEventIdxRef = useRef(0)
  const timelineRef     = useRef<TimelineEvent[]>([])
  const exerciseRef     = useRef<Exercise | null>(null)
  const bpmRef          = useRef(70)
  const metroOnRef      = useRef(true)
  const figureOnRef     = useRef(true)
  const metroVolRef     = useRef(0.5)
  const figureVolRef    = useRef(0.8)

  const [isPlaying, setIsPlaying] = useState(false)
  const [cursor,    setCursor]    = useState<Cursor>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }

  function scheduleClick(when: number, accent: boolean) {
    const ctx  = getCtx()
    const vol  = metroVolRef.current
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.value = accent ? 1100 : 770
    gain.gain.setValueAtTime(vol, when)
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.02)
    osc.start(when)
    osc.stop(when + 0.02)
  }

  function scheduleTone(when: number, duration: number) {
    const ctx      = getCtx()
    const vol      = figureVolRef.current
    const osc      = ctx.createOscillator()
    const gain     = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 440
    const fadeStart = Math.max(when, when + duration - FADE_OUT_S)
    gain.gain.setValueAtTime(vol, when)
    gain.gain.setValueAtTime(vol, fadeStart)
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration)
    osc.start(when)
    osc.stop(when + duration)
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
        scheduleTone(audioTime, ev.duration)
      } else if (ev.kind === 'visual') {
        const delayMs = Math.max(0, (audioTime - ctx.currentTime) * 1000)
        const t = setTimeout(() => setCursor({ measureIdx: ev.mi, figureIdx: ev.fi }), delayMs)
        visualTimersRef.current.push(t)
      }

      nextEventIdxRef.current++
    }

    if (nextEventIdxRef.current >= timeline.length) {
      const dur = exerciseDuration(exerciseRef.current!, bpmRef.current)
      startTimeRef.current += dur
      nextEventIdxRef.current = 0
    }

    schedulerRef.current = setTimeout(runScheduler, INTERVAL_MS)
  }

  const play = useCallback(async (
    exercise: Exercise,
    bpm: number,
    metroOn: boolean,
    figureOn: boolean,
  ) => {
    if (schedulerRef.current) clearTimeout(schedulerRef.current)
    visualTimersRef.current.forEach(clearTimeout)
    visualTimersRef.current = []

    const ctx = getCtx()
    if (ctx.state === 'suspended') await ctx.resume()

    exerciseRef.current     = exercise
    bpmRef.current          = bpm
    metroOnRef.current      = metroOn
    figureOnRef.current     = figureOn
    timelineRef.current     = buildTimeline(exercise, bpm)
    startTimeRef.current    = ctx.currentTime + 0.05
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

  const setMetroVolume  = useCallback((v: number) => { metroVolRef.current  = Math.max(0, Math.min(1, v)) }, [])
  const setFigureVolume = useCallback((v: number) => { figureVolRef.current = Math.max(0, Math.min(1, v)) }, [])

  useEffect(() => {
    return () => {
      stop()
      ctxRef.current?.close()
    }
  }, [stop])

  return { isPlaying, cursor, play, stop, setMetroVolume, setFigureVolume }
}
