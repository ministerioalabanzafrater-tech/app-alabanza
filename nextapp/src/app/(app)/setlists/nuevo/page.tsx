import { createClient } from '@/lib/supabase/server'
import NuevoSetlistForm from './NuevoSetlistForm'
import type { Event } from '@/types/database'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NuevoSetlistPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('id, title, starts_at, type')
    .gte('starts_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('starts_at')

  const events = (data ?? []) as unknown as Event[]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/setlists" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-black text-3xl">Nuevo setlist</h1>
      </div>
      <NuevoSetlistForm events={events} />
    </div>
  )
}
