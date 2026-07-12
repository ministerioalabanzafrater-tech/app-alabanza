'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

const theoryQuestions = [
  { q: '¿Cuál es la distancia matemática más pequeña posible entre dos notas musicales?', a: 'Un Semitono', options: ['Un Semitono','Un Tono','Un Sostenido','Un Grado'] },
  { q: '¿A qué equivale exactamente un Tono?', a: 'A la suma de dos semitonos', options: ['A la suma de dos semitonos','A un semitono','A la suma de tres semitonos','A medio semitono'] },
  { q: '¿Qué efecto tiene un Sostenido (#) sobre una nota natural?', a: 'La sube un semitono', options: ['La sube un semitono','La baja un semitono','La sube un tono','La mantiene igual'] },
  { q: '¿Qué efecto tiene un Bemol (b) sobre una nota natural?', a: 'La baja un semitono', options: ['La baja un semitono','La sube un semitono','La baja un tono','Sube la nota a la octava'] },
  { q: '¿Cuál es la estructura matemática de una Escala Mayor?', a: 'T - T - S - T - T - T - S', options: ['T - T - S - T - T - T - S','T - S - T - T - S - T - T','S - T - T - T - S - T - T','T - T - T - S - T - T - S'] },
  { q: '¿Cuál es la estructura matemática de una Escala Menor Natural?', a: 'T - S - T - T - S - T - T', options: ['T - S - T - T - S - T - T','T - T - S - T - T - T - S','S - T - S - T - S - T - T','T - T - T - S - T - S - T'] },
]

const ROMAN = ['I','II','III','IV','V','VI','VII']

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

function generateQuestion() {
  const cat = ['fundamental','major','minor'][Math.floor(Math.random() * 3)]
  if (cat === 'fundamental') {
    const q = theoryQuestions[Math.floor(Math.random() * theoryQuestions.length)]
    return { question: q.q, answer: q.a, options: shuffle(q.options) }
  }
  const db = cat === 'major' ? majorScales : minorScales
  const scaleName = randomKey(db)
  const notes = db[scaleName]
  const idx = Math.floor(Math.random() * 7)
  const askNote = Math.random() > 0.5
  if (askNote) {
    const answer = notes[idx]
    const opts = [answer]
    while (opts.length < 4) { const n = notes[Math.floor(Math.random() * 7)]; if (!opts.includes(n)) opts.push(n) }
    return { question: `En la escala de "${scaleName}", ¿qué nota es el grado ${ROMAN[idx]}?`, answer, options: shuffle(opts) }
  } else {
    const answer = ROMAN[idx]
    const opts = [answer]
    while (opts.length < 4) { const n = ROMAN[Math.floor(Math.random() * 7)]; if (!opts.includes(n)) opts.push(n) }
    return { question: `En la escala de "${scaleName}", ¿qué grado es la nota ${notes[idx]}?`, answer, options: shuffle(opts) }
  }
}

type Tab = 'fundamentos' | 'mayores' | 'menores' | 'trivia'

