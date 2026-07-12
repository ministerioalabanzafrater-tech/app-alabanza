import { createClient } from '@/lib/supabase/server'
import PerfilForm from './PerfilForm'
import type { Profile } from '@/types/database'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as unknown as Profile | null

  return <PerfilForm profile={profile} userId={user.id} />
}
