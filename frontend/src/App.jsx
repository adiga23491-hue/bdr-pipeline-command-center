import { useState, useEffect, useCallback, useMemo } from 'react';
import KanbanBoard from './components/KanbanBoard.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';
import BDRDashboard from './components/BDRDashboard.jsx';
import RacheliOpps from './components/RacheliOpps.jsx';
import OppModal from './components/OppModal.jsx';
import ListView from './components/ListView.jsx';
import FilterBar from './components/FilterBar.jsx';
import ActivityPanel from './components/ActivityPanel.jsx';
import Sidebar from './components/Sidebar.jsx';
import Playbook from './components/Playbook.jsx';

const STAGE_PILLS = [
  { label: 'Not Accepted', key: 'Meeting Not Accepted', style: 'bg-[#ffe9e9] text-[#c9372c] border border-[#f5c2c0]' },
  { label: 'S0',           key: 'S0',                   style: 'bg-[#fff4e0] text-[#b36200] border border-[#ffdfa3]' },
  { label: 'S0 Occurred',  key: 'S0 Occurred',          style: 'bg-[#f3eeff] text-[#6645c6] border border-[#d5c4f5]' },
  { label: 'S1',           key: 'S1',                   style: 'bg-[#e6f9f1] text-[#007038] border border-[#b0e8cf]' },
];

const BDR_NAMES = ['Simon', 'Steven', 'Eyal', 'Rachel'];

const DEFAULT_FILTERS = { search: '', source: '', pain: null, bdr: '' };

function getMeetingAlerts(opps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 2);
  return opps.filter((o) => {
    if (!o.Meeting_Date || o.Stage === 'Rejected' || o.Meeting_Rejected === 'true') return false;
    const d = new Date(o.Meeting_Date);
    return d >= today && d <= soon;
  });
}

