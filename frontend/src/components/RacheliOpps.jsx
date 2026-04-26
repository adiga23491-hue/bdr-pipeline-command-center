import { useState, useEffect, useCallback, useMemo } from 'react';
import KanbanBoard, { STAGES } from './KanbanBoard.jsx';
import ListView from './ListView.jsx';
import OppModal from './OppModal.jsx';

// Only S1 and S2 columns in Racheli Kanban
const RACHELI_STAGES = STAGES.filter((s) => s.id === 'S1' || s.id === 'S2');

const BDR_NAMES = ['Simon', 'Steven', 'Eyal', 'Rachel'];

export default function RacheliOpps() {
  const [opps, setOpps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [stageFilter, setStageFilter] = useState('both');
  const [oppModal, setOppModal] = useState(null); // null | { mode: 'add'|'edit', opp? }
  const [toast, setToast]       = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Fetch from separate racheli endpoint ──────────────────────────────────
  useEffect(() => {
    fetch('/api/racheli')
      .then((r) => r.json())
      .then((data) => { setOpps(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { notify('Could not load Racheli opps', 'error'); setLoading(false); });
  }, [notify]);

  // ── CRUD (all hit /api/racheli — never /api/opportunities) ───────────────
  const updateOpp = useCallback(async (id, updates) => {
    setOpps((prev) => prev.map((o) => o.Id === id ? { ...o, ...updates, Last_Updated: new Date().toISOString() } : o));
    try {
      await fetch(`/api/racheli/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    } catch { notify('Sync failed — refresh to reload', 'error'); }
  }, [notify]);

  const deleteOpp = useCallback(async (id) => {
    setOpps((prev) => prev.filter((o) => o.Id !== id));
    try { await fetch(`/api/racheli/${id}`, { method: 'DELETE' }); }
    catch { notify('Delete failed', 'error'); }
  }, [notify]);

  const handleMoveStage = useCallback((id, targetStage) => updateOpp(id, { Stage: targetStage }), [updateOpp]);

  // ── Modal handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = (stage) => setOppModal({ mode: 'add', opp: { Stage: stage || 'S1' } });
  const handleOpenEdit = (opp) => setOppModal({ mode: 'edit', opp });
  const handleCloseModal = () => setOppModal(null);

  const handleModalSave = async (formData) => {
    if (oppModal.mode === 'add') {
      const tempId = `temp-${Date.now()}`;
      const draft = { Id: tempId, ...formData, Last_Updated: new Date().toISOString() };
      setOpps((prev) => [draft, ...prev]);
      try {
        const res  = await fetch('/api/racheli', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
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

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    window.location.href = '/api/racheli/export';
  };

  // ── Filtered opps ─────────────────────────────────────────────────────────
  const filteredOpps = useMemo(() => {
    if (stageFilter === 'both') return opps;
    return opps.filter((o) => o.Stage === stageFilter.toUpperCase());
  }, [opps, stageFilter]);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          R
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800 leading-none">Racheli's Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">{opps.length} opportunities · Separate data store</p>
        </div>
        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors bg-white"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* + Add Opportunity */}
        <button
          onClick={() => handleOpenAdd()}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48 gap-3">
          <div className="w-5 h-5 border-2 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading Racheli's opportunities…</p>
        </div>
      )}

      {/* Content */}
      {!loading && viewMode === 'list' && (
        <ListView
          opps={filteredOpps}
          onEdit={handleOpenEdit}
          onUpdate={updateOpp}
        />
      )}

      {!loading && viewMode === 'kanban' && (
        <KanbanBoard
          opps={filteredOpps}
          onAdd={handleOpenAdd}
          onUpdate={updateOpp}
          onDelete={deleteOpp}
          currentBDR={null}
          bdrNames={BDR_NAMES}
          onEdit={handleOpenEdit}
          onMoveStage={handleMoveStage}
          stagesOverride={RACHELI_STAGES}
        />
      )}

      {/* Opp Add/Edit Modal */}
      {oppModal && (
        <OppModal
          opp={oppModal.mode === 'edit' ? oppModal.opp : null}
          bdrNames={BDR_NAMES}
          onSave={handleModalSave}
          onClose={handleCloseModal}
        />
      )}

      {/* Toast */}
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
