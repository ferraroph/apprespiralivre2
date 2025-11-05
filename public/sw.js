// Service Worker for asset caching
// Version: 1.0.0

const CACHE_VERSION = 'respira-livre-v1';
const CACHE_NAME = `${CACHE_VERSION}-assets`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/placeholder.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old cache versions
              return cacheName.startsWith('respira-livre-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip API requests (Supabase, etc.)
  if (url.pathname.startsWith('/api') || 
      url.hostname.includes('supabase') ||
      url.hostname.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache static assets (JS, CSS, images, fonts)
            if (shouldCache(url)) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('[Service Worker] Caching new resource:', request.url);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // Return offline page if available
            return caches.match('/index.html');
          });
      })
  );
});

// Helper function to determine if a resource should be cached
function shouldCache(url) {
  const pathname = url.pathname;
  
  // Cache JavaScript files
  if (pathname.endsWith('.js') || pathname.endsWith('.mjs')) {
    return true;
  }
  
  // Cache CSS files
  if (pathname.endsWith('.css')) {
    return true;
  }
  
  // Cache images
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    return true;
  }
  
  // Cache fonts
  if (pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    return true;
  }
  
  // Cache HTML files
  if (pathname.endsWith('.html') || pathname === '/') {
    return true;
  }
  
  return false;
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// ========================================
// PUSH NOTIFICATIONS - CROSS-PLATFORM
// iOS 16.4+, Android, Windows, Mac
// ========================================

// PUSH EVENT - Recebe notificações do servidor
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'Respira Livre',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'respira-livre-notification',
    requireInteraction: false,
    data: {}
  };

  // Parse notification data
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] Push data:', data);
      
      // Web Push format
      if (data.title) {
        notificationData.title = data.title;
        notificationData.body = data.body || notificationData.body;
        notificationData.icon = data.icon || notificationData.icon;
        notificationData.data = data.data || data;
      }
      // Plain text
      else if (typeof data === 'string') {
        notificationData.body = data;
      }
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  // Options para notificação nativa
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  // CRÍTICO: showNotification faz a notificação aparecer na barra do sistema
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => console.log('[SW] Notification displayed'))
      .catch((error) => console.error('[SW] Error showing notification:', error))
  );
});

// NOTIFICATION CLICK - Abre o app quando clicar
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// PUSH SUBSCRIPTION CHANGE - Mantém subscription atualizada
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.registration.pushManager.applicationServerKey
    })
    .then((subscription) => {
      console.log('[SW] New subscription:', subscription);
      return fetch('/api/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    })
    .catch((error) => console.error('[SW] Error renewing subscription:', error))
  );
});
