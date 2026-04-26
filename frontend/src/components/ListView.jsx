const STAGE_STYLE = {
  'Meeting Not Accepted': 'bg-[#fff0ef] text-[#c9372c] border-[#fad4d0]',
  'S0':                   'bg-[#fff8ed] text-[#b36200] border-[#fde8c0]',
  'S0 Occurred':          'bg-[#f5f0ff] text-[#6645c6] border-[#ddd0f8]',
  'S1':                   'bg-[#edfdf5] text-[#007038] border-[#b0e8cf]',
  'S2':                   'bg-[#ecf8f9] text-[#0a7ea4] border-[#a5f3fc]',
  'Rejected':             'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
};

const PAIN_STYLE = {
  true:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  false: 'bg-gray-50 text-gray-400 border-gray-200',
};

function fmt(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  } catch { return dateStr; }
}

export default function ListView({ opps, onEdit, onUpdate }) {
  if (opps.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl flex items-center justify-center h-40">
        <p className="text-sm text-gray-400">No opportunities match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {['Company', 'BDR', 'AE', 'Stage', 'Date', 'Pain', 'Source', ''].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide text-[10px] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {opps.map((opp) => {
            const stageStyle = STAGE_STYLE[opp.Stage] || 'bg-gray-100 text-gray-600 border-gray-200';
            const painValidated = opp.Pain_Validated === 'true';
            return (
              <tr key={opp.Id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[200px] truncate">
                  {opp.Opp_Name || '—'}
                </td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                  {opp.BDR_Name || '—'}
                </td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                  {opp.AE_Name || '—'}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full font-semibold border text-[10px] ${stageStyle}`}>
                    {opp.Stage}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                  {fmt(opp.Meeting_Date)}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onUpdate(opp.Id, { Pain_Validated: String(!painValidated) })}
                    className={`px-2 py-0.5 rounded-full border font-semibold text-[10px] transition-all ${PAIN_STYLE[painValidated]}`}
                    title="Click to toggle"
                  >
                    {painValidated ? '✓ Yes' : '✗ No'}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                  {opp.Source || '—'}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onEdit(opp)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#0073ea]"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
        {opps.length} opportunit{opps.length === 1 ? 'y' : 'ies'}
      </div>
    </div>
  );
}
