// ═══════════════════════════════════════════════════
// sw.js — Jarvis OS Service Worker
// ═══════════════════════════════════════════════════
const CACHE_NAME = 'jarvis-os-v1'
const ASSETS = [
  '/index.html',
  '/auth.js',
  '/db.js',
  '/manifest.json'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
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
  // Réseau d'abord, cache en fallback
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
