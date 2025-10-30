// IndexedDB wrapper for offline storage
const DB_NAME = 'YKBayDB';
const DB_VERSION = 1;

let dbInstance = null;

export function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('IndexedDB opened successfully');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Tracks store - for active/recorded tracks
      if (!db.objectStoreNames.contains('tracks')) {
        const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
        trackStore.createIndex('timestamp', 'timestamp', { unique: false });
        trackStore.createIndex('synced', 'synced', { unique: false });
        trackStore.createIndex('recording', 'recording', { unique: false });
      }

      // Pending tracks - for background sync queue
      if (!db.objectStoreNames.contains('pendingTracks')) {
        db.createObjectStore('pendingTracks', { keyPath: 'id' });
      }

      // Hazards store - cached hazard data
      if (!db.objectStoreNames.contains('hazards')) {
        const hazardStore = db.createObjectStore('hazards', { keyPath: 'id' });
        hazardStore.createIndex('location', ['lat', 'lng'], { unique: false });
        hazardStore.createIndex('severity', 'severity', { unique: false });
      }

      // Pending hazards - for background sync queue
      if (!db.objectStoreNames.contains('pendingHazards')) {
        db.createObjectStore('pendingHazards', { keyPath: 'id' });
      }

      // Offline maps - cached map regions
      if (!db.objectStoreNames.contains('offlineMaps')) {
        const mapStore = db.createObjectStore('offlineMaps', { keyPath: 'regionId' });
        mapStore.createIndex('downloadDate', 'downloadDate', { unique: false });
      }

      // Map tiles - individual tile cache
      if (!db.objectStoreNames.contains('mapTiles')) {
        const tileStore = db.createObjectStore('mapTiles', { keyPath: 'tileId' });
        tileStore.createIndex('regionId', 'regionId', { unique: false });
      }

      console.log('IndexedDB schema created');
    };
  });
}

// Generic CRUD operations
export async function addItem(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(storeName, indexName = null, query = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    let request;
    if (indexName) {
      const index = store.index(indexName);
      request = query ? index.getAll(query) : index.getAll();
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateItem(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get database size estimate
export async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usagePercent: (estimate.usage / estimate.quota * 100).toFixed(2),
      available: estimate.quota - estimate.usage
    };
  }

  return null;
}
