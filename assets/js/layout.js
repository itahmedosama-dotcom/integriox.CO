/* ==========================================================================
   Integriox — App shell (sidebar + topbar), role-aware navigation
   ========================================================================== */
const LAYOUT = (function(){

  const ICONS = {
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
    clients: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17.5" cy="8.5" r="2.4"/><path d="M15.5 14.2c2.8.4 4.9 2.6 4.9 5.8"/></svg>`,
    tech: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2z"/></svg>`,
    contracts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7M9 8h2"/></svg>`,
    visits: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="m8.5 15 2 2 4-4"/></svg>`,
    request: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
    payments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19"/><path d="M6 15h4"/></svg>`,
    invoices: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2h10v20l-2.5-1.5L12 22l-2.5-1.5L7 22z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.9 7.9 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4L4.6 10.5a7.9 7.9 0 0 0 0 3L2.6 15l2 3.4 2.3-.9c.8.7 1.7 1.2 2.6 1.5l.5 2.5h4l.5-2.5c1-.3 1.8-.8 2.6-1.5l2.3.9 2-3.4-2-1.5z"/></svg>`,
    docdesign: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/><circle cx="14.5" cy="14.5" r="2.5"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.7-6.2 5.5-6.2s5.5 2.6 5.5 6.2"/><circle cx="17" cy="7" r="2.4"/><path d="M15.2 13.3c2.6.5 4.3 2.7 4.3 6.7"/></svg>`,
    complaint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H8l-4 4z"/><path d="M12 8v4"/><circle cx="12" cy="15" r="0.5" fill="currentColor"/></svg>`,
    statement: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/><path d="M9 12h6M9 15.5h6M9 9h3"/></svg>`,
    joborders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6l1 3h4v17H4V5h4z"/><path d="M9 2v3h6V2"/><path d="m9 13 2 2 4-4"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  };

  const NAV = [
    { key:'dashboard', href:'dashboard.html', icon:'dashboard', label:'nav_dashboard', roles:['admin','client','technician'] },
    { key:'clients', href:'clients.html', icon:'clients', label:'nav_clients', roles:['admin'] },
    { key:'contracts', href:'contracts.html', icon:'contracts', label:'nav_contracts', roles:['admin','client'] },
    { key:'technicians', href:'technicians.html', icon:'tech', label:'nav_technicians', roles:['admin'] },
    { key:'job-orders', href:'job-orders.html', icon:'joborders', label:'nav_job_orders', roles:['admin','client'] },
    { key:'visit-request', href:'visit-request.html', icon:'request', label:'nav_visit_request', roles:['admin','client'] },
    { key:'visits', href:'visits.html', icon:'visits', label:'nav_visits', roles:['admin','technician','client'] },
    { key:'payments', href:'payments.html', icon:'payments', label:'nav_payments', roles:['admin','client'] },
    { key:'invoices', href:'invoices.html', icon:'invoices', label:'nav_invoices', roles:['admin','client'] },
    { key:'statement', href:'statement.html', icon:'statement', label:'nav_statement', roles:['admin','client'] },
    { key:'complaints', href:'complaints.html', icon:'complaint', label:'nav_complaints', roles:['admin','client','technician'] },
    { key:'settings', href:'settings.html', icon:'settings', label:'nav_settings', roles:['admin'] },
    { key:'document-design', href:'document-design.html', icon:'docdesign', label:'nav_document_design', roles:['admin'] },
  ];

  function render(activeKey){
    const user = AUTH.requireAuth();
    if(!user) return null;

    const clientRecord = user.role==='client' && user.clientId ? DB.get('clients', user.clientId) : null;
    const items = NAV.filter(n => n.roles.includes(user.role));
    const navHtml = items.map(n => `
      <a class="nav-link ${n.key===activeKey?'active':''}" href="${n.href}">
        ${ICONS[n.icon]}<span data-i18n="${n.label}"></span>
      </a>`).join('');

    const shell = document.getElementById('app-shell');
    shell.innerHTML = `
      <div class="sidebar-backdrop no-print" id="sidebarBackdrop"></div>
      <div class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <img src="assets/images/logo.png" alt="Integriox">
          <div>
            <div class="name" data-i18n="app_name"></div>
            <div class="tag" data-i18n="app_tag"></div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-section" data-i18n="nav_section_main"></div>
          ${navHtml}
        </nav>
        <div class="sidebar-foot">
          <button type="button" class="user-chip" id="userChipBtn" style="cursor:pointer; border:none; background:none; text-align:start; width:100%;">
            ${UI.avatarHtml(user.name, clientRecord && clientRecord.logo)}
            <div>
              <div class="u-name">${user.name}</div>
              <div class="u-role">${AUTH.roleLabel(user.role)}</div>
            </div>
          </button>
        </div>
      </div>
      <div class="main">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:14px;">
            <button class="icon-btn menu-toggle" id="menuToggle">${ICONS.menu}</button>
            <h1 id="pageTitle" data-i18n="${NAV.find(n=>n.key===activeKey)?.label || 'nav_dashboard'}"></h1>
          </div>
          <div class="topbar-right">
            <a class="quick-action-btn no-print" id="quickActionBtn2" href="job-orders.html?new=1" style="display:none;"></a>
            <a class="quick-action-btn no-print" id="quickActionBtn" href="#"></a>
            <div class="lang-switch">
              <button data-lang="ar">AR</button>
              <button data-lang="en">EN</button>
            </div>
            <div class="notif-wrap" style="position:relative;">
              <button type="button" class="icon-btn" id="notifBtn" title="notifications">${ICONS.bell}<span class="dot hidden" id="notifDot"></span></button>
              <div class="notif-panel hidden" id="notifPanel"></div>
            </div>
            <button class="icon-btn" id="logoutBtn" title="logout">${ICONS.logout}</button>
          </div>
        </div>
        <div class="page" id="pageContent"></div>
      </div>
    `;

    // lang switch state + handlers
    const langBtns = shell.querySelectorAll('.lang-switch button');
    function syncLangBtns(){ langBtns.forEach(b=>b.classList.toggle('active', b.dataset.lang===I18N.getLang())); }
    syncLangBtns();
    langBtns.forEach(b=> b.addEventListener('click', ()=>{ I18N.setLang(b.dataset.lang); syncLangBtns(); document.dispatchEvent(new CustomEvent('lang-changed')); }));

    shell.querySelector('#logoutBtn').addEventListener('click', AUTH.logout);
    const menuToggle = shell.querySelector('#menuToggle');
    const sidebar = shell.querySelector('#sidebar');
    const sidebarBackdrop = shell.querySelector('#sidebarBackdrop');
    function toggleSidebar(open){
      const shouldOpen = open !== undefined ? open : !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', shouldOpen);
      if(sidebarBackdrop) sidebarBackdrop.classList.toggle('open', shouldOpen);
    }
    if(menuToggle) menuToggle.addEventListener('click', ()=> toggleSidebar());
    if(sidebarBackdrop) sidebarBackdrop.addEventListener('click', ()=> toggleSidebar(false));
    // tapping a nav link on mobile should close the drawer, not leave it open over the new page
    shell.querySelectorAll('.nav-link').forEach(a=> a.addEventListener('click', ()=> toggleSidebar(false)));

    I18N.apply(shell);
    UI.mountFooter(shell.querySelector('.main'));
    UI.mountWhatsapp();
    document.addEventListener('lang-changed', ()=>{ UI.mountFooter(shell.querySelector('.main')); UI.mountWhatsapp(); });
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('sw.js').catch(()=>{});
      if(!navigator.serviceWorker.__integriox_reload_wired){
        navigator.serviceWorker.__integriox_reload_wired = true;
        navigator.serviceWorker.addEventListener('message', (e)=>{
          if(e.data && e.data.type === 'SW_UPDATED'){
            const seen = sessionStorage.getItem('integriox_sw_build');
            if(seen !== e.data.build){
              sessionStorage.setItem('integriox_sw_build', e.data.build);
              window.location.reload();
            }
          }
        });
      }
    }
    shell.querySelector('#userChipBtn').addEventListener('click', ()=> openProfileModal(user));
    mountNotifications(shell, user);
    mountQuickAction(shell, user);
    return { user, contentEl: shell.querySelector('#pageContent') };
  }

  function mountQuickAction(shell, user){
    const el = shell.querySelector('#quickActionBtn');
    const el2 = shell.querySelector('#quickActionBtn2');
    if(!el) return;

    const clientRecord = user.role==='client' && user.clientId ? DB.get('clients', user.clientId) : null;
    const isOnDemandOnly = clientRecord && clientRecord.clientType === 'on_demand';

    if(isOnDemandOnly){
      el.style.display = 'none';
    } else if(user.role === 'technician'){
      el.style.display = '';
      el.href = 'visits.html';
      el.innerHTML = `<span class="quick-action-icon">🛠️</span><span data-i18n="my_visits_assigned"></span>`;
    } else {
      el.style.display = '';
      el.href = 'visit-request.html';
      el.innerHTML = `<span class="quick-action-icon">⚡</span><span data-i18n="request_new_visit"></span>`;
    }
    I18N.apply(el);

    if(el2 && user.role !== 'technician'){
      el2.style.display = '';
      el2.innerHTML = `<span class="quick-action-icon">🧰</span><span data-i18n="register_new_job_order"></span>`;
      I18N.apply(el2);
    }
  }

  function computeNotifications(user){
    const items = [];
    if(user.role === 'admin'){
      const pending = DB.all('users').filter(u=>u.status==='pending').length;
      if(pending) items.push({ textAr:`${pending} حساب بانتظار الموافقة`, textEn:`${pending} account(s) awaiting approval`, href:'settings.html' });
      const overdue = (window.BILLING ? BILLING.overdueInvoices() : []).length;
      if(overdue) items.push({ textAr:`${overdue} فاتورة متأخرة عن السداد`, textEn:`${overdue} overdue invoice(s)`, href:'dashboard.html' });
      const newComplaints = DB.all('complaints').filter(c=>c.status==='open').length;
      if(newComplaints) items.push({ textAr:`${newComplaints} شكوى جديدة`, textEn:`${newComplaints} new complaint(s)`, href:'complaints.html' });
      const newVisits = DB.all('visits').filter(v=>v.status==='requested').length;
      if(newVisits) items.push({ textAr:`${newVisits} طلب زيارة جديد`, textEn:`${newVisits} new visit request(s)`, href:'visits.html' });
      const renewals = window.BILLING ? BILLING.contractsNearingRenewal() : [];
      if(renewals.length){
        const soonest = renewals[0];
        const visitsNote = soonest.visitsRemaining !== null ? ` — ${soonest.visitsRemaining} زيارة متبقية` : '';
        const visitsNoteEn = soonest.visitsRemaining !== null ? ` — ${soonest.visitsRemaining} visits left` : '';
        items.push({
          textAr: `${renewals.length} عقد قريب من الانتهاء (أقربهم ${soonest.id} خلال ${soonest.daysLeft} يوم${visitsNote})`,
          textEn: `${renewals.length} contract(s) nearing renewal (soonest: ${soonest.id} in ${soonest.daysLeft} day(s)${visitsNoteEn})`,
          href: 'contracts.html',
        });
      }
      const resetRequests = DB.all('users').filter(u=>u.passwordResetRequested).length;
      if(resetRequests) items.push({ textAr:`${resetRequests} طلب إعادة تعيين كلمة مرور`, textEn:`${resetRequests} password reset request(s)`, href:'settings.html' });
    } else if(user.role === 'client'){
      const overdue = (window.BILLING ? BILLING.overdueInvoices(user.clientId) : []).length;
      if(overdue) items.push({ textAr:`${overdue} فاتورة متأخرة عن السداد`, textEn:`${overdue} overdue invoice(s)`, href:'invoices.html' });
    } else if(user.role === 'technician'){
      const visits = DB.all('visits').filter(v=> user.canViewAllVisits ? v.status==='requested' : (v.techId===user.techId && v.status==='requested'));
      if(visits.length) items.push({ textAr:`${visits.length} طلب زيارة جديد`, textEn:`${visits.length} new visit request(s)`, href:'visits.html' });
    }
    return items;
  }

  function mountNotifications(shell, user){
    const btn = shell.querySelector('#notifBtn');
    const dot = shell.querySelector('#notifDot');
    const panel = shell.querySelector('#notifPanel');
    const items = computeNotifications(user);
    dot.classList.toggle('hidden', items.length === 0);
    function draw(){
      panel.innerHTML = items.length
        ? items.map(it=>`<a class="notif-item" href="${it.href}">${I18N.getLang()==='ar'?it.textAr:it.textEn}</a>`).join('')
        : `<div class="notif-empty">${I18N.t('no_notifications')}</div>`;
    }
    draw();
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      panel.classList.toggle('hidden');
    });
    document.addEventListener('click', (e)=>{
      if(!panel.contains(e.target) && e.target!==btn) panel.classList.add('hidden');
    });
  }

  // Lets any logged-in user edit their own name/email/password from the
  // sidebar — but never their username (that stays fixed once set).
  function openProfileModal(user){
    const overlay = UI.openModal(`
      <div class="modal-head"><h3 data-i18n="my_profile"></h3><button type="button" class="close-x" id="pClose">&times;</button></div>
      <div class="modal-body">
        <div class="field"><label data-i18n="full_name"></label><input type="text" id="pName" value="${user.name||''}"></div>
        <div class="field"><label data-i18n="email"></label><input type="email" id="pEmail" value="${user.email||''}"></div>
        ${user.username ? `<div class="field"><label data-i18n="username"></label><input type="text" value="${user.username}" disabled></div>` : ''}
        <div class="field-row">
          <div class="field"><label data-i18n="new_password_optional"></label><input type="password" id="pPassword"></div>
          <div class="field"><label data-i18n="confirm_password"></label><input type="password" id="pPassword2"></div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-outline" id="pCancel" data-i18n="cancel"></button>
        <button type="button" class="btn btn-primary" id="pSave" data-i18n="save"></button>
      </div>
    `);
    I18N.apply(overlay);
    overlay.querySelector('#pClose').addEventListener('click', UI.closeModal);
    overlay.querySelector('#pCancel').addEventListener('click', UI.closeModal);
    overlay.querySelector('#pSave').addEventListener('click', ()=>{
      const name = overlay.querySelector('#pName').value.trim();
      const email = overlay.querySelector('#pEmail').value.trim();
      const password = overlay.querySelector('#pPassword').value;
      const password2 = overlay.querySelector('#pPassword2').value;
      if(!name || !email){ UI.toast(I18N.t('err_required'), 'error'); return; }
      if(password && password !== password2){ UI.toast(I18N.t('err_pass_match'), 'error'); return; }
      if(DB.all('users').some(x=>x.id!==user.id && x.email.toLowerCase()===email.toLowerCase())){
        UI.toast(I18N.t('err_login'), 'error'); return;
      }
      const patch = { name, email };
      if(password) patch.password = password;
      DB.update('users', user.id, patch);
      // keep the client/technician record's own name in sync too, since it
      // shows up on invoices/contracts elsewhere.
      if(user.clientId) DB.update('clients', user.clientId, { name, nameAr:name });
      if(user.techId) DB.update('technicians', user.techId, { name, nameAr:name });
      DB.logActivity('تم تحديث البيانات الشخصية للمستخدم ' + name, 'User updated their own profile: ' + name, 'user');
      UI.toast(I18N.t('saved_ok'), 'success');
      UI.closeModal();
      setTimeout(()=>window.location.reload(), 900);
    });
  }

  // Blocks a page for roles that shouldn't access it at all (nav hiding
  // alone doesn't stop someone from typing the URL directly) — e.g.
  // technicians have no business on the financial pages (payments,
  // invoices, statements). Redirects to the dashboard and returns false
  // when blocked, so the caller can bail out immediately.
  function guardRoles(ctx, allowedRoles){
    if(!ctx) return false;
    if(!allowedRoles.includes(ctx.user.role)){
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }

  return { render, guardRoles };
})();
