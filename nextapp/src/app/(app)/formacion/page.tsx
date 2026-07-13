import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Download, Music, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import EscalaArmonica from './EscalaArmonica'

const NOTAS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']
const CIFRADO = [
  { espanol: 'Do', americano: 'C' }, { espanol: 'Re', americano: 'D' },
  { espanol: 'Mi', americano: 'E' }, { espanol: 'Fa', americano: 'F' },
  { espanol: 'Sol', americano: 'G' }, { espanol: 'La', americano: 'A' },
  { espanol: 'Si', americano: 'B' },
]
const ACORDES = [
  { nombre: 'Mayor', formula: '1 - 3 - 5', ejemplo: 'C E G' },
  { nombre: 'Menor', formula: '1 - ♭3 - 5', ejemplo: 'C E♭ G' },
  { nombre: 'Séptima dominante', formula: '1 - 3 - 5 - ♭7', ejemplo: 'C E G B♭' },
  { nombre: 'Mayor 7', formula: '1 - 3 - 5 - 7', ejemplo: 'C E G B' },
  { nombre: 'Menor 7', formula: '1 - ♭3 - 5 - ♭7', ejemplo: 'C E♭ G B♭' },
  { nombre: 'Suspendido 4', formula: '1 - 4 - 5', ejemplo: 'C F G' },
]
const METRICAS = [
  { compas: '4/4', desc: 'Cuatro tiempos. El más común en música contemporánea y gospel.' },
  { compas: '3/4', desc: 'Tres tiempos. Vals. Usado en himnos tradicionales.' },
  { compas: '6/8', desc: 'Seis corcheas. Sensación de dos tiempos compuestos.' },
  { compas: '2/4', desc: 'Dos tiempos. Marcha. Base de muchos coros latinos.' },
]

export default function FormacionPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-black text-3xl mb-2 flex items-center gap-2">
        <GraduationCap size={28} />
        Formación Musical
      </h1>
      <p className="text-gray-500 font-medium mb-8">
        Curso Práctico de Generalidades Musicales — Alabanza Frater Sv.
      </p>

      {/* Grados Musicales */}
      <Link href="/formacion/grados" className="brutal-card-lg flex items-center gap-4 mb-8 hover:shadow-[8px_8px_0px_#000] transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0">
          <Music size={24} className="text-white" />
        </div>
        <div>
          <p className="font-black text-lg">Grados Musicales</p>
          <p className="text-sm text-gray-500 font-medium">Escalas mayores, menores y trivia interactiva</p>
        </div>
        <span className="ml-auto font-black text-xl">→</span>
      </Link>

      {/* Notas musicales */}
      <section className="mb-8">
        <h2 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Escala Diatónica</h2>
        <div className="grid grid-cols-7 gap-2">
          {NOTAS.map((nota, i) => (
            <div key={nota} className="brutal-card flex flex-col items-center py-4">
              <span className="text-2xl font-black">{nota}</span>
              <span className="text-xs font-bold text-gray-400 mt-1">{i + 1}°</span>
            </div>
          ))}
        </div>
      </section>

      {/* Escala armónica */}
      <EscalaArmonica />

      {/* Cifrado americano */}
      <section className="mb-8">
        <h2 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Cifrado Americano</h2>
        <div className="grid grid-cols-7 gap-2">
          {CIFRADO.map(({ espanol, americano }) => (
            <div key={americano} className="brutal-card flex flex-col items-center py-3">
              <span className="text-xl font-black">{americano}</span>
              <span className="text-xs font-bold text-gray-400 mt-1">{espanol}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Acordes */}
      <section className="mb-8">
        <h2 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Tipos de Acordes</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {ACORDES.map(({ nombre, formula, ejemplo }) => (
            <Card key={nombre}>
              <h3 className="font-black text-sm mb-1">{nombre}</h3>
              <p className="text-xs font-bold text-gray-500 mb-1">{formula}</p>
              <p className="text-xs font-medium text-gray-400">Ej: {ejemplo}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Métricas */}
      <section className="mb-8">
        <h2 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Métricas y Compases</h2>
        <div className="flex flex-col gap-3">
          {METRICAS.map(({ compas, desc }) => (
            <Card key={compas} className="flex items-start gap-4">
              <span className="font-black text-2xl shrink-0 w-12 text-center">{compas}</span>
              <p className="text-sm font-medium text-gray-600">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Descarga */}
      <Card size="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Manual completo</CardTitle>
            <CardDescription>Curso Práctico de Generalidades Musicales</CardDescription>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Alabanza Frater Sv · 2022
            </p>
          </div>
          <a
            href="/pdfs/formacion-musical.pdf"
            download="Curso-Generalidades-Musicales-2022.pdf"
            className="brutal-btn flex items-center gap-2 shrink-0"
          >
            <Download size={18} />
            Descargar PDF
          </a>
        </div>
      </Card>
    </div>
  )
}
