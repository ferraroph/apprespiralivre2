// Firebase Cloud Messaging Service Worker
// This service worker handles background push notifications

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
// Note: These values should match your Firebase project configuration
// They will be replaced at runtime or configured via environment
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Customize notification
  const notificationTitle = payload.notification?.title || 'Respira Livre';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem uma nova notificação',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  // Add action buttons based on notification type
  if (payload.data?.type === 'daily_reminder') {
    notificationOptions.actions = [
      {
        action: 'checkin',
        title: 'Fazer Check-in'
      },
      {
        action: 'dismiss',
        title: 'Depois'
      }
    ];
  } else if (payload.data?.type === 'streak_at_risk') {
    notificationOptions.actions = [
      {
        action: 'checkin',
        title: 'Salvar Sequência'
      }
    ];
    notificationOptions.requireInteraction = true;
  } else if (payload.data?.type === 'achievement') {
    notificationOptions.actions = [
      {
        action: 'view',
        title: 'Ver Conquista'
      }
    ];
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  // Determine URL based on action and notification type
  let urlToOpen = '/';

  if (action === 'checkin' || data.type === 'daily_reminder' || data.type === 'streak_at_risk') {
    urlToOpen = '/dashboard'; // Open dashboard where check-in dialog can be triggered
  } else if (action === 'view' && data.type === 'achievement') {
    urlToOpen = '/profile'; // Open profile to view achievements
  } else if (data.type === 'squad_message' && data.squad_id) {
    urlToOpen = `/squads/${data.squad_id}`;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push event (alternative to onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[firebase-messaging-sw.js] Push data:', data);

      // If the message wasn't handled by onBackgroundMessage, handle it here
      if (data.notification) {
        const notificationTitle = data.notification.title || 'Respira Livre';
        const notificationOptions = {
          body: data.notification.body || '',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: data.data || {},
        };

        event.waitUntil(
          self.registration.showNotification(notificationTitle, notificationOptions)
        );
      }
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  }
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});
