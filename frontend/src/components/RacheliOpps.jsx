import { useState, useMemo } from 'react';
import racheliData from '../data/racheli_opps.json';

const STAGE_THEME = {
  S1: { hex: '#00c875', light: '#edfdf5', border: '#b0e8cf', text: '#007038' },
  S2: { hex: '#06b6d4', light: '#ecf8f9', border: '#a5f3fc', text: '#0a7ea4' },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return null;
  }
}

function exportToCSV(opps, filename) {
  const headers = [
    'Id', 'Opp_Name', 'Stage', 'Meeting_Date', 'Languages', 'Pain_Validated',
    'Source', 'Link', 'BDR_Name', 'Originally_Sourced_By', 'AE_Name', 'Notes',
    'Email', 'Next_Step', 'Meeting_Rejected', 'Rejection_Reason', 'Last_Updated',
  ];

  const escape = (val) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = opps.map((o) => headers.map((h) => escape(o[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function OppCard({ opp }) {
  const theme = STAGE_THEME[opp.Stage] || STAGE_THEME.S1;
  return (
    <div
      className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
      style={{ borderColor: theme.border }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-tight flex-1">
          {opp.Opp_Name}
        </h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: theme.light, color: theme.text, border: `1px solid ${theme.border}` }}
        >
          {opp.Stage}
        </span>
      </div>

      {opp.Meeting_Date && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{formatDate(opp.Meeting_Date)}</span>
        </div>
      )}

      {opp.Originally_Sourced_By && (
        <div className="mb-2">
          <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full font-medium">
            Originally sourced by: {opp.Originally_Sourced_By}
          </span>
        </div>
      )}

      {opp.AE_Name && (
        <div className="text-xs text-gray-500 mb-1">
          <span className="font-medium text-gray-700">AE:</span> {opp.AE_Name}
        </div>
      )}

      {opp.Next_Step && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-snug">
            <span className="font-medium text-gray-700">Next Step:</span> {opp.Next_Step}
          </p>
        </div>
      )}

      {opp.Notes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 leading-snug italic">
            {opp.Notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function RacheliOpps() {
  // All available months from data, sorted
  const availableMonths = useMemo(() => {
    const months = new Set();
    racheliData.forEach((o) => {
      const key = getMonthKey(o.Meeting_Date);
      if (key) months.add(key);
    });
    return Array.from(months).sort();
  }, []);

  // Default to current month, or first available month if current not in data
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const defaultMonth = useMemo(() => {
    if (availableMonths.includes(currentMonthKey)) return currentMonthKey;
    return availableMonths[0] || currentMonthKey;
  }, [availableMonths, currentMonthKey]);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [showNoDate, setShowNoDate] = useState(false);

  const filteredOpps = useMemo(() => {
    if (showAllMonths) return racheliData;
    if (showNoDate) return racheliData.filter((o) => !o.Meeting_Date);
    return racheliData.filter((o) => getMonthKey(o.Meeting_Date) === selectedMonth);
  }, [selectedMonth, showAllMonths, showNoDate]);

  const s1Opps = filteredOpps.filter((o) => o.Stage === 'S1');
  const s2Opps = filteredOpps.filter((o) => o.Stage === 'S2');
  const noDateCount = racheliData.filter((o) => !o.Meeting_Date).length;

  const formatMonthLabel = (key) => {
    if (!key) return '';
    const [year, month] = key.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
  };

  const handleExport = () => {
    const filename = showAllMonths
      ? `racheli_opps_all.csv`
      : showNoDate
        ? `racheli_opps_no_date.csv`
        : `racheli_opps_${selectedMonth}.csv`;
    exportToCSV(filteredOpps, filename);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Racheli Opps</h1>
                <p className="text-xs text-gray-500">
                  {racheliData.length} opportunities · Separate from main pipeline
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#0073ea] hover:bg-[#0060c0] rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV ({filteredOpps.length})
          </button>
        </div>

        {/* Month filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Filter by month:</span>

          <button
            onClick={() => { setShowAllMonths(true); setShowNoDate(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showAllMonths
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            All ({racheliData.length})
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setShowAllMonths(false); setShowNoDate(false); }}
            disabled={showAllMonths || showNoDate}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              !showAllMonths && !showNoDate
                ? 'bg-[#0073ea] text-white border-[#0073ea]'
                : 'bg-white text-gray-500 border-gray-200'
            } disabled:opacity-50 focus:outline-none`}
          >
            {availableMonths.map((m) => {
              const count = racheliData.filter((o) => getMonthKey(o.Meeting_Date) === m).length;
              return (
                <option key={m} value={m}>
                  {formatMonthLabel(m)} ({count})
                </option>
              );
            })}
          </select>

          {noDateCount > 0 && (
            <button
              onClick={() => { setShowNoDate(true); setShowAllMonths(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showNoDate
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-amber-600 border-amber-200 hover:border-amber-300'
              }`}
            >
              No Date ({noDateCount})
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400">
            Showing <span className="font-bold text-gray-700">{filteredOpps.length}</span> opportunities
            {!showAllMonths && !showNoDate && ` for ${formatMonthLabel(selectedMonth)}`}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {filteredOpps.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm font-medium text-gray-700">No opportunities for this month</p>
          <p className="text-xs text-gray-500 mt-1">Try selecting a different month or "All"</p>
        </div>
      )}

      {/* S1 Section */}
      {s1Opps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STAGE_THEME.S1.hex }}
            />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              S1 — Accepted
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                backgroundColor: STAGE_THEME.S1.light,
                color: STAGE_THEME.S1.text,
                border: `1px solid ${STAGE_THEME.S1.border}`,
              }}
            >
              {s1Opps.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {s1Opps.map((opp) => (
              <OppCard key={opp.Id} opp={opp} />
            ))}
          </div>
        </div>
      )}

      {/* S2 Section */}
      {s2Opps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STAGE_THEME.S2.hex }}
            />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              S2 — Advanced
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                backgroundColor: STAGE_THEME.S2.light,
                color: STAGE_THEME.S2.text,
                border: `1px solid ${STAGE_THEME.S2.border}`,
              }}
            >
              {s2Opps.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {s2Opps.map((opp) => (
              <OppCard key={opp.Id} opp={opp} />
            ))}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
        <p className="text-xs text-violet-700">
          ℹ️ These opportunities are tracked separately and do not count toward main BDR goals or the Manager Dashboard.
        </p>
      </div>
    </div>
  );
}
