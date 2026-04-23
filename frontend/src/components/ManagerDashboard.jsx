import { useState, useMemo } from 'react';

// ── Design tokens (Monday CRM palette) ───────────────────────────────────────
const STAGE_TOKEN = {
  'Meeting Not Accepted': {
    bg: 'bg-[#ffe9e9]', text: 'text-[#c9372c]', border: 'border-[#f5c2c0]',
    dot: 'bg-[#e2445c]', bar: 'bg-[#e2445c]', headerBg: '#fff0ef',
    hex: '#e2445c', light: '#fff0ef',
  },
  S0: {
    bg: 'bg-[#fff4e0]', text: 'text-[#b36200]', border: 'border-[#ffdfa3]',
    dot: 'bg-[#fdab3d]', bar: 'bg-[#fdab3d]', headerBg: '#fff8ed',
    hex: '#fdab3d', light: '#fff8ed',
  },
  'S0 Occurred': {
    bg: 'bg-[#f3eeff]', text: 'text-[#6645c6]', border: 'border-[#d5c4f5]',
    dot: 'bg-[#a25ddc]', bar: 'bg-[#a25ddc]', headerBg: '#f5f0ff',
    hex: '#a25ddc', light: '#f5f0ff',
  },
  S1: {
    bg: 'bg-[#e6f9f1]', text: 'text-[#007038]', border: 'border-[#b0e8cf]',
    dot: 'bg-[#00c875]', bar: 'bg-[#00c875]', headerBg: '#edfdf5',
    hex: '#00c875', light: '#edfdf5',
  },
  Rejected: {
    bg: 'bg-[#fef2f2]', text: 'text-[#991b1b]', border: 'border-[#fecaca]',
    dot: 'bg-[#dc2626]', bar: 'bg-[#dc2626]', headerBg: '#fef2f2',
    hex: '#dc2626', light: '#fef2f2',
  },
};

const SOURCE_COLOR = {
  Outbound: 'bg-[#e8f5fd] text-[#0073ea] border border-[#c0dff9]',
  LinkedIn: 'bg-[#e8f0fe] text-[#1a56db] border border-[#bfd0fb]',
  Referral: 'bg-[#edf9f0] text-[#038048] border border-[#b6e9ca]',
  Inbound: 'bg-[#fff3e0] text-[#b36200] border border-[#ffd8a3]',
  'Cold Call': 'bg-[#fce8ff] text-[#8b00c9] border border-[#e5b5fa]',
  Event: 'bg-[#e8fdf8] text-[#007c70] border border-[#a8eed8]',
  Partner: 'bg-[#fef0e0] text-[#965200] border border-[#f5cfa0]',
};

const STAGES = ['Meeting Not Accepted', 'S0', 'S0 Occurred', 'S1', 'Rejected'];

