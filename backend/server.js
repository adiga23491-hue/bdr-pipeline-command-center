const express  = require('express');
const cors     = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs   = require('fs');
const path = require('path');
const { parse }     = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const { backupCSV } = require('./backup-csv.js');

const app     = express();
const PORT    = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';
const CSV_PATH        = process.env.CSV_PATH        || path.join(__dirname, 'pipeline_master.csv');
const RACHELI_CSV_PATH = process.env.RACHELI_CSV_PATH || path.join(__dirname, 'racheli_opps.csv');
const ACTIVITY_PATH   = process.env.ACTIVITY_PATH   || path.join(__dirname, 'activity_log.json');

const HEADERS = ['Id','Opp_Name','Stage','Meeting_Date','Languages','Pain_Validated','Source','Link','BDR_Name','AE_Name','Notes','Email','Next_Step','Next_Step_Date','Meeting_Rejected','Rejection_Reason','Last_Updated'];

// Human-readable labels for field names
const FIELD_LABELS = {
  Opp_Name: 'Name', Stage: 'Stage', Meeting_Date: 'Meeting Date',
  Languages: 'Languages', Pain_Validated: 'Pain Validated', Source: 'Source',
  Link: 'Link', BDR_Name: 'BDR', AE_Name: 'AE', Notes: 'Notes',
  Email: 'Email', Next_Step: 'Next Step', Next_Step_Date: 'Next Step Date',
  Meeting_Rejected: 'Rejected', Rejection_Reason: 'Rejection Reason',
};

app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── CSV helpers ──────────────────────────────────────────────────────────────
function ensureCSV() {
  if (!fs.existsSync(CSV_PATH))
    fs.writeFileSync(CSV_PATH, HEADERS.join(',') + '\n', 'utf8');
}
function readCSV() {
  ensureCSV();
  const content = fs.readFileSync(CSV_PATH, 'utf8').trim();
  if (!content || content === HEADERS.join(',')) return [];
  try {
    const records = parse(content, { columns: true, skip_empty_lines: true });
    return records.map((record) => {
      const migrated = { ...record };
      HEADERS.forEach((header) => {
        if (!(header in migrated)) {
          if (header === 'Meeting_Rejected') migrated[header] = 'false';
          else if (header === 'Rejection_Reason') migrated[header] = '';
          else if (header === 'Email') migrated[header] = '';
          else if (header === 'Next_Step') migrated[header] = '';
          else if (header === 'Next_Step_Date') migrated[header] = '';
          else migrated[header] = '';
        }
      });
      return migrated;
    });
  }
  catch { return []; }
}
function writeCSV(records) {
  fs.writeFileSync(CSV_PATH, stringify(records, { header: true, columns: HEADERS }), 'utf8');
}

// ── Racheli CSV helpers (separate data store) ────────────────────────────────
function ensureRacheliCSV() {
  if (!fs.existsSync(RACHELI_CSV_PATH))
    fs.writeFileSync(RACHELI_CSV_PATH, HEADERS.join(',') + '\n', 'utf8');
}
function readRacheliCSV() {
  ensureRacheliCSV();
  const content = fs.readFileSync(RACHELI_CSV_PATH, 'utf8').trim();
  if (!content || content === HEADERS.join(',')) return [];
  try {
    const records = parse(content, { columns: true, skip_empty_lines: true });
    return records.map((record) => {
      const migrated = { ...record };
      HEADERS.forEach((header) => {
        if (!(header in migrated)) {
          if (header === 'Meeting_Rejected') migrated[header] = 'false';
          else migrated[header] = '';
        }
      });
      return migrated;
    });
  }
  catch { return []; }
}
function writeRacheliCSV(records) {
  fs.writeFileSync(RACHELI_CSV_PATH, stringify(records, { header: true, columns: HEADERS }), 'utf8');
}

// ── Activity log helpers ─────────────────────────────────────────────────────
function readActivity() {
  if (!fs.existsSync(ACTIVITY_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(ACTIVITY_PATH, 'utf8')); }
  catch { return []; }
}

function logActivity(action, opp, changes = null) {
  const log = readActivity();
  const entry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    action,                          // 'created' | 'updated' | 'deleted'
    oppId:   opp.Id,
    oppName: opp.Opp_Name || 'Untitled',
    bdrName: opp.BDR_Name || '',
    changes: changes || [],          // [{ field, label, oldValue, newValue }]
  };
  log.unshift(entry);
  // Keep last 500 entries
  if (log.length > 500) log.splice(500);
  fs.writeFileSync(ACTIVITY_PATH, JSON.stringify(log, null, 2), 'utf8');
}

function diffOpps(oldOpp, newFields) {
  const skip = new Set(['Last_Updated', 'Id']);
  return Object.entries(newFields)
    .filter(([k, v]) => !skip.has(k) && String(oldOpp[k] ?? '') !== String(v ?? ''))
    .map(([k, v]) => ({
      field:    k,
      label:    FIELD_LABELS[k] || k,
      oldValue: oldOpp[k] || '',
      newValue: String(v),
    }));
}

