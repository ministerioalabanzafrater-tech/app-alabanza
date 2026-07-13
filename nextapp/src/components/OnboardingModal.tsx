'use client'

import { useState, useEffect } from 'react'
import {
  X, ChevronLeft, ChevronRight,
  LayoutDashboard, CalendarDays, Music2, ListMusic,
  Users, GraduationCap, BookMarked, Bell,
} from 'lucide-react'

const SLIDES = [
  {
    icon: LayoutDashboard,
    section: 'Bienvenida',
    title: 'Tu app de Alabanza Frater',
    body: 'Todo lo que necesitas para coordinar el equipo de alabanza en un solo lugar. Eventos, canciones, setlists y más.',
  },
  {
    icon: CalendarDays,
    section: 'Eventos',
    title: 'Gestiona cada servicio',
    body: 'Crea servicios, ensayos y retiros. Confirma tu asistencia y mira quién del equipo estará presente.',
  },
  {
    icon: Music2,
    section: 'Repertorio',
    title: 'Canciones con transposición',
    body: 'Abre cualquier canción y usa los botones +/− para subir o bajar la tonalidad. Los acordes en la letra se actualizan en tiempo real.',
  },
  {
    icon: ListMusic,
    section: 'Setlists',
    title: 'Organiza el orden de alabanza',
    body: 'Crea setlists vinculados a un evento. Agrega canciones, define el orden y añade notas para el equipo.',
  },
  {
    icon: Users,
    section: 'Equipo',
    title: 'Directorio del ministerio',
    body: 'Consulta los integrantes del equipo, sus instrumentos y roles. Recibirás avisos de cumpleaños próximos.',
  },
  {
    icon: GraduationCap,
    section: 'Formación Musical',
    title: 'Aprende teoría musical',
    body: 'Escalas, cifrado americano, tipos de acordes y la herramienta de escala armónica para identificar los acordes de cualquier tonalidad.',
  },
  {
    icon: BookMarked,
    section: 'Fundamentos',
    title: 'Plan de lectura',
    body: 'Lee "La Adoración" capítulo a capítulo. Suscríbete a recordatorios diarios y avanza a tu ritmo hasta completar los 12 capítulos.',
  },
  {
    icon: Bell,
    section: 'Notificaciones',
    title: 'Mantente al día',
    body: 'La campanita muestra eventos próximos y cumpleaños del equipo. Activa las notificaciones push para no perderte nada.',
  },
] as const

const STORAGE_KEY = 'onboarding_v1_seen'

export function useOnboarding() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  return { open, setOpen, dismiss }
}

export default function OnboardingModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState(0)

  if (!open) return null

  const slide = SLIDES[step]
  const Icon  = slide.icon
  const isLast = step === SLIDES.length - 1

  function next() {
    if (isLast) { onClose(); setStep(0) }
    else setStep(s => s + 1)
  }

  function prev() { if (step > 0) setStep(s => s - 1) }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col">

        {/* Header */}
        <div className="bg-black text-white flex items-center justify-between px-5 py-3">
          <span className="text-xs font-black uppercase tracking-wider">{slide.section}</span>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center text-center px-8 py-10 flex-1">
          <div className="w-16 h-16 bg-black flex items-center justify-center mb-6">
            <Icon size={32} className="text-white" />
          </div>
          <h2 className="font-black text-2xl leading-tight mb-3">{slide.title}</h2>
          <p className="text-sm font-medium text-gray-600 leading-relaxed">{slide.body}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${
                i === step ? 'w-5 h-2 bg-black' : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="flex border-t-2 border-black">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex-1 flex items-center justify-center gap-1 py-3 font-black text-sm border-r-2 border-black hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-1 py-3 font-black text-sm bg-black text-white hover:opacity-80 transition-opacity"
          >
            {isLast ? 'Comenzar' : 'Siguiente'} {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
