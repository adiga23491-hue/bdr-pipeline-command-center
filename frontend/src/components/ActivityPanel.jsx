import { useState, useEffect } from 'react';

const ACTION_STYLE = {
  created: { dot: 'bg-[#00c875]', label: 'Created', labelStyle: 'text-[#007038]', bg: 'bg-[#edfdf5]' },
  updated: { dot: 'bg-[#0073ea]', label: 'Updated', labelStyle: 'text-[#0055b8]', bg: 'bg-[#e8f2fd]' },
  deleted: { dot: 'bg-[#e2445c]', label: 'Deleted', labelStyle: 'text-[#c9372c]', bg: 'bg-[#fff0ef]' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityPanel({ onClose }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bdrFilter, setBdrFilter] = useState('');

  useEffect(() => {
    fetch('/api/activity')
      .then((r) => r.json())
      .then((data) => { setLog(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allBdrs = [...new Set(log.map((e) => e.bdrName).filter(Boolean))].sort();

  const filtered = bdrFilter
    ? log.filter((e) => e.bdrName === bdrFilter)
    : log;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Panel */}
      <div
        className="relative bg-white w-[420px] max-w-full h-full shadow-2xl border-l border-gray-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Activity Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">All recent changes to the pipeline</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BDR filter */}
        {allBdrs.length > 1 && (
          <div className="px-5 py-3 border-b border-gray-100 flex gap-1.5 flex-wrap">
            <button
              onClick={() => setBdrFilter('')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                !bdrFilter ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              All BDRs
            </button>
            {allBdrs.map((bdr) => (
              <button
                key={bdr}
                onClick={() => setBdrFilter(bdrFilter === bdr ? '' : bdr)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  bdrFilter === bdr
                    ? 'bg-[#0073ea] text-white border-[#0073ea]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {bdr}
              </button>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center h-32 gap-2">
              <div className="w-4 h-4 border-2 border-[#0073ea] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading activity…</span>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">No activity yet</span>
              <span className="text-xs text-center">Changes to opportunities will appear here</span>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-100" />

              <div className="space-y-1">
                {filtered.map((entry) => {
                  const s = ACTION_STYLE[entry.action] || ACTION_STYLE.updated;
                  return (
                    <div key={entry.id} className="flex gap-3 group">
                      {/* Dot */}
                      <div className="relative flex-shrink-0 mt-1">
                        <span className={`block w-[10px] h-[10px] rounded-full border-2 border-white shadow-sm ${s.dot}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs font-semibold ${s.labelStyle}`}>{s.label}</span>
                              <span className="text-xs font-medium text-gray-700 truncate max-w-[14rem]">
                                {entry.oppName}
                              </span>
                              {entry.bdrName && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-medium">
                                  {entry.bdrName}
                                </span>
                              )}
                            </div>

                            {/* Changes list */}
                            {entry.changes && entry.changes.length > 0 && (
                              <div className="mt-1.5 space-y-1">
                                {entry.changes.map((c, i) => (
                                  <div key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                                    <span className="font-medium text-gray-600 flex-shrink-0">{c.label}:</span>
                                    {c.oldValue ? (
                                      <span className="flex items-center gap-1 min-w-0">
                                        <span className="line-through text-gray-400 truncate max-w-[100px]">{c.oldValue}</span>
                                        <svg className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="font-medium text-gray-700 truncate max-w-[100px]">{c.newValue || '—'}</span>
                                      </span>
                                    ) : (
                                      <span className="font-medium text-gray-700 truncate">{c.newValue || '—'}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap mt-0.5">
                            {timeAgo(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Showing last {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
          {bdrFilter ? ` for ${bdrFilter}` : ''}
        </div>
      </div>
    </div>
  );
}
