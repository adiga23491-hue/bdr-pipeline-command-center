const express  = require('express');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('./auth');
const { v4: uuidv4 } = require('uuid');
const fs   = require('fs');
const path = require('path');
const { parse }     = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const app     = express();
const PORT    = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';
const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, 'pipeline_master.csv');

const HEADERS = ['Id','Opp_Name','Stage','Meeting_Date','Languages','Pain_Validated','Source','Link','Last_Updated'];

// ── Trust proxy (Railway / any reverse-proxy) ────────────────────────────────
app.set('trust proxy', 1);

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Sessions ─────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'bdr-pipeline-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,          // HTTPS only in production
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Auth routes ──────────────────────────────────────────────────────────────

// Kick off Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/?login_error=true' }),
  (_req, res) => res.redirect('/')
);

// Logout
app.post('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.json({ success: true }));
  });
});

// Current user (no auth required — returns null when not logged in)
app.get('/api/me', (req, res) => {
  res.json({ user: req.isAuthenticated() ? req.user : null });
});

// ── Auth guard ───────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

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

// ── Protected API routes ─────────────────────────────────────────────────────

app.get('/api/opportunities', requireAuth, (_req, res) => {
  res.json(readCSV());
});

app.post('/api/opportunities', requireAuth, (req, res) => {
  const records = readCSV();
  const opp = {
    Id: uuidv4(),
    Opp_Name:      req.body.Opp_Name      || 'New Opportunity',
    Stage:         req.body.Stage         || 'Meeting Not Accepted',
    Meeting_Date:  req.body.Meeting_Date  || '',
    Languages:     req.body.Languages     || '',
    Pain_Validated: String(req.body.Pain_Validated ?? 'false'),
    Source:        req.body.Source        || '',
    Link:          req.body.Link          || '',
    Last_Updated:  new Date().toISOString(),
  };
  records.push(opp);
  writeCSV(records);
  res.status(201).json(opp);
});

app.put('/api/opportunities/:id', requireAuth, (req, res) => {
  const records = readCSV();
  const idx = records.findIndex((r) => r.Id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  records[idx] = { ...records[idx], ...req.body, Id: records[idx].Id, Last_Updated: new Date().toISOString() };
  writeCSV(records);
  res.json(records[idx]);
});

app.delete('/api/opportunities/:id', requireAuth, (req, res) => {
  writeCSV(readCSV().filter((r) => r.Id !== req.params.id));
  res.json({ success: true });
});

app.get('/api/export', requireAuth, (_req, res) => {
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
  console.log(`\n  BDR Pipeline Backend  →  http://localhost:${PORT}`);
  console.log(`  Manager email         →  ${process.env.MANAGER_EMAIL || '(not set)'}\n`);
});
