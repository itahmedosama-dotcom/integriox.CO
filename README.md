# Integriox — منصة عقود الصيانة | Maintenance Contracts Platform

منصة ويب ثنائية اللغة (عربي/إنجليزي) لإدارة عقود الصيانة، العملاء، الفنيين،
الزيارات، والمدفوعات — مبنية بالكامل بـ HTML/CSS/JS بدون أي إطار عمل، جاهزة
للنشر مباشرة على GitHub Pages، وقابلة للربط مع Google Sheets كقاعدة بيانات
حقيقية عبر Google Apps Script.

A bilingual (Arabic/English) web platform for managing maintenance
contracts, clients, technicians, visits, and payments — built with plain
HTML/CSS/JS, ready to deploy on GitHub Pages, and connectable to Google
Sheets as a real backend via Google Apps Script.

---

## 🇸🇦 تشغيل سريع

1. المشروع يعمل مباشرة بدون أي تثبيت — افتح `index.html` في المتصفح أو ارفعه
   على GitHub Pages.
2. **لا توجد بيانات تجريبية.** عند فتح المنصة لأول مرة سيظهر **معالج تفعيل
   النظام**: يطلب منك (اختياريًا) رابط Google Apps Script Web App ومفتاح الـ
   API، ثم إنشاء **حساب المدير** الرئيسي. بعد إكمال المعالج يتم تسجيل
   دخولك تلقائيًا.
3. صفحات الدخول والتسجيل تحتوي على **رمز تحقق (Captcha)** بسيط لمنع
   التسجيلات الآلية.
4. البيانات تُخزَّن في `localStorage` بالمتصفح حتى تربط المشروع بـ Google
   Sheet حقيقي.

### الربط بـ Google Sheets (اختياري لتفعيل قاعدة بيانات حقيقية)

1. أنشئ Google Sheet جديد.
2. من القائمة: Extensions → Apps Script، والصق محتوى ملف
   `apps-script/Code.gs` كاملاً.
3. شغّل الدالة `setupSheet` مرة واحدة لإنشاء كل الأوراق (Tabs) والأعمدة.
4. Deploy → New deployment → Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. انسخ رابط الـ Web App، وضعه في المنصة من صفحة **الإعدادات → ربط جوجل
   شيت**.
6. من هذه اللحظة، أي تعديل في المنصة (عميل، عقد، دفعة...) يتم إرساله تلقائيًا
   لمزامنة الشيت.

> ملاحظة: النسخة الحالية تعتمد على `localStorage` كمصدر أساسي للعرض (لضمان
> عمل الديمو فورًا بدون سيرفر)، والمزامنة مع الشيت تتم بشكل "fire-and-forget".
> لجعل الشيت هو المصدر الوحيد للبيانات (source of truth) عدّل `assets/js/db.js`
> ليقرأ عبر `doGet` من `Code.gs` بدلاً من `localStorage`.

---

## 🇬🇧 Quick start

1. No build step — open `index.html` directly or deploy the folder to
   GitHub Pages.
2. **No demo data is seeded.** On first launch you'll see a **setup
   wizard**: it (optionally) asks for your Google Apps Script Web App URL
   and API key, then has you create the main **admin account**. You're
   signed in automatically once it's done.
3. The login/register page includes a lightweight **captcha** to block
   automated/spam sign-ups.
4. Data is stored in the browser's `localStorage` until you connect a
   real Google Sheet.

### Connecting Google Sheets (optional, for a real backend)

1. Create a new Google Sheet.
2. Extensions → Apps Script, paste the full contents of
   `apps-script/Code.gs`.
3. Run `setupSheet` once to create all tabs and headers.
4. Deploy → New deployment → Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL into **Settings → Google Sheet Integration** inside
   the platform.
6. From then on, every change in the app (a client, contract, payment…) is
   pushed to the Sheet automatically.

> The current build treats `localStorage` as the primary read source (so the
> demo works instantly with no server), and syncs to the Sheet as a
> fire-and-forget write. To make the Sheet the single source of truth,
> update `assets/js/db.js` to read through `doGet` in `Code.gs` instead of
> `localStorage`.

---

## 📁 Project structure

