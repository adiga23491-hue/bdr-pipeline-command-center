const express  = require('express');
const cors     = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs   = require('fs');
const path = require('path');
const { parse }     = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const app     = express();
const PORT    = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';
const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, 'pipeline_master.csv');

const HEADERS = ['Id','Opp_Name','Stage','Meeting_Date','Languages','Pain_Validated','Source','Link','BDR_Name','AE_Name','Notes','Email','Next_Step','Meeting_Rejected','Rejection_Reason','Last_Updated'];

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
  try { return parse(content, { columns: true, skip_empty_lines: true }); }
  catch { return []; }
}
function writeCSV(records) {
  fs.writeFileSync(CSV_PATH, stringify(records, { header: true, columns: HEADERS }), 'utf8');
}

// ── API routes ───────────────────────────────────────────────────────────────

app.get('/api/opportunities', (req, res) => {
  let opps = readCSV();
  const bdrFilter = req.query.bdr;
  if (bdrFilter) {
    opps = opps.filter((o) => o.BDR_Name === bdrFilter);
  }
  res.json(opps);
});

app.post('/api/opportunities', (req, res) => {
  // Email is required
  if (!req.body.Email || !req.body.Email.trim()) {
    return res.status(400).json({ error: 'Email is required to create an opportunity' });
  }

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
    Meeting_Rejected: String(req.body.Meeting_Rejected ?? 'false'),
    Rejection_Reason: req.body.Rejection_Reason || '',
    Last_Updated:     new Date().toISOString(),
  };
  records.push(opp);
  writeCSV(records);
  res.status(201).json(opp);
});

app.put('/api/opportunities/:id', (req, res) => {
  const records = readCSV();
  const idx = records.findIndex((r) => r.Id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  records[idx] = { ...records[idx], ...req.body, Id: records[idx].Id, Last_Updated: new Date().toISOString() };
  writeCSV(records);
  res.json(records[idx]);
});

app.delete('/api/opportunities/:id', (req, res) => {
  writeCSV(readCSV().filter((r) => r.Id !== req.params.id));
  res.json({ success: true });
});

app.get('/api/export', (_req, res) => {
  ensureCSV();
  res.download(CSV_PATH, 'pipeline_master.csv');
});

// ── Serve built React frontend in production ─────────────────────────────────
if (IS_PROD) {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  BDR Pipeline Backend  →  http://localhost:${PORT}\n`);
});
