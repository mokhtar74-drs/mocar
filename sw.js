const CACHE = 'mocar-v1';
const SHELL = ['./', 'index.html', 'assets/css/style.css', 'assets/fonts/fonts.css', 'assets/js/data.js', 'assets/js/i18n.js', 'assets/js/app.js', 'assets/img/ui/logo.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (/\.(webp|png|svg|woff2|ico)$/.test(u.pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { const k = n.clone(); caches.open(CACHE).then(c => c.put(e.request, k)); return n; })));
    return;
  }
  e.respondWith(fetch(e.request).then(n => { const k = n.clone(); caches.open(CACHE).then(c => c.put(e.request, k)); return n; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
