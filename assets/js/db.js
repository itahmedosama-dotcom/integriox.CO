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
      activity: []
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

  /* ---------- remote sync (fire & forget) ----------
     Every insert/update/delete pushes ONLY the row that changed (instead of
     re-writing the whole sheet on every keystroke-triggered save), which
     keeps the UI fast even with a real Google Sheet attached. */
  function pushRemote(body){
    const data = load();
    if(MODE !== 'remote' || !data.settings.sheetUrl) return;
    try{
      fetch(data.settings.sheetUrl, {
        method:'POST', mode:'no-cors',
        body: JSON.stringify(Object.assign({ apiKey: decodeSecret(data.settings.apiKeyEnc) }, body))
      }).catch(()=>{});
    }catch(e){ /* offline / blocked — local copy already saved */ }
  }
  function syncFull(){
    const data = load();
    pushRemote({ action:'syncAll', payload:data });
  }

  // ---------- generic collection helpers ----------
  function all(col){ return load()[col] || []; }
  function get(col, id){ return all(col).find(x=>x.id===id); }
  function insert(col, obj){
    const data = load();
    if(!obj.id) obj.id = uid(col.slice(0,2));
    data[col].push(obj);
    save(data);
    pushRemote({ action:'insert', collection:col, data:obj });
    return obj;
  }
  function update(col, id, patch){
    const data = load();
    const idx = data[col].findIndex(x=>x.id===id);
    if(idx===-1) return null;
    data[col][idx] = { ...data[col][idx], ...patch };
    save(data);
    pushRemote({ action:'update', collection:col, id, patch });
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
    data.activity.unshift({ id: uid('a'), text_ar, text_en, type: type||'other', at: new Date().toISOString() });
    data.activity = data.activity.slice(0,500);
    save(data);
    pushRemote({ action:'insert', collection:'activity', data:data.activity[0] });
  }

  return {
    uid, todayISO, load, save, resetDemo,
    all, get, insert, update, remove,
    getSettings, saveSettings, logActivity,
    encodeSecret, decodeSecret, syncFull, shippedConfig,
    setMode:(m)=>MODE=m, getMode:()=>MODE,
  };
})();
