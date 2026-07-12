'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
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
          <h2 className="font-black text-xl mb-2">Correo enviado</h2>
          <p className="text-gray-600 text-sm">
            Enviamos un enlace a <strong>{email}</strong> para restablecer tu contraseña.
          </p>
          <Link href="/login" className="brutal-btn block mt-6 text-center">
            Volver al login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 relative mb-3">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <h1 className="font-black text-2xl text-center leading-tight">Alabanza Frater</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Recuperar contraseña</p>
        </div>

        <div className="brutal-card-lg">
          <h2 className="font-black text-xl mb-2">¿Olvidaste tu contraseña?</h2>
          <p className="text-sm text-gray-500 mb-5">
            Ingresa tu correo y te enviamos un enlace para restablecerla.
          </p>
          <form onSubmit={handleRecover} className="flex flex-col gap-4">
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
            {error && (
              <p className="text-sm font-bold text-red-600 border-2 border-red-600 px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full mt-1">
              Enviar enlace
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-medium mt-4">
          <Link href="/login" className="font-black underline">
            ← Volver al login
          </Link>
        </p>
      </div>
    </main>
  )
}
