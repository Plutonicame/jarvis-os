// ═══════════════════════════════════════════════════
// sw.js — Jarvis OS Service Worker v2
// ═══════════════════════════════════════════════════
const CACHE_NAME = 'jarvis-os-v2'
const ASSETS = [
  '/jarvis-os/',
  '/jarvis-os/index.html',
  '/jarvis-os/manifest.json',
  '/jarvis-os/icon-192.png',
  '/jarvis-os/icon-512.png'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Toujours servir index.html pour les URLs de navigation
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('/jarvis-os/index.html')
      )
    )
    return
  }

  // Réseau d'abord, cache en fallback pour les assets
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp.ok) {
          const clone = resp.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone))
        }
        return resp
      })
      .catch(() => caches.match(e.request))
  )
})