export default function GradosPage() {
  const [tab, setTab] = useState<Tab>('fundamentos')
  const [trivia, setTrivia] = useState(() => generateQuestion())
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lastScore, setLastScore] = useState(0)

  function nextQuestion() {
    setTrivia(generateQuestion())
    setSelected(null)
  }

  function handleAnswer(opt: string) {
    if (selected) return
    setSelected(opt)
    if (opt === trivia.answer) {
      const ns = score + 10
      setScore(ns)
      if (ns > highScore) setHighScore(ns)
    } else {
      setLastScore(score)
      setScore(0)
    }
  }

  const scaleTable = (db: Record<string, string[]>) => (
    <div className="overflow-x-auto border-2 border-black">
      <table className="w-full border-collapse text-center" style={{ minWidth: 640 }}>
        <thead className="bg-black text-white">
          <tr>
            <th className="p-3 text-left pl-5">Tonalidad</th>
            {ROMAN.map(r => <th key={r} className="p-3">{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.entries(db).map(([name, notes]) => (
            <tr key={name} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3 text-left pl-5 font-black bg-gray-50 border-r-2 border-black">{name}</td>
              {notes.map((n, i) => <td key={i} className="p-3 font-medium">{n}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'fundamentos', label: 'Fundamentos' },
    { id: 'mayores', label: 'Escalas Mayores' },
    { id: 'menores', label: 'Escalas Menores' },
    { id: 'trivia', label: '🎯 Trivia' },
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-2 border-black p-1 mb-8 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-bold text-sm transition-colors ${tab === t.id ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Fundamentos */}
      {tab === 'fundamentos' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="brutal-card-lg">
            <h3 className="font-black text-lg mb-3">Unidades de Medida</h3>
            <p className="text-gray-600 text-sm mb-4">La música occidental se divide en distancias precisas entre notas.</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li><strong>Semitono (S):</strong> La distancia más pequeña posible — de una tecla blanca a la negra inmediata.</li>
              <li className="mt-2"><strong>Tono (T):</strong> Equivale exactamente a dos semitonos.</li>
            </ul>
          </div>
          <div className="brutal-card-lg">
            <h3 className="font-black text-lg mb-3">Alteraciones</h3>
            <p className="text-gray-600 text-sm mb-4">Símbolos que modifican la altura de una nota.</p>
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
            <h3 className="font-black text-lg mb-4">Estructura de las Escalas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-sm mb-1">Escala Mayor</p>
                <p className="text-xs text-gray-500 mb-2">Sonido brillante y "alegre"</p>
                <div className="bg-gray-100 border-l-4 border-black p-3 font-mono font-bold">T - T - S - T - T - T - S</div>
              </div>
              <div>
                <p className="font-bold text-sm mb-1">Escala Menor Natural</p>
                <p className="text-xs text-gray-500 mb-2">Sonido oscuro o melancólico</p>
                <div className="bg-gray-100 border-l-4 border-black p-3 font-mono font-bold">T - S - T - T - S - T - T</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mayores */}
      {tab === 'mayores' && (
        <div>
          <h2 className="font-black text-xl mb-4">Escalas Mayores</h2>
          {scaleTable(majorScales)}
        </div>
      )}

      {/* Menores */}
      {tab === 'menores' && (
        <div>
          <h2 className="font-black text-xl mb-4">Escalas Menores Naturales</h2>
          {scaleTable(minorScales)}
        </div>
      )}

      {/* Trivia */}
      {tab === 'trivia' && (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <div className="border-2 border-black px-4 py-1.5 font-bold text-sm">Racha: {score}</div>
            <div className="bg-black text-white px-4 py-1.5 font-bold text-sm">Récord: {highScore}</div>
          </div>

          <div className="brutal-card-lg text-center mb-4">
            <p className="font-black text-xl mb-8 leading-snug">{trivia.question}</p>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-6">
              {trivia.options.map(opt => {
                const isSelected = selected === opt
                const isCorrect = opt === trivia.answer
                const done = selected !== null
                let cls = 'border-2 border-black px-4 py-3 font-bold text-sm transition-colors cursor-pointer'
                if (done) {
                  if (isCorrect) cls += ' bg-black text-white'
                  else if (isSelected) cls += ' border-red-600 text-red-600'
                  else cls += ' opacity-30'
                } else {
                  cls += ' hover:bg-black hover:text-white'
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={done} className={cls}>
                    {opt}
                  </button>
                )
              })}
            </div>

            {selected && (
              <div className="mb-4">
                {selected === trivia.answer
                  ? <p className="font-black text-lg">¡Correcto! 🎯</p>
                  : <p className="font-black text-lg text-red-600">Incorrecto. Era: <span className="text-black">{trivia.answer}</span></p>
                }
              </div>
            )}

            {selected && (
              <button onClick={nextQuestion} className="brutal-btn">
                {selected === trivia.answer ? 'Siguiente →' : 'Volver a intentar ↻'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
