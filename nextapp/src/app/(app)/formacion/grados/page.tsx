'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────
const majorScales: Record<string, string[]> = {
  'C Mayor':  ['C','D','E','F','G','A','B'],
  'G Mayor':  ['G','A','B','C','D','E','F#'],
  'D Mayor':  ['D','E','F#','G','A','B','C#'],
  'A Mayor':  ['A','B','C#','D','E','F#','G#'],
  'E Mayor':  ['E','F#','G#','A','B','C#','D#'],
  'B Mayor':  ['B','C#','D#','E','F#','G#','A#'],
  'F# Mayor': ['F#','G#','A#','B','C#','D#','E#'],
  'Db Mayor': ['Db','Eb','F','Gb','Ab','Bb','C'],
  'Ab Mayor': ['Ab','Bb','C','Db','Eb','F','G'],
  'Eb Mayor': ['Eb','F','G','Ab','Bb','C','D'],
  'Bb Mayor': ['Bb','C','D','Eb','F','G','A'],
  'F Mayor':  ['F','G','A','Bb','C','D','E'],
}

const minorScales: Record<string, string[]> = {
  'A Menor':  ['A','B','C','D','E','F','G'],
  'E Menor':  ['E','F#','G','A','B','C','D'],
  'B Menor':  ['B','C#','D','E','F#','G','A'],
  'F# Menor': ['F#','G#','A','B','C#','D','E'],
  'C# Menor': ['C#','D#','E','F#','G#','A','B'],
  'G# Menor': ['G#','A#','B','C#','D#','E','F#'],
  'D# Menor': ['D#','E#','F#','G#','A#','B','C#'],
  'D Menor':  ['D','E','F','G','A','Bb','C'],
  'G Menor':  ['G','A','Bb','C','D','Eb','F'],
  'C Menor':  ['C','D','Eb','F','G','Ab','Bb'],
  'F Menor':  ['F','G','Ab','Bb','C','Db','Eb'],
  'Bb Menor': ['Bb','C','Db','Eb','F','Gb','Ab'],
}

const ROMAN = ['I','II','III','IV','V','VI','VII']
const MAJOR_QUALITIES = ['Mayor','menor','menor','Mayor','Mayor','menor','dism.']
const MINOR_QUALITIES = ['menor','dism.','Mayor','menor','menor','Mayor','Mayor']
const MINOR_ALTERED   = [2, 5, 6]
const MAJOR_STEPS = ['Raíz','+T','+T','+S','+T','+T','+T']
const MINOR_STEPS = ['Raíz','+T','+S','+T','+T','+S','+T']

const ALL_NOTES = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B','E#','B#','Cb','Fb']

const theoryPool = [
  { q: '¿Cuál es la distancia matemática más pequeña posible entre dos notas musicales?', a: 'Un Semitono', options: ['Un Semitono','Un Tono','Un Sostenido','Un Grado'] },
  { q: '¿A qué equivale exactamente un Tono?', a: 'A la suma de dos semitonos', options: ['A la suma de dos semitonos','A un semitono','A la suma de tres semitonos','A medio semitono'] },
  { q: '¿Qué efecto tiene un Sostenido (#) sobre una nota natural?', a: 'La sube un semitono', options: ['La sube un semitono','La baja un semitono','La sube un tono','La mantiene igual'] },
  { q: '¿Qué efecto tiene un Bemol (b) sobre una nota natural?', a: 'La baja un semitono', options: ['La baja un semitono','La sube un semitono','La baja un tono','Sube la nota a la octava'] },
  { q: '¿Cuál es la estructura matemática para construir una Escala Mayor?', a: 'T - T - S - T - T - T - S', options: ['T - T - S - T - T - T - S','T - S - T - T - S - T - T','S - T - T - T - S - T - T','T - T - T - S - T - T - S'] },
  { q: '¿Cuál es la estructura matemática de una Escala Menor Natural?', a: 'T - S - T - T - S - T - T', options: ['T - S - T - T - S - T - T','T - T - S - T - T - T - S','S - T - S - T - S - T - T','T - T - T - S - T - S - T'] },
]

