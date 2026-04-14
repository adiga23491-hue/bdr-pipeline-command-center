import { useDroppable } from '@dnd-kit/core';
import OpportunityCard from './OpportunityCard.jsx';

const STAGE_THEME = {
  'Meeting Not Accepted': {
    dot: 'bg-slate-400',
    label: 'text-slate-300',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    ring: 'ring-slate-500/60',
    glow: 'bg-slate-900/60',
    addBtn: 'text-slate-600 hover:text-slate-400 border-slate-800 hover:border-slate-600',
    columnBg: 'bg-slate-950/40',
  },
  S0: {
    dot: 'bg-blue-400',
    label: 'text-blue-300',
    badge: 'bg-blue-900/50 text-blue-400 border-blue-800',
    ring: 'ring-blue-500/60',
    glow: 'bg-blue-950/40',
    addBtn: 'text-blue-800 hover:text-blue-400 border-blue-900 hover:border-blue-700',
    columnBg: 'bg-blue-950/10',
  },
  'S0 Occurred': {
    dot: 'bg-violet-400',
    label: 'text-violet-300',
    badge: 'bg-violet-900/50 text-violet-400 border-violet-800',
    ring: 'ring-violet-500/60',
    glow: 'bg-violet-950/40',
    addBtn: 'text-violet-800 hover:text-violet-400 border-violet-900 hover:border-violet-700',
    columnBg: 'bg-violet-950/10',
  },
  S1: {
    dot: 'bg-emerald-400',
    label: 'text-emerald-300',
    badge: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    ring: 'ring-emerald-500/60',
    glow: 'bg-emerald-950/40',
    addBtn: 'text-emerald-800 hover:text-emerald-400 border-emerald-900 hover:border-emerald-700',
    columnBg: 'bg-emerald-950/10',
  },
};

export default function Column({ stage, opps, onAdd, onUpdate, onDelete, isDraggingId }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const theme = STAGE_THEME[stage.id];

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${theme.dot}`} />
        <span className={`text-xs font-semibold tracking-wide uppercase ${theme.label}`}>
          {stage.label}
        </span>
        <span
          className={`ml-auto text-xs px-1.5 py-0.5 rounded-full border font-mono font-medium ${theme.badge}`}
        >
          {opps.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 border border-gray-800/60 transition-all duration-150 ${theme.columnBg} ${
          isOver ? `ring-2 ${theme.ring} ${theme.glow}` : ''
        }`}
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
            <div className="flex items-center justify-center py-8 text-xs text-gray-700">
              Drop cards here
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={onAdd}
          className={`mt-3 w-full py-2 text-xs border border-dashed rounded-lg transition-all ${theme.addBtn}`}
        >
          + Add Opportunity
        </button>
      </div>
    </div>
  );
}
