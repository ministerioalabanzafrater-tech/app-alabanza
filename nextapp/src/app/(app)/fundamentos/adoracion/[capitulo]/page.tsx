import { createClient } from '@/lib/supabase/server'
import { CHAPTERS } from '@/lib/chapters'
import { notFound, redirect } from 'next/navigation'
import ChapterClient from './ChapterClient'

export default async function ChapterPage({ params }: { params: Promise<{ capitulo: string }> }) {
  const { capitulo } = await params
  const idx = parseInt(capitulo)
  if (isNaN(idx) || idx < 0 || idx >= CHAPTERS.length) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const chapter = CHAPTERS[idx]

  // Check progress
  const { data: progressData } = await (supabase.from('reading_progress') as any)
    .select('chapter_index')
    .eq('user_id', user.id)
  const readSet = new Set<number>((progressData ?? []).map((p: any) => p.chapter_index))

  // Enforce sequential access
  if (idx > 0 && !readSet.has(idx - 1)) redirect('/fundamentos/adoracion')

  const isRead = readSet.has(idx)
  const hasNext = idx < CHAPTERS.length - 1

  return (
    <ChapterClient
      chapter={chapter}
      isRead={isRead}
      hasNext={hasNext}
      userId={user.id}
    />
  )
}
