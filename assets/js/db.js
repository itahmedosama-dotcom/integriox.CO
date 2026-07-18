/* ==========================================================================
   Integriox — Data layer
   Works fully offline via localStorage out of the box (for GitHub Pages demo)
   and can sync to a real Google Sheet through Apps Script — see /apps-script.
   Every function name here matches the "action" the Apps Script API expects,
   so swapping storage is a one-line change (DB.MODE).
   ========================================================================== */
const DB = (function(){

  const KEY = 'integriox_db_v2';
  // 'local' -> localStorage only. 'remote' -> also pushes to Google Sheet (fire & forget).
  let MODE = 'local';

  function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  function seed(){
    return {
      // setupDone becomes true once the first-run wizard (Sheet URL + API key
      // + admin account) has been completed — see index.html.
      settings: {
        setupDone: false,
        companyName: 'Integriox',
        companyPhone: '053-939',
        companyEmail: 'info@integriox.com',
        companyAddress: '',
        sheetUrl: '',
        driveFolderId: '',
        apiKeyEnc: '',
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
    let raw = localStorage.getItem(KEY);
    if(!raw){
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    try{ return JSON.parse(raw); } catch(e){ const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
  }
  function save(data){
    localStorage.setItem(KEY, JSON.stringify(data));
    if(MODE === 'remote' && data.settings.sheetUrl){
      // fire-and-forget sync to Google Apps Script
      fetch(data.settings.sheetUrl, {
        method:'POST', mode:'no-cors',
        body: JSON.stringify({ action:'syncAll', payload:data })
      }).catch(()=>{});
    }
  }

  function resetDemo(){ localStorage.removeItem(KEY); return load(); }

  // ---------- generic collection helpers ----------
  function all(col){ return load()[col] || []; }
  function get(col, id){ return all(col).find(x=>x.id===id); }
  function insert(col, obj){
    const data = load();
    if(!obj.id) obj.id = uid(col.slice(0,2));
    data[col].push(obj);
    save(data);
    return obj;
  }
  function update(col, id, patch){
    const data = load();
    const idx = data[col].findIndex(x=>x.id===id);
    if(idx===-1) return null;
    data[col][idx] = { ...data[col][idx], ...patch };
    save(data);
    return data[col][idx];
  }
  function remove(col, id){
    const data = load();
    data[col] = data[col].filter(x=>x.id!==id);
    save(data);
  }
  function getSettings(){ return load().settings; }
  function saveSettings(patch){
    const data = load();
    data.settings = { ...data.settings, ...patch };
    save(data);
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

  function logActivity(text_ar, text_en){
    const data = load();
    data.activity.unshift({ id: uid('a'), text_ar, text_en, at: new Date().toISOString() });
    data.activity = data.activity.slice(0,300);
    save(data);
  }

  return {
    uid, todayISO, load, save, resetDemo,
    all, get, insert, update, remove,
    getSettings, saveSettings, logActivity,
    encodeSecret, decodeSecret,
    setMode:(m)=>MODE=m,
  };
})();
