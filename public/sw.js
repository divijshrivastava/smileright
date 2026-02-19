self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// A fetch listener keeps the app installable on mobile browsers that require SW fetch handling.
self.addEventListener('fetch', () => {})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { body: event.data.text() }
  }
  const title = data?.title || 'Smile Right Admin'
  const body = data?.body || 'You have a new dashboard update.'
  const tag = data?.tag || 'admin-alert'
  const url = data?.url || '/admin'
  const badgeCount = typeof data?.badgeCount === 'number' ? data.badgeCount : undefined

  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        if (typeof badgeCount !== 'number') return
        if (typeof self.registration?.setAppBadge === 'function') {
          await self.registration.setAppBadge(badgeCount)
        } else if (typeof self.registration?.clearAppBadge === 'function' && badgeCount <= 0) {
          await self.registration.clearAppBadge()
        }
      })
      .catch(() => {})
      .then(() => self.registration.showNotification(title, {
        body,
        tag,
        data: { url },
        badge: '/images/logo.png',
        icon: '/images/logo.png',
        renotify: true,
      }))
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification?.data?.url || '/admin'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }

      return Promise.resolve()
    })
  )
})
