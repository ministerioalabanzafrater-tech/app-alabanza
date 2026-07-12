import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, Cake } from 'lucide-react'
import InstrumentIcon from '@/components/InstrumentIcon'
import type { Profile } from '@/types/database'

function getAge(birthday: string): number {
  const today = new Date()
  const b = new Date(birthday)
  let age = today.getFullYear() - b.getFullYear()
  if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) age--
  return age
}

export default async function EquipoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('active', true)
    .order('full_name')

  const profiles = (data ?? []) as unknown as Profile[]
  const admins = profiles.filter(p => p.role === 'admin')
  const musicians = profiles.filter(p => p.role === 'musician')

  function ProfileCard({ p }: { p: Profile }) {
    const initials = p.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    return (
      <Card className="flex items-start gap-4">
        <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black">{p.full_name}</p>
            {p.role === 'admin' && <Badge variant="filled">Admin</Badge>}
          </div>
          <p className="text-sm text-gray-500 font-medium capitalize flex items-center gap-1">
            <InstrumentIcon instrument={p.instrument} size={15} />
            {p.instrument ?? p.voice ?? 'músico'}
          </p>
          {p.birthday && (
            <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1">
              <Cake size={12} />
              {getAge(p.birthday)} años · {new Date(p.birthday).toLocaleDateString('es-SV', { day: 'numeric', month: 'long' })}
            </p>
          )}
          {p.phone && (
            <a href={`tel:${p.phone}`} className="text-xs font-medium underline">
              {p.phone}
            </a>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-black text-3xl">Equipo</h1>
        <Badge variant="filled">{profiles.length} miembros</Badge>
      </div>

      {profiles.length === 0 ? (
        <Card size="lg" className="text-center py-12">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-400">Sin miembros registrados.</p>
        </Card>
      ) : (
        <>
          {admins.length > 0 && (
            <section className="mb-6">
              <h2 className="font-black text-sm uppercase tracking-wide mb-3 border-b-2 border-black pb-2">Liderazgo</h2>
              <div className="flex flex-col gap-3">
                {admins.map(p => <ProfileCard key={p.id} p={p} />)}
              </div>
            </section>
          )}
          <section>
            <h2 className="font-black text-sm uppercase tracking-wide mb-3 border-b-2 border-black pb-2">
              Músicos ({musicians.length})
            </h2>
            <div className="flex flex-col gap-3">
              {musicians.map(p => <ProfileCard key={p.id} p={p} />)}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
