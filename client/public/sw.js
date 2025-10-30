// YK Bay Service Worker - Offline capabilities and background sync
const CACHE_VERSION = 'v1';
const CACHE_NAME = `ykbay-${CACHE_VERSION}`;
const OFFLINE_CACHE = `ykbay-offline-${CACHE_VERSION}`;
const TRACK_SYNC_TAG = 'track-sync';
const HAZARD_SYNC_TAG = 'hazard-sync';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('ykbay-') && name !== CACHE_NAME && name !== OFFLINE_CACHE)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests differently (network-first with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response
          const responseClone = response.clone();

          // Cache successful responses
          if (response.ok) {
            caches.open(OFFLINE_CACHE)
              .then(cache => cache.put(request, responseClone));
          }

          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }

              // Return offline fallback for specific endpoints
              return new Response(
                JSON.stringify({ error: 'Offline', cached: false }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets (cache-first)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response.ok) {
              return response;
            }

            // Clone the response
            const responseClone = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background Sync - Track Upload
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === TRACK_SYNC_TAG) {
    event.waitUntil(syncTracks());
  } else if (event.tag === HAZARD_SYNC_TAG) {
    event.waitUntil(syncHazards());
  }
});

async function syncTracks() {
  try {
    console.log('[SW] Syncing tracks...');

    // Get pending tracks from IndexedDB
    const db = await openDatabase();
    const tx = db.transaction('pendingTracks', 'readonly');
    const store = tx.objectStore('pendingTracks');
    const tracks = await store.getAll();

    if (tracks.length === 0) {
      console.log('[SW] No tracks to sync');
      return;
    }

    console.log(`[SW] Found ${tracks.length} tracks to sync`);

    // Upload each track
    for (const track of tracks) {
      try {
        const response = await fetch('/api/tracks/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${track.token}`
          },
          body: JSON.stringify(track.data)
        });

        if (response.ok) {
          // Remove from pending queue
          const deleteTx = db.transaction('pendingTracks', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingTracks');
          await deleteStore.delete(track.id);
          console.log('[SW] Track synced successfully:', track.id);

          // Notify client
          notifyClients({ type: 'TRACK_SYNCED', trackId: track.id });
        } else {
          console.error('[SW] Track sync failed:', response.status);
        }
      } catch (error) {
        console.error('[SW] Error syncing track:', error);
      }
    }

    console.log('[SW] Track sync completed');
  } catch (error) {
    console.error('[SW] Track sync error:', error);
    throw error; // Re-throw to trigger retry
  }
}

async function syncHazards() {
  try {
    console.log('[SW] Syncing hazards...');

    // Get pending hazards from IndexedDB
    const db = await openDatabase();
    const tx = db.transaction('pendingHazards', 'readonly');
    const store = tx.objectStore('pendingHazards');
    const hazards = await store.getAll();

    if (hazards.length === 0) {
      console.log('[SW] No hazards to sync');
      return;
    }

    console.log(`[SW] Found ${hazards.length} hazards to sync`);

    // Upload each hazard
    for (const hazard of hazards) {
      try {
        const response = await fetch('/api/hazards/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hazard.token}`
          },
          body: JSON.stringify(hazard.data)
        });

        if (response.ok) {
          // Remove from pending queue
          const deleteTx = db.transaction('pendingHazards', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingHazards');
          await deleteStore.delete(hazard.id);
          console.log('[SW] Hazard synced successfully:', hazard.id);

          // Notify client
          notifyClients({ type: 'HAZARD_SYNCED', hazardId: hazard.id });
        } else {
          console.error('[SW] Hazard sync failed:', response.status);
        }
      } catch (error) {
        console.error('[SW] Error syncing hazard:', error);
      }
    }

    console.log('[SW] Hazard sync completed');
  } catch (error) {
    console.error('[SW] Hazard sync error:', error);
    throw error;
  }
}

// Push notifications for hazard alerts
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'YK Bay Alert';
  const options = {
    body: data.body || 'Navigation alert',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: data.tag || 'default',
    data: data,
    vibrate: data.vibrate || [200, 100, 200],
    requireInteraction: data.critical || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);

  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Helper: Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('YKBayDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pendingTracks')) {
        db.createObjectStore('pendingTracks', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('pendingHazards')) {
        db.createObjectStore('pendingHazards', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('tracks')) {
        const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
        trackStore.createIndex('timestamp', 'timestamp', { unique: false });
        trackStore.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains('hazards')) {
        const hazardStore = db.createObjectStore('hazards', { keyPath: 'id' });
        hazardStore.createIndex('location', ['lat', 'lng'], { unique: false });
      }

      if (!db.objectStoreNames.contains('offlineMaps')) {
        db.createObjectStore('offlineMaps', { keyPath: 'regionId' });
      }
    };
  });
}

// Helper: Notify all clients
function notifyClients(message) {
  clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clientList => {
      clientList.forEach(client => {
        client.postMessage(message);
      });
    });
}

console.log('[SW] Service Worker loaded');
