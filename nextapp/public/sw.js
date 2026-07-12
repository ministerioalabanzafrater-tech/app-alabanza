const CACHE_NAME = 'alabanza-v3'

// Rutas a pre-cachear en instalación
const PRECACHE_URLS = [
  '/offline',
  '/manifest.json',
]

// Rutas que NUNCA cachear (API, auth, storage)
const NEVER_CACHE = [
  '/api/',
  'supabase.co',
  'replicate.com',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // Skip non-GET y rutas excluidas
  if (request.method !== 'GET') return
  if (NEVER_CACHE.some((pattern) => url.includes(pattern))) return
  if (!url.startsWith('http')) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          // Solo cachear respuestas válidas de mismo origen o estáticos
          if (
            response.ok &&
            (response.type === 'basic' || response.type === 'cors')
          ) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          // Offline fallback para navegación
          if (request.mode === 'navigate') {
            return caches.match('/offline') || new Response('Sin conexión', {
              headers: { 'Content-Type': 'text/plain' },
            })
          }
        })
    })
  )
})

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload = { title: 'Alabanza Frater', body: '', url: '/' }
  try { payload = { ...payload, ...event.data.json() } } catch { payload.body = event.data.text() }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
