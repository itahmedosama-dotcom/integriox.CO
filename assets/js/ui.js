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
        <button class="btn btn-primary btn-sm success-popup-ok" data-i18n="ok"></button>
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

  /* ---------- lightweight captcha (anti-spam, not a real bot-proof CAPTCHA) ---------- */
  function makeCaptcha(container){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    function gen(){
      code = Array.from({length:5}, ()=>chars[Math.floor(Math.random()*chars.length)]).join('');
      container.innerHTML = `
        <div class="captcha-code" aria-hidden="true">
          ${code.split('').map((c,i)=>`<span style="transform:rotate(${(i%2?1:-1)*(6+Math.random()*10)|0}deg);color:hsl(${205+(i*13)%40},55%,${30+ (i%3)*8}%)">${c}</span>`).join('')}
        </div>
        <button type="button" class="captcha-refresh" title="${I18N.t('captcha_refresh')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 12a9 9 0 1 1 2.6 6.3M3 12V6m0 6h6"/></svg>
        </button>`;
      container.querySelector('.captcha-refresh').addEventListener('click', gen);
    }
    gen();
    return { verify:(val)=> String(val||'').trim().toUpperCase() === code, refresh: gen };
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

  function fmtMoney(n){
    const v = Number(n||0).toLocaleString(I18N.getLang()==='ar' ? 'ar-EG' : 'en-US');
    return v + ' ' + I18N.t('currency');
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

  return { toast, successPopup, mountFooter, mountWhatsapp, makeCaptcha, openModal, closeModal, confirmAction, fileToDataURL, fmtMoney, fmtDate, initials, SignaturePad };
})();
