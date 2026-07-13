import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditarCancionPage from './EditarCancionPage'
import type { Song } from '@/types/database'

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('songs').select('*').eq('id', id).single()
  if (!data) notFound()
  return <EditarCancionPage song={data as unknown as Song} />
}
