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
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.7-6.2 5.5-6.2s5.5 2.6 5.5 6.2"/><circle cx="17" cy="7" r="2.4"/><path d="M15.2 13.3c2.6.5 4.3 2.7 4.3 6.7"/></svg>`,
    complaint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H8l-4 4z"/><path d="M12 8v4"/><circle cx="12" cy="15" r="0.5" fill="currentColor"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  };

  const NAV = [
    { key:'dashboard', href:'dashboard.html', icon:'dashboard', label:'nav_dashboard', roles:['admin','client','technician'] },
    { key:'clients', href:'clients.html', icon:'clients', label:'nav_clients', roles:['admin'] },
    { key:'technicians', href:'technicians.html', icon:'tech', label:'nav_technicians', roles:['admin'] },
    { key:'contracts', href:'contracts.html', icon:'contracts', label:'nav_contracts', roles:['admin','client'] },
    { key:'visits', href:'visits.html', icon:'visits', label:'nav_visits', roles:['admin','technician','client'] },
    { key:'visit-request', href:'visit-request.html', icon:'request', label:'nav_visit_request', roles:['admin','client'] },
    { key:'payments', href:'payments.html', icon:'payments', label:'nav_payments', roles:['admin','client'] },
    { key:'invoices', href:'invoices.html', icon:'invoices', label:'nav_invoices', roles:['admin','client'] },
    { key:'complaints', href:'complaints.html', icon:'complaint', label:'nav_complaints', roles:['admin','client','technician'] },
    { key:'settings', href:'settings.html', icon:'settings', label:'nav_settings', roles:['admin'] },
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
          <div class="user-chip">
            ${UI.avatarHtml(user.name, clientRecord && clientRecord.logo)}
            <div>
              <div class="u-name">${user.name}</div>
              <div class="u-role">${AUTH.roleLabel(user.role)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="main">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:14px;">
            <button class="icon-btn menu-toggle" id="menuToggle">${ICONS.menu}</button>
            <h1 id="pageTitle" data-i18n="${NAV.find(n=>n.key===activeKey)?.label || 'nav_dashboard'}"></h1>
          </div>
          <div class="topbar-right">
            <div class="lang-switch">
              <button data-lang="ar">AR</button>
              <button data-lang="en">EN</button>
            </div>
            <button class="icon-btn" title="notifications">${ICONS.bell}<span class="dot"></span></button>
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
    if(menuToggle) menuToggle.addEventListener('click', ()=> sidebar.classList.toggle('open'));

    I18N.apply(shell);
    UI.mountFooter(shell.querySelector('.main'));
    UI.mountWhatsapp();
    document.addEventListener('lang-changed', ()=>{ UI.mountFooter(shell.querySelector('.main')); UI.mountWhatsapp(); });
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
    return { user, contentEl: shell.querySelector('#pageContent') };
  }

  return { render };
})();
