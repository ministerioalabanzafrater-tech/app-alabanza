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

export type Measure  = Figure[]   // must sum to exactly 4 beats
export type Exercise = {
  id:         string
  label:      string
  defaultBpm: number
  measures:   Measure[]
}

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
const R   = FIGURE_DEFS['redonda']
const B   = FIGURE_DEFS['blanca']
const N   = FIGURE_DEFS['negra']
const C   = FIGURE_DEFS['corchea']
const SC  = FIGURE_DEFS['semi-corchea']
const CU  = FIGURE_DEFS['corchea-unica']
const SR  = FIGURE_DEFS['silencio-redonda']
const SB  = FIGURE_DEFS['silencio-blanca']
const SN  = FIGURE_DEFS['silencio-negra']
const SC2 = FIGURE_DEFS['silencio-corchea']

export const EXERCISES: Exercise[] = [
  {
    id:         'calentamiento',
    label:      'Calentamiento',
    defaultBpm: 70,
    measures: [
      [R],
      [B, B],
      [N, N, N, N],
      [C, C, C, C],
      [SR],
      [SC, SC, SC, SC],
      [SR],
      [N, SN, N, SN],
      [SN, B, N],
      [B, SB],
      [SB, B],
      [SC, SC, SC, SC],
      [N, C, N, C],
      [SR],
      [N, C, N, C],
      [SR],
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
    id:         'ejercicio-1',
    label:      'Ejercicio 1',
    defaultBpm: 70,
    measures: [
      [R],
      [B, N, N],
      [SC, SC, SC, SC],
      [C, C, B],
      [B, N, N],
      [R],
      [SC, SC, N, N],
      [SC, SC, N, N],
      [N, N, B],
      [SC, N, N, N],
      [N, N, SC, N],
      [SC, SC, SC, SC],
    ],
  },
  {
    id:         'ejercicio-2',
    label:      'Ejercicio 2',
    defaultBpm: 70,
    measures: [
      [SC, SC, N, N],
      [C, N, N, N],
      [SC, SC, N, N],
      [C, N, B],
      [C, N, C, N],
      [C, N, N, N],
      [R],
      [C, B, N],
      [N, C, C, N],
      [B, B],
      [C, C, N, N],
      [N, C, N, C],
    ],
  },
  {
    id:         'ejercicio-3',
    label:      'Ejercicio 3',
    defaultBpm: 70,
    measures: [
      [R],
      [SR],
      [SC, SC, SN, N],
      [N, N, N, SC2, CU],
      [B, SN, N],
      [SC, N, SN, SC],
      [SC, N, N, SC2, CU],
      [N, SN, SC, SC],
      [SN, N, N, N],
      [SC, SC, N, SC2, CU],
      [N, N, SN, SC],
      [N, N, SN, SC],
    ],
  },
  {
    id:         'ejercicio-4',
    label:      'Ejercicio 4',
    defaultBpm: 70,
    measures: [
      [SC, N, N, SC2, CU],
      [N, SC2, CU, SC2, CU, N],
      [SC, N, B],
      [N, SN, SC2, CU, N],
      [SC2, CU, SC, SC2, CU, N],
      [SC2, CU, N, SC2, CU, N],
      [R],
      [SC, SC2, CU, N, SC],
      [SN, N, N, N],
      [B, SC2, CU, N],
      [SC, N, N, SC2, CU],
      [N, SC2, CU, B],
    ],
  },
]

export const BUILDER_PALETTE: FigureType[] = [
  'redonda', 'blanca', 'negra', 'corchea', 'semi-corchea',
  'silencio-redonda', 'silencio-blanca', 'silencio-negra', 'silencio-corchea',
]

if (process.env.NODE_ENV === 'development') {
  EXERCISES.forEach(ex => {
    ex.measures.forEach((m, mi) => {
      const total = measureBeats(m)
      if (Math.abs(total - 4) > 0.001) {
        console.error(`[exercises] ${ex.id} measure ${mi}: expected 4 beats, got ${total}`)
      }
    })
  })
}
