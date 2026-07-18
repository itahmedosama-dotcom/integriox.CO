/* Integriox — minimal service worker.
   Its only job is to satisfy the browser's PWA installability requirement
   (having a fetch handler). It intentionally does NOT cache app data, so the
   platform always reflects the latest localStorage / Google Sheet state. */
self.addEventListener('install', (e)=>{ self.skipWaiting(); });
self.addEventListener('activate', (e)=>{ self.clients.claim(); });
self.addEventListener('fetch', (e)=>{ /* network passthrough */ });
