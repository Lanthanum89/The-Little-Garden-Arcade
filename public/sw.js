// Base path is computed from the service worker's own location so this
// works unmodified whether it's served from the repo root or a GitHub
// Pages project subpath (e.g. /The-Little-Garden-Arcade/) - no hardcoded
// repo name to go stale if the repo is ever renamed.
const BASE = new URL('./', self.location).pathname;
const NAV_FALLBACK = BASE + 'shell/index.html';

const CACHE = 'garden-arcade-v2';

const ASSETS = [
  '',
  'index.html',
  'manifest.json',
  'shell/',
  'shell/index.html',
  'shell/shell.css',
  'shared/tap-select.js',
  'shared/storage.js',
  'shared/register-sw.js',
  'games.json',
  'games/flower-garden/',
  'games/flower-garden/index.html',
  'games/flower-garden/style.css',
  'games/flower-garden/game.js',
  'games/memory-garden/',
  'games/memory-garden/index.html',
  'games/memory-garden/style.css',
  'games/memory-garden/game.js',
  'games/washing-line/',
  'games/washing-line/index.html',
  'games/washing-line/style.css',
  'games/washing-line/game.js',
  'games/colouring-garden/',
  'games/colouring-garden/index.html',
  'games/colouring-garden/style.css',
  'games/colouring-garden/game.js',
  'icons/icon.svg',
].map(path => BASE + path);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function networkFirst(request, fallbackKey) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      if (fallbackKey) await cache.put(fallbackKey, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackKey) {
      const fallback = await cache.match(fallbackKey);
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(networkFirst(e.request, NAV_FALLBACK));
    return;
  }

  e.respondWith(networkFirst(e.request));
});