export default function App() {
  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activePage, setActivePage] = useState('pipeline'); // 'pipeline' | 'dashboard' | 'playbook' | 'racheli'
  const [dashboardView, setDashboardView] = useState('manager'); // 'manager' | 'bdr'

  // ── Pipeline state ─────────────────────────────────────────────────────────
  const [opps, setOpps]               = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentBDR, setCurrentBDR]   = useState(null);
  const [toast, setToast]             = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput]   = useState('');
  const [pendingAddition, setPendingAddition] = useState(null);
  const [filters, setFilters]         = useState(DEFAULT_FILTERS);
  const [showActivity, setShowActivity] = useState(false);
  const [showAlerts, setShowAlerts]   = useState(false);
  const [viewMode, setViewMode]       = useState('kanban'); // 'kanban' | 'list'
  const [stageFilter, setStageFilter] = useState('both');   // 'both' | 's1' | 's2'
  const [oppModal, setOppModal]       = useState(null);     // null | { mode: 'add'|'edit', opp?: {} }

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Navigate to dashboard (requires password) ──────────────────────────────
  const handleDashboardNav = () => {
    if (activePage === 'dashboard') {
      setActivePage('pipeline');
    } else {
      setShowPasswordModal(true);
      setPasswordInput('');
    }
  };

  const handleSidebarNav = (page) => {
    if (page === 'dashboard') {
      handleDashboardNav();
    } else {
      setActivePage(page);
    }
  };

  // ── Opp modal handlers ─────────────────────────────────────────────────────
  const handleOpenAdd = () => setOppModal({ mode: 'add', opp: null });
  const handleOpenEdit = (opp) => setOppModal({ mode: 'edit', opp });
  const handleCloseModal = () => setOppModal(null);

  const handleModalSave = async (formData) => {
    if (oppModal.mode === 'add') {
      await completeAddOpp(formData.Stage, formData.BDR_Name, formData.Email || '');
      // After the temp opp is replaced by the real one, updateOpp with full data
      // Simpler: just call the full add path with all fields
      const tempId = `temp-${Date.now()}`;
      const draft = { Id: tempId, ...formData, Last_Updated: new Date().toISOString() };
      setOpps((prev) => [draft, ...prev]);
      try {
        const res  = await fetch('/api/opportunities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
        const data = await res.json();
        if (!res.ok) { setOpps((prev) => prev.filter((o) => o.Id !== tempId)); notify(data.error || 'Failed to create', 'error'); }
        else { setOpps((prev) => prev.map((o) => (o.Id === tempId ? data : o))); notify('Opportunity created', 'success'); }
      } catch { setOpps((prev) => prev.filter((o) => o.Id !== tempId)); notify('Failed to create', 'error'); }
    } else {
      await updateOpp(oppModal.opp.Id, formData);
      notify('Opportunity updated', 'success');
    }
    handleCloseModal();
  };

  const handleMoveStage = (id, targetStage) => updateOpp(id, { Stage: targetStage });

  // ── Load opportunities ─────────────────────────────────────────────────────
  useEffect(() => {
    const url = currentBDR ? `/api/opportunities?bdr=${encodeURIComponent(currentBDR)}` : '/api/opportunities';
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setOpps(Array.isArray(data) ? data : []); setDataLoading(false); })
      .catch(() => { notify('Could not reach backend', 'error'); setDataLoading(false); });
  }, [notify, currentBDR]);

  // ── Meeting alerts ─────────────────────────────────────────────────────────
  const alerts = useMemo(() => getMeetingAlerts(opps), [opps]);

  // ── Filtered opps for Kanban ───────────────────────────────────────────────
  const filteredOpps = useMemo(() => {
    return opps.filter((o) => {
      const q = filters.search.toLowerCase();
      if (q && !(
        o.Opp_Name?.toLowerCase().includes(q) ||
        o.Email?.toLowerCase().includes(q) ||
        o.Notes?.toLowerCase().includes(q)
      )) return false;
      if (filters.source && o.Source !== filters.source) return false;
      if (filters.pain !== null) {
        const isValidated = o.Pain_Validated === 'true';
        if (filters.pain && !isValidated) return false;
        if (!filters.pain && isValidated) return false;
      }
      return true;
    });
  }, [opps, filters]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleAddClick = (stage, bdrName) => {
    setPendingAddition({ stage, bdrName });
    setShowEmailModal(true);
    setEmailInput('');
  };

  const completeAddOpp = useCallback(async (stage, bdrName, email) => {
    const tempId = `temp-${Date.now()}`;
    const draft = { Id: tempId, Opp_Name: 'New Opportunity', Stage: stage, Meeting_Date: '', Languages: '', Pain_Validated: 'false', Source: '', Link: '', BDR_Name: bdrName || '', AE_Name: '', Notes: '', Email: email.trim(), Next_Step: '', Meeting_Rejected: 'false', Rejection_Reason: '', Last_Updated: new Date().toISOString() };
    setOpps((prev) => [draft, ...prev]);
    try {
      const res  = await fetch('/api/opportunities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'Failed to create opportunity', 'error');
        setOpps((prev) => prev.filter((o) => o.Id !== tempId));
        return;
      }
      setOpps((prev) => prev.map((o) => (o.Id === tempId ? data : o)));
      notify('Opportunity created', 'success');
    } catch {
      setOpps((prev) => prev.filter((o) => o.Id !== tempId));
      notify('Failed to create opportunity', 'error');
    }
  }, [notify]);

  const addOpp = useCallback((stage, bdrName) => {
    handleAddClick(stage, bdrName);
  }, []);

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

  // ── Render helpers ─────────────────────────────────────────────────────────
  const isPipeline  = activePage === 'pipeline';
  const isDashboard = activePage === 'dashboard';
  const isPlaybook  = activePage === 'playbook';
  const isRacheli   = activePage === 'racheli';

  // Stage filter applied on top of other filters
  const stageFilteredOpps = stageFilter === 'both'
    ? filteredOpps
    : filteredOpps.filter((o) => o.Stage === stageFilter.toUpperCase());

  return (
    <div className="h-screen flex flex-col bg-[#f5f6f8] text-gray-800 font-sans overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3 flex items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-3 mr-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0073ea] via-[#a25ddc] to-[#00c875] flex items-center justify-center shadow shadow-blue-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-none tracking-tight">
                {isPlaybook ? 'BDR Playbook Coach' : 'BDR Pipeline'}
              </h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">
                {isPlaybook
                  ? 'SeaLights · Tricentis'
                  : isDashboard
                    ? (dashboardView === 'bdr' ? 'BDR Analytics' : 'Manager Dashboard')
                    : currentBDR ? `${currentBDR}'s View` : 'All Opportunities'}
              </p>
            </div>
          </div>

          {/* Stage pills — pipeline only */}
          {isPipeline && (
            <div className="hidden lg:flex items-center gap-1.5">
              {STAGE_PILLS.map((s) => (
                <span key={s.key} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.style}`}>
                  {opps.filter((o) => o.Stage === s.key).length} {s.label}
                </span>
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">

            {/* Meeting alerts — pipeline only */}
            {isPipeline && alerts.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAlerts((v) => !v)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {alerts.length} meeting{alerts.length > 1 ? 's' : ''} soon
                </button>
                {showAlerts && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-amber-100 rounded-xl shadow-xl w-72 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-amber-50 bg-amber-50">
                      <p className="text-xs font-semibold text-amber-700">Upcoming Meetings</p>
                      <p className="text-xs text-amber-500">Next 48 hours</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {alerts.map((o) => (
                        <div key={o.Id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">{o.Opp_Name}</p>
                              <p className="text-xs text-gray-400">{o.BDR_Name} · {o.Stage}</p>
                            </div>
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              {new Date(o.Meeting_Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowAlerts(false)} className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 border-t border-gray-100 transition-colors">Close</button>
                  </div>
                )}
              </div>
            )}

            {/* BDR Filter — pipeline/dashboard only */}
            {!isPlaybook && (
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
            )}

            {/* Export — pipeline only */}
            {isPipeline && (
              <a
                href="/api/export"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors bg-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </a>
            )}

            {/* Activity Log — pipeline only */}
            {isPipeline && (
              <button
                onClick={() => setShowActivity((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                  showActivity
                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity
              </button>
            )}

            {/* Dashboard toggle — when on dashboard, show view switcher */}
            {isDashboard && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setDashboardView('manager')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dashboardView === 'manager' ? 'bg-white text-[#0073ea] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manager
                </button>
                <button
                  onClick={() => setDashboardView('bdr')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dashboardView === 'bdr' ? 'bg-white text-[#0073ea] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  BDR Analytics
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Content ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar activePage={activePage} onChange={handleSidebarNav} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">

          {/* Pipeline page */}
          {isPipeline && (
            <div className="px-6 py-6">
              {dataLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-6 h-6 border-2 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading pipeline…</p>
                </div>
              ) : (
                <>
                  <FilterBar
                    filters={filters}
                    onChange={setFilters}
                    bdrNames={BDR_NAMES}
                    resultCount={stageFilteredOpps.length}
                    totalCount={opps.length}
                  />

                  {/* ── Pipeline toolbar: Add, View toggle, Stage filter ── */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {/* + Add Opportunity */}
                    <button
                      onClick={handleOpenAdd}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0073ea] hover:bg-[#0063d0] rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Opportunity
                    </button>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Kanban / List toggle */}
                    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                      {[{ id: 'kanban', label: 'Kanban' }, { id: 'list', label: 'List' }].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setViewMode(id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            viewMode === id ? 'bg-white text-[#0073ea] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* S1 / S2 stage filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 font-medium">Stage:</span>
                      {[{ id: 'both', label: 'All' }, { id: 's1', label: 'S1 Only' }, { id: 's2', label: 'S2 Only' }].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setStageFilter(id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            stageFilter === id
                              ? 'bg-gray-800 text-white border-gray-800'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {viewMode === 'list' ? (
                    <ListView
                      opps={stageFilteredOpps}
                      onEdit={handleOpenEdit}
                      onUpdate={updateOpp}
                    />
                  ) : (
                    <KanbanBoard
                      opps={stageFilteredOpps}
                      onAdd={addOpp}
                      onUpdate={updateOpp}
                      onDelete={deleteOpp}
                      currentBDR={currentBDR}
                      bdrNames={BDR_NAMES}
                      onEdit={handleOpenEdit}
                      onMoveStage={handleMoveStage}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Dashboard page */}
          {isDashboard && (
            <div className="px-6 py-6">
              {dataLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-6 h-6 border-2 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading…</p>
                </div>
              ) : dashboardView === 'bdr' ? (
                <BDRDashboard opps={opps} bdrNames={BDR_NAMES} />
              ) : (
                <ManagerDashboard opps={opps} currentBDR={currentBDR} bdrNames={BDR_NAMES} />
              )}
            </div>
          )}

          {/* Playbook page */}
          {isPlaybook && <Playbook />}

          {/* Racheli Opps page */}
          {isRacheli && (
            <div className="px-6 py-6">
              <RacheliOpps
                opps={opps.filter((o) => o.BDR_Name === 'Rachel')}
                onUpdate={updateOpp}
                onDelete={deleteOpp}
                onOpenEdit={handleOpenEdit}
                onOpenAdd={(stage) => setOppModal({ mode: 'add', opp: { BDR_Name: 'Rachel', ...(stage ? { Stage: stage } : {}) } })}
                onMoveStage={handleMoveStage}
                bdrNames={BDR_NAMES}
              />
            </div>
          )}
        </main>
      </div>

      {/* ── Activity Panel ──────────────────────────────────────────────── */}
      {showActivity && <ActivityPanel onClose={() => setShowActivity(false)} />}

      {/* ── Opp Add/Edit Modal ──────────────────────────────────────────── */}
      {oppModal && (
        <OppModal
          opp={oppModal.mode === 'edit' ? oppModal.opp : null}
          bdrNames={BDR_NAMES}
          onSave={handleModalSave}
          onClose={handleCloseModal}
        />
      )}

      {/* ── Email Modal ─────────────────────────────────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Email Required</h2>
            <p className="text-sm text-gray-600 mb-6">Please enter the contact email for this opportunity:</p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && emailInput.trim()) {
                  if (pendingAddition) {
                    completeAddOpp(pendingAddition.stage, pendingAddition.bdrName, emailInput);
                    setShowEmailModal(false);
                    setPendingAddition(null);
                  }
                }
              }}
              placeholder="contact@example.com"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (emailInput.trim() && pendingAddition) {
                    completeAddOpp(pendingAddition.stage, pendingAddition.bdrName, emailInput);
                    setShowEmailModal(false);
                    setPendingAddition(null);
                  } else {
                    notify('Please enter an email address', 'error');
                  }
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0073ea] hover:bg-[#0063d0] rounded-lg transition-colors"
              >
                Create Opportunity
              </button>
              <button
                onClick={() => { setShowEmailModal(false); setPendingAddition(null); setEmailInput(''); }}
                className="flex-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                    setActivePage('dashboard');
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
                    setActivePage('dashboard');
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
                onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }}
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
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium border flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-white border-red-200 text-red-600'
            : 'bg-white border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
