/* ==========================================================================
   Integriox — Data layer
   Works fully offline via localStorage (instant reads/writes, so the UI
   never blocks on network) and syncs every change to a real Google Sheet
   through Apps Script — see /apps-script. The Sheet connection itself comes
   from assets/js/config.js (shared by every visitor of the deployed site)
   unless overridden locally from Settings → الربط والتكامل (per-device
   preview only) — see settings.html.
   ========================================================================== */
const DB = (function(){

  const KEY = 'integriox_db_v2';
  // 'local' -> localStorage only. 'remote' -> also pushes to Google Sheet (fire & forget).
  let MODE = 'local';
  let cache = null; // in-memory cache of the parsed DB, avoids re-parsing localStorage on every call

  function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
  // Generates PREFIX-YYYY-NNN ids (e.g. PAY-2026-001, INV-2026-001) —
  // sequential per year, per collection.
  function nextSeqId(prefix, collection){
    const year = new Date().getFullYear();
    const yearPrefix = `${prefix}-${year}-`;
    const maxSeq = all(collection).reduce((max, r)=>{
      if(typeof r.id !== 'string' || !r.id.startsWith(yearPrefix)) return max;
      const n = parseInt(r.id.slice(yearPrefix.length), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return yearPrefix + String(maxSeq + 1).padStart(3, '0');
  }
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  // Config shipped in assets/js/config.js — the site-wide default connection
  // every visitor gets out of the box, before any per-device override.
  function shippedConfig(){
    return (window.INTEGRIOX_CONFIG) || { sheetUrl:'', apiKey:'' };
  }

  function seed(){
    const cfg = shippedConfig();
    return {
      // setupDone becomes true once the first-run wizard (admin account) has
      // been completed — see index.html.
      settings: {
        setupDone: false,
        companyName: 'Integriox',
        companyPhone: '053-939',
        companyEmail: 'info@integriox.com',
        companyAddress: '',
        companyCr: '',
        companyTaxNumber: '',
        bankName: '',
        iban: '',
        // Service catalog for one-off job orders (تنفيذ بالطلب) — starts
        // empty; the admin adds services as needed directly from that
        // screen.
        serviceTypes: [],
        // Per-country tax definitions — editable from Settings → الضرائب.
        // Seeded from LISTS.COUNTRIES with a sensible Saudi VAT default;
        // everything else starts disabled at 0% until the admin fills it in.
        taxes: (window.LISTS ? LISTS.COUNTRIES : []).filter(c=>c.ar!=='أخرى').map(c=>({
          id: 'tax_' + Math.random().toString(36).slice(2,9),
          countryAr: c.ar, countryEn: c.en,
          nameAr: 'ضريبة القيمة المضافة', nameEn: 'VAT',
          rate: c.ar==='السعودية' ? 15 : 0,
          enabled: c.ar==='السعودية',
        })),
        // Contract subscription currencies — editable/extendable directly
        // from the "add contract" screen, not just Settings.
        currencies: [
          { code:'SAR', nameAr:'ريال سعودي', nameEn:'Saudi Riyal', symbol:'ر.س', country:'السعودية' },
          { code:'USD', nameAr:'دولار أمريكي', nameEn:'US Dollar', symbol:'$', country:'' },
          { code:'EUR', nameAr:'يورو', nameEn:'Euro', symbol:'€', country:'' },
          { code:'AED', nameAr:'درهم إماراتي', nameEn:'UAE Dirham', symbol:'د.إ', country:'الإمارات' },
          { code:'EGP', nameAr:'جنيه مصري', nameEn:'Egyptian Pound', symbol:'ج.م', country:'مصر' },
          { code:'KWD', nameAr:'دينار كويتي', nameEn:'Kuwaiti Dinar', symbol:'د.ك', country:'الكويت' },
          { code:'QAR', nameAr:'ريال قطري', nameEn:'Qatari Riyal', symbol:'ر.ق', country:'قطر' },
          { code:'BHD', nameAr:'دينار بحريني', nameEn:'Bahraini Dinar', symbol:'د.ب', country:'البحرين' },
          { code:'OMR', nameAr:'ريال عماني', nameEn:'Omani Rial', symbol:'ر.ع', country:'عُمان' },
          { code:'JOD', nameAr:'دينار أردني', nameEn:'Jordanian Dinar', symbol:'د.أ', country:'الأردن' },
          { code:'GBP', nameAr:'جنيه إسترليني', nameEn:'British Pound', symbol:'£', country:'' },
        ],
        sheetUrl: cfg.sheetUrl || '',
        driveFolderId: '',
        apiKeyEnc: cfg.apiKey ? encodeSecret(cfg.apiKey) : '',
        // true once the admin has explicitly overridden the connection from
        // this specific device (Settings → local preview) — see settings.html
        sheetUrlIsLocalOverride: false,
        // Footer / copyright notice — editable from Settings → Footer & WhatsApp.
        footerText: '© جميع حقوق الملكية الفكرية لهذا التطبيق محفوظة لدى الشركة المطوّرة — integriox CO 2026',
        footerTextEn: '© All intellectual property rights of this application are reserved to the developing company — integriox CO 2026',
        // WhatsApp floating contact widget — editable from Settings.
        whatsappNumber: '',
        whatsappMessage: 'مرحباً، أحتاج مساعدة بخصوص منصة Integriox',
        whatsappMessageEn: 'Hello, I need help regarding the Integriox platform',
        terms:
`1. يلتزم الطرف الأول (الشركة) بتقديم خدمات الصيانة المتفق عليها وفق الجدول الزمني المحدد في العقد.
2. يلتزم الطرف الثاني (العميل) بتوفير الوصول اللازم للموقع في مواعيد الزيارات المتفق عليها.
3. يلتزم الطرف الثاني بسداد المستحقات المالية في المواعيد المحددة، وفي حال التأخر أكثر من 15 يومًا يحق للشركة إيقاف الخدمة مؤقتًا.
4. يشمل العقد الزيارات الدورية المذكورة أعلاه فقط، وأي زيارات إضافية تخضع لاتفاق منفصل.
5. يحق لأي من الطرفين طلب إنهاء العقد بإشعار كتابي قبل 30 يومًا من تاريخ الإنهاء.
6. يتم تجديد العقد تلقائيًا لمدة مماثلة ما لم يُخطر أحد الطرفين الآخر برغبته في عدم التجديد قبل 15 يومًا من تاريخ الانتهاء.
7. تخضع بنود هذا العقد لأنظمة المملكة العربية السعودية النافذة.`
      },
      users: [],
      clients: [],
      technicians: [],
      contracts: [],
      visits: [],
      payments: [],
      invoices: [],
      activity: [],
      complaints: [],
      jobOrders: []
    };
  }

  function load(){
    if(cache) return cache;
    let raw = localStorage.getItem(KEY);
    if(!raw){
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      cache = s;
    } else {
      try{ cache = JSON.parse(raw); } catch(e){ cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); }
    }
    // migration safety net: older saved DBs may be missing collections/fields
    // introduced later — fill them in without touching existing data.
    const fresh = seed();
    Object.keys(fresh).forEach(col=>{
      if(cache[col] === undefined) cache[col] = fresh[col];
    });
    if(cache.settings){
      let settingsChanged = false;
      Object.keys(fresh.settings).forEach(k=>{
        if(cache.settings[k] === undefined){ cache.settings[k] = fresh.settings[k]; settingsChanged = true; }
      });
      // The site-wide config.js is the source of truth for the connection
      // UNLESS this specific device has an explicit local preview override
      // (Settings → الربط والتكامل → "تطبيق ومعاينة على هذا الجهاز"). This
      // also self-heals browsers whose data was saved before config.js
      // existed (sheetUrl was '' back then and would otherwise stay stuck
      // empty forever, which is why sync could silently never start).
      if(!cache.settings.sheetUrlIsLocalOverride){
        const cfg = shippedConfig();
        if(cache.settings.sheetUrl !== (cfg.sheetUrl || '')){
          cache.settings.sheetUrl = cfg.sheetUrl || '';
          cache.settings.apiKeyEnc = cfg.apiKey ? encodeSecret(cfg.apiKey) : '';
          settingsChanged = true;
        }
      }
      // One-time cleanup: this build briefly shipped a demo service
      // catalog (svc_ac_repair, svc_plumbing, ...) — remove exactly those
      // if still present, but leave any custom services the admin added.
      if(Array.isArray(cache.settings.serviceTypes)){
        const demoIds = ['svc_ac_repair','svc_ac_install','svc_plumbing','svc_electrical','svc_general','svc_emergency'];
        const cleaned = cache.settings.serviceTypes.filter(s => !demoIds.includes(s.id));
        if(cleaned.length !== cache.settings.serviceTypes.length){
          cache.settings.serviceTypes = cleaned;
          settingsChanged = true;
        }
      }
      if(settingsChanged) localStorage.setItem(KEY, JSON.stringify(cache));
    }
    // keep MODE in sync with whatever sheet URL is currently active
    // (site-wide config.js, or a per-device local override saved in settings)
    MODE = cache.settings && cache.settings.sheetUrl ? 'remote' : 'local';
    return cache;
  }
  function save(data){
    cache = data;
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function resetDemo(){ localStorage.removeItem(KEY); cache = null; return load(); }

  // Wipes every collection (clients, technicians, contracts, visits,
  // payments, invoices, complaints, activity, other users) both locally
  // AND on the connected Sheet, but keeps the currently logged-in admin's
  // own account and the Sheet connection/API key untouched. Previously
  // "delete all" only cleared localStorage, so the very next page load
  // would silently pull all the old data straight back down from the
  // Sheet — this now clears both sides.
  function clearAllData(){
    const data = load();
    const preservedSettings = {
      sheetUrl: data.settings.sheetUrl,
      apiKeyEnc: data.settings.apiKeyEnc,
      sheetUrlIsLocalOverride: data.settings.sheetUrlIsLocalOverride,
      driveFolderId: data.settings.driveFolderId,
    };
    let currentUser = null;
    try{ currentUser = window.AUTH && AUTH.currentUser ? AUTH.currentUser() : null; }catch(e){}
    const fresh = seed();
    const newData = Object.assign({}, fresh, {
      settings: Object.assign({}, fresh.settings, preservedSettings),
      users: currentUser ? [currentUser] : [],
    });
    save(newData);
    const keepUserIds = currentUser ? [currentUser.id] : [];
    pushRemote({ action:'clearAll', keepUserIds });
    return newData;
  }

  /* ---------- remote sync ----------
     Every insert/update/delete pushes ONLY the row that changed (instead of
     re-writing the whole sheet on every keystroke-triggered save), which
     keeps the UI fast even with a real Google Sheet attached.

     We first try a normal (readable) fetch so failures are no longer
     silent — Apps Script Web Apps deployed with "Who has access: Anyone"
     do return a readable cross-origin response for both GET and POST. If
     the browser still blocks reading it for any reason, we fall back to a
     best-effort no-cors resend (fire-and-forget, like before) so the write
     is still attempted even though we can't confirm it. */
  function pushRemote(body, opts){
    const data = load();
    if(MODE !== 'remote' || !data.settings.sheetUrl) return;
    const payload = JSON.stringify(Object.assign({ apiKey: decodeSecret(data.settings.apiKeyEnc) }, body));
    const url = data.settings.sheetUrl;
    fetch(url, { method:'POST', body: payload })
      .then(res=>res.json())
      .then(json=>{
        if(!json || json.error){
          notifySyncIssue(json && json.error);
        } else if(opts && opts.onSuccess){
          opts.onSuccess(json);
        }
      })
      .catch(()=>{
        // couldn't read the response (older/blocked deployment) — still
        // attempt a fire-and-forget write so data isn't lost if the sheet
        // side actually works, just silently.
        try{
          fetch(url, { method:'POST', mode:'no-cors', body: payload }).catch(()=>{});
        }catch(e){ /* fully offline */ }
      });
  }
  let lastSyncWarningAt = 0;
  function notifySyncIssue(errText){
    // throttle to avoid spamming toasts if many rows fail in a row
    const now = Date.now();
    if(now - lastSyncWarningAt < 4000) return;
    lastSyncWarningAt = now;
    if(window.UI && UI.toast){
      UI.toast((window.I18N ? I18N.t('sync_failed_toast') : 'Sync to Google Sheet failed') + (errText ? ' — ' + errText : ''), 'error');
    }
  }
  // Pulls the full dataset from the Sheet and makes it the local copy —
  // used by the explicit "Load from Sheet" action in Settings, for anyone
  // who wants the Sheet to be the verified source of truth on this device.
  // Sheet cells only hold text, so array/object fields (branches, messages,
  // photos, remoteAccess...) come back as JSON strings — turn them back
  // into real objects/arrays before using the data in the app.
  function hydrateRow(row){
    const out = {};
    Object.keys(row).forEach(k=>{
      const v = row[k];
      if(typeof v === 'string' && v.length>1 && (v[0]==='{' || v[0]==='[')){
        try{ out[k] = JSON.parse(v); return; }catch(e){ /* not actually JSON, keep as-is */ }
      }
      out[k] = v;
    });
    return out;
  }
  function pullFromSheet(){
    const data = load();
    if(!data.settings.sheetUrl) return Promise.reject(new Error('no sheet url'));
    return fetch(data.settings.sheetUrl + (data.settings.sheetUrl.includes('?')?'&':'?') + 'action=getAll')
      .then(res=>res.json())
      .then(remote=>{
        if(!remote || remote.error) throw new Error((remote && remote.error) || 'invalid response');
        const merged = Object.assign({}, data, data);
        Object.keys(remote).forEach(col=>{
          if(col==='settings') return;
          merged[col] = (remote[col]||[]).map(hydrateRow);
        });
        if(merged.users){
          merged.users = merged.users.map(u=>{
            if(!u.password) return u;
            const decoded = decodeSecret(u.password);
            return { ...u, password: decoded || u.password };
          });
        }
        merged.settings = hydrateRow(Object.assign({}, data.settings, remote.settings||{}));
        save(merged);
        return merged;
      });
  }
  // Clones the full dataset with every user's password encoded, for full
  // (not per-row) syncs to the Sheet.
  function redactedFullData(){
    const data = load();
    if(!data.users || !data.users.length) return data;
    return { ...data, users: data.users.map(u=> u.password ? { ...u, password: encodeSecret(u.password) } : u) };
  }
  function syncFull(){
    pushRemote({ action:'syncAll', payload: redactedFullData() });
  }
  // Promise-based full push, used by the explicit "Sync Now" button in
  // Settings so the admin gets a definitive success/failure result instead
  // of the throttled ambient notification used for background auto-syncs.
  function syncNow(){
    const data = load();
    if(!data.settings.sheetUrl) return Promise.reject(new Error('no sheet url configured'));
    const payload = JSON.stringify(Object.assign({ apiKey: decodeSecret(data.settings.apiKeyEnc) }, { action:'syncAll', payload: redactedFullData() }));
    return fetch(data.settings.sheetUrl, { method:'POST', body: payload })
      .then(res=>res.json())
      .then(json=>{
        if(!json || json.error) throw new Error((json && json.error) || 'sync failed');
        return json;
      });
  }

  // ---------- generic collection helpers ----------
  function all(col){ return load()[col] || []; }
  function get(col, id){ return all(col).find(x=>x.id===id); }
  // Never send a readable password to the Sheet — encode it in the outgoing
  // payload only (the local copy stays plaintext so login can compare
  // directly; pullFromSheet decodes it back on the way in).
  function redactPasswordForRemote(col, obj){
    if(col !== 'users' || !obj || obj.password === undefined) return obj;
    return { ...obj, password: encodeSecret(obj.password) };
  }
  function insert(col, obj){
    const data = load();
    if(!obj.id) obj.id = uid(col.slice(0,2));
    data[col].push(obj);
    save(data);
    pushRemote({ action:'insert', collection:col, data: redactPasswordForRemote(col, obj) });
    return obj;
  }
  function update(col, id, patch){
    const data = load();
    const idx = data[col].findIndex(x=>x.id===id);
    if(idx===-1) return null;
    data[col][idx] = { ...data[col][idx], ...patch };
    save(data);
    pushRemote({ action:'update', collection:col, id, patch: redactPasswordForRemote(col, patch) });
    return data[col][idx];
  }
  function remove(col, id){
    const data = load();
    data[col] = data[col].filter(x=>x.id!==id);
    save(data);
    pushRemote({ action:'delete', collection:col, id });
  }
  function getSettings(){ return load().settings; }
  function saveSettings(patch){
    const data = load();
    data.settings = { ...data.settings, ...patch };
    save(data);
    MODE = data.settings.sheetUrl ? 'remote' : 'local';
    pushRemote({ action:'syncAll', payload:{ settings:data.settings } });
    return data.settings;
  }
  // ---------- lightweight secret obfuscation (NOT real encryption) ----------
  // Purpose: avoid keeping API keys as bare plaintext in localStorage/UI.
  // For real security this must be replaced by server-side secret storage.
  function encodeSecret(plain){
    if(!plain) return '';
    try{ return btoa(unescape(encodeURIComponent(plain))); } catch(e){ return ''; }
  }
  function decodeSecret(enc){
    if(!enc) return '';
    try{ return decodeURIComponent(escape(atob(enc))); } catch(e){ return ''; }
  }

  // type: one of client | technician | contract | visit | payment | invoice | user | settings | other
  function logActivity(text_ar, text_en, type){
    const data = load();
    let byUserId = null, byUserName = null;
    try{
      const u = window.AUTH && AUTH.currentUser ? AUTH.currentUser() : null;
      if(u){ byUserId = u.id; byUserName = u.name; }
    }catch(e){ /* no session (e.g. public visit-request page) */ }
    data.activity.unshift({ id: uid('a'), text_ar, text_en, type: type||'other', byUserId, byUserName, at: new Date().toISOString() });
    data.activity = data.activity.slice(0,500);
    save(data);
    pushRemote({ action:'insert', collection:'activity', data:data.activity[0] });
  }

  return {
    uid, nextSeqId, todayISO, load, save, resetDemo,
    all, get, insert, update, remove,
    getSettings, saveSettings, logActivity,
    encodeSecret, decodeSecret, syncFull, syncNow, pullFromSheet, clearAllData, shippedConfig,
    setMode:(m)=>MODE=m, getMode:()=>MODE,
  };
})();
