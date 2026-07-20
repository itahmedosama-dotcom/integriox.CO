/* ==========================================================================
   Integriox — Auth (client-side demo).
   NOTE: For production, replace with real hashed auth on the Apps Script
   side; this layer is intentionally simple for a static-hosted demo.
   ========================================================================== */
const AUTH = (function(){
  const SKEY = 'integriox_session';

  // Auto-transitions any 'approved' user whose suspendAt date has already
  // passed into 'suspended'. Safe to call repeatedly (idempotent).
  function checkSuspensions(){
    const today = DB.todayISO();
    DB.all('users').forEach(u=>{
      if(u.status==='approved' && u.suspendAt && u.suspendAt <= today){
        DB.update('users', u.id, { status:'suspended' });
        DB.logActivity('تم إيقاف حساب ' + u.name + ' تلقائيًا (تاريخ الإيقاف المحدد)', 'Account auto-suspended: ' + u.name + ' (scheduled suspend date)', 'user');
      }
    });
  }

  // Accepts either the user's email OR username (case-insensitive) in `identifier`.
  function login(identifier, password){
    checkSuspensions();
    const users = DB.all('users');
    const id = String(identifier||'').trim().toLowerCase();
    const u = users.find(x=>
      (x.email && x.email.toLowerCase()===id) ||
      (x.username && x.username.toLowerCase()===id)
    );
    if(!u || u.password!==password) return { ok:false, error:'err_login' };
    if(u.status === 'suspended') return { ok:false, error:'err_suspended' };
    if(u.status !== 'approved') return { ok:false, error:'err_pending' };
    const sessionMinutes = Number(u.sessionMinutes) > 0 ? Number(u.sessionMinutes) : 15;
    localStorage.setItem(SKEY, JSON.stringify({ userId:u.id, expiresAt: Date.now() + sessionMinutes*60000 }));
    return { ok:true, user:u };
  }

  function register(data){
    const users = DB.all('users');
    if(users.some(x=>x.email.toLowerCase()===data.email.toLowerCase())){
      return { ok:false, error:'err_login' };
    }
    if(data.username && users.some(x=>(x.username||'').toLowerCase()===data.username.toLowerCase())){
      return { ok:false, error:'err_username_taken' };
    }
    const user = {
      id: DB.uid('u'), name:data.name, email:data.email, username:data.username||'', password:data.password,
      phone:data.phone, role:data.role, status:'pending', company:data.company || ''
    };
    if(data.role === 'client'){
      const client = DB.insert('clients', { name:data.name, nameAr:data.name, nameEn:'', country:'', phone:data.phone, email:data.email, address:data.company||'', logo:data.logo||'', createdAt: DB.todayISO() });
      user.clientId = client.id;
    } else if(data.role === 'technician'){
      const tech = DB.insert('technicians', { name:data.name, phone:data.phone, email:data.email, specialty:data.company||'', nationality:'', rating:0 });
      user.techId = tech.id;
      // by default a technician only sees visits assigned to them; an admin
      // can grant "see everything" from Settings → Users.
      user.canViewAllVisits = false;
    }
    DB.insert('users', user);
    DB.logActivity('تسجيل حساب جديد بانتظار الموافقة: ' + data.name, 'New account registered, pending approval: ' + data.name, 'user');
    return { ok:true };
  }

  function logout(){ localStorage.removeItem(SKEY); window.location.href = 'index.html'; }

  function currentUser(){
    const raw = localStorage.getItem(SKEY);
    if(!raw) return null;
    try{
      const { userId } = JSON.parse(raw);
      return DB.get('users', userId) || null;
    }catch(e){ return null; }
  }

  function requireAuth(){
    const u = currentUser();
    if(!u){ window.location.href = 'index.html'; return null; }
    if(isSessionExpired()){ logout(); return null; }
    checkSuspensions();
    // Re-check status from fresh data when we can, but never force a
    // logout just because the fresh lookup came back empty (e.g. a
    // transient sync/id mismatch) — only a CONFIRMED suspension logs out.
    const fresh = DB.get('users', u.id);
    if(fresh && fresh.status === 'suspended'){ logout(); return null; }
    return fresh || u;
  }

  function getSession(){
    const raw = localStorage.getItem(SKEY);
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }

  function isSessionExpired(){
    const s = getSession();
    return !!(s && s.expiresAt && Date.now() > s.expiresAt);
  }

  // Milliseconds left in the current session, or null if there's no
  // tracked expiry (e.g. a session created before this feature existed).
  function sessionMsRemaining(){
    const s = getSession();
    if(!s || !s.expiresAt) return null;
    return Math.max(0, s.expiresAt - Date.now());
  }

  // Resets the session's expiry back to a full window from now — called
  // on user activity so the timeout is idle-based (any interaction keeps
  // the session alive) rather than a fixed countdown from login.
  function extendSession(){
    const s = getSession();
    if(!s) return;
    const u = currentUser();
    const sessionMinutes = u && Number(u.sessionMinutes) > 0 ? Number(u.sessionMinutes) : 15;
    s.expiresAt = Date.now() + sessionMinutes*60000;
    localStorage.setItem(SKEY, JSON.stringify(s));
  }

  function roleLabel(role){
    const map = { admin:{ar:'مدير النظام',en:'Administrator'}, client:{ar:'عميل',en:'Client'}, technician:{ar:'فني',en:'Technician'} };
    const lang = I18N.getLang();
    return (map[role] && map[role][lang]) || role;
  }

  return { login, register, logout, currentUser, requireAuth, roleLabel, checkSuspensions, sessionMsRemaining, isSessionExpired, extendSession };
})();
