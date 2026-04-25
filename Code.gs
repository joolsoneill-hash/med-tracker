// ============================================================
// Med Tracker — Google Apps Script Backend (API mode)
// ============================================================
// FIRST-TIME SETUP:
// 1. Paste this into a new Apps Script project linked to your Sheet
// 2. Run setupAuth() once — copy the key it logs
// 3. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL
// 5. In the PWA (index.html), set SCRIPT_URL and paste the auth key on first launch
// ============================================================

const SHEET_NAME = 'MedLog';

// ---- Run once to generate your auth key ----
function setupAuth() {
  const key = Utilities.getUuid().replace(/-/g, '').substring(0, 16).toUpperCase();
  PropertiesService.getScriptProperties().setProperty('AUTH_KEY', key);
  Logger.log('╔══════════════════════════════╗');
  Logger.log('  Your auth key: ' + key);
  Logger.log('  Share this with family members');
  Logger.log('╚══════════════════════════════╝');
  return key;
}

// ---- Auth check ----
function checkAuth(key) {
  const stored = PropertiesService.getScriptProperties().getProperty('AUTH_KEY');
  return stored && key === stored;
}

// ---- GET handler (read operations) ----
function doGet(e) {
  const key      = (e.parameter && e.parameter.key)      || '';
  const action   = (e.parameter && e.parameter.action)   || '';
  const callback = (e.parameter && e.parameter.callback) || '';

  if (!checkAuth(key)) return respond({ error: 'Unauthorized' }, callback);

  if (action === 'getHistory') return respond(getHistoryData(), callback);

  return respond({ error: 'Unknown action' }, callback);
}

// ---- POST handler (write operations) ----
function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); }
  catch(err) { return deny(); }

  if (!checkAuth(data.key)) return deny();

  const action = data.action || '';

  if (action === 'logDose') {
    return json(logDoseData(data.medication, data.givenBy, data.timestamp));
  }
  if (action === 'updateDoseTime') {
    return json(updateDoseTimeData(data.sheetRow, data.newTimestamp));
  }
  if (action === 'deleteDose') {
    return json(deleteDoseData(data.sheetRow));
  }

  return json({ error: 'Unknown action' });
}

// ---- Data functions ----
function getHistoryData() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  return data
    .map((row, i) => ({ row, sheetRow: i + 2 }))
    .filter(({ row }) => row[0])
    .map(({ row, sheetRow }) => ({
      sheetRow,
      timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      medication: row[1],
      givenBy: row[2] || '',
      notes: row[3] || '',
      weight: row[4] || ''
    }))
    .reverse();
}

function logDoseData(medication, givenBy, timestamp) {
  const sheet = getOrCreateSheet();
  const doseTime = timestamp ? new Date(timestamp) : new Date();
  sheet.appendRow([
    doseTime.toISOString(),
    medication,
    givenBy || '',
    '',
    ''
  ]);
  return { success: true, timestamp: doseTime.toISOString() };
}

function updateDoseTimeData(sheetRow, newTimestamp) {
  const sheet = getOrCreateSheet();
  sheet.getRange(sheetRow, 1).setValue(new Date(newTimestamp).toISOString());
  return { success: true };
}

function deleteDoseData(sheetRow) {
  const sheet = getOrCreateSheet();
  sheet.deleteRow(sheetRow);
  return { success: true };
}

// ---- Helpers ----
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Medication', 'Given By', 'Notes', 'Weight(kg)']);
    sheet.getRange('1:1').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }
  return sheet;
}

// Supports both plain JSON and JSONP (callback param)
function respond(data, callback) {
  const body = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function deny() {
  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
    .setMimeType(ContentService.MimeType.JSON);
}
