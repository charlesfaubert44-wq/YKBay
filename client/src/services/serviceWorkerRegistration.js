// Service Worker registration for PWA capabilities
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('[SW] Registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Every minute

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, prompt user to refresh
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => {
          console.error('[SW] Registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        handleServiceWorkerMessage(event.data);
      });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('[SW] Unregistration failed:', error);
      });
  }
}

function handleServiceWorkerMessage(message) {
  console.log('[SW Message]', message);

  switch (message.type) {
    case 'TRACK_SYNCED':
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('trackSynced', {
        detail: { trackId: message.trackId }
      }));
      break;

    case 'HAZARD_SYNCED':
      window.dispatchEvent(new CustomEvent('hazardSynced', {
        detail: { hazardId: message.hazardId }
      }));
      break;

    default:
      console.log('[SW] Unknown message type:', message.type);
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show local notification
export function showNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Cannot show notification');
    return;
  }

  const defaultOptions = {
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200]
  };

  new Notification(title, { ...defaultOptions, ...options });
}

// Register background sync
export async function registerBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'sync' in self.registration) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('[SW] Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('[SW] Background sync registration failed:', error);
      return false;
    }
  }

  console.warn('[SW] Background sync not supported');
  return false;
}
