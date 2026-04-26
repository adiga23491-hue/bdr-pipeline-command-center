import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import { useState } from 'react';
import Column from './Column.jsx';
import OpportunityCard from './OpportunityCard.jsx';

export const STAGES = [
  { id: 'Meeting Not Accepted', label: 'Meeting Not Accepted', short: 'Not Accepted', color: 'slate' },
  { id: 'S0', label: 'S0 — Scheduled', short: 'S0', color: 'blue' },
  { id: 'S0 Occurred', label: 'S0 Occurred', short: 'S0 Occurred', color: 'violet' },
  { id: 'S1', label: 'S1 — Accepted', short: 'S1', color: 'emerald' },
  { id: 'S2', label: 'S2 — Advanced', short: 'S2', color: 'cyan' },
  { id: 'Rejected', label: 'Rejected', short: 'Rejected', color: 'rose' },
];

export default function KanbanBoard({ opps, onAdd, onUpdate, onDelete, currentBDR, bdrNames, onEdit, onMoveStage, stagesOverride }) {
  const [activeId, setActiveId] = useState(null);
  const [showBDRModal, setShowBDRModal] = useState(false);
  const [pendingStage, setPendingStage] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeStages = stagesOverride || STAGES;
  const activeOpp = opps.find((o) => o.Id === activeId);

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    // over.id is always a stage ID (column droppables)
    const targetStage = over.id;
    const opp = opps.find((o) => o.Id === active.id);
    if (opp && opp.Stage !== targetStage) {
      onUpdate(active.id, { Stage: targetStage });
    }
  };

  const handleDragCancel = () => setActiveId(null);

  const handleAddClick = (stageId) => {
    if (!currentBDR && bdrNames && bdrNames.length > 0) {
      setPendingStage(stageId);
      setShowBDRModal(true);
    } else {
      onAdd(stageId, currentBDR);
    }
  };

  const handleBDRSelect = (bdrName) => {
    if (pendingStage) {
      onAdd(pendingStage, bdrName);
    }
    setShowBDRModal(false);
    setPendingStage(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-6" style={{ minHeight: 'calc(100vh - 9rem)' }}>
        {activeStages.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            opps={opps.filter((o) => o.Stage === stage.id)}
            onAdd={() => handleAddClick(stage.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isDraggingId={activeId}
            bdrNames={bdrNames}
            onEdit={onEdit}
            onMoveStage={onMoveStage}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeOpp ? (
          <OpportunityCard
            opp={activeOpp}
            onUpdate={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>

      {/* ── BDR Selector Modal ─────────────────────────────────── */}
      {showBDRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select a BDR</h2>
            <p className="text-sm text-gray-600 mb-4">Choose which BDR this opportunity belongs to:</p>
            <div className="space-y-2">
              {bdrNames && bdrNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handleBDRSelect(name)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-[#0073ea] hover:text-white rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <img
                    src={`/bdr-images/${name.toLowerCase()}.jpg`}
                    alt={name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-300"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowBDRModal(false);
                setPendingStage(null);
              }}
              className="w-full mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </DndContext>
  );
}
