'use client'
import { Logo } from '@/components/ui/Logo'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegistroPage() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, apellido, full_name: `${nombre} ${apellido}` },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-sm brutal-card-lg text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="font-black text-xl mb-2">Revisa tu correo</h2>
          <p className="text-gray-600 text-sm">
            Enviamos un enlace de confirmación a <strong>{email}</strong>. Confirma tu cuenta para iniciar sesión.
          </p>
          <Link href="/login" className="brutal-btn block mt-6 text-center">
            Ir al login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-3" />
          <h1 className="font-black text-2xl text-center leading-tight">Alabanza Frater</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Crear cuenta</p>
        </div>

        <div className="brutal-card-lg">
          <h2 className="font-black text-xl mb-5">Registro</h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Input
                id="nombre"
                label="Nombre"
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                autoComplete="given-name"
              />
              <Input
                id="apellido"
                label="Apellido"
                type="text"
                placeholder="Pérez"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
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
            <Input
              id="password"
              label="Contraseña"
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
            <Button type="submit" loading={loading} className="w-full mt-1">
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-medium mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-black underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
