/* ==========================================================================
   Integriox — Billing helpers
   Shared by dashboard.html, invoices.html, invoice-template.html and
   contract-template.html: tax computation per contract, automatic monthly
   invoice generation for "deferred" (آجل) payment contracts, and overdue
   invoice detection.
   ========================================================================== */
const BILLING = (function(){

  // Which tax definitions (from Settings → الضرائب) apply to a contract,
  // and their combined rate.
  function contractTaxes(contract){
    const all = (DB.getSettings().taxes || []);
    const applied = all.filter(t => t.enabled && (contract && contract.taxIds || []).includes(t.id));
    const totalRate = applied.reduce((s,t)=> s + Number(t.rate||0), 0);
    return { applied, totalRate };
  }

  // Backs out subtotal + a per-tax breakdown from a final (tax-inclusive)
  // invoice amount, using whichever contract it belongs to.
  function invoiceBreakdown(amount, contract){
    amount = Number(amount||0);
    const { applied, totalRate } = contractTaxes(contract);
    const subtotal = totalRate > 0 ? Math.round((amount / (1 + totalRate/100)) * 100) / 100 : amount;
    const taxLines = applied.map(t=>({
      nameAr: t.nameAr, nameEn: t.nameEn, rate: t.rate,
      countryAr: t.countryAr, countryEn: t.countryEn,
      amount: Math.round(subtotal * (Number(t.rate||0)/100) * 100) / 100,
    }));
    const totalTax = Math.round((amount - subtotal) * 100) / 100;
    return { subtotal, taxLines, totalTax, total: amount };
  }

  // Scans active "deferred" contracts and creates the next period's
  // PENDING PAYMENT (not an invoice directly) once the configured due day
  // arrives, respecting each contract's billing cycle (monthly or
  // yearly). Confirming that payment in Payments is what actually issues
  // the invoice (see payments.html) — so every charge, recurring or not,
  // goes through the same review step before it ever reaches Invoices.
  // Safe to call repeatedly (e.g. on every dashboard/invoices page load) —
  // `lastAutoInvoiceMonth` guards against creating duplicates (holds a
  // 'YYYY-MM' key for monthly contracts, or a 'YYYY' key for yearly ones).
  function runAutoInvoices(){
    const today = new Date();
    const todayDay = today.getDate();
    let created = 0;
    DB.all('contracts').forEach(c=>{
      if(c.status !== 'active') return;
      if(c.paymentTerms !== 'deferred') return;
      if(!c.paymentDueDay) return;

      const cycle = c.billingCycle === 'yearly' ? 'yearly' : 'monthly';
      let periodKey, isDue;
      if(cycle === 'monthly'){
        periodKey = today.toISOString().slice(0,7); // YYYY-MM
        isDue = todayDay >= Number(c.paymentDueDay);
      } else {
        // Fires once a year, in the same month the contract started.
        const startMonth = c.startDate ? new Date(c.startDate).getMonth() : today.getMonth();
        periodKey = String(today.getFullYear());
        isDue = today.getMonth() === startMonth && todayDay >= Number(c.paymentDueDay);
      }
      if(!isDue) return;
      if(c.lastAutoInvoiceMonth === periodKey) return;

      // The entered amount IS the per-cycle charge already (monthly, or
      // yearly if the billing cycle is yearly) — no longer divided by the
      // contract's total duration.
      const amount = Math.round(Number(c.amount||0) * 100) / 100;
      if(amount <= 0) return;

      const payment = {
        id: DB.nextSeqId('PAY', 'payments'),
        contractId: c.id, clientId: c.clientId,
        amount, method: 'bank', date: DB.todayISO(), status: 'review',
        description: paymentDescription(c.id, DB.todayISO()),
      };
      DB.insert('payments', payment);
      DB.update('contracts', c.id, { lastAutoInvoiceMonth: periodKey });
      DB.logActivity('تم إنشاء دفعة دورية بانتظار التأكيد للعقد ' + c.id, 'Recurring pending payment created for contract ' + c.id, 'payment');
      created++;
    });
    return created;
  }

  // Unpaid invoices whose date has already passed — i.e. payment is late.
  function overdueInvoices(clientId){
    const today = DB.todayISO();
    let list = DB.all('invoices').filter(i => i.status === 'unpaid' && i.date && i.date < today);
    if(clientId) list = list.filter(i => i.clientId === clientId);
    return list.map(i=>{
      const days = Math.max(1, Math.round((new Date(today) - new Date(i.date)) / 86400000));
      return Object.assign({}, i, { daysLate: days });
    }).sort((a,b)=> b.daysLate - a.daysLate);
  }

  const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function monthYearLabel(dateStr){
    const d = dateStr ? new Date(dateStr) : new Date();
    const name = I18N.getLang()==='ar' ? MONTHS_AR[d.getMonth()] : MONTHS_EN[d.getMonth()];
    return `${name} ${d.getFullYear()}`;
  }
  // "سداد قيمة الصيانة عن عقد CT-1001 عن شهر يوليو 2026"
  function paymentDescription(contractId, dateStr){
    return I18N.getLang()==='ar'
      ? `سداد قيمة الصيانة عن عقد ${contractId || '—'} عن شهر ${monthYearLabel(dateStr)}`
      : `Maintenance payment for contract ${contractId || '—'} for ${monthYearLabel(dateStr)}`;
  }
  // Same, plus the payment voucher (سند) number — used on the auto-issued invoice.
  function invoiceDescription(contractId, dateStr, paymentId){
    const base = paymentDescription(contractId, dateStr);
    return I18N.getLang()==='ar'
      ? `${base} — سند رقم ${paymentId}`
      : `${base} — voucher No. ${paymentId}`;
  }

  // Active, fixed-period contracts within THEIR OWN configured renewal
  // notice period (contract.renewalNoticeDays, defaulting to 60 if not
  // set), with remaining visits info.
  function contractsNearingRenewal(){
    const today = DB.todayISO();
    return DB.all('contracts').filter(c=>c.status==='active' && c.periodType==='fixed' && c.endDate).map(c=>{
      const daysLeft = Math.round((new Date(c.endDate) - new Date(today)) / 86400000);
      const noticeDays = Number(c.renewalNoticeDays) || 60;
      return Object.assign({}, c, { daysLeft, noticeDays, visitsRemaining: c.visitsUnlimited ? null : Math.max(0,(c.visitsTotal||0)-(c.visitsUsed||0)) });
    }).filter(c=>c.daysLeft >= 0 && c.daysLeft <= c.noticeDays).sort((a,b)=>a.daysLeft-b.daysLeft);
  }

  return { contractTaxes, invoiceBreakdown, runAutoInvoices, overdueInvoices, paymentDescription, invoiceDescription, monthYearLabel, contractsNearingRenewal };
})();
