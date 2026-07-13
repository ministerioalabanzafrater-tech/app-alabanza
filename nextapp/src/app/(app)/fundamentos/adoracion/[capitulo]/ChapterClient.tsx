'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Chapter } from '@/lib/chapters'

export default function ChapterClient({
  chapter, isRead, hasNext, userId,
}: {
  chapter: Chapter
  isRead: boolean
  hasNext: boolean
  userId: string
}) {
  const router = useRouter()
  const [read,    setRead]    = useState(isRead)
  const [saving,  setSaving]  = useState(false)

  async function markRead() {
    if (read) return
    setSaving(true)
    const supabase = createClient()
    await (supabase.from('reading_progress') as any).upsert(
      { user_id: userId, chapter_index: chapter.index },
      { onConflict: 'user_id,chapter_index' }
    )
    setRead(true)
    setSaving(false)
    router.refresh()
  }

  const pdfUrl = `/libros/la-adoracion.pdf#page=${chapter.page}`

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/fundamentos/adoracion"
          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shrink-0 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{chapter.label}</span>
            {chapter.part && <Badge>{chapter.part}</Badge>}
          </div>
          <h1 className="font-black text-2xl leading-tight">{chapter.title}</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">{chapter.author}</p>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-4">
        <p className="text-sm font-medium leading-relaxed text-gray-600">{chapter.desc}</p>
      </Card>

      {/* Read button */}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="brutal-btn flex items-center gap-2 w-full justify-center mb-3"
      >
        <BookOpen size={16} />
        Abrir capítulo en PDF
      </a>

      {/* Mark as read */}
      {!read ? (
        <button
          onClick={markRead}
          disabled={saving}
          className="brutal-btn-outline flex items-center gap-2 w-full justify-center mb-6"
        >
          {saving
            ? <Loader2 size={16} className="animate-spin" />
            : <CheckCircle2 size={16} />}
          Ya lo leí — marcar como leído
        </button>
      ) : (
        <div className="flex items-center gap-2 justify-center mb-6 p-3 border-2 border-black bg-black text-white font-bold text-sm">
          <CheckCircle2 size={16} />
          Capítulo completado
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {chapter.index > 0 && (
          <Link
            href={`/fundamentos/adoracion/${chapter.index - 1}`}
            className="brutal-btn-outline flex-1 text-center text-sm"
          >
            ← Anterior
          </Link>
        )}
        {hasNext && read && (
          <Link
            href={`/fundamentos/adoracion/${chapter.index + 1}`}
            className="brutal-btn flex items-center gap-1 justify-center flex-1 text-sm"
          >
            Siguiente <ChevronRight size={15} />
          </Link>
        )}
        {!hasNext && read && (
          <Link href="/fundamentos/adoracion" className="brutal-btn flex-1 text-center text-sm">
            Ver plan completo
          </Link>
        )}
      </div>
    </div>
  )
}
