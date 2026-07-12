import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditarEventoForm from './EditarEventoForm'
import type { Event } from '@/types/database'

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase.from('events').select('*').eq('id', id).single()
  if (!data) notFound()

  return <EditarEventoForm event={data as unknown as Event} />
}
