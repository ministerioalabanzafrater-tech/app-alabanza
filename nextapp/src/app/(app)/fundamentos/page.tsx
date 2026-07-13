import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { BookOpen, Heart, Music, BookMarked } from 'lucide-react'
import Link from 'next/link'

const PILLARS = [
  {
    icon: Heart,
    title: 'Adoración como estilo de vida',
    body: 'La adoración no se limita al tiempo de música en el servicio. Es una postura del corazón que reconoce a Dios como supremo en cada área de la vida (Romanos 12:1-2).',
  },
  {
    icon: BookOpen,
    title: 'Fundamento bíblico',
    body: 'Desde los Salmos hasta el Nuevo Testamento, la adoración corporativa es central en la comunidad de fe. Estudiamos las bases que nos dan autoridad para ministrar (Juan 4:23-24).',
  },
  {
    icon: Music,
    title: 'El músico como siervo',
    body: 'El talento musical es un don dado para servir a la congregación y glorificar a Dios, no para exhibirse. La actitud del corazón precede a la habilidad técnica (1 Crónicas 25).',
  },
]

export default function FundamentosPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-black text-3xl mb-2">📖 Fundamentos Bíblicos</h1>
      <p className="text-gray-500 font-medium mb-8">Teología de la adoración para el equipo de Alabanza Frater.</p>

      {/* Intro */}
      <Card size="lg" className="mb-6">
        <h2 className="font-black text-xl mb-3">¿Por qué adoramos?</h2>
        <p className="font-medium text-gray-700 leading-relaxed mb-3">
          La adoración es la respuesta natural del ser humano ante la revelación de Dios. No es un programa ni una estrategia de servicio — es el propósito eterno para el cual fuimos creados (Apocalipsis 4:11).
        </p>
        <p className="font-medium text-gray-700 leading-relaxed">
          Como equipo, somos facilitadores: nuestro rol es crear un ambiente donde la congregación pueda encontrarse genuinamente con Dios. Eso requiere preparación espiritual tanto como preparación técnica.
        </p>
      </Card>

      {/* Pilares */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="w-10 h-10 bg-black flex items-center justify-center mb-3">
              <Icon size={20} className="text-white" />
            </div>
            <h3 className="font-black text-sm mb-2">{title}</h3>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">{body}</p>
          </Card>
        ))}
      </div>

      {/* Plan de Lectura */}
      <Link href="/fundamentos/adoracion" className="brutal-card-lg flex items-center gap-4 hover:shadow-[8px_8px_0px_#000] transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0">
          <BookMarked size={24} className="text-white" />
        </div>
        <div>
          <p className="font-black text-lg">Plan de Lectura</p>
          <p className="text-sm text-gray-500 font-medium">La Adoración · Coalición por el Evangelio · 12 capítulos</p>
        </div>
        <span className="ml-auto font-black text-xl">→</span>
      </Link>
    </div>
  )
}