// ── API routes ───────────────────────────────────────────────────────────────

app.get('/api/opportunities', (req, res) => {
  let opps = readCSV();
  const bdrFilter = req.query.bdr;
  if (bdrFilter) opps = opps.filter((o) => o.BDR_Name === bdrFilter);
  res.json(opps);
});

app.post('/api/opportunities', (req, res) => {
  if (!req.body.Email || !req.body.Email.trim())
    return res.status(400).json({ error: 'Email is required to create an opportunity' });

  const records = readCSV();
  const opp = {
    Id: uuidv4(),
    Opp_Name:         req.body.Opp_Name         || 'New Opportunity',
    Stage:            req.body.Stage            || 'Meeting Not Accepted',
    Meeting_Date:     req.body.Meeting_Date     || '',
    Languages:        req.body.Languages        || '',
    Pain_Validated:   String(req.body.Pain_Validated ?? 'false'),
    Source:           req.body.Source           || '',
    Link:             req.body.Link             || '',
    BDR_Name:         req.body.BDR_Name         || '',
    AE_Name:          req.body.AE_Name          || '',
    Notes:            req.body.Notes            || '',
    Email:            req.body.Email.trim(),
    Next_Step:        req.body.Next_Step        || '',
    Next_Step_Date:   req.body.Next_Step_Date   || '',
    Meeting_Rejected: String(req.body.Meeting_Rejected ?? 'false'),
    Rejection_Reason: req.body.Rejection_Reason || '',
    Last_Updated:     new Date().toISOString(),
  };
  records.push(opp);
  writeCSV(records);
  logActivity('created', opp);
  res.status(201).json(opp);
});

app.put('/api/opportunities/:id', (req, res) => {
  const records = readCSV();
  const idx = records.findIndex((r) => r.Id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const oldOpp = records[idx];
  const changes = diffOpps(oldOpp, req.body);
  records[idx] = { ...oldOpp, ...req.body, Id: oldOpp.Id, Last_Updated: new Date().toISOString() };
  writeCSV(records);
  if (changes.length > 0) logActivity('updated', records[idx], changes);
  res.json(records[idx]);
});

app.delete('/api/opportunities/:id', (req, res) => {
  const records = readCSV();
  const opp = records.find((r) => r.Id === req.params.id);
  writeCSV(records.filter((r) => r.Id !== req.params.id));
  if (opp) logActivity('deleted', opp);
  res.json({ success: true });
});

app.get('/api/activity', (_req, res) => {
  res.json(readActivity());
});

app.get('/api/export', (_req, res) => {
  ensureCSV();
  res.download(CSV_PATH, 'pipeline_master.csv');
});

// ── Racheli Opps routes (separate data store — never touches main CSV) ────────
app.get('/api/racheli', (_req, res) => {
  res.json(readRacheliCSV());
});

app.post('/api/racheli', (req, res) => {
  const records = readRacheliCSV();
  const opp = {
    Id:               uuidv4(),
    Opp_Name:         req.body.Opp_Name         || 'New Opportunity',
    Stage:            req.body.Stage            || 'S1',
    Meeting_Date:     req.body.Meeting_Date     || '',
    Languages:        req.body.Languages        || '',
    Pain_Validated:   String(req.body.Pain_Validated ?? 'false'),
    Source:           req.body.Source           || '',
    Link:             req.body.Link             || '',
    BDR_Name:         req.body.BDR_Name         || '',
    AE_Name:          req.body.AE_Name          || '',
    Notes:            req.body.Notes            || '',
    Email:            req.body.Email            || '',
    Next_Step:        req.body.Next_Step        || '',
    Next_Step_Date:   req.body.Next_Step_Date   || '',
    Meeting_Rejected: String(req.body.Meeting_Rejected ?? 'false'),
    Rejection_Reason: req.body.Rejection_Reason || '',
    Last_Updated:     new Date().toISOString(),
  };
  records.push(opp);
  writeRacheliCSV(records);
  res.status(201).json(opp);
});

app.put('/api/racheli/:id', (req, res) => {
  const records = readRacheliCSV();
  const idx = records.findIndex((r) => r.Id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  records[idx] = { ...records[idx], ...req.body, Id: records[idx].Id, Last_Updated: new Date().toISOString() };
  writeRacheliCSV(records);
  res.json(records[idx]);
});

app.delete('/api/racheli/:id', (req, res) => {
  const records = readRacheliCSV();
  writeRacheliCSV(records.filter((r) => r.Id !== req.params.id));
  res.json({ success: true });
});

app.get('/api/racheli/export', (_req, res) => {
  ensureRacheliCSV();
  res.download(RACHELI_CSV_PATH, 'racheli_opps.csv');
});

// ── Serve built React frontend in production ─────────────────────────────────
if (IS_PROD) {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  backupCSV();
  console.log(`\n  BDR Pipeline Backend  →  http://localhost:${PORT}\n`);
});
