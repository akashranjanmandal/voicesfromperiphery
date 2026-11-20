/**
 * Voices from the Periphery — blog likes & comments
 *
 * Paste this whole file into Extensions → Apps Script of a Google Sheet,
 * run `setup` once, then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone). See google-apps-script/SETUP.md.
 *
 * Sheets used (created automatically by `setup`):
 *   Likes     — slug | likes | updated
 *   Comments  — time | id | slug | name | email | comment | visible
 * Every comment is published immediately. If spam ever appears,
 * untick "visible" on that row and it disappears from the website.
 */

// ---------------- settings ----------------
var NOTIFY_EMAIL = '';        // put an address here to be emailed about each new comment
var MAX_NAME = 60;
var MAX_COMMENT = 2000;
var COMMENT_COOLDOWN_SECONDS = 30;                        // per visitor, stops accidental double posts
// ------------------------------------------

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var likes = ss.getSheetByName('Likes') || ss.insertSheet('Likes');
  if (likes.getLastRow() === 0) {
    likes.appendRow(['slug', 'likes', 'updated']);
    likes.setFrozenRows(1);
  }
  var comments = ss.getSheetByName('Comments') || ss.insertSheet('Comments');
  if (comments.getLastRow() === 0) {
    comments.appendRow(['time', 'id', 'slug', 'name', 'email', 'comment', 'visible']);
    comments.setFrozenRows(1);
    comments.setColumnWidth(6, 520);
  }
  comments.getRange('G2:G').setDataValidation(
    SpreadsheetApp.newDataValidation().requireCheckbox().build()
  );
}

// ---------- reading: GET ?action=post&slug=…  or  GET ?action=counts ----------
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'counts') return json_({ ok: true, counts: allCounts_() });
    if (p.action === 'post') {
      var slug = cleanSlug_(p.slug);
      if (!slug) return json_({ ok: false, error: 'missing slug' });
      return json_({ ok: true, likes: likeCount_(slug), comments: visibleComments_(slug) });
    }
    return json_({ ok: true, service: 'vftp-blog-responses' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// ---------- writing: POST {action:'like'|'comment', …} as text/plain JSON ----------
function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) {}
  var slug = cleanSlug_(body.slug);
  if (!slug) return json_({ ok: false, error: 'missing slug' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (body.action === 'like') return json_({ ok: true, likes: addLike_(slug) });
    if (body.action === 'comment') return json_(addComment_(slug, body));
    return json_({ ok: false, error: 'unknown action' });
  } finally {
    lock.releaseLock();
  }
}

// ---------------- likes ----------------
function likesSheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Likes'); }

function likeCount_(slug) {
  var rows = likesSheet_().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === slug) return Number(rows[i][1]) || 0;
  return 0;
}

function addLike_(slug) {
  var sh = likesSheet_();
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === slug) {
      var n = (Number(rows[i][1]) || 0) + 1;
      sh.getRange(i + 1, 2, 1, 2).setValues([[n, new Date()]]);
      return n;
    }
  }
  sh.appendRow([slug, 1, new Date()]);
  return 1;
}

// ---------------- comments ----------------
function commentsSheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Comments'); }

function visibleComments_(slug) {
  var rows = commentsSheet_().getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (r[2] === slug && r[6] === true) {
      out.push({ id: String(r[1]), name: String(r[3]), text: String(r[5]), time: new Date(r[0]).toISOString() });
    }
  }
  return out;
}

function addComment_(slug, body) {
  if (body.website) return { ok: true, published: false };            // honeypot: bots fill hidden field
  var name = clip_(body.name, MAX_NAME);
  var text = clip_(body.comment, MAX_COMMENT);
  var email = clip_(body.email, 120);
  if (!name || !text) return { ok: false, error: 'Please add your name and a comment.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) email = '';

  var cache = CacheService.getScriptCache();
  var visitor = clip_(body.visitor, 64);
  if (visitor) {
    if (cache.get('c:' + visitor)) return { ok: false, error: 'Please wait a few seconds before posting again.' };
    cache.put('c:' + visitor, '1', COMMENT_COOLDOWN_SECONDS);
  }

  var now = new Date();
  var id = Utilities.getUuid().slice(0, 8);
  commentsSheet_().appendRow([now, id, slug, safeCell_(name), safeCell_(email), safeCell_(text), true]);

  if (NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail(NOTIFY_EMAIL, 'New comment on ' + slug,
        name + (email ? ' <' + email + '>' : '') + ' wrote:\n\n' + text +
        '\n\nIt is live on the site. Untick "visible" in the Comments sheet to hide it.\n' +
        SpreadsheetApp.getActiveSpreadsheet().getUrl());
    } catch (err) { /* email quota reached: comment is still saved */ }
  }
  return { ok: true, published: true, comment: { id: id, name: name, text: text, time: now.toISOString() } };
}

// ---------------- listing page counts ----------------
function allCounts_() {
  var counts = {};
  var likes = likesSheet_().getDataRange().getValues();
  for (var i = 1; i < likes.length; i++) {
    counts[likes[i][0]] = counts[likes[i][0]] || { likes: 0, comments: 0 };
    counts[likes[i][0]].likes = Number(likes[i][1]) || 0;
  }
  var com = commentsSheet_().getDataRange().getValues();
  for (var j = 1; j < com.length; j++) {
    if (com[j][6] !== true) continue;
    var s = com[j][2];
    counts[s] = counts[s] || { likes: 0, comments: 0 };
    counts[s].comments++;
  }
  return counts;
}

// ---------------- helpers ----------------
function cleanSlug_(s) {
  s = String(s || '').trim();
  return /^[a-z0-9-]{1,120}$/.test(s) ? s : '';
}
function clip_(s, n) { return String(s || '').replace(/\s+$/, '').replace(/^\s+/, '').slice(0, n); }
function safeCell_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }   // stop text being read as a formula
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
