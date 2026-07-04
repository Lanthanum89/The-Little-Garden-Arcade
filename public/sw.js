// Base path is computed from the service worker's own location so this
// works unmodified whether it's served from the repo root or a GitHub
// Pages project subpath (e.g. /The-Little-Garden-Arcade/) - no hardcoded
// repo name to go stale if the repo is ever renamed.
const BASE = new URL('./', self.location).pathname;
const NAV_FALLBACK = BASE + 'shell/index.html';

const CACHE = 'garden-arcade-v8';

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
  'shared/a11y.js',
  'shared/random.js',
  'shared/fonts/dm-serif-display-latin-ext.woff2',
  'shared/fonts/dm-serif-display-latin.woff2',
  'shared/fonts/nunito-sans-latin-ext.woff2',
  'shared/fonts/nunito-sans-latin.woff2',
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
  'icons/icon-192.png',
  'icons/icon-512.png',
].map(path => BASE + path);

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url => cache.add(url).catch(err => console.warn('[sw] failed to cache', url, err))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('garden-arcade-') && k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Navigations get their own handler because serving the app shell's cached
// HTML directly under an unrelated URL would break every relative path in
// it (CSS, scripts, games.json, tile links all resolve against the address
// bar's URL, not the file the bytes actually came from). Redirecting to the
// shell's real URL instead makes the browser re-navigate and re-run this
// same handler, which then serves shell/index.html under its own URL where
// its relative references resolve correctly.
async function handleNavigate(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
    throw new Error(`Bad response: ${response.status}`);
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match(NAV_FALLBACK);
    if (fallback) return Response.redirect(NAV_FALLBACK, 302);
    throw err;
  }
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(handleNavigate(e.request));
    return;
  }

  e.respondWith(networkFirst(e.request));
});