const qsFundamentos = [
  { q: '¿Cuántos semitonos equivalen a 1 Tono?', options: ['1','2','3','4'], a: '2' },
  { q: '¿Qué hace el # (sostenido) a una nota?', options: ['La sube 1 semitono','La baja 1 semitono','La sube 1 tono','No cambia nada'], a: 'La sube 1 semitono' },
  { q: '¿Qué hace el b (bemol) a una nota?', options: ['La baja 1 semitono','La sube 1 semitono','La baja 1 tono','No cambia nada'], a: 'La baja 1 semitono' },
  { q: '¿Cuál es la fórmula de la Escala Mayor?', options: ['T–T–S–T–T–T–S','T–S–T–T–S–T–T','S–T–T–S–T–T–T','T–T–T–S–T–T–S'], a: 'T–T–S–T–T–T–S' },
  { q: '¿Cuál es la fórmula de la Escala Menor Natural?', options: ['T–S–T–T–S–T–T','T–T–S–T–T–T–S','S–T–T–T–S–T–T','T–T–T–S–T–S–T'], a: 'T–S–T–T–S–T–T' },
  { q: '¿Qué 3 grados de la Escala Mayor bajan para formar la Menor Natural?', options: ['III, VI y VII','II, IV y VI','I, III y V','IV, V y VII'], a: 'III, VI y VII' },
  { q: '¿Cuál es la distancia mínima posible entre dos notas?', options: ['Un semitono','Un tono','Un bemol','Un sostenido'], a: 'Un semitono' },
  { q: 'El paso S entre dos notas equivale a…', options: ['1 semitono','2 semitonos','½ semitono','1 tono'], a: '1 semitono' },
  { q: 'Si partes de C y aplicas +T, ¿qué nota obtienes?', options: ['D','C#','Db','E'], a: 'D' },
  { q: 'Si partes de E y aplicas +S, ¿qué nota obtienes?', options: ['F','F#','Eb','G'], a: 'F' },
]

// ── HELPERS ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomKey(obj: Record<string, unknown>) {
  const keys = Object.keys(obj)
  return keys[Math.floor(Math.random() * keys.length)]
}

function outsiderNote(scaleNotes: string[]) {
  const outside = ALL_NOTES.filter(n => !scaleNotes.includes(n))
  return outside[Math.floor(Math.random() * outside.length)]
}

// ── QUIZ ENGINE ────────────────────────────────────────────────────────────────
interface QuizQ { q: string; options: string[]; a: string; isHtml?: boolean }

