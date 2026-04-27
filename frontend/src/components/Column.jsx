import { useDroppable } from '@dnd-kit/core';
import OpportunityCard from './OpportunityCard.jsx';

const STAGE_THEME = {
  'Meeting Not Accepted': { hex: '#e2445c', light: '#fff0ef', border: '#fad4d0', text: '#c9372c', ring: 'ring-[#e2445c]/30' },
  'S0':                   { hex: '#fdab3d', light: '#fff8ed', border: '#fde8c0', text: '#b36200', ring: 'ring-[#fdab3d]/30' },
  'S0 Occurred':          { hex: '#a25ddc', light: '#f5f0ff', border: '#ddd0f8', text: '#6645c6', ring: 'ring-[#a25ddc]/30' },
  'S1':                   { hex: '#00c875', light: '#edfdf5', border: '#b0e8cf', text: '#007038', ring: 'ring-[#00c875]/30' },
  'S2':                   { hex: '#06b6d4', light: '#ecf8f9', border: '#a5f3fc', text: '#0a7ea4', ring: 'ring-[#06b6d4]/30' },
  'Rejected':             { hex: '#dc2626', light: '#fef2f2', border: '#fecaca', text: '#991b1b', ring: 'ring-[#dc2626]/30' },
};

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByMonth(opps) {
  // Sort: dated opps ascending by date, undated at bottom
  const dated   = [...opps].filter((o) => o.Meeting_Date).sort((a, b) => new Date(a.Meeting_Date) - new Date(b.Meeting_Date));
  const undated = opps.filter((o) => !o.Meeting_Date);

  const groups = [];
  let lastKey = null;

  for (const opp of dated) {
    const key = getMonthKey(opp.Meeting_Date);
    if (key !== lastKey) {
      groups.push({ label: key, opps: [] });
      lastKey = key;
    }
    groups[groups.length - 1].opps.push(opp);
  }

  if (undated.length > 0) {
    groups.push({ label: null, opps: undated }); // no-date group
  }

  return groups;
}

export default function Column({ stage, opps, onAdd, onUpdate, onDelete, isDraggingId, bdrNames = [], onEdit, onMoveStage }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const t = STAGE_THEME[stage.id];

  const groups = groupByMonth(opps);

  return (
    <div className="flex flex-col w-72 flex-shrink-0">

      {/* ── Column header ──────────────────────────────────────────── */}
      <div
        className="rounded-t-xl px-3 py-2.5 flex items-center gap-2 border border-b-0"
        style={{ backgroundColor: t.light, borderColor: t.border }}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.hex }} />
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: t.text }}>
          {stage.label}
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white font-bold border"
          style={{ color: t.text, borderColor: t.border }}
        >
          {opps.length}
        </span>
      </div>

      {/* ── Drop zone ──────────────────────────────────────────────── */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-xl border border-t-0 p-2 transition-all duration-150 bg-[#f8f9fb] ${
          isOver
            ? `ring-2 ${t.ring} bg-white`
            : 'border-gray-200'
        }`}
        style={{ borderColor: isOver ? t.hex : undefined }}
      >
        <div className="flex flex-col gap-0">
          {groups.map((group, gi) => (
            <div key={group.label ?? '__nodate__'}>
              {/* Month separator */}
              {group.label && (
                <div className={`flex items-center gap-2 ${gi === 0 ? 'mb-1.5' : 'mt-3 mb-1.5'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {group.label}
                  </span>
                  <span className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-300 font-medium">{group.opps.length}</span>
                </div>
              )}
              {!group.label && groups.length > 1 && (
                <div className="flex items-center gap-2 mt-3 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">No date</span>
                  <span className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] text-gray-300 font-medium">{group.opps.length}</span>
                </div>
              )}

              {/* Cards in this group */}
              <div className="flex flex-col gap-2">
                {group.opps.map((opp) => (
                  <OpportunityCard
                    key={opp.Id}
                    opp={opp}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    isGhost={opp.Id === isDraggingId}
                    bdrNames={bdrNames}
                    onEdit={onEdit}
                    onMoveStage={onMoveStage}
                  />
                ))}
              </div>
            </div>
          ))}

          {opps.length === 0 && !isOver && (
            <div className="flex items-center justify-center py-10 text-xs text-gray-400">
              Drop cards here
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={onAdd}
          className="mt-3 w-full py-2 text-xs font-medium text-gray-400 border border-dashed border-gray-300 rounded-lg hover:border-[#0073ea] hover:text-[#0073ea] hover:bg-[#f0f7ff] transition-all"
        >
          + Add Opportunity
        </button>
      </div>
    </div>
  );
}