```
integriox/
├── index.html                # Login / Register
├── dashboard.html             # Analytics dashboard
├── clients.html                # Client management
├── technicians.html            # Technician management
├── contracts.html               # Contract management
├── contract-template.html       # Printable contract + T&C + e-signature
├── visits.html                   # Visit tracking (open/closed)
├── visit-request.html            # Client visit request form
├── payments.html                  # Payments + proof-of-payment upload
├── settings.html                   # Company info, T&C editor, Sheets link
├── assets/
│   ├── css/style.css               # Design tokens & shared styles
│   ├── js/
│   │   ├── i18n.js                  # Arabic / English dictionary
│   │   ├── db.js                     # Data layer (localStorage + sync)
│   │   ├── auth.js                    # Login / register / session
│   │   ├── layout.js                   # Sidebar + topbar shell
│   │   └── ui.js                        # Toasts, modals, signature pad
│   └── images/logo.png
├── apps-script/Code.gs                  # Google Apps Script backend
└── README.md
```

## ✨ Key features

- **Roles:** Admin / Client / Technician, with registration requiring
  admin approval.
- **Dashboard:** clients, active contracts, open visits, total collected,
  visits-by-client chart, annual monthly overview, on-time vs late payments.
- **Contracts:** amount, duration, open-ended or fixed period, type
  (on-site / remote / scheduled visits / all), visit quota, upfront or
  deferred payment terms, status lifecycle (active → renewal → closed).
- **Contract template:** auto-filled printable contract with the
  company's terms & conditions (editable from Settings) and an on-screen
  e-signature pad.
- **Visit request form:** client-submitted requests with photo
  attachments, routed to admin for technician assignment.
- **Payments:** bank transfer / cash / other, with proof-of-payment
  upload, admin review (confirm/reject), and a WhatsApp reminder shortcut.
- **Fully bilingual UI** with instant AR/EN switch and RTL/LTR layout.
- **User management screen** (`users.html`, admin only): list every account,
  approve/reject pending sign-ups, edit name/phone/role/status/password, add
  users manually, delete accounts.
