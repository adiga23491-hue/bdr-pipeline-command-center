import { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './components/KanbanBoard.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';

export default function App() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    fetch('/api/opportunities')
      .then((r) => r.json())
      .then((data) => {
        setOpps(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        notify('Could not reach backend — is the server running on :3001?', 'error');
        setLoading(false);
      });
  }, [notify]);

  const addOpp = useCallback(
    async (stage) => {
      const tempId = `temp-${Date.now()}`;
      const draft = {
        Id: tempId,
        Opp_Name: 'New Opportunity',
        Stage: stage,
        Meeting_Date: '',
        Languages: '',
        Pain_Validated: 'false',
        Source: '',
        Link: '',
        Last_Updated: new Date().toISOString(),
      };
      setOpps((prev) => [draft, ...prev]);
      try {
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });
        const saved = await res.json();
        setOpps((prev) => prev.map((o) => (o.Id === tempId ? saved : o)));
      } catch {
        setOpps((prev) => prev.filter((o) => o.Id !== tempId));
        notify('Failed to create opportunity', 'error');
      }
    },
    [notify]
  );

  const updateOpp = useCallback(
    async (id, updates) => {
      // Optimistic — update immediately
      setOpps((prev) =>
        prev.map((o) =>
          o.Id === id ? { ...o, ...updates, Last_Updated: new Date().toISOString() } : o
        )
      );
      try {
        await fetch(`/api/opportunities/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {
        notify('Sync failed — refresh to reload', 'error');
      }
    },
    [notify]
  );

  const deleteOpp = useCallback(
    async (id) => {
      setOpps((prev) => prev.filter((o) => o.Id !== id));
      try {
        await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
        notify('Opportunity removed');
      } catch {
        notify('Delete failed', 'error');
      }
    },
    [notify]
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${showDashboard ? 'bg-[#f5f6f8] text-gray-800' : 'bg-gray-950 text-gray-100'}`}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        showDashboard
          ? 'border-b border-gray-200 bg-white/95 shadow-sm'
          : 'border-b border-gray-800/80 bg-gray-950/90'
      }`}>
        <div className="mx-auto max-w-screen-2xl px-6 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className={`text-sm font-semibold tracking-tight leading-none ${showDashboard ? 'text-gray-800' : 'text-gray-100'}`}>BDR Pipeline</h1>
              <p className={`text-xs leading-none mt-0.5 ${showDashboard ? 'text-gray-400' : 'text-gray-500'}`}>Command Center</p>
            </div>
          </div>

          {/* Stage summary pills — adapt color per mode */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {[
              { label: 'Not Accepted', key: 'Meeting Not Accepted',
                dark: 'bg-slate-800 text-slate-400', light: 'bg-[#ffe9e9] text-[#c9372c] border border-[#f5c2c0]' },
              { label: 'S0', key: 'S0',
                dark: 'bg-blue-900/60 text-blue-400', light: 'bg-[#fff4e0] text-[#b36200] border border-[#ffdfa3]' },
              { label: 'S0 Occurred', key: 'S0 Occurred',
                dark: 'bg-violet-900/60 text-violet-400', light: 'bg-[#f3eeff] text-[#6645c6] border border-[#d5c4f5]' },
              { label: 'S1', key: 'S1',
                dark: 'bg-emerald-900/60 text-emerald-400', light: 'bg-[#e6f9f1] text-[#007038] border border-[#b0e8cf]' },
            ].map((s) => (
              <span key={s.key} className={`px-2 py-0.5 rounded-full font-mono font-medium ${showDashboard ? s.light : s.dark}`}>
                {opps.filter((o) => o.Stage === s.key).length} {s.label}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="/api/export"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                showDashboard
                  ? 'text-gray-500 hover:text-gray-700 border-gray-200 hover:border-gray-300 bg-white'
                  : 'text-gray-400 hover:text-gray-200 border-gray-700 hover:border-gray-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
            <button
              onClick={() => setShowDashboard((s) => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border font-medium ${
                showDashboard
                  ? 'bg-[#0073ea] border-[#0073ea] text-white shadow-sm hover:bg-[#0060c0]'
                  : 'text-gray-400 hover:text-gray-200 border-gray-700 hover:border-gray-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showDashboard ? 'Board View' : 'Manager Dashboard'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-2xl px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading pipeline…</p>
          </div>
        ) : showDashboard ? (
          <ManagerDashboard opps={opps} />
        ) : (
          <KanbanBoard opps={opps} onAdd={addOpp} onUpdate={updateOpp} onDelete={deleteOpp} />
        )}
      </main>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border animate-fade-in ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-800 text-red-300'
              : 'bg-emerald-950 border-emerald-800 text-emerald-300'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
