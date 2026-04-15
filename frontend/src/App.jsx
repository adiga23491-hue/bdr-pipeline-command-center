import { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './components/KanbanBoard.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';

const STAGE_PILLS = [
  { label: 'Not Accepted', key: 'Meeting Not Accepted', style: 'bg-[#ffe9e9] text-[#c9372c] border border-[#f5c2c0]' },
  { label: 'S0',           key: 'S0',                   style: 'bg-[#fff4e0] text-[#b36200] border border-[#ffdfa3]' },
  { label: 'S0 Occurred',  key: 'S0 Occurred',          style: 'bg-[#f3eeff] text-[#6645c6] border border-[#d5c4f5]' },
  { label: 'S1',           key: 'S1',                   style: 'bg-[#e6f9f1] text-[#007038] border border-[#b0e8cf]' },
];

const BDR_NAMES = ['Simon', 'Steven', 'Eyal'];

export default function App() {
  const [opps, setOpps]               = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentBDR, setCurrentBDR]    = useState(null);
  const [showBDRModal, setShowBDRModal] = useState(false);
  const [toast, setToast]             = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Load opportunities ─────────────────────────────────────────────────────
  useEffect(() => {
    const url = currentBDR ? `/api/opportunities?bdr=${encodeURIComponent(currentBDR)}` : '/api/opportunities';
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setOpps(Array.isArray(data) ? data : []); setDataLoading(false); })
      .catch(() => { notify('Could not reach backend', 'error'); setDataLoading(false); });
  }, [notify, currentBDR]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addOpp = useCallback(async (stage, bdrName) => {
    const tempId = `temp-${Date.now()}`;
    const draft = { Id: tempId, Opp_Name: 'New Opportunity', Stage: stage, Meeting_Date: '', Languages: '', Pain_Validated: 'false', Source: '', Link: '', BDR_Name: bdrName || '', AE_Name: '', Notes: '', Last_Updated: new Date().toISOString() };
    setOpps((prev) => [draft, ...prev]);
    try {
      const res  = await fetch('/api/opportunities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const saved = await res.json();
      setOpps((prev) => prev.map((o) => (o.Id === tempId ? saved : o)));
    } catch {
      setOpps((prev) => prev.filter((o) => o.Id !== tempId));
      notify('Failed to create opportunity', 'error');
    }
  }, [notify]);

  const updateOpp = useCallback(async (id, updates) => {
    setOpps((prev) => prev.map((o) => o.Id === id ? { ...o, ...updates, Last_Updated: new Date().toISOString() } : o));
    try {
      await fetch(`/api/opportunities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    } catch { notify('Sync failed — refresh to reload', 'error'); }
  }, [notify]);

  const deleteOpp = useCallback(async (id) => {
    setOpps((prev) => prev.filter((o) => o.Id !== id));
    try { await fetch(`/api/opportunities/${id}`, { method: 'DELETE' }); }
    catch { notify('Delete failed', 'error'); }
  }, [notify]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-800 font-sans">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-6 py-3 flex items-center gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 mr-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0073ea] via-[#a25ddc] to-[#00c875] flex items-center justify-center shadow shadow-blue-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-none tracking-tight">BDR Pipeline</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">
                {currentBDR ? `${currentBDR}'s View` : 'All Opportunities'}
              </p>
            </div>
          </div>

          {/* Stage pills */}
          <div className="hidden md:flex items-center gap-1.5">
            {STAGE_PILLS.map((s) => (
              <span key={s.key} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.style}`}>
                {opps.filter((o) => o.Stage === s.key).length} {s.label}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* BDR Filter */}
            <select
              value={currentBDR || ''}
              onChange={(e) => setCurrentBDR(e.target.value || null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg transition-colors bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:border-[#0073ea]"
            >
              <option value="">All BDRs</option>
              {BDR_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <a
              href="/api/export"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors bg-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>

            {/* Dashboard toggle */}
            <button
              onClick={() => {
                if (showDashboard) {
                  setShowDashboard(false);
                } else {
                  setShowPasswordModal(true);
                  setPasswordInput('');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                showDashboard
                  ? 'bg-[#0073ea] border-[#0073ea] text-white shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#0073ea] hover:text-[#0073ea]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showDashboard ? 'Board View' : 'Dashboard'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-2xl px-6 py-6">
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-6 h-6 border-2 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading pipeline…</p>
          </div>
        ) : showDashboard ? (
          <ManagerDashboard opps={opps} currentBDR={currentBDR} />
        ) : (
          <KanbanBoard opps={opps} onAdd={addOpp} onUpdate={updateOpp} onDelete={deleteOpp} currentBDR={currentBDR} bdrNames={BDR_NAMES} />
        )}
      </main>

      {/* ── Password Modal ──────────────────────────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Manager Dashboard</h2>
            <p className="text-sm text-gray-600 mb-6">Enter password to access:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (passwordInput === '1234') {
                    setShowDashboard(true);
                    setShowPasswordModal(false);
                    setPasswordInput('');
                  } else {
                    notify('Incorrect password', 'error');
                    setPasswordInput('');
                  }
                }
              }}
              placeholder="Password"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (passwordInput === '1234') {
                    setShowDashboard(true);
                    setShowPasswordModal(false);
                    setPasswordInput('');
                  } else {
                    notify('Incorrect password', 'error');
                    setPasswordInput('');
                  }
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0073ea] hover:bg-[#0063d0] rounded-lg transition-colors"
              >
                Unlock
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
                className="flex-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === 'error'
            ? 'bg-white border-red-200 text-red-600'
            : 'bg-white border-emerald-200 text-emerald-700'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
