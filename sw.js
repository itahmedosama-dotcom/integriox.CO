/* Integriox — minimal service worker.
   Two jobs: (1) satisfy the browser's PWA installability requirement,
   and (2) make sure this app NEVER serves a stale cached page — every
   request is forced through the network with no caching, and any
   already-open tab gets told to reload once a new version of this file
   takes over. This app is meant to always reflect the latest
   localStorage / Google Sheet state, so caching old files (especially in
   an installed-PWA context, where meta-tag cache hints are less
   reliable) is actively harmful. */
const SW_BUILD = '2026-07-20b';

self.addEventListener('install', (e)=>{ self.skipWaiting(); });

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    self.clients.claim().then(()=>
      self.clients.matchAll({ type:'window' }).then(clients=>{
        clients.forEach(client => client.postMessage({ type:'SW_UPDATED', build: SW_BUILD }));
      })
    )
  );
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return; // don't touch POSTs to the Apps Script backend etc.
  e.respondWith(
    fetch(e.request, { cache:'no-store' }).catch(()=> fetch(e.request))
  );
});
