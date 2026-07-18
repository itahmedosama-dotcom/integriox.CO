/* ==========================================================================
   Integriox — Data layer
   Works fully offline via localStorage out of the box (for GitHub Pages demo)
   and can sync to a real Google Sheet through Apps Script — see /apps-script.
   Every function name here matches the "action" the Apps Script API expects,
   so swapping storage is a one-line change (DB.MODE).
   ========================================================================== */
const DB = (function(){

  const KEY = 'integriox_db_v1';
  // 'local' -> localStorage only. 'remote' -> also pushes to Google Sheet (fire & forget).
  let MODE = 'local';

  function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  function seed(){
    const now = todayISO();
    return {
      settings: {
        companyName: 'Integriox',
        companyPhone: '+966 50 000 0000',
        companyEmail: 'info@integriox.com',
        companyAddress: 'الرياض، المملكة العربية السعودية',
        sheetUrl: '',
        terms:
`1. يلتزم الطرف الأول (الشركة) بتقديم خدمات الصيانة المتفق عليها وفق الجدول الزمني المحدد في العقد.
2. يلتزم الطرف الثاني (العميل) بتوفير الوصول اللازم للموقع في مواعيد الزيارات المتفق عليها.
3. يلتزم الطرف الثاني بسداد المستحقات المالية في المواعيد المحددة، وفي حال التأخر أكثر من 15 يومًا يحق للشركة إيقاف الخدمة مؤقتًا.
4. يشمل العقد الزيارات الدورية المذكورة أعلاه فقط، وأي زيارات إضافية تخضع لاتفاق منفصل.
5. يحق لأي من الطرفين طلب إنهاء العقد بإشعار كتابي قبل 30 يومًا من تاريخ الإنهاء.
6. يتم تجديد العقد تلقائيًا لمدة مماثلة ما لم يُخطر أحد الطرفين الآخر برغبته في عدم التجديد قبل 15 يومًا من تاريخ الانتهاء.
7. تخضع بنود هذا العقد لأنظمة المملكة العربية السعودية النافذة.`
      },
      users: [
        { id:'u_admin', name:'مدير النظام', email:'admin@integriox.com', password:'admin123', phone:'0500000001', role:'admin', status:'approved' },
        { id:'u_client1', name:'أحمد الشمري', email:'client@integriox.com', password:'client123', phone:'0501112233', role:'client', status:'approved', clientId:'c_1' },
        { id:'u_tech1', name:'محمد العتيبي', email:'tech@integriox.com', password:'tech123', phone:'0502223344', role:'technician', status:'approved', techId:'t_1' },
        { id:'u_pending1', name:'سارة القحطاني', email:'sara@example.com', password:'123456', phone:'0509998877', role:'client', status:'pending' },
      ],
      clients: [
        { id:'c_1', name:'أحمد الشمري', phone:'0501112233', email:'client@integriox.com', address:'الرياض - حي النرجس', createdAt: now },
        { id:'c_2', name:'شركة النخبة التجارية', phone:'0555556677', email:'info@elitecorp.sa', address:'جدة - حي الروضة', createdAt: now },
        { id:'c_3', name:'مصنع الأمل للصناعات', phone:'0533334455', email:'contact@amal-factory.sa', address:'الدمام - المنطقة الصناعية', createdAt: now },
      ],
      technicians: [
        { id:'t_1', name:'محمد العتيبي', phone:'0502223344', email:'tech@integriox.com', specialty:'تكييف وتبريد', rating:4.8 },
        { id:'t_2', name:'خالد الدوسري', phone:'0544445566', email:'khaled@integriox.com', specialty:'كهرباء وأنظمة', rating:4.6 },
        { id:'t_3', name:'عبدالله المطيري', phone:'0577778899', email:'abdullah@integriox.com', specialty:'شبكات وحاسب آلي', rating:4.9 },
      ],
      contracts: [
        { id:'CT-1001', clientId:'c_1', amount:24000, durationMonths:12, periodType:'fixed', contractType:'all', startDate:'2026-01-01', endDate:'2026-12-31', visitsTotal:12, visitsUsed:5, paymentTerms:'deferred', status:'active', signature:null, createdAt:now },
        { id:'CT-1002', clientId:'c_2', amount:60000, durationMonths:12, periodType:'open', contractType:'onsite', startDate:'2025-09-01', endDate:'', visitsTotal:24, visitsUsed:9, paymentTerms:'upfront', status:'active', signature:null, createdAt:now },
        { id:'CT-1003', clientId:'c_3', amount:18000, durationMonths:6, periodType:'fixed', contractType:'visits', startDate:'2026-02-01', endDate:'2026-07-31', visitsTotal:6, visitsUsed:6, paymentTerms:'deferred', status:'closed', signature:null, createdAt:now },
        { id:'CT-1004', clientId:'c_2', amount:15000, durationMonths:12, periodType:'fixed', contractType:'remote', startDate:'2026-03-01', endDate:'2027-02-28', visitsTotal:12, visitsUsed:1, paymentTerms:'upfront', status:'renewal', signature:null, createdAt:now },
      ],
      visits: [
        { id:'V-5001', contractId:'CT-1001', clientId:'c_1', techId:'t_1', date:'2026-07-20', time:'10:00', type:'periodic', status:'scheduled', description:'صيانة دورية شهرية لأجهزة التكييف' },
        { id:'V-5002', contractId:'CT-1002', clientId:'c_2', techId:'t_2', date:'2026-07-15', time:'13:00', type:'fault', status:'ongoing', description:'عطل في اللوحة الكهربائية الرئيسية' },
        { id:'V-5003', contractId:'CT-1001', clientId:'c_1', techId:'t_1', date:'2026-06-18', time:'09:30', type:'periodic', status:'done', description:'صيانة دورية' },
        { id:'V-5004', contractId:'CT-1003', clientId:'c_3', techId:'t_3', date:'2026-07-10', time:'11:00', type:'urgent', status:'done', description:'توقف كامل في نظام الشبكة' },
        { id:'V-5005', contractId:'CT-1004', clientId:'c_2', techId:'t_2', date:'2026-07-22', time:'15:00', type:'periodic', status:'scheduled', description:'فحص أنظمة الدعم عن بعد' },
        { id:'V-5006', contractId:'CT-1002', clientId:'c_2', techId:null, date:'2026-07-25', time:'10:00', type:'fault', status:'scheduled', description:'بلاغ عطل في وحدة التبريد الثانية' },
      ],
      payments: [
        { id:'P-9001', contractId:'CT-1001', clientId:'c_1', amount:2000, method:'bank', date:'2026-06-01', status:'confirmed', proofName:'receipt_june.pdf' },
        { id:'P-9002', contractId:'CT-1002', clientId:'c_2', amount:30000, method:'bank', date:'2025-09-05', status:'confirmed', proofName:'transfer_sept.jpg' },
        { id:'P-9003', contractId:'CT-1001', clientId:'c_1', amount:2000, method:'cash', date:'2026-07-01', status:'review', proofName:'cash_receipt_july.jpg' },
        { id:'P-9004', contractId:'CT-1004', clientId:'c_2', amount:15000, method:'other', date:'2026-03-02', status:'confirmed', proofName:'stc_pay.png' },
      ],
      activity: [
        { id:'a1', text_ar:'تم تسجيل دفعة جديدة للعقد CT-1001', text_en:'New payment recorded for contract CT-1001', at: now },
        { id:'a2', text_ar:'تمت جدولة زيارة جديدة للعميل أحمد الشمري', text_en:'New visit scheduled for client Ahmed Al-Shamri', at: now },
      ]
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
  function logActivity(text_ar, text_en){
    const data = load();
    data.activity.unshift({ id: uid('a'), text_ar, text_en, at: new Date().toISOString() });
    data.activity = data.activity.slice(0,20);
    save(data);
  }

  return {
    uid, todayISO, load, save, resetDemo,
    all, get, insert, update, remove,
    getSettings, saveSettings, logActivity,
    setMode:(m)=>MODE=m,
  };
})();
