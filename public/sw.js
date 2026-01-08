// WebTorrent Service Worker for streaming support
importScripts('https://cdn.jsdelivr.net/npm/webtorrent@2.8.5/webtorrent.min.js')

const registeredMagnetUris = []

self.addEventListener('install', () => {
  console.log('[SW] Installing WebTorrent service worker')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating WebTorrent service worker')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Check if this is a request for a WebTorrent file
  const match = url.pathname.match(/^\/webtorrent\/(.*)$/)
  if (!match) return
  
  const [, suffix] = match
  
  event.respondWith(
    (async () => {
      const client = await self.clients.get(event.clientId)
      if (!client) {
        return new Response('Client not found', { status: 404 })
      }
      
      // Forward request to the client page
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data)
        }
        
        client.postMessage(
          {
            type: 'webtorrent',
            url: event.request.url,
            suffix
          },
          [messageChannel.port2]
        )
      })
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'webtorrent-register') {
    const { magnetUri } = event.data
    if (magnetUri && !registeredMagnetUris.includes(magnetUri)) {
      registeredMagnetUris.push(magnetUri)
      console.log('[SW] Registered magnet URI:', magnetUri.substring(0, 50))
    }
  }
})
