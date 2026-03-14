/**
 * NeverMissBirthdays Apps Script backend
 * Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * Keep this endpoint private by requiring token and hashing user IDs.
 */

var HARDCODED_SPREADSHEET_ID = '1chI7njem0d2aqiwarItNtzzIHfILuwNnkHHBl7yjGHA';
var HARDCODED_SHEET_NAME = 'birthdays';
var HARDCODED_ACCESS_ID_SALT = '01dfb760a0457cd1c8a5d53e054ab925af1f4989edeb7f86646ab81954ba1bdd';
var HARDCODED_CLIENT_KEY = '17088669416447bf8ceecbb1521bbc8de2a73ce4ba60680b';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var expectedClientKey = HARDCODED_CLIENT_KEY;
    var salt = HARDCODED_ACCESS_ID_SALT;
    var spreadsheetId = HARDCODED_SPREADSHEET_ID;
    var sheetName = HARDCODED_SHEET_NAME || 'birthdays';

    if (!salt || !spreadsheetId) {
      return json({ error: 'Missing Script Properties.' }, 500);
    }

    // Optional lightweight guard for client-only mode.
    // This is not a secret once shipped in frontend code.
    if (expectedClientKey && payload.clientKey !== expectedClientKey) {
      return json({ error: 'Unauthorized.' }, 401);
    }

    var userId = String(payload.userId || '').trim();
    if (userId.length < 6 || userId.length > 80) {
      return json({ error: 'Invalid access ID.' }, 400);
    }

    var userHash = sha256Hex(salt + ':' + userId);
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    if (!sheet) {
      return json({ error: 'Sheet tab not found.' }, 500);
    }

    ensureHeader(sheet);

    var action = payload.action;
    if (action === 'list') {
      return json({ records: listRecords(sheet, userHash, userId) }, 200);
    }
    if (action === 'create') {
      var record = createRecord(sheet, userHash, userId, payload.input || {});
      return json({ record: record }, 200);
    }
    if (action === 'update') {
      updateRecord(sheet, userHash, String(payload.id || ''), payload.input || {});
      return json({ ok: true }, 200);
    }
    if (action === 'delete') {
      deleteRecord(sheet, userHash, String(payload.id || ''));
      return json({ ok: true }, 200);
    }

    return json({ error: 'Unsupported action.' }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

function ensureHeader(sheet) {
  var header = [
    'record_id', 'user_hash', 'name', 'relation', 'birthday_type', 'date_iso',
    'month', 'day', 'email', 'notes', 'created_at', 'updated_at'
  ];
  var existing = sheet.getRange(1, 1, 1, 12).getValues()[0];
  if (existing.join('|') !== header.join('|')) {
    sheet.getRange(1, 1, 1, 12).setValues([header]);
  }
}

function listRecords(sheet, userHash, userId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var rows = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var out = [];
  rows.forEach(function (r) {
    if (!r[0] || r[1] !== userHash) return;
    out.push({
      id: String(r[0]),
      userId: userId,
      name: String(r[2] || ''),
      relation: String(r[3] || 'other'),
      birthdayType: String(r[4] || 'monthDay'),
      dateIso: normalizeDateIso(r[5]),
      month: r[6] ? Number(r[6]) : undefined,
      day: r[7] ? Number(r[7]) : undefined,
      email: r[8] ? String(r[8]) : undefined,
      notes: r[9] ? String(r[9]) : undefined,
      createdAt: String(r[10] || ''),
      updatedAt: String(r[11] || ''),
    });
  });

  return out;
}

function createRecord(sheet, userHash, userId, input) {
  var now = new Date().toISOString();
  var record = {
    id: Utilities.getUuid(),
    userId: userId,
    name: String(input.name || '').trim(),
    relation: String(input.relation || 'other'),
    birthdayType: String(input.birthdayType || 'monthDay'),
    dateIso: normalizeDateIso(input.dateIso),
    month: input.month != null ? Number(input.month) : undefined,
    day: input.day != null ? Number(input.day) : undefined,
    email: input.email ? String(input.email) : undefined,
    notes: input.notes ? String(input.notes) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  sheet.appendRow([
    record.id,
    userHash,
    record.name,
    record.relation,
    record.birthdayType,
    record.dateIso || '',
    record.month != null ? record.month : '',
    record.day != null ? record.day : '',
    record.email || '',
    record.notes || '',
    record.createdAt,
    record.updatedAt,
  ]);

  return record;
}

function updateRecord(sheet, userHash, id, input) {
  if (!id) throw new Error('Missing record id.');

  var found = findRow(sheet, userHash, id);
  if (!found) throw new Error('Record not found.');

  var r = found.row;
  var birthdayType = String(input.birthdayType || r[4] || 'monthDay');
  var normalizedDate = normalizeDateIso(input.dateIso || r[5]);
  var next = [
    id,
    userHash,
    String(input.name || r[2] || '').trim(),
    String(input.relation || r[3] || 'other'),
    birthdayType,
    birthdayType === 'full' ? normalizedDate || '' : '',
    birthdayType === 'monthDay' ? Number(input.month || '') || '' : '',
    birthdayType === 'monthDay' ? Number(input.day || '') || '' : '',
    input.email ? String(input.email) : '',
    input.notes ? String(input.notes) : '',
    String(r[10] || new Date().toISOString()),
    new Date().toISOString(),
  ];

  sheet.getRange(found.index, 1, 1, 12).setValues([next]);
}

function normalizeDateIso(value) {
  if (!value) return undefined;

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, 'Etc/UTC', 'yyyy-MM-dd');
  }

  var raw = String(value).trim();
  if (!raw) return undefined;

  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)) {
    return raw;
  }

  var parsed = new Date(raw);
  if (isNaN(parsed)) return undefined;
  return Utilities.formatDate(parsed, 'Etc/UTC', 'yyyy-MM-dd');
}

function deleteRecord(sheet, userHash, id) {
  if (!id) throw new Error('Missing record id.');

  var found = findRow(sheet, userHash, id);
  if (!found) throw new Error('Record not found.');

  sheet.getRange(found.index, 1, 1, 12).clearContent();
}

function findRow(sheet, userHash, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var rows = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[0]) === id && String(row[1]) === userHash) {
      return { index: i + 2, row: row };
    }
  }

  return null;
}

function sha256Hex(input) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return digest.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function json(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