const COL_HEADERS = [
  { key: 'Opp_Name',      label: 'Opportunity',    w: 'w-52' },
  { key: 'Stage',         label: 'Stage',           w: 'w-36' },
  { key: 'Meeting_Date',  label: 'Meeting Date',    w: 'w-32' },
  { key: 'Languages',     label: 'Languages',       w: 'w-44' },
  { key: 'Pain_Validated',label: 'Pain Validated',  w: 'w-28' },
  { key: 'Source',        label: 'Source',          w: 'w-28' },
  { key: 'Email',         label: 'Email',           w: 'w-48' },
  { key: 'BDR_Name',      label: 'BDR',             w: 'w-28' },
  { key: 'AE_Name',       label: 'AE',              w: 'w-28' },
  { key: 'Last_Updated',  label: 'Last Updated',    w: 'w-36' },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ stage, count, total }) {
  const t = STAGE_TOKEN[stage];
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{stage}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-gray-800 leading-none">{count}</span>
        <span className="text-sm text-gray-400 mb-1">opps</span>
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Share of pipeline</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${t.bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ stage, count, max }) {
  const t = STAGE_TOKEN[stage];
  const pct = max ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-32 text-right truncate">{stage}</span>
      <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
        <div
          className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
          style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: t.hex }}
        >
          {count > 0 && (
            <span className="text-white text-xs font-semibold">{count}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StagePill({ stage }) {
  const t = STAGE_TOKEN[stage] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${t.bg} ${t.text} ${t.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {stage}
    </span>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ManagerDashboard({ opps, currentBDR }) {
  // Filter opps by currentBDR if set
  const filteredOpps = currentBDR ? opps.filter((o) => o.BDR_Name === currentBDR) : opps;
  const [sortField, setSortField] = useState('Last_Updated');
  const [sortDir, setSortDir]     = useState('desc');
  const [search, setSearch]       = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [showRejected, setShowRejected] = useState(false);

  // Separate rejected from active pipeline
  const activeOpps = filteredOpps.filter((o) => o.Meeting_Rejected !== 'true');
  const rejectedOpps = filteredOpps.filter((o) => o.Meeting_Rejected === 'true');
  const displayOpps = showRejected ? rejectedOpps : activeOpps;

  const painCount  = activeOpps.filter((o) => o.Pain_Validated === 'true').length;
  const painPct    = activeOpps.length ? Math.round((painCount / activeOpps.length) * 100) : 0;
  const rejectionCount = rejectedOpps.length;
  const rejectionRate = filteredOpps.length ? Math.round((rejectionCount / filteredOpps.length) * 100) : 0;

  const sourceBreakdown = useMemo(() =>
    activeOpps.reduce((acc, o) => {
      if (o.Source) acc[o.Source] = (acc[o.Source] || 0) + 1;
      return acc;
    }, {}),
  [activeOpps]);

  const topLangs = useMemo(() => {
    const map = activeOpps
      .flatMap((o) => (o.Languages ? o.Languages.split(',').filter(Boolean) : []))
      .reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {});
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [activeOpps]);

  const pipelineStages = ['Meeting Not Accepted', 'S0', 'S0 Occurred', 'S1'];
  const maxStageCount = Math.max(...pipelineStages.map((s) => activeOpps.filter((o) => o.Stage === s).length), 1);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const rows = useMemo(() =>
    [...displayOpps]
      .filter((o) => {
        const q = search.toLowerCase();
        const matchesSearch = o.Opp_Name?.toLowerCase().includes(q) || o.Source?.toLowerCase().includes(q) || o.Email?.toLowerCase().includes(q);

        if (stageFilter === 'All') return matchesSearch;
        if (stageFilter === 'Rejected') return matchesSearch && o.Meeting_Rejected === 'true';
        return matchesSearch && o.Stage === stageFilter;
      })
      .sort((a, b) => {
        const va = (a[sortField] || '').toString();
        const vb = (b[sortField] || '').toString();
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }),
  [displayOpps, search, stageFilter, sortField, sortDir]);

  return (
    <div className="-mx-6 -my-6 bg-[#f5f6f8] min-h-screen">
      {/* ── Dashboard header bar ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 leading-none">Pipeline Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {showRejected
              ? `${rejectionCount} rejected opportunities${currentBDR ? ` for ${currentBDR}` : ''}`
              : currentBDR ? `${activeOpps.length} active opportunities for ${currentBDR}` : `${activeOpps.length} active opportunities`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => { setShowRejected(false); setStageFilter('All'); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                !showRejected
                  ? 'bg-white text-[#0073ea] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Pipeline
            </button>
            <button
              onClick={() => { setShowRejected(true); setStageFilter('Rejected'); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                showRejected
                  ? 'bg-white text-[#dc2626] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
              Rejected {rejectionCount > 0 ? `(${rejectionCount})` : ''}
            </button>
          </div>

          {/* Stage filter chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            {(showRejected ? ['Rejected'] : ['All', ...pipelineStages]).map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  stageFilter === s
                    ? 'bg-[#0073ea] text-white border-[#0073ea] shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {s === 'All' ? 'All Stages' : s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Search opportunities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 w-52"
            />
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* ── Stage stat cards ─────────────────────────────────────── */}
        {!showRejected ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {pipelineStages.map((stage) => (
              <StatCard
                key={stage}
                stage={stage}
                count={activeOpps.filter((o) => o.Stage === stage).length}
                total={activeOpps.length}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rejected</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-800 leading-none">{rejectionCount}</span>
                <span className="text-sm text-gray-400 mb-1">opps</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Of total pipeline</span>
                  <span className="font-medium">{rejectionRate}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#dc2626] transition-all" style={{ width: `${rejectionRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Insight row ──────────────────────────────────────────── */}
        {!showRejected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pipeline funnel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M13 16h-2" />
              </svg>
              Pipeline Funnel
            </h3>
            <div className="space-y-2.5">
              {pipelineStages.map((stage) => (
                <FunnelBar
                  key={stage}
                  stage={stage}
                  count={activeOpps.filter((o) => o.Stage === stage).length}
                  max={maxStageCount}
                />
              ))}
            </div>
          </div>

          {/* Pain validated */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pain Validated
            </h3>

            {/* Donut-style ring */}
            <div className="flex items-center justify-center my-2">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#00c875" strokeWidth="3.5"
                    strokeDasharray={`${painPct} ${100 - painPct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{painPct}%</span>
                  <span className="text-xs text-gray-400">validated</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-[#007038]">{painCount}</span>
              <span className="text-sm text-gray-400"> of {activeOpps.length} opps</span>
            </div>
          </div>

          {/* Source breakdown + top languages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 015.656 0l.3.3a4 4 0 01-5.656 5.656l-1.1-1.1" />
                </svg>
                Source Breakdown
              </h3>
              <div className="space-y-1.5">
                {Object.entries(sourceBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, cnt]) => (
                    <div key={src} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-20 truncate">{src}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0073ea] rounded-full"
                          style={{ width: `${(cnt / activeOpps.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-4 text-right">{cnt}</span>
                    </div>
                  ))}
              </div>
            </div>

            {topLangs.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Top Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {topLangs.map(([lang, cnt]) => (
                    <span key={lang} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-medium">
                      {lang}
                      <span className="text-gray-400 font-normal">{cnt}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <h3 className="font-semibold text-gray-800 text-sm">All Opportunities</h3>
            <span className="px-2 py-0.5 bg-[#e8f2fd] text-[#0073ea] rounded-full text-xs font-semibold">{rows.length}</span>

            {/* Mobile stage filter */}
            <div className="lg:hidden ml-auto">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none"
              >
                <option value="All">All Stages</option>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  {COL_HEADERS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className={`px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-[#0073ea] hover:bg-[#f0f7ff] transition-colors select-none ${col.w}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.key ? (
                          <span className="text-[#0073ea]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-gray-200">↕</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((opp, i) => (
                  <tr
                    key={opp.Id}
                    className={`border-b border-gray-50 hover:bg-[#f0f7ff] transition-colors group ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                  >
                    {/* Opp Name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-1 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: STAGE_TOKEN[opp.Stage]?.hex || '#ccc' }}
                        />
                        {opp.Link ? (
                          <a
                            href={opp.Link}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[#0073ea] hover:text-[#0060c0] hover:underline truncate max-w-[11rem] block"
                          >
                            {opp.Opp_Name}
                          </a>
                        ) : (
                          <span className="font-semibold text-gray-800 truncate max-w-[11rem] block">{opp.Opp_Name}</span>
                        )}
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-5 py-3">
                      <StagePill stage={opp.Stage} />
                    </td>

                    {/* Meeting Date */}
                    <td className="px-5 py-3">
                      {opp.Meeting_Date ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {opp.Meeting_Date}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Languages */}
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {opp.Languages
                          ? opp.Languages.split(',').filter(Boolean).map((l) => (
                              <span key={l} className="px-1.5 py-0.5 bg-[#f0f4ff] text-[#3b5bdb] border border-[#c5d2f8] rounded text-xs font-medium">
                                {l}
                              </span>
                            ))
                          : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                    </td>

                    {/* Pain Validated */}
                    <td className="px-5 py-3">
                      {opp.Pain_Validated === 'true' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e6f9f1] text-[#007038] border border-[#b0e8cf] rounded-lg text-xs font-semibold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          No
                        </span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="px-5 py-3">
                      {opp.Source ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${SOURCE_COLOR[opp.Source] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {opp.Source}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3">
                      {opp.Email ? (
                        <a
                          href={`mailto:${opp.Email}`}
                          className="text-xs text-[#0073ea] hover:text-[#0060c0] hover:underline break-all"
                        >
                          {opp.Email}
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* BDR Name */}
                    <td className="px-5 py-3">
                      {opp.BDR_Name ? (
                        <span className="text-xs font-medium text-gray-700">{opp.BDR_Name}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* AE Name */}
                    <td className="px-5 py-3">
                      {opp.AE_Name ? (
                        <span className="text-xs font-medium text-gray-700">{opp.AE_Name}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {opp.Last_Updated
                        ? new Date(opp.Last_Updated).toLocaleString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm">No opportunities match your filters</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
