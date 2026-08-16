/* ═══════════════════════════════════════════════════════════════
   PITTA CORNER — service worker
   ───────────────────────────────────────────────────────────────
   The menu should survive the Piccadilly line. Strategy is chosen
   for a GitHub Pages deploy, where a stale cache is worse than no
   cache:

   - The page, stylesheet and script are NETWORK-FIRST: every online
     visit gets the latest deploy, and the cached copy only answers
     when the network genuinely fails.
   - Fonts, photos, WebP tiers, logos and icons are CACHE-FIRST as
     they are browsed: their contents never change under the same
     name in this repo, so revalidating them is wasted transfer.
   - Bump VERSION on strategy changes; activation deletes any cache
     that doesn't match, so old workers can't strand old assets.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const VERSION = 'pc-v1';
const CORE = 'pc-core-' + VERSION;
const MEDIA = 'pc-media-' + VERSION;

const PRECACHE = [
  './',
  'index.html',
  'css/style.css',
  'js/script.js',
  'fonts/manrope-latin-variable.woff2',
  'fonts/playfair-latin-variable.woff2',
  'fonts/kaushan-script-latin-400.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CORE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CORE && k !== MEDIA).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const MEDIA_RE = /\.(woff2|webp|jpe?g|png|svg)$/;

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (MEDIA_RE.test(url.pathname)) {
    /* cache-first: immutable-by-convention media */
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(MEDIA).then(c => c.put(e.request, copy));
        }
        return res;
      }))
    );
    return;
  }

  /* network-first: documents, css, js — fall back to cache, and for
     navigations fall back to the cached shell as a last resort */
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CORE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(hit =>
        hit || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined))
    )
  );
});
