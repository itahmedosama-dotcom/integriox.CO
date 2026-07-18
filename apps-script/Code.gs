/**
 * Integriox — Google Apps Script backend
 * -----------------------------------------------------------------------
 * Turns a Google Sheet into a simple REST-like API the front-end can call.
 *
 * SETUP:
 * 1. Create a new Google Sheet.
 * 2. Extensions → Apps Script, paste this whole file in as Code.gs.
 * 3. Run `setupSheet` once (Run menu) to create all tabs with headers.
 * 4. Deploy → New deployment → Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web App URL and paste it into the platform's
 *    Settings → Google Sheet Integration field.
 *
 * The front-end (assets/js/db.js) currently runs fully offline via
 * localStorage for the GitHub Pages demo, and fires a fire-and-forget
 * `syncAll` POST to this endpoint whenever data changes so the Sheet
 * stays a live mirror. You can extend `doGet` below to make the front-end
 * read from the Sheet as the source of truth instead of localStorage.
 * -----------------------------------------------------------------------
 */

const SHEETS = {
  users: ['id','name','email','password','phone','role','status','clientId','techId','company'],
  clients: ['id','name','phone','email','address','createdAt'],
  technicians: ['id','name','phone','email','specialty','rating'],
  contracts: ['id','clientId','amount','durationMonths','periodType','contractType','startDate','endDate','visitsTotal','visitsUsed','paymentTerms','status','signature','createdAt'],
  visits: ['id','contractId','clientId','techId','date','time','type','status','description','photos'],
  payments: ['id','contractId','clientId','amount','method','date','status','proofName','proofData'],
  settings: ['key','value'],
  activity: ['id','text_ar','text_en','at'],
};

function setupSheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name=>{
    let sheet = ss.getSheetByName(name);
    if(!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.appendRow(SHEETS[name]);
    sheet.setFrozenRows(1);
  });
}

function doGet(e){
  const action = e.parameter.action || 'getAll';
  if(action === 'getAll'){
    return jsonResponse(getAllData());
  }
  if(action === 'getCollection' && e.parameter.collection){
    return jsonResponse(getCollection(e.parameter.collection));
  }
  return jsonResponse({ error:'unknown action' });
}

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if(action === 'syncAll'){
      syncAll(body.payload);
      return jsonResponse({ ok:true });
    }
    if(action === 'insert'){
      insertRow(body.collection, body.data);
      return jsonResponse({ ok:true });
    }
    if(action === 'update'){
      updateRow(body.collection, body.id, body.patch);
      return jsonResponse({ ok:true });
    }
    if(action === 'delete'){
      deleteRow(body.collection, body.id);
      return jsonResponse({ ok:true });
    }
    return jsonResponse({ error:'unknown action' });
  }catch(err){
    return jsonResponse({ error: String(err) });
  }
}

/* ---------------- helpers ---------------- */

function getSheet(name){
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function getCollection(name){
  const sheet = getSheet(name);
  if(!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row=>{
    const obj = {};
    headers.forEach((h,i)=> obj[h] = row[i]);
    return obj;
  });
}

function getAllData(){
  const data = {};
  Object.keys(SHEETS).forEach(name=>{
    if(name === 'settings'){
      const rows = getCollection('settings');
      const settings = {};
      rows.forEach(r=> settings[r.key] = r.value);
      data.settings = settings;
    } else {
      data[name] = getCollection(name);
    }
  });
  return data;
}

function syncAll(payload){
  Object.keys(SHEETS).forEach(name=>{
    if(name === 'settings') return;
    const sheet = getSheet(name);
    if(!sheet || !payload[name]) return;
    const headers = SHEETS[name];
    sheet.clearContents();
    sheet.appendRow(headers);
    const rows = payload[name].map(item=> headers.map(h=>
      typeof item[h] === 'object' ? JSON.stringify(item[h]) : (item[h] ?? '')
    ));
    if(rows.length) sheet.getRange(2,1,rows.length, headers.length).setValues(rows);
  });
  // settings as key/value pairs
  if(payload.settings){
    const sheet = getSheet('settings');
    sheet.clearContents();
    sheet.appendRow(['key','value']);
    const rows = Object.keys(payload.settings).map(k=>[k, payload.settings[k]]);
    if(rows.length) sheet.getRange(2,1,rows.length,2).setValues(rows);
  }
}

function insertRow(collection, data){
  const sheet = getSheet(collection);
  const headers = SHEETS[collection];
  sheet.appendRow(headers.map(h=> typeof data[h]==='object' ? JSON.stringify(data[h]) : (data[h] ?? '')));
}

function updateRow(collection, id, patch){
  const sheet = getSheet(collection);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('id');
  for(let r=1; r<values.length; r++){
    if(values[r][idCol] === id){
      headers.forEach((h,c)=>{
        if(patch.hasOwnProperty(h)){
          sheet.getRange(r+1, c+1).setValue(typeof patch[h]==='object' ? JSON.stringify(patch[h]) : patch[h]);
        }
      });
      break;
    }
  }
}

function deleteRow(collection, id){
  const sheet = getSheet(collection);
  const values = sheet.getDataRange().getValues();
  const idCol = values[0].indexOf('id');
  for(let r=1; r<values.length; r++){
    if(values[r][idCol] === id){
      sheet.deleteRow(r+1);
      break;
    }
  }
}

function jsonResponse(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
