/**
 * Service Worker for WhatsApp Simulator
 * Provides offline support, caching, and mobile-optimized performance
 */

const CACHE_NAME = 'whatsapp-simulator-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// Cache duration in milliseconds
const CACHE_DURATION = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  DYNAMIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000, // 5 minutes
};

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Core JS and CSS files will be added dynamically
];

// Resources to cache on first access
const DYNAMIC_ROUTES = [
  '/api/simulator',
  '/api/flows',
  '/api/templates',
];

// Image extensions to cache
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];

/**
 * Utility Functions
 */
const isImageRequest = (url) => {
  return IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().includes(ext));
};

const isStaticAsset = (url) => {
  return url.pathname.includes('/_next/static/') || 
         url.pathname.includes('/static/') ||
         STATIC_ASSETS.includes(url.pathname);
};

const isDynamicRoute = (url) => {
  return DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route));
};

const isApiRequest = (url) => {
  return url.pathname.startsWith('/api/');
};

const addToCache = async (cacheName, request, response) => {
  try {
    const cache = await caches.open(cacheName);
    // Clone the response since it can only be consumed once
    await cache.put(request, response.clone());
  } catch (error) {
    console.warn('Failed to cache:', request.url, error);
  }
};

const getCachedResponse = async (cacheName, request) => {
  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    
    if (response) {
      // Check if cached response is still fresh
      const cachedTime = response.headers.get('sw-cached-time');
      if (cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        const maxAge = getCacheMaxAge(request);
        
        if (age > maxAge) {
          await cache.delete(request);
          return null;
        }
      }
    }
    
    return response;
  } catch (error) {
    console.warn('Failed to get cached response:', request.url, error);
    return null;
  }
};

const getCacheMaxAge = (request) => {
  const url = new URL(request.url);
  
  if (isImageRequest(url)) return CACHE_DURATION.IMAGES;
  if (isStaticAsset(url)) return CACHE_DURATION.STATIC;
  if (isApiRequest(url)) return CACHE_DURATION.API;
  return CACHE_DURATION.DYNAMIC;
};

const addCacheHeaders = (response) => {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('sw-cached-time', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

/**
 * Cache Strategies
 */

// Cache First - Good for static assets
const cacheFirst = async (request) => {
  const cacheName = isImageRequest(new URL(request.url)) ? IMAGE_CACHE : STATIC_CACHE;
  
  // Try cache first
  const cachedResponse = await getCachedResponse(cacheName, request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await addToCache(cacheName, request, addCacheHeaders(networkResponse));
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
};

// Network First - Good for dynamic content
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await addToCache(DYNAMIC_CACHE, request, addCacheHeaders(networkResponse));
    }
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await getCachedResponse(DYNAMIC_CACHE, request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return await getOfflineFallback(request);
  }
};

// Stale While Revalidate - Good for API calls
const staleWhileRevalidate = async (request) => {
  const cachedResponse = getCachedResponse(DYNAMIC_CACHE, request);
  const networkResponse = fetch(request).then(response => {
    if (response.ok) {
      addToCache(DYNAMIC_CACHE, request, addCacheHeaders(response));
    }
    return response;
  }).catch(() => null);
  
  // Return cached response immediately if available
  const cached = await cachedResponse;
  if (cached) {
    return cached;
  }
  
  // Wait for network response
  const network = await networkResponse;
  if (network) {
    return network;
  }
  
  // Return offline fallback
  return await getOfflineFallback(request);
};

// Get offline fallback response
const getOfflineFallback = async (request) => {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    // Return cached offline page
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) return offlinePage;
    
    // Create simple offline response
    return new Response(
      `<!DOCTYPE html>
       <html>
         <head>
           <title>Offline - WhatsApp Simulator</title>
           <meta name="viewport" content="width=device-width, initial-scale=1">
           <style>
             body { 
               font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
               display: flex; align-items: center; justify-content: center;
               min-height: 100vh; margin: 0; padding: 20px;
               background: #f5f5f5; text-align: center;
             }
             .offline { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
             .icon { font-size: 3rem; margin-bottom: 1rem; }
           </style>
         </head>
         <body>
           <div class="offline">
             <div class="icon">📱</div>
             <h1>You're offline</h1>
             <p>The WhatsApp Simulator requires an internet connection.</p>
             <p>Please check your connection and try again.</p>
             <button onclick="window.location.reload()">Retry</button>
           </div>
         </body>
       </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
  
  if (isImageRequest(url)) {
    // Return placeholder image
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
         <rect width="200" height="200" fill="#f0f0f0"/>
         <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text>
       </svg>`,
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
  
  if (isApiRequest(url)) {
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response('Offline', { status: 503 });
};

/**
 * Event Listeners
 */

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(STATIC_ASSETS);
        console.log('Static assets cached successfully');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('Failed to cache static assets:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('whatsapp-simulator-') && !name.includes('v1.0.0')
        );
        
        await Promise.all(
          oldCaches.map(name => caches.delete(name))
        );
        
        console.log('Old caches cleaned up');
        
        // Take control of all open clients immediately
        self.clients.claim();
      } catch (error) {
        console.error('Failed to clean up old caches:', error);
      }
    })()
  );
});

// Fetch event - handle requests with appropriate cache strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests (except for same-origin API calls)
  if (url.origin !== location.origin && !isApiRequest(url)) return;
  
  // Skip Chrome extensions and other non-http requests
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(
    (async () => {
      try {
        // Route to appropriate cache strategy
        if (isStaticAsset(url) || isImageRequest(url)) {
          return await cacheFirst(event.request);
        } else if (isApiRequest(url)) {
          return await staleWhileRevalidate(event.request);
        } else {
          return await networkFirst(event.request);
        }
      } catch (error) {
        console.error('Fetch error:', event.request.url, error);
        return await getOfflineFallback(event.request);
      }
    })()
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'simulator-action') {
    event.waitUntil(handleOfflineActions());
  }
});

// Handle offline actions when back online
const handleOfflineActions = async () => {
  try {
    // Get offline actions from IndexedDB
    const db = await openDatabase();
    const actions = await getOfflineActions(db);
    
    for (const action of actions) {
      try {
        // Replay the action
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });
        
        // Remove successful action from queue
        await removeOfflineAction(db, action.id);
      } catch (error) {
        console.error('Failed to replay action:', action, error);
      }
    }
  } catch (error) {
    console.error('Failed to handle offline actions:', error);
  }
};

// IndexedDB helpers for offline queue
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('whatsapp-simulator-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        const store = db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const getOfflineActions = (db) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readonly');
    const store = transaction.objectStore('actions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const removeOfflineAction = (db, id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('WhatsApp Simulator', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_STATS':
        getCacheStats().then(stats => {
          event.ports[0].postMessage(stats);
        });
        break;
      case 'CLEAR_CACHE':
        clearCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
    }
  }
});

// Get cache statistics
const getCacheStats = async () => {
  try {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      stats[name] = {
        count: requests.length,
        size: await getCacheSize(cache, requests)
      };
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {};
  }
};

// Get approximate cache size
const getCacheSize = async (cache, requests) => {
  let size = 0;
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (response && response.body) {
        const reader = response.body.getReader();
        let result = await reader.read();
        while (!result.done) {
          size += result.value.length;
          result = await reader.read();
        }
      }
    } catch (error) {
      // Skip this request
    }
  }
  return size;
};

// Clear all caches
const clearCaches = async () => {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
};

console.log('Service Worker loaded successfully');