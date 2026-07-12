'use client'
import { Logo } from '@/components/ui/Logo'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Supabase recovery links put the token in the URL hash
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.slice(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token') ?? ''
      if (access_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => setReady(true))
        return
      }
    }
    // Ya hay sesión activa (PKCE flow)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setError('Enlace inválido o expirado. Solicita otro correo de recuperación.')
    })
  }, [])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-3" />
          <h1 className="font-black text-2xl text-center leading-tight">Alabanza Frater</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Nueva contraseña</p>
        </div>

        <div className="brutal-card-lg">
          <h2 className="font-black text-xl mb-5">Establecer nueva contraseña</h2>
          {!ready && !error && <p className="text-sm font-medium text-gray-500 mb-4">Verificando enlace...</p>}
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <Input
              id="password"
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Input
              id="confirm"
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error && (
              <p className="text-sm font-bold text-red-600 border-2 border-red-600 px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} disabled={!ready} className="w-full mt-1">
              Guardar contraseña
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
