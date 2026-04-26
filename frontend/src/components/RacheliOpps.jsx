import { useState, useMemo } from 'react';
import KanbanBoard from './KanbanBoard.jsx';
import ListView from './ListView.jsx';

export default function RacheliOpps({ opps, onUpdate, onDelete, onOpenEdit, onOpenAdd, onMoveStage, bdrNames }) {
  const [viewMode, setViewMode] = useState('kanban');
  const [stageFilter, setStageFilter] = useState('both');

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
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-none">Racheli's Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">{opps.length} opportunities</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* + Add Opportunity */}
        <button
          onClick={onOpenAdd}
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

      {/* Content */}
      {viewMode === 'list' ? (
        <ListView
          opps={filteredOpps}
          onEdit={onOpenEdit}
          onUpdate={onUpdate}
        />
      ) : (
        <KanbanBoard
          opps={filteredOpps}
          onAdd={(stage) => onOpenAdd(stage)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          currentBDR="Rachel"
          bdrNames={bdrNames}
          onEdit={onOpenEdit}
          onMoveStage={onMoveStage}
        />
      )}
    </div>
  );
}
