'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mb-3" />
          <h1 className="font-black text-2xl text-center leading-tight">Alabanza Frater</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Panel de gestión musical</p>
        </div>

        {/* Form */}
        <div className="brutal-card-lg">
          <h2 className="font-black text-xl mb-5">Iniciar sesión</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="flex flex-col gap-1">
              <Input
                id="password"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Link href="/recuperar" className="text-xs font-bold underline text-right">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {error && (
              <p className="text-sm font-bold text-red-600 border-2 border-red-600 px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full mt-1">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-medium mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="font-black underline">
            Regístrate
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 font-medium mt-6">
          Alabanza Frater © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