- **Visit request contact & remote access:** every request now captures a
  contact name/phone, plus optional remote-access app name and access code
  when the visit needs the technician to connect to the client's device
  remotely (visible to admin/technician from the visit's "Details" button).
- **Settings → Integrations:** in addition to the Google Sheet Web App URL,
  you can store a Google Drive Folder ID (where visit photos / payment
  proofs should be organized) and an API key. The API key is obfuscated
  before being stored in `localStorage` and is never redisplayed after
  saving — leave the field blank to keep the existing value.
- **Client dashboard:** clients now land on a personal view showing only
  their own contract and upcoming visits (no other client's data), with
  quick links to request a visit, view their contract, or view payments.
  Technicians similarly see only their own assigned visits.
- **First-run setup wizard:** on first launch (no admin account yet),
  `index.html` walks you through connecting a Google Sheet (URL + API
  key, optional/skippable) and then creating the platform's admin
  account — no seeded demo data ships with the project.
- **Login/register captcha:** a lightweight generated verification code
  (with a refresh button) guards both the login and registration forms
  against spam/automated submissions.
- **Editable copyright / footer:** Settings → **Footer & WhatsApp** lets
  the admin edit the copyright notice (Arabic + English) shown at the
  bottom of every page in the platform.
- **WhatsApp contact widget:** an animated floating WhatsApp button
  appears on every page (login page included), with its label following
  the active language. The number and pre-filled message are editable
  from the same Settings tab.
- **Save/submit confirmation popup:** every save, update, delete, or
  submitted form across the platform shows a centered "Done" popup (not
  just a corner toast) so it's unmistakable that the action succeeded.

## 🆕 What's new in this update

- **Shared Google Sheet connection (`assets/js/config.js`)** — the platform
  now ships with a site-wide Sheet URL + API key baked into
  `assets/js/config.js`, so every visitor uses the same backend by default
  (previously the Sheet URL only lived in one admin's browser). Every page
  now also auto-detects and switches into "remote" sync mode on load —
  before, syncing silently stopped after a page refresh.
- **Faster, targeted sync** — inserts/updates/deletes now push only the
  changed row to the Sheet (`insert`/`update`/`delete` actions) instead of
  rewriting every tab on every change; `DB.load()` is also cached in memory
  so pages don't re-parse localStorage on every read.
- **Settings → 🔌 الربط والتكامل (rebuilt)** — "Apply & preview on this
  device" only changes the connection in your own browser; "Download
  updated config.js" gives you the file to re-upload to your hosting so the
  change is permanent for every visitor; "Cancel local preview" reverts to
  the shipped config; a "Test connection" button pings the Apps Script.
- **Settings → 💾 النسخة الاحتياطية (new)** — downloads one Excel file with
  every collection (users, clients, technicians, contracts, visits,
  payments, invoices, settings, activity) as a backup, plus a restore-from-file
  option.
- **Captcha fixes** — validation is now normalized (case/space/look-alike
  characters) so correct answers are no longer rejected; added a **Copy**
  button next to the code and a **Paste** button next to the input so users
  never have to retype the styled/rotated characters by hand.
- **Login with email OR username** — an optional username field was added
  to registration, the admin setup wizard, and the user management form;
  `AUTH.login` now accepts either.
- **Categorized, filterable activity log** — every log entry now carries a
  `type` (client/technician/contract/visit/payment/invoice/user/settings),
  shown as a colored badge, with date-range and type filters in
  Settings → سجل الأنشطة.
- **Technician "view all requests" permission** — a checkbox in
  Settings → Users (visible for technician accounts) lets an admin grant a
  technician visibility into every technician's visits and every
  new/unassigned request, instead of only their own assigned visits.
- **Dashboard filters + export** — the admin dashboard now has period /
  client / contract filters that live-update the KPIs and charts, plus
  Print and "Export as image" buttons.
- **Nationalities / countries / branches** — Technicians now have a
  nationality dropdown; Clients have a country dropdown, a Google Maps
  location link, and a repeatable branches list (name + Maps link each).
- **Installable app (PWA)** — a `manifest.json` + minimal service worker
  make the platform installable; an "Install app" floating button appears
  above the WhatsApp button once the browser allows it.
- **Invoice layout** — reworked into a standard itemized tax-invoice layout
  (item / qty / unit price, subtotal, VAT, grand total). *No reference
  image for the invoice was attached to this round of changes — if you
  have a specific design in mind, send it over and it can be matched
  exactly.*

---

## 🆕 Latest round of updates

- **Fixed: data wasn't reaching the Google Sheet on browsers that had used
  the platform before `config.js` existed.** Those browsers had `sheetUrl`
  permanently stuck at `''` in their local data, which silently prevented
  any sync from ever starting. The app now self-heals this on load — it
  keeps following the shipped `assets/js/config.js` connection unless the
  admin has explicitly set a local override from Settings.
- **Fixed: captcha code appeared reversed inside the code/paste input**
  (an RTL-page bidi rendering issue) — captcha inputs and the code display
  now force LTR direction explicitly.
- **Fixed: new field labels (السجل التجاري / الرقم الضريبي) showed as raw
  keys instead of Arabic text** — this was a stale-cache issue: browsers
  and GitHub Pages can serve an old cached copy of the JS files after an
  update. Every page now loads its CSS/JS with a version query string
  (`?v=...`) so future updates are picked up automatically without needing
  a manual hard refresh.
- Added a concrete troubleshooting hint in Settings → الربط والتكامل about
  Apps Script deployment access (`Anyone`) and the need to create a
  **New version** on every deployment after editing `Code.gs`.
- **Client CR & Tax numbers** — Clients now have "السجل التجاري" and "الرقم
  الضريبي" fields, shown on invoices and contracts for both the company
  (Settings → Company info now has the same two fields) and the client.
- **Settings → Backup → Danger zone** — a new section lets the admin either
  wipe a single table's data (clients, technicians, contracts, visits,
  payments, invoices, complaints, users, or the activity log) or fully
  erase all data on the device (requires typing `DELETE` to confirm).
- **New Complaints page (`complaints.html`)** — open to clients and
  technicians. A client can file a complaint about a specific technician +
  visit, or choose "Other" for a general complaint; a technician can file
  one with an optional related visit. Every complaint has a reply thread
  (admin ↔ submitter) and a status (new / in progress / resolved /
  closed) the admin can update. Admin sees and filters every complaint;
  clients/technicians only see their own.

---

## 🚀 Deploying to GitHub Pages
2. Repository Settings → Pages → Deploy from branch → `main` / root.
3. Your platform will be live at `https://<username>.github.io/<repo>/`.
