const CACHE_NAME = 'alabanza-v2'

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
