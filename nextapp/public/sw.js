const CACHE_NAME = 'alabanza-v4'
const STATIC_CACHE = 'alabanza-static-v4'

const PRECACHE_URLS = [
  '/offline',
  '/manifest.json',
]

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
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  if (request.method !== 'GET') return
  if (NEVER_CACHE.some((p) => url.includes(p))) return
  if (!url.startsWith('http')) return

  // Next.js hashed static bundles → cache-first (inmutables)
  if (url.includes('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone())
            return res
          })
        })
      )
    )
    return
  }

  // HTML / navegación → network-first, fallback caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached ?? caches.match('/offline') ?? new Response('Sin conexión', {
              headers: { 'Content-Type': 'text/plain' },
            })
          )
        )
    )
    return
  }

  // Resto → network-first, fallback caché
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
        }
        return res
      })
      .catch(() => caches.match(request))
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
