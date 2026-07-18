/* ==========================================================================
   Integriox — i18n engine (Arabic / English)
   Usage: add data-i18n="key" to any element's text, data-i18n-ph="key" for
   placeholder attributes. Call I18N.apply() after injecting new DOM.
   ========================================================================== */
const I18N = (function(){

  const dict = {
    ar: {
      // brand
      app_name: "Integriox", app_tag: "حلول متكاملة",
      // nav
      nav_dashboard: "لوحة التحكم", nav_clients: "العملاء", nav_technicians: "الفنيون",
      nav_contracts: "العقود", nav_visits: "الزيارات", nav_visit_request: "طلب زيارة",
      nav_payments: "المدفوعات", nav_settings: "الإعدادات", nav_section_main: "الرئيسية",
      nav_section_manage: "الإدارة", nav_logout: "تسجيل الخروج",
      // auth
      welcome_back: "أهلاً بعودتك", login_sub: "سجّل الدخول لمتابعة حسابك",
      tab_login: "تسجيل الدخول", tab_register: "حساب جديد",
      email: "البريد الإلكتروني", password: "كلمة المرور", full_name: "الاسم الكامل",
      phone: "رقم الهاتف", account_type: "نوع الحساب", role_client: "عميل", role_technician: "فني",
      confirm_password: "تأكيد كلمة المرور", company_name: "اسم الشركة (اختياري)",
      btn_login: "دخول", btn_register: "إرسال طلب التسجيل",
      no_account: "ليس لديك حساب؟", have_account: "لديك حساب بالفعل؟",
      register_note: "سيتم مراجعة طلبك من قبل الإدارة قبل تفعيل الحساب.",
      demo_accounts: "حسابات تجريبية",
      err_required: "برجاء تعبئة جميع الحقول المطلوبة", err_login: "بيانات الدخول غير صحيحة",
      err_pass_match: "كلمتا المرور غير متطابقتين", err_pending: "الحساب قيد المراجعة من الإدارة",
      success_register: "تم إرسال طلبك بنجاح، بانتظار موافقة الإدارة",
      // dashboard
      dashboard: "لوحة التحكم الرئيسية", dashboard_sub: "نظرة عامة على أداء المنصة",
      kpi_clients: "إجمالي العملاء", kpi_contracts_active: "عقود نشطة", kpi_visits_open: "زيارات مفتوحة",
      kpi_revenue: "إجمالي التحصيل", visits_by_client: "الزيارات حسب العميل",
      annual_overview: "المخطط السنوي (شهريًا)", payment_status: "التزام مواعيد السداد",
      on_time: "في الموعد", late: "متأخر", upcoming_payments: "مواعيد دفع قادمة",
      recent_activity: "آخر النشاطات", view_all: "عرض الكل",
      // clients
      clients: "العملاء", clients_sub: "إدارة بيانات العملاء وعقودهم", add_client: "إضافة عميل",
      client_name: "اسم العميل", client_phone: "الهاتف", client_email: "البريد الإلكتروني",
      client_address: "العنوان", client_contracts_count: "عدد العقود", client_status: "الحالة",
      // technicians
      technicians: "الفنيون", technicians_sub: "إدارة فريق الصيانة والفنيين", add_technician: "إضافة فني",
      tech_name: "اسم الفني", tech_specialty: "التخصص", tech_visits_count: "عدد الزيارات",
      tech_rating: "التقييم",
      // contracts
      contracts: "العقود", contracts_sub: "إدارة عقود الصيانة", add_contract: "إضافة تعاقد",
      contract_id: "رقم العقد", contract_client: "العميل", contract_amount: "مبلغ العقد",
      contract_duration: "مدة العقد", contract_period_type: "طبيعة الفترة", period_open: "مفتوحة",
      period_fixed: "محددة المدة", contract_type: "نوع العقد", type_onsite: "حضور ميداني",
      type_remote: "عن بعد", type_visits: "زيارات محددة", type_all: "كل الأنواع",
      contract_start: "تاريخ البداية", contract_end: "تاريخ النهاية", contract_visits_total: "إجمالي الزيارات المستحقة",
      payment_terms: "نظام الدفع", pay_upfront: "دفع مقدم", pay_deferred: "دفع آجل",
      contract_status: "الحالة", status_active: "نشط", status_closed: "منتهي", status_renewal: "تحت التجديد",
      status_cancelled: "ملغي", view_contract: "عرض العقد", months: "شهر",
      // visits
      visits: "الزيارات", visits_sub: "متابعة الزيارات المفتوحة والمغلقة", add_visit: "جدولة زيارة",
      visit_date: "تاريخ الزيارة", visit_technician: "الفني المسند", visit_status: "حالة الزيارة",
      visit_type: "نوع الزيارة", visit_scheduled: "مجدولة", visit_ongoing: "جارية",
      visit_done: "منتهية", visit_cancelled: "ملغاة", assign_tech: "إسناد فني",
      // visit request
      visit_request_title: "طلب زيارة صيانة", visit_request_sub: "قم بتعبئة النموذج وسيتم التواصل معك لتأكيد الموعد",
      related_contract: "العقد المرتبط", issue_type: "نوع المشكلة", issue_periodic: "صيانة دورية",
      issue_fault: "بلاغ عطل", issue_urgent: "زيارة طارئة", issue_desc: "وصف المشكلة",
      preferred_date: "التاريخ المفضل", preferred_time: "الوقت المفضل", attach_photos: "إرفاق صور (اختياري)",
      submit_request: "إرسال الطلب", request_sent: "تم إرسال طلبك بنجاح، رقم الطلب",
      // payments
      payments: "المدفوعات", payments_sub: "تسجيل ومتابعة المدفوعات", add_payment: "تسجيل دفعة",
      payment_amount: "المبلغ", payment_method: "طريقة الدفع", method_bank: "تحويل بنكي",
      method_cash: "نقدي", method_other: "أخرى", payment_date: "تاريخ الدفع",
      payment_status_col: "حالة المراجعة", pay_review: "قيد المراجعة", pay_confirmed: "مؤكدة",
      pay_rejected: "مرفوضة", attach_proof: "إرفاق مستند الدفع", proof_hint: "صورة أو PDF لإيصال التحويل / السند",
      whatsapp_reminder: "إرسال تذكير واتساب", confirm_payment: "تأكيد", reject_payment: "رفض",
      // settings
      settings: "الإعدادات", settings_sub: "إعدادات الحساب والمنصة", general_settings: "إعدادات عامة",
      terms_settings: "الشروط والأحكام", pending_approvals: "طلبات بانتظار الموافقة",
      approve: "قبول", reject: "رفض", company_info: "بيانات الشركة", save_changes: "حفظ التغييرات",
      terms_hint: "هذا النص سيُضاف تلقائيًا لكل عقد جديد يتم إنشاؤه.",
      integration_settings: "ربط جوجل شيت", sheet_url: "رابط Google Apps Script Web App",
      sheet_hint: "الصق رابط الـ Web App الخاص بسكريبت جوجل شيت لتفعيل المزامنة الحقيقية.",
      no_pending: "لا توجد طلبات بانتظار الموافقة حاليًا",
      // contract template
      contract_template_title: "عقد صيانة", print_contract: "طباعة / تصدير PDF",
      party_a: "الطرف الأول (الشركة)", party_b: "الطرف الثاني (العميل)", terms_conditions: "الشروط والأحكام",
      signature: "التوقيع", client_signature: "توقيع العميل", clear_signature: "مسح", sign_here: "وقّع هنا",
      contract_saved_sign: "تم حفظ التوقيع",
      // common
      actions: "إجراءات", edit: "تعديل", delete: "حذف", cancel: "إلغاء", save: "حفظ",
      close: "إغلاق", search: "بحث...", all: "الكل", currency: "ر.س", no_data: "لا توجد بيانات لعرضها",
      required: "مطلوب", details: "التفاصيل", export: "تصدير", filter: "تصفية", loading: "جاري التحميل...",
      confirm_delete: "هل أنت متأكد من الحذف؟", saved_ok: "تم الحفظ بنجاح", deleted_ok: "تم الحذف بنجاح",
      jan:"يناير",feb:"فبراير",mar:"مارس",apr:"أبريل",may:"مايو",jun:"يونيو",jul:"يوليو",aug:"أغسطس",sep:"سبتمبر",oct:"أكتوبر",nov:"نوفمبر",dec:"ديسمبر",
    },
    en: {
      app_name: "Integriox", app_tag: "Integrated Solutions",
      nav_dashboard: "Dashboard", nav_clients: "Clients", nav_technicians: "Technicians",
      nav_contracts: "Contracts", nav_visits: "Visits", nav_visit_request: "Visit Request",
      nav_payments: "Payments", nav_settings: "Settings", nav_section_main: "Main",
      nav_section_manage: "Management", nav_logout: "Logout",
      welcome_back: "Welcome back", login_sub: "Sign in to access your account",
      tab_login: "Login", tab_register: "New Account",
      email: "Email address", password: "Password", full_name: "Full name",
      phone: "Phone number", account_type: "Account type", role_client: "Client", role_technician: "Technician",
      confirm_password: "Confirm password", company_name: "Company name (optional)",
      btn_login: "Sign in", btn_register: "Submit registration",
      no_account: "Don't have an account?", have_account: "Already have an account?",
      register_note: "Your request will be reviewed by an admin before activation.",
      demo_accounts: "Demo accounts",
      err_required: "Please fill in all required fields", err_login: "Invalid credentials",
      err_pass_match: "Passwords do not match", err_pending: "This account is pending admin approval",
      success_register: "Your request was submitted, awaiting admin approval",
      dashboard: "Main Dashboard", dashboard_sub: "Overview of platform performance",
      kpi_clients: "Total Clients", kpi_contracts_active: "Active Contracts", kpi_visits_open: "Open Visits",
      kpi_revenue: "Total Collected", visits_by_client: "Visits by Client",
      annual_overview: "Annual Overview (Monthly)", payment_status: "Payment Punctuality",
      on_time: "On time", late: "Late", upcoming_payments: "Upcoming Payments",
      recent_activity: "Recent Activity", view_all: "View all",
      clients: "Clients", clients_sub: "Manage client records and contracts", add_client: "Add Client",
      client_name: "Client name", client_phone: "Phone", client_email: "Email",
      client_address: "Address", client_contracts_count: "Contracts", client_status: "Status",
      technicians: "Technicians", technicians_sub: "Manage your maintenance team", add_technician: "Add Technician",
      tech_name: "Technician name", tech_specialty: "Specialty", tech_visits_count: "Visits",
      tech_rating: "Rating",
      contracts: "Contracts", contracts_sub: "Manage maintenance contracts", add_contract: "Add Contract",
      contract_id: "Contract ID", contract_client: "Client", contract_amount: "Contract amount",
      contract_duration: "Duration", contract_period_type: "Period type", period_open: "Open-ended",
      period_fixed: "Fixed term", contract_type: "Contract type", type_onsite: "On-site",
      type_remote: "Remote", type_visits: "Scheduled visits", type_all: "All types",
      contract_start: "Start date", contract_end: "End date", contract_visits_total: "Total visits due",
      payment_terms: "Payment terms", pay_upfront: "Upfront", pay_deferred: "Deferred",
      contract_status: "Status", status_active: "Active", status_closed: "Closed", status_renewal: "Renewal due",
      status_cancelled: "Cancelled", view_contract: "View contract", months: "months",
      visits: "Visits", visits_sub: "Track open and closed visits", add_visit: "Schedule Visit",
      visit_date: "Visit date", visit_technician: "Assigned technician", visit_status: "Status",
      visit_type: "Visit type", visit_scheduled: "Scheduled", visit_ongoing: "Ongoing",
      visit_done: "Completed", visit_cancelled: "Cancelled", assign_tech: "Assign technician",
      visit_request_title: "Maintenance Visit Request", visit_request_sub: "Fill the form and we'll confirm your appointment",
      related_contract: "Related contract", issue_type: "Issue type", issue_periodic: "Periodic maintenance",
      issue_fault: "Fault report", issue_urgent: "Urgent visit", issue_desc: "Problem description",
      preferred_date: "Preferred date", preferred_time: "Preferred time", attach_photos: "Attach photos (optional)",
      submit_request: "Submit request", request_sent: "Request submitted successfully, ref #",
      payments: "Payments", payments_sub: "Record and track payments", add_payment: "Record Payment",
      payment_amount: "Amount", payment_method: "Payment method", method_bank: "Bank transfer",
      method_cash: "Cash", method_other: "Other", payment_date: "Payment date",
      payment_status_col: "Review status", pay_review: "Under review", pay_confirmed: "Confirmed",
      pay_rejected: "Rejected", attach_proof: "Attach payment proof", proof_hint: "Image or PDF of the transfer receipt",
      whatsapp_reminder: "Send WhatsApp reminder", confirm_payment: "Confirm", reject_payment: "Reject",
      settings: "Settings", settings_sub: "Account and platform settings", general_settings: "General settings",
      terms_settings: "Terms & Conditions", pending_approvals: "Pending Approvals",
      approve: "Approve", reject: "Reject", company_info: "Company info", save_changes: "Save changes",
      terms_hint: "This text will be added automatically to every new contract.",
      integration_settings: "Google Sheet Integration", sheet_url: "Google Apps Script Web App URL",
      sheet_hint: "Paste your Apps Script Web App URL to enable live sync.",
      no_pending: "No pending approval requests",
      contract_template_title: "Maintenance Contract", print_contract: "Print / Export PDF",
      party_a: "First Party (Company)", party_b: "Second Party (Client)", terms_conditions: "Terms & Conditions",
      signature: "Signature", client_signature: "Client signature", clear_signature: "Clear", sign_here: "Sign here",
      contract_saved_sign: "Signature saved",
      actions: "Actions", edit: "Edit", delete: "Delete", cancel: "Cancel", save: "Save",
      close: "Close", search: "Search...", all: "All", currency: "SAR", no_data: "No data to display",
      required: "Required", details: "Details", export: "Export", filter: "Filter", loading: "Loading...",
      confirm_delete: "Are you sure you want to delete this?", saved_ok: "Saved successfully", deleted_ok: "Deleted successfully",
      jan:"Jan",feb:"Feb",mar:"Mar",apr:"Apr",may:"May",jun:"Jun",jul:"Jul",aug:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dec:"Dec",
    }
  };

  function getLang(){ return localStorage.getItem('integriox_lang') || 'ar'; }
  function t(key){ const l = getLang(); return (dict[l] && dict[l][key]) || (dict.en[key]) || key; }

  function setLang(lang){
    localStorage.setItem('integriox_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    apply();
  }

  function apply(root){
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el=>{
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.title = t(document.body?.dataset?.titleKey || 'app_name') + ' — ' + t('app_name');
  }

  function init(){
    const lang = getLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  init();

  return { t, apply, setLang, getLang };
})();
