import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, ListMusic } from 'lucide-react'
import Link from 'next/link'
import type { Setlist } from '@/types/database'

export default async function SetlistsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('setlists')
    .select('*, events(title, starts_at, type)')
    .order('created_at', { ascending: false })

  const setlists = (data ?? []) as unknown as (Setlist & {
    events: { title: string; starts_at: string; type: string } | null
  })[]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-3xl">Setlists</h1>
          <p className="text-gray-500 font-medium">{setlists.length} setlists creados</p>
        </div>
        <Link href="/setlists/nuevo" className="brutal-btn flex items-center gap-2">
          <Plus size={18} />
          Nuevo setlist
        </Link>
      </div>

      {setlists.length === 0 ? (
        <Card size="lg" className="text-center py-12">
          <ListMusic size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-400">Sin setlists aún.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {setlists.map(sl => (
            <Link key={sl.id} href={`/setlists/${sl.id}`}>
              <Card className="hover:shadow-[8px_8px_0px_#000] transition-shadow duration-100 cursor-pointer h-full">
                <p className="font-black text-lg mb-1">{sl.title}</p>
                {sl.events && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={sl.events.type === 'servicio' ? 'filled' : 'default'}>
                      {sl.events.type}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(sl.events.starts_at).toLocaleDateString('es-SV', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {sl.notes && <p className="text-xs text-gray-400 font-medium line-clamp-2">{sl.notes}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
