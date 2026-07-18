/* ==========================================================================
   Integriox — Auth (client-side demo).
   NOTE: For production, replace with real hashed auth on the Apps Script
   side; this layer is intentionally simple for a static-hosted demo.
   ========================================================================== */
const AUTH = (function(){
  const SKEY = 'integriox_session';

  function login(email, password){
    const users = DB.all('users');
    const u = users.find(x=>x.email.toLowerCase()===String(email).toLowerCase() && x.password===password);
    if(!u) return { ok:false, error:'err_login' };
    if(u.status !== 'approved') return { ok:false, error:'err_pending' };
    localStorage.setItem(SKEY, JSON.stringify({ userId:u.id }));
    return { ok:true, user:u };
  }

  function register(data){
    const users = DB.all('users');
    if(users.some(x=>x.email.toLowerCase()===data.email.toLowerCase())){
      return { ok:false, error:'err_login' };
    }
    const user = {
      id: DB.uid('u'), name:data.name, email:data.email, password:data.password,
      phone:data.phone, role:data.role, status:'pending', company:data.company || ''
    };
    if(data.role === 'client'){
      const client = DB.insert('clients', { name:data.name, nameAr:data.name, nameEn:'', country:'', phone:data.phone, email:data.email, address:data.company||'', createdAt: DB.todayISO() });
      user.clientId = client.id;
    } else if(data.role === 'technician'){
      const tech = DB.insert('technicians', { name:data.name, phone:data.phone, email:data.email, specialty:data.company||'', nationality:'', rating:0 });
      user.techId = tech.id;
    }
    DB.insert('users', user);
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
    return u;
  }

  function roleLabel(role){
    const map = { admin:{ar:'مدير النظام',en:'Administrator'}, client:{ar:'عميل',en:'Client'}, technician:{ar:'فني',en:'Technician'} };
    const lang = I18N.getLang();
    return (map[role] && map[role][lang]) || role;
  }

  return { login, register, logout, currentUser, requireAuth, roleLabel };
})();
