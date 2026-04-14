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
];

export default function KanbanBoard({ opps, onAdd, onUpdate, onDelete }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-6" style={{ minHeight: 'calc(100vh - 9rem)' }}>
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            opps={opps.filter((o) => o.Stage === stage.id)}
            onAdd={() => onAdd(stage.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isDraggingId={activeId}
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
    </DndContext>
  );
}