function QuizEngine({ questions }: { questions: QuizQ[] }) {
  const [qs]      = useState(() => shuffle(questions))
  const [qi, setQi]          = useState(0)
  const [picked, setPicked]  = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone]      = useState(false)

  function pick(opt: string) {
    if (picked) return
    setPicked(opt)
    if (opt === qs[qi].a) setCorrect(c => c + 1)
  }

  function next() {
    if (qi + 1 >= qs.length) { setDone(true); return }
    setQi(qi + 1); setPicked(null)
  }

  function restart() { setQi(0); setPicked(null); setCorrect(0); setDone(false) }

  const pct = Math.round((qi / qs.length) * 100)

  if (done) {
    const score = Math.round((correct / qs.length) * 100)
    const msg = score === 100 ? 'Dominio perfecto. Puedes avanzar.' :
                score >= 70  ? 'Bien. Repasa lo que fallaste y repite.' :
                               'Revisa la teoría antes de continuar.'
    return (
      <div className="text-center py-4">
        <div className="h-1.5 bg-gray-200 mb-4 rounded"><div className="h-full bg-black rounded w-full" /></div>
        <p className="text-gray-500 text-sm mb-1">Resultado</p>
        <p className="font-black text-5xl mb-1">{correct}/{qs.length}</p>
        <p className="text-gray-500 text-sm mb-6">{msg}</p>
        <button onClick={restart} className="brutal-btn">Reintentar</button>
      </div>
    )
  }

  const q = qs[qi]
  return (
    <div>
      <div className="h-1.5 bg-gray-200 mb-4 rounded overflow-hidden">
        <div className="h-full bg-black rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 font-medium mb-3">{qi + 1} / {qs.length}</p>
      {q.isHtml
        ? <p className="font-semibold text-base mb-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.q }} />
        : <p className="font-semibold text-base mb-5 leading-relaxed">{q.q}</p>
      }
      <div className="grid grid-cols-2 gap-2 max-w-lg mb-4">
        {shuffle(q.options).map(opt => {
          const isCorrect  = opt === q.a
          const isSelected = picked === opt
          const isDone     = picked !== null
          let cls = 'border-2 border-black px-3 py-2.5 font-bold text-sm transition-colors text-left'
          if (isDone) {
            if (isCorrect) cls += ' bg-black text-white'
            else if (isSelected) cls += ' border-red-600 text-red-600'
            else cls += ' opacity-30'
          } else cls += ' hover:bg-black hover:text-white cursor-pointer'
          return (
            <button key={opt} onClick={() => pick(opt)} disabled={!!picked} className={cls}>{opt}</button>
          )
        })}
      </div>
      {picked && (
        <div className="flex flex-col items-start gap-3">
          <p className={`font-bold text-sm ${picked === q.a ? 'text-black' : 'text-red-600'}`}>
            {picked === q.a ? 'Correcto.' : `Incorrecto. Respuesta: ${q.a}`}
          </p>
          <button onClick={next} className="brutal-btn text-sm">
            {qi + 1 >= qs.length ? 'Ver resultado' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── MAYORES QUIZ ─────────────────────────────────────────────────────────────
function MayoresQuiz() {
  const allNotePool = [...new Set(Object.values(majorScales).flat())]
  const qs: QuizQ[] = []
  const used = new Set<string>()
  const scaleNames = Object.keys(majorScales)
  while (qs.length < 8) {
    const sn  = scaleNames[Math.floor(Math.random() * scaleNames.length)]
    const notes = majorScales[sn]
    const idx = 1 + Math.floor(Math.random() * 6)
    const key = `${sn}-${idx}`
    if (used.has(key)) continue
    used.add(key)
    const target     = notes[idx]
    const display    = notes.map((n, i) =>
      i === idx ? `<strong style="background:#f5f5f5;padding:0 6px;border:2px solid #000;border-radius:4px">___</strong>` : n
    ).join(' – ')
    const distractors = shuffle(allNotePool.filter(n => n !== target)).slice(0, 3)
    qs.push({
      q: `Escala de <strong>${sn}</strong> — grado <strong>${ROMAN[idx]}</strong>:<br><code style="font-size:0.95rem;letter-spacing:0.05em;display:block;margin-top:0.5rem">${display}</code>`,
      options: [target, ...distractors], a: target, isHtml: true,
    })
  }
  return <QuizEngine questions={qs} />
}

// ── MENORES CONVERSION ────────────────────────────────────────────────────────
function ConversionMenores() {
  const majorNames = Object.keys(majorScales)
  const [scaleName, setScaleName] = useState(() => majorNames[Math.floor(Math.random() * majorNames.length)])
  const [selected, setSelected]   = useState<Set<number>>(new Set())
  const [checked, setChecked]     = useState(false)

  const majorNotes = majorScales[scaleName]
  const root       = scaleName.split(' ')[0]
  const minorName  = Object.keys(minorScales).find(k => k.startsWith(root + ' '))
  const minorNotes = minorName ? minorScales[minorName] : null
  const allCorrect = MINOR_ALTERED.every(i => selected.has(i))

  function toggle(i: number) {
    if (checked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else if (next.size < 3) next.add(i)
      return next
    })
  }

  function next() { setScaleName(majorNames[Math.floor(Math.random() * majorNames.length)]); setSelected(new Set()); setChecked(false) }

  return (
    <div>
      <p className="text-xs text-gray-400 font-medium mb-1">Ejercicio de conversión</p>
      <p className="font-semibold text-base mb-1 leading-relaxed">
        Selecciona los <strong>3 grados</strong> que bajan un semitono (♭) para convertir{' '}
        <strong>{scaleName}</strong> en Menor Natural.
      </p>
      <p className="text-xs text-gray-400 mb-4">Pista: siempre son los grados III, VI y VII.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {majorNotes.map((note, i) => {
          const isAlt = MINOR_ALTERED.includes(i)
          const isSel = selected.has(i)
          let cls = 'flex flex-col items-center px-3 py-2 border-2 border-black text-sm font-bold min-w-[48px] transition-colors'
          if (checked) {
            if (isAlt)    cls += ' bg-black text-white'
            else if (isSel) cls += ' border-red-600 text-red-600'
          } else {
            cls += isSel ? ' bg-black text-white' : ' hover:bg-gray-100 cursor-pointer'
          }
          return (
            <button key={i} onClick={() => toggle(i)} disabled={checked} className={cls}>
              <span>{checked && isAlt && minorNotes ? minorNotes[i] : note}</span>
              <span className="text-[10px] font-normal opacity-60">{ROMAN[i]}{checked && isAlt ? ' ♭' : ''}</span>
            </button>
          )
        })}
      </div>
      {!checked
        ? <button onClick={() => { if (selected.size === 3) setChecked(true) }} disabled={selected.size < 3} className="brutal-btn text-sm disabled:opacity-40">Verificar</button>
        : (
          <div className="flex flex-col items-start gap-3 mt-2">
            <p className={`font-bold text-sm ${allCorrect ? 'text-black' : 'text-red-600'}`}>
              {allCorrect ? 'Perfecto. Identificaste los 3 grados alterados.' : 'Casi. Los grados que siempre cambian en la Menor Natural son III, VI y VII.'}
            </p>
            <button onClick={next} className="brutal-btn-outline text-sm">Otra escala →</button>
          </div>
        )
      }
    </div>
  )
}

// ── SCALE TABLE ───────────────────────────────────────────────────────────────
function ScaleTable({ db, alteredIdx, qualities, headerSteps }: {
  db: Record<string, string[]>; alteredIdx: number[]; qualities: string[]; headerSteps: string[]
}) {
  return (
    <div className="overflow-x-auto border-2 border-black">
      <table className="w-full border-collapse text-center" style={{ minWidth: 700 }}>
        <thead className="bg-black text-white">
          <tr>
            <th className="p-3 text-left pl-4 text-sm">Tonalidad</th>
            {ROMAN.map((r, i) => (
              <th key={r} className={`p-2 text-sm ${alteredIdx.includes(i) ? 'bg-gray-700' : ''}`}>
                {alteredIdx.includes(i) ? `${r} ♭` : r}
                <span className="block text-[10px] font-normal opacity-60">{headerSteps[i]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(db).map(([name, notes]) => (
            <tr key={name} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3 text-left pl-4 font-black text-sm bg-gray-50 border-r-2 border-black">{name}</td>
              {notes.map((n, i) => (
                <td key={i} className={`p-2 ${alteredIdx.includes(i) ? 'bg-gray-900 text-white' : ''}`}>
                  <span className="block font-bold text-sm">{n}</span>
                  <span className="block text-[10px] opacity-50">{qualities[i]}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── TRIVIA ────────────────────────────────────────────────────────────────────
interface TriviaQ { question: string; answer: string; options: string[]; isHtml?: boolean }

function buildTriviaQ(theoryDeck: number[], recentSet: Set<string>): TriviaQ {
  const roll = Math.random()
  const cat  = roll < 0.2 ? 'theory' : roll < 0.6 ? 'major' : 'minor'

  if (cat === 'theory') {
    if (theoryDeck.length === 0) theoryDeck.push(...shuffle([...Array(theoryPool.length).keys()]))
    const q = theoryPool[theoryDeck.pop()!]
    return { question: q.q, answer: q.a, options: [...q.options] }
  }

  const db = cat === 'major' ? majorScales : minorScales
  let scaleName: string, degreeIndex: number, askNote: boolean, key: string
  let attempts = 0
  do {
    scaleName   = randomKey(db as Record<string, unknown>)
    degreeIndex = Math.floor(Math.random() * 7)
    askNote     = Math.random() > 0.5
    key = `${cat}-${scaleName}-${degreeIndex}-${askNote}`
    attempts++
  } while (recentSet.has(key) && attempts < 30)

  recentSet.add(key)
  const first = recentSet.values().next().value
  if (recentSet.size > 20 && first !== undefined) recentSet.delete(first)

  const notes = db[scaleName]; const target = notes[degreeIndex]; const roman = ROMAN[degreeIndex]

  if (askNote) {
    const opts = [target]
    while (opts.length < 3) { const n = notes[Math.floor(Math.random() * 7)]; if (!opts.includes(n)) opts.push(n) }
    opts.push(outsiderNote(notes))
    return { question: `En la escala de <strong>${scaleName}</strong>,<br>¿Qué nota es el grado <strong>${roman}</strong>?`, answer: target, options: opts, isHtml: true }
  } else {
    const opts = [roman]
    while (opts.length < 4) { const r = ROMAN[Math.floor(Math.random() * 7)]; if (!opts.includes(r)) opts.push(r) }
    return { question: `En la escala de <strong>${scaleName}</strong>,<br>¿Qué grado es la nota <strong>${target}</strong>?`, answer: roman, options: opts, isHtml: true }
  }
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
type Tab = 'fundamentos' | 'mayores' | 'menores' | 'trivia'
type Phase = 'start' | 'playing' | 'gameover'

export default function GradosPage() {
  const [tab, setTab] = useState<Tab>('fundamentos')

  // Trivia state
  const [phase, setPhase]         = useState<Phase>('start')
  const [lives, setLives]         = useState(3)
  const [score, setScore]         = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lastScore, setLastScore] = useState(0)
  const [triviaQ, setTriviaQ]     = useState<TriviaQ | null>(null)
  const [triviaAns, setTriviaAns] = useState<string | null>(null)
  const theoryDeck = useRef<number[]>([])
  const recentSet  = useRef<Set<string>>(new Set())

  const nextQ = useCallback(() => {
    setTriviaQ(buildTriviaQ(theoryDeck.current, recentSet.current))
    setTriviaAns(null)
  }, [])

  function startTrivia() { setScore(0); setLives(3); setPhase('playing'); nextQ() }

  function answerTrivia(opt: string) {
    if (triviaAns || !triviaQ) return
    setTriviaAns(opt)
    if (opt === triviaQ.answer) {
      const ns = score + 10; setScore(ns)
      if (ns > highScore) setHighScore(ns)
    } else {
      const nl = lives - 1; setLives(nl)
      if (nl <= 0) { setLastScore(score); setTimeout(() => setPhase('gameover'), 700) }
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'fundamentos', label: 'Fundamentos Armónicos' },
    { id: 'mayores',     label: 'Escalas Mayores' },
    { id: 'menores',     label: 'Escalas Menores' },
    { id: 'trivia',      label: 'Trivia Interactiva' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/formacion" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-black text-3xl">Grados Musicales</h1>
          <p className="text-gray-500 font-medium text-sm">Entrenamiento auditivo e intelectual interactivo</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-2 border-black p-1 mb-8 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-bold text-sm transition-colors ${tab === t.id ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* FUNDAMENTOS */}
      {tab === 'fundamentos' && (
        <div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="brutal-card-lg">
              <h3 className="font-black text-lg mb-3">Unidades de Medida</h3>
              <p className="text-gray-600 text-sm mb-3">La música occidental se divide matemáticamente en distancias precisas entre las notas.</p>
              <ul className="flex flex-col gap-2 text-sm">
                <li><strong>Semitono (S):</strong> La distancia más pequeña posible — de una tecla blanca a la negra inmediata.</li>
                <li className="mt-1"><strong>Tono (T):</strong> Equivale exactamente a dos semitonos.</li>
              </ul>
            </div>
            <div className="brutal-card-lg">
              <h3 className="font-black text-lg mb-3">Alteraciones</h3>
              <p className="text-gray-600 text-sm mb-3">Símbolos que modifican la altura de una nota para cumplir con las fórmulas de las escalas.</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black w-8">#</span>
                  <span className="text-sm"><strong>Sostenido:</strong> Sube la nota un semitono.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black w-8">b</span>
                  <span className="text-sm"><strong>Bemol:</strong> Baja la nota un semitono.</span>
                </div>
              </div>
            </div>
            <div className="brutal-card-lg md:col-span-2">
              <h3 className="font-black text-lg mb-3">El "Porqué" de las Escalas</h3>
              <p className="text-gray-600 text-sm mb-4">Las escalas no son notas al azar. Son plantillas matemáticas de Tonos y Semitonos que generan un color o emoción específica. Al aplicar estas plantillas desde diferentes notas, los Sostenidos (#) y Bemoles (b) aparecen para respetar la plantilla.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm mb-1">Escala Mayor</p>
                  <p className="text-xs text-gray-400 mb-2">Sonido brillante y "alegre"</p>
                  <div className="bg-gray-100 border-l-4 border-black p-3 font-mono font-bold">T – T – S – T – T – T – S</div>
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">Escala Menor Natural</p>
                  <p className="text-xs text-gray-400 mb-2">Sonido oscuro o melancólico</p>
                  <div className="bg-gray-100 border-l-4 border-black p-3 font-mono font-bold">T – S – T – T – S – T – T</div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Ejercicios</h2>
          <div className="brutal-card-lg"><QuizEngine questions={qsFundamentos} /></div>
        </div>
      )}

      {/* MAYORES */}
      {tab === 'mayores' && (
        <div>
          <div className="brutal-card-lg mb-4">
            <h3 className="font-black text-base mb-3">Construcción de la Escala Mayor</h3>
            <p className="text-sm text-gray-600 mb-3">Partiendo de la raíz (I), cada nota siguiente se obtiene sumando T o S en orden fijo. Esa distancia obliga a usar # o b cuando la nota natural no cae en el lugar correcto.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {ROMAN.map((r, i) => (
                <div key={r} className="flex flex-col items-center border-2 border-black px-2 py-1 text-xs font-bold min-w-[42px] text-center">
                  <span>{r}</span>
                  <span className="text-[9px] font-normal text-gray-400">{MAJOR_STEPS[i]}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 border-l-4 border-black p-3 font-mono font-bold text-sm">T – T – S – T – T – T – S</div>
          </div>
          <ScaleTable db={majorScales} alteredIdx={[]} qualities={MAJOR_QUALITIES} headerSteps={MAJOR_STEPS} />
          <h2 className="font-black text-xl mt-6 mb-4 border-b-2 border-black pb-2">Ejercicios</h2>
          <div className="brutal-card-lg"><MayoresQuiz /></div>
        </div>
      )}

      {/* MENORES */}
      {tab === 'menores' && (
        <div>
          <div className="brutal-card-lg mb-4">
            <h3 className="font-black text-base mb-3">Construcción de la Escala Menor Natural</h3>
            <p className="text-sm text-gray-600 mb-3">La fórmula cambia: el tercer paso es S en vez de T, y los pasos 5 y 7 también son S. Eso obliga a bajar los grados <strong>III, VI y VII</strong> un semitono respecto a la Mayor.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['I','II','III ♭','IV','V','VI ♭','VII ♭'].map((r, i) => (
                <div key={r} className={`flex flex-col items-center border-2 border-black px-2 py-1 text-xs font-bold min-w-[42px] text-center ${MINOR_ALTERED.includes(i) ? 'bg-black text-white' : ''}`}>
                  <span>{r}</span>
                  <span className={`text-[9px] font-normal ${MINOR_ALTERED.includes(i) ? 'text-gray-400' : 'text-gray-400'}`}>{MINOR_STEPS[i]}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 border-l-4 border-black p-3 font-mono font-bold text-sm">T – S – T – T – S – T – T</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="brutal-card">
              <p className="font-bold text-sm mb-1">El III baja un semitono (♭3)</p>
              <p className="text-xs text-gray-500 mb-2">I→III en Mayor es T+T. En menor es T+S, por eso el III queda un semitono abajo.</p>
              <div className="bg-gray-100 border-l-4 border-black p-2 text-xs font-mono">
                C Mayor: C – D – <strong>E</strong> – F – G – A – B<br />
                C Menor: C – D – <strong>Eb</strong> – F – G – Ab – Bb
              </div>
            </div>
            <div className="brutal-card">
              <p className="font-bold text-sm mb-1">El VI y VII también bajan (♭6 · ♭7)</p>
              <p className="text-xs text-gray-500 mb-2">V→VI en menor es S, así VI queda un semitono abajo. VII le sigue desde ese VI bemolizado.</p>
              <div className="bg-gray-100 border-l-4 border-black p-2 text-xs font-mono">
                C Mayor: G – <strong>A</strong> – <strong>B</strong><br />
                C Menor: G – <strong>Ab</strong> – <strong>Bb</strong>
              </div>
            </div>
          </div>
          <ScaleTable db={minorScales} alteredIdx={MINOR_ALTERED} qualities={MINOR_QUALITIES} headerSteps={MINOR_STEPS} />
          <h2 className="font-black text-xl mt-6 mb-4 border-b-2 border-black pb-2">Ejercicios</h2>
          <div className="brutal-card-lg"><ConversionMenores /></div>
        </div>
      )}

      {/* TRIVIA */}
      {tab === 'trivia' && (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <div className="border-2 border-black px-4 py-1.5 font-bold text-sm">Racha: {score}</div>
            <div className="border-2 border-black px-3 py-1.5 font-bold text-sm flex gap-1 items-center">
              {[0,1,2].map(i => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
                  fill={i < lives ? '#e53e3e' : 'none'} stroke="#e53e3e" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
              ))}
            </div>
            <div className="bg-black text-white px-4 py-1.5 font-bold text-sm">Récord: {highScore}</div>
          </div>

          {phase === 'start' && (
            <div className="brutal-card-lg text-center py-8">
              <p className="font-bold text-lg mb-1">Pon a prueba lo que aprendiste</p>
              <p className="text-sm text-gray-500 mb-6">3 vidas · preguntas de escalas y fundamentos</p>
              <button onClick={startTrivia} className="brutal-btn text-base px-8 py-3">Iniciar Trivia</button>
            </div>
          )}

          {phase === 'playing' && triviaQ && (
            <div className="brutal-card-lg">
              {triviaQ.isHtml
                ? <p className="font-black text-xl mb-8 leading-snug" dangerouslySetInnerHTML={{ __html: triviaQ.question }} />
                : <p className="font-black text-xl mb-8 leading-snug">{triviaQ.question}</p>
              }
              <div className="grid grid-cols-2 gap-3 mb-6">
                {shuffle(triviaQ.options).map(opt => {
                  const isCorrect  = opt === triviaQ.answer
                  const isSelected = triviaAns === opt
                  const isDone     = triviaAns !== null
                  let cls = 'border-2 border-black px-4 py-3 font-bold text-sm transition-colors'
                  if (isDone) {
                    if (isCorrect) cls += ' bg-black text-white'
                    else if (isSelected) cls += ' border-red-600 text-red-600'
                    else cls += ' opacity-30'
                  } else cls += ' hover:bg-black hover:text-white cursor-pointer'
                  return (
                    <button key={opt} onClick={() => answerTrivia(opt)} disabled={!!triviaAns} className={cls}>{opt}</button>
                  )
                })}
              </div>
              {triviaAns && phase === 'playing' && (
                <div className="text-center">
                  <p className={`font-black text-lg mb-4 ${triviaAns === triviaQ.answer ? 'text-black' : 'text-red-600'}`}>
                    {triviaAns === triviaQ.answer
                      ? '¡Correcto! Sigue así.'
                      : `Incorrecto. Era: ${triviaQ.answer}.${lives > 0 ? ` Te quedan ${lives} vida${lives === 1 ? '' : 's'}.` : ''}`}
                  </p>
                  {lives > 0 && <button onClick={nextQ} className="brutal-btn">Siguiente pregunta →</button>}
                </div>
              )}
            </div>
          )}

          {phase === 'gameover' && (
            <div className="brutal-card-lg text-center py-8">
              <p className="text-gray-500 font-medium mb-2">Quedaste sin vidas</p>
              <p className="font-black text-6xl mb-1">{lastScore}</p>
              <p className="text-gray-400 text-sm mb-6">puntos</p>
              <div className="flex flex-col items-center gap-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Practiqué teoría musical de escalas y logré ${lastScore} puntos en Alabanza Frater. ¿Puedes superarme?`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 px-5 py-2.5 font-bold text-sm"
                  style={{ borderColor: '#25D366', color: '#25D366' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.112 1.523 5.837L.057 23.985l6.304-1.654A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.554 9.554 0 01-4.87-1.332l-.35-.208-3.615.948.966-3.524-.228-.362A9.555 9.555 0 012.4 12c0-5.297 4.303-9.6 9.6-9.6 5.296 0 9.6 4.303 9.6 9.6 0 5.296-4.304 9.6-9.6 9.6z"/>
                  </svg>
                  Compartir en WhatsApp
                </a>
                <button onClick={() => { setPhase('start'); setScore(0); setLives(3) }} className="brutal-btn">
                  Volver a intentar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
