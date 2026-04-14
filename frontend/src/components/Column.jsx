import { useDroppable } from '@dnd-kit/core';
import OpportunityCard from './OpportunityCard.jsx';

const STAGE_THEME = {
  'Meeting Not Accepted': { hex: '#e2445c', light: '#fff0ef', border: '#fad4d0', text: '#c9372c', ring: 'ring-[#e2445c]/30' },
  'S0':                   { hex: '#fdab3d', light: '#fff8ed', border: '#fde8c0', text: '#b36200', ring: 'ring-[#fdab3d]/30' },
  'S0 Occurred':          { hex: '#a25ddc', light: '#f5f0ff', border: '#ddd0f8', text: '#6645c6', ring: 'ring-[#a25ddc]/30' },
  'S1':                   { hex: '#00c875', light: '#edfdf5', border: '#b0e8cf', text: '#007038', ring: 'ring-[#00c875]/30' },
};

export default function Column({ stage, opps, onAdd, onUpdate, onDelete, isDraggingId }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const t = STAGE_THEME[stage.id];

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
        <div className="flex flex-col gap-2">
          {opps.map((opp) => (
            <OpportunityCard
              key={opp.Id}
              opp={opp}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isGhost={opp.Id === isDraggingId}
            />
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
