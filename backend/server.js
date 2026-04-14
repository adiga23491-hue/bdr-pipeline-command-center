const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';
const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, 'pipeline_master.csv');

const HEADERS = [
  'Id',
  'Opp_Name',
  'Stage',
  'Meeting_Date',
  'Languages',
  'Pain_Validated',
  'Source',
  'Link',
  'Last_Updated',
];

app.use(cors());
app.use(express.json());

// ── CSV helpers ──────────────────────────────────────────────────────────────

function ensureCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, HEADERS.join(',') + '\n', 'utf8');
  }
}

function readCSV() {
  ensureCSV();
  const content = fs.readFileSync(CSV_PATH, 'utf8').trim();
  if (!content || content === HEADERS.join(',')) return [];
  try {
    return parse(content, { columns: true, skip_empty_lines: true });
  } catch {
    return [];
  }
}

function writeCSV(records) {
  const output = stringify(records, { header: true, columns: HEADERS });
  fs.writeFileSync(CSV_PATH, output, 'utf8');
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/opportunities', (_req, res) => {
  res.json(readCSV());
});

app.post('/api/opportunities', (req, res) => {
  const records = readCSV();
  const opp = {
    Id: uuidv4(),
    Opp_Name: req.body.Opp_Name || 'New Opportunity',
    Stage: req.body.Stage || 'Meeting Not Accepted',
    Meeting_Date: req.body.Meeting_Date || '',
    Languages: req.body.Languages || '',
    Pain_Validated: String(req.body.Pain_Validated ?? 'false'),
    Source: req.body.Source || '',
    Link: req.body.Link || '',
    Last_Updated: new Date().toISOString(),
  };
  records.push(opp);
  writeCSV(records);
  res.status(201).json(opp);
});

app.put('/api/opportunities/:id', (req, res) => {
  const records = readCSV();
  const idx = records.findIndex((r) => r.Id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = {
    ...records[idx],
    ...req.body,
    Id: records[idx].Id, // never overwrite ID
    Last_Updated: new Date().toISOString(),
  };
  records[idx] = updated;
  writeCSV(records);
  res.json(updated);
});

app.delete('/api/opportunities/:id', (req, res) => {
  const records = readCSV().filter((r) => r.Id !== req.params.id);
  writeCSV(records);
  res.json({ success: true });
});

// Download the CSV directly (Manager export)
app.get('/api/export', (_req, res) => {
  ensureCSV();
  res.download(CSV_PATH, 'pipeline_master.csv');
});

// ── Serve built React frontend in production ──────────────────────────────────

if (IS_PROD) {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  // Catch-all: let React Router handle client-side routes
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  BDR Pipeline Backend\n  http://localhost:${PORT}\n`);
});
