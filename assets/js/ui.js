/* ==========================================================================
   Integriox — UI helpers
   ========================================================================== */
const UI = (function(){

  function toast(msg, type){
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' '+type : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(10px)'; el.style.transition='.2s'; setTimeout(()=>el.remove(),200); }, 2600);
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

  return { toast, openModal, closeModal, confirmAction, fileToDataURL, fmtMoney, fmtDate, initials, SignaturePad };
})();
