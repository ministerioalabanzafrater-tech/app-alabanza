'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer
}

export default function PushSubscribePrompt() {
  const [state, setState] = useState<'idle' | 'prompt' | 'subscribed' | 'denied' | 'unsupported'>('idle')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported'); return
    }
    const perm = Notification.permission
    if (perm === 'denied') { setState('denied'); return }
    if (perm === 'granted') { setState('subscribed'); return }
    // Show prompt after 3 seconds on first visit
    const seen = localStorage.getItem('push_prompt_seen')
    if (seen) return
    const t = setTimeout(() => setState('prompt'), 3000)
    return () => clearTimeout(t)
  }, [])

  async function subscribe() {
    setState('subscribed')
    localStorage.setItem('push_prompt_seen', '1')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
    } catch {
      setState('denied')
    }
  }

  function dismiss() {
    setState('idle')
    localStorage.setItem('push_prompt_seen', '1')
  }

  if (state !== 'prompt') return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm border-2 border-black rounded-2xl bg-white shadow-[6px_6px_0px_#000] p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shrink-0">
          <Bell size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm mb-0.5">Activar notificaciones</p>
          <p className="text-xs text-gray-500 mb-3">Recibe avisos de ensayos, servicios y cumpleaños del equipo.</p>
          <div className="flex gap-2">
            <button onClick={subscribe} className="brutal-btn text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Bell size={12} /> Activar
            </button>
            <button onClick={dismiss} className="brutal-btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5">
              <BellOff size={12} /> Ahora no
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-black transition-colors shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
