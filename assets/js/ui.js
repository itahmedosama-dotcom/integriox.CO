/* ==========================================================================
   Integriox — UI helpers
   ========================================================================== */
const UI = (function(){

  function toast(msg, type){
    if(type === 'success'){ return successPopup(msg); }
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' '+type : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(10px)'; el.style.transition='.2s'; setTimeout(()=>el.remove(),200); }, 2600);
  }

  /* ---------- success confirmation popup ----------
     Shown for every save / submit action across the platform so the user
     gets an unmistakable "تم" confirmation, not just a corner toast. */
  function successPopup(msg){
    const ex = document.getElementById('ui-success-popup');
    if(ex) ex.remove();
    const overlay = document.createElement('div');
    overlay.className = 'success-popup-overlay';
    overlay.id = 'ui-success-popup';
    overlay.innerHTML = `
      <div class="success-popup-card">
        <div class="success-popup-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12.5l5 5L20 6"/></svg>
        </div>
        <div class="success-popup-title" data-i18n="done_title"></div>
        <div class="success-popup-msg"></div>
        <button type="button" class="btn btn-primary btn-sm success-popup-ok" data-i18n="ok"></button>
      </div>`;
    overlay.querySelector('.success-popup-msg').textContent = msg || '';
    document.body.appendChild(overlay);
    I18N.apply(overlay);
    function close(){ overlay.remove(); }
    overlay.querySelector('.success-popup-ok').addEventListener('click', close);
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
    setTimeout(close, 2200);
    return overlay;
  }

  /* ---------- shared footer (copyright / IP notice) ----------
     Rendered inside the app shell (layout.js) and on the login page
     (index.html) so it appears on every page, and reflects live edits
     made from Settings → Footer & WhatsApp without needing a rebuild. */
  function footerHtml(){
    const s = DB.getSettings();
    const text = I18N.getLang()==='ar' ? (s.footerText||'') : (s.footerTextEn||s.footerText||'');
    return `<footer class="site-footer no-print">
      <span>${text}</span>
      ${s.companyPhone ? `<span class="site-footer-sep">·</span><span>📞 ${s.companyPhone}</span>` : ''}
      ${s.companyEmail ? `<span class="site-footer-sep">·</span><span>✉️ ${s.companyEmail}</span>` : ''}
    </footer>`;
  }
  function mountFooter(targetEl){
    if(!targetEl) return;
    let el = targetEl.querySelector(':scope > .site-footer');
    if(!el){ targetEl.insertAdjacentHTML('beforeend', footerHtml()); }
    else { el.outerHTML = footerHtml(); }
  }

  /* ---------- floating WhatsApp contact widget ----------
     Mounted once per page (idempotent); number/message are editable from
     Settings → Footer & WhatsApp, and the label follows the active language. */
  function mountWhatsapp(){
    let el = document.getElementById('wa-float');
    const s = DB.getSettings();
    if(!s.whatsappNumber){ if(el) el.remove(); return; }
    const msg = I18N.getLang()==='ar' ? (s.whatsappMessage||'') : (s.whatsappMessageEn||s.whatsappMessage||'');
    const number = String(s.whatsappNumber).replace(/[^0-9]/g,'');
    const href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    if(!el){
      el = document.createElement('a');
      el.id = 'wa-float';
      el.className = 'wa-float no-print';
      el.target = '_blank';
      el.rel = 'noopener';
      document.body.appendChild(el);
    }
    el.href = href;
    el.innerHTML = `
      <span class="wa-float-icon">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor"><path d="M16 3C9 3 3.3 8.6 3.3 15.5c0 2.4.7 4.6 1.8 6.5L3 29l7.3-2c1.8 1 3.9 1.5 5.7 1.5 7 0 12.7-5.6 12.7-12.5S23 3 16 3zm0 22.8c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.2 1.2-4.2-.3-.4a10.2 10.2 0 0 1-1.6-5.4C5.3 9.9 10.1 5.2 16 5.2S26.7 9.9 26.7 15.7 21.9 25.8 16 25.8zm5.8-7.7c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-2.5-1.6 9.4 9.4 0 0 1-1.7-2.2c-.2-.3 0-.5.1-.6l.4-.5.3-.4a.6.6 0 0 0 0-.5c-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.6 3.6 0 0 0-1.1 2.7c0 1.6 1.1 3.1 1.3 3.3.2.3 2.2 3.4 5.4 4.7.8.3 1.4.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4z"/></svg>
      </span>
      <span class="wa-float-label" data-i18n="contact_us"></span>`;
    I18N.apply(el);
  }

  /* ---------- PWA "install app" floating button ----------
     Sits just above the WhatsApp button. Only appears once the browser
     fires `beforeinstallprompt` (i.e. the app is actually installable) and
     hides itself again once installed. */
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallButton();
  });
  window.addEventListener('appinstalled', ()=>{
    deferredInstallPrompt = null;
    const el = document.getElementById('pwa-install-float');
    if(el) el.remove();
  });
  function showInstallButton(){
    if(!deferredInstallPrompt) return;
    if(document.getElementById('pwa-install-float')) return;
    const el = document.createElement('button');
    el.id = 'pwa-install-float';
    el.className = 'pwa-install-float no-print';
    el.type = 'button';
    el.innerHTML = `
      <span class="pwa-install-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
      </span>
      <span class="pwa-install-label" data-i18n="install_app"></span>`;
    document.body.appendChild(el);
    I18N.apply(el);
    el.addEventListener('click', async ()=>{
      if(!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      el.remove();
    });
  }

  /* ---------- lightweight captcha (anti-spam, not a real bot-proof CAPTCHA) ----------
     `inputEl` (optional) is the text field the code should end up in. When
     given, a Copy button next to the code fills it directly into that
     field (so users never have to transcribe the styled/rotated
     characters by hand — the main source of "wrong code" mismatches).
     Validation also normalizes the input (trim, uppercase, strip spaces,
     map look-alike characters) so a visually ambiguous character never
     fails a correct answer. */
  function makeCaptcha(container, inputEl){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    function normalize(v){
      return String(v||'').toUpperCase().replace(/\s+/g,'')
        .replace(/O/g,'0').replace(/I/g,'1').replace(/L/g,'1');
    }
    function gen(){
      code = Array.from({length:5}, ()=>chars[Math.floor(Math.random()*chars.length)]).join('');
      container.innerHTML = `
        <div class="captcha-code" dir="ltr" aria-hidden="true">
          ${code.split('').map((c,i)=>`<span style="transform:rotate(${(i%2?1:-1)*(4+Math.random()*6)|0}deg);color:hsl(${205+(i*13)%40},55%,${28+ (i%3)*8}%)">${c}</span>`).join('')}
        </div>
        <button type="button" class="captcha-copy" title="${I18N.t('captcha_copy')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
        <button type="button" class="captcha-refresh" title="${I18N.t('captcha_refresh')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 12a9 9 0 1 1 2.6 6.3M3 12V6m0 6h6"/></svg>
        </button>`;
      container.querySelector('.captcha-refresh').addEventListener('click', gen);
      container.querySelector('.captcha-copy').addEventListener('click', async ()=>{
        try{ await navigator.clipboard.writeText(code); toast(I18N.t('captcha_copied'), 'success'); }catch(e){}
        if(inputEl){ inputEl.value = code; inputEl.focus(); }
      });
    }
    gen();
    if(inputEl){ inputEl.setAttribute('dir','ltr'); inputEl.style.textAlign = 'left'; }
    return { verify:(val)=> normalize(val) === normalize(code), refresh: gen };
  }

  function openModal(html, opts){
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'ui-overlay';
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay && !(opts&&opts.noBackdropClose)) closeModal(); });
    document.body.appendChild(overlay);
    I18N.apply(overlay);
    return overlay;
  }
  function closeModal(){
    const ex = document.getElementById('ui-overlay');
    if(ex) ex.remove();
  }

  function confirmAction(message, onConfirm){
    if(window.confirm(message)) onConfirm();
  }

  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // Downscales/compresses an image file to a small dataURL (default max
  // 320px on the longest side, JPEG ~0.82 quality) so logos/photos don't
  // bloat localStorage. Falls back to the raw file if resizing fails.
  function resizeImageFile(file, maxDim){
    maxDim = maxDim || 320;
    return new Promise((resolve)=>{
      const img = new Image();
      const reader = new FileReader();
      reader.onload = ()=>{
        img.onload = ()=>{
          try{
            let { width, height } = img;
            if(width > maxDim || height > maxDim){
              const scale = maxDim / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          }catch(e){ resolve(reader.result); }
        };
        img.onerror = ()=> resolve(reader.result);
        img.src = reader.result;
      };
      reader.onerror = ()=> resolve(null);
      reader.readAsDataURL(file);
    });
  }

  function fmtMoney(n, currencyCode){
    const v = Number(n||0).toLocaleString(I18N.getLang()==='ar' ? 'ar-EG' : 'en-US');
    let label = I18N.t('currency');
    if(currencyCode && window.DB){
      const cur = (DB.getSettings().currencies||[]).find(c=>c.code===currencyCode);
      if(cur) label = I18N.getLang()==='ar' ? (cur.symbol || cur.nameAr) : (cur.symbol || cur.nameEn || cur.code);
    }
    return v + ' ' + label;
  }
  function fmtDate(d){
    if(!d) return '—';
    try{
      const dt = new Date(d);
      return dt.toLocaleDateString(I18N.getLang()==='ar' ? 'ar-EG' : 'en-GB', { year:'numeric', month:'short', day:'numeric' });
    }catch(e){ return d; }
  }
  function initials(name){
    return (name||'?').trim().split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  }
  // Renders either the given logo/photo as a round image, or initials —
  // used for the sidebar profile avatar and anywhere else a client logo
  // should represent the user.
  function avatarHtml(name, logoDataUrl, extraStyle){
    if(logoDataUrl){
      return `<div class="avatar" style="padding:0; overflow:hidden; ${extraStyle||''}"><img src="${logoDataUrl}" alt="${name||''}" style="width:100%;height:100%;object-fit:cover;"></div>`;
    }
    return `<div class="avatar" style="${extraStyle||''}">${initials(name)}</div>`;
  }

  /* ---------- lightweight signature pad (canvas) ---------- */
  function SignaturePad(canvas){
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.4; ctx.lineCap='round'; ctx.strokeStyle = '#0B2545';
    let drawing = false, has = false;
    function pos(e){
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: (t.clientX-rect.left) * (canvas.width/rect.width), y: (t.clientY-rect.top) * (canvas.height/rect.height) };
    }
    function start(e){ drawing=true; has=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault(); }
    function move(e){ if(!drawing) return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); e.preventDefault(); }
    function end(){ drawing=false; }
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', end);
    return {
      clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); has=false; },
      isEmpty(){ return !has; },
      toDataURL(){ return canvas.toDataURL('image/png'); }
    };
  }

  return { toast, successPopup, mountFooter, mountWhatsapp, showInstallButton, makeCaptcha, openModal, closeModal, confirmAction, fileToDataURL, resizeImageFile, fmtMoney, fmtDate, initials, avatarHtml, SignaturePad };
})();
