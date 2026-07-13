import { createClient } from '@/lib/supabase/server'
import { CHAPTERS, PARTS } from '@/lib/chapters'
import { Card } from '@/components/ui/Card'
import { BookOpen, CheckCircle2, Lock, ChevronRight, BookMarked } from 'lucide-react'
import Link from 'next/link'
import ReminderToggle from './ReminderToggle'

export default async function AdoracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: progressData }, { data: subData }] = await Promise.all([
    (supabase.from('reading_progress') as any).select('chapter_index').eq('user_id', user!.id),
    (supabase.from('reading_subscriptions') as any).select('reminder_time, active').eq('user_id', user!.id).maybeSingle(),
  ])

  const readSet = new Set<number>((progressData ?? []).map((p: any) => p.chapter_index))
  const totalRead = readSet.size
  const progress = Math.round((totalRead / CHAPTERS.length) * 100)

  // A chapter is accessible if it's the first or the previous one is read
  function isAccessible(idx: number) {
    if (idx === 0) return true
    return readSet.has(idx - 1)
  }

  const nextIdx = CHAPTERS.find(c => !readSet.has(c.index))?.index ?? null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BookMarked size={20} />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Plan de lectura</span>
          </div>
          <h1 className="font-black text-3xl leading-tight">La Adoración</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Fabio Rossi (ed.) · Coalición por el Evangelio
          </p>
        </div>
        <a
          href="/libros/la-adoracion.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shrink-0 mt-1"
          title="Abrir PDF completo"
        >
          <BookOpen size={18} />
        </a>
      </div>

      {/* Progress bar */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Progreso</span>
          <span className="font-black text-sm">{totalRead} / {CHAPTERS.length} capítulos</span>
        </div>
        <div className="h-3 bg-gray-100 border-2 border-black">
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {totalRead === CHAPTERS.length && (
          <p className="text-xs font-bold text-green-600 mt-2 text-center">
            ¡Completado! Bien hecho.
          </p>
        )}
      </Card>

      {/* Chapters grouped by part */}
      {/* Prefacio first */}
      {(() => {
        const ch = CHAPTERS[0]
        const read = readSet.has(0)
        const accessible = isAccessible(0)
        const isCurrent = nextIdx === 0
        return (
          <div className="mb-6">
            <ChapterRow chapter={ch} read={read} accessible={accessible} isCurrent={isCurrent} />
          </div>
        )
      })()}

      {PARTS.map(part => {
        const partChapters = CHAPTERS.filter(c => c.part === part)
        return (
          <div key={part} className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b-2 border-black pb-2">
              {part}
            </h2>
            <div className="flex flex-col gap-2">
              {partChapters.map(ch => (
                <ChapterRow
                  key={ch.index}
                  chapter={ch}
                  read={readSet.has(ch.index)}
                  accessible={isAccessible(ch.index)}
                  isCurrent={nextIdx === ch.index}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Reminder */}
      <ReminderToggle
        userId={user!.id}
        initial={subData ? { time: subData.reminder_time, active: subData.active } : null}
      />
    </div>
  )
}

function ChapterRow({
  chapter, read, accessible, isCurrent,
}: {
  chapter: typeof CHAPTERS[0]
  read: boolean
  accessible: boolean
  isCurrent: boolean
}) {
  const content = (
    <div className={`flex items-center gap-3 p-3 border-2 transition-all ${
      read        ? 'border-black bg-black text-white'
      : isCurrent ? 'border-black bg-white'
      : accessible ? 'border-black bg-white hover:shadow-[4px_4px_0px_#000]'
      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
    }`}>
      <div className="shrink-0">
        {read ? (
          <CheckCircle2 size={20} className="text-white" />
        ) : accessible ? (
          <div className={`w-5 h-5 border-2 rounded-full ${isCurrent ? 'border-black bg-black' : 'border-gray-400'}`} />
        ) : (
          <Lock size={16} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-widest ${read ? 'text-white/60' : 'text-gray-400'}`}>
          {chapter.label}
        </p>
        <p className="font-black text-sm leading-tight truncate">{chapter.title}</p>
        <p className={`text-xs font-medium ${read ? 'text-white/70' : 'text-gray-400'}`}>{chapter.author}</p>
      </div>
      {accessible && !read && <ChevronRight size={16} className="shrink-0 text-gray-400" />}
      {isCurrent && !read && (
        <span className="text-xs font-black bg-black text-white px-2 py-0.5 shrink-0">HOY</span>
      )}
    </div>
  )

  if (!accessible) return <div key={chapter.index}>{content}</div>

  return (
    <Link href={`/fundamentos/adoracion/${chapter.index}`}>
      {content}
    </Link>
  )
}
