import { useDraggable } from '@dnd-kit/core';
import { useState, useRef, useEffect, useCallback } from 'react';

const LANGUAGES = [
  'Java', 'Python', 'Go', 'JavaScript', 'TypeScript',
  'C#', 'C++', 'Ruby', 'Rust', 'PHP', 'Swift', 'Kotlin', 'Scala',
];

const SOURCES = ['Outbound', 'LinkedIn', 'Referral', 'Inbound', 'Cold Call', 'Event', 'Partner'];

const STAGE_CARD = {
  'Meeting Not Accepted': 'border-slate-700/80 bg-gray-900 hover:border-slate-600',
  S0: 'border-blue-700/40 bg-blue-950/20 hover:border-blue-600/60',
  'S0 Occurred': 'border-violet-700/40 bg-violet-950/20 hover:border-violet-600/60',
  S1: 'border-emerald-700/40 bg-emerald-950/20 hover:border-emerald-600/60',
};

const LANG_BADGE = {
  Java: 'bg-orange-950/60 text-orange-300 border-orange-800/50',
  Python: 'bg-sky-950/60 text-sky-300 border-sky-800/50',
  Go: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
  JavaScript: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50',
  TypeScript: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
  'C#': 'bg-purple-950/60 text-purple-300 border-purple-800/50',
  'C++': 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50',
  Ruby: 'bg-red-950/60 text-red-300 border-red-800/50',
  Rust: 'bg-orange-950/60 text-orange-300 border-orange-800/50',
  PHP: 'bg-violet-950/60 text-violet-300 border-violet-800/50',
  Swift: 'bg-red-950/60 text-red-300 border-red-800/50',
  Kotlin: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/50',
  Scala: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
};

export default function OpportunityCard({ opp, onUpdate, onDelete, isOverlay, isGhost }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opp.Id,
    disabled: isOverlay,
  });

  const [editingName, setEditingName] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [localName, setLocalName] = useState(opp.Opp_Name);
  const [localLink, setLocalLink] = useState(opp.Link);
  const [showLangs, setShowLangs] = useState(false);
  const langRef = useRef(null);
  const nameInputRef = useRef(null);
  const linkInputRef = useRef(null);

  const currentLangs = opp.Languages ? opp.Languages.split(',').filter(Boolean) : [];
  const painValidated = opp.Pain_Validated === 'true';

  // Keep local state in sync if opp is updated externally
  useEffect(() => { setLocalName(opp.Opp_Name); }, [opp.Opp_Name]);
  useEffect(() => { setLocalLink(opp.Link); }, [opp.Link]);

  // Close lang menu on outside click
  useEffect(() => {
    if (!showLangs) return;
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangs]);

  const toggleLang = useCallback(
    (lang) => {
      const next = currentLangs.includes(lang)
        ? currentLangs.filter((l) => l !== lang)
        : [...currentLangs, lang];
      onUpdate(opp.Id, { Languages: next.join(',') });
    },
    [currentLangs, opp.Id, onUpdate]
  );

  const saveName = () => {
    setEditingName(false);
    if (localName.trim() && localName !== opp.Opp_Name) {
      onUpdate(opp.Id, { Opp_Name: localName.trim() });
    } else {
      setLocalName(opp.Opp_Name);
    }
  };

  const saveLink = () => {
    setEditingLink(false);
    if (localLink !== opp.Link) {
      onUpdate(opp.Id, { Link: localLink.trim() });
    }
  };

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  // Ghost placeholder when this card is being dragged
  if (isGhost || (isDragging && !isOverlay)) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border border-dashed border-gray-700/60 bg-gray-800/10 h-36 opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl border p-3 group transition-all duration-150 ${
        STAGE_CARD[opp.Stage] || 'border-gray-700 bg-gray-900'
      } ${isOverlay ? 'shadow-2xl shadow-black/70 rotate-1 scale-[1.03] ring-1 ring-white/10' : ''}`}
    >
      {/* ── Drag handle (top-right, visible on hover) ─────────────── */}
      {!isOverlay && (
        <div
          {...listeners}
          {...attributes}
          className="drag-handle absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-opacity rounded"
          title="Drag to move"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="7" cy="6" r="1.2" />
            <circle cx="13" cy="6" r="1.2" />
            <circle cx="7" cy="10" r="1.2" />
            <circle cx="13" cy="10" r="1.2" />
            <circle cx="7" cy="14" r="1.2" />
            <circle cx="13" cy="14" r="1.2" />
          </svg>
        </div>
      )}

      {/* ── Opp Name ──────────────────────────────────────────────── */}
      {editingName ? (
        <input
          ref={nameInputRef}
          autoFocus
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
          className="w-full bg-gray-800 text-gray-100 font-semibold text-sm rounded-lg px-2 py-1 mb-2 border border-gray-600 focus:outline-none focus:border-blue-500 pr-6"
        />
      ) : (
        <h3
          className="font-semibold text-sm text-gray-100 mb-2 pr-6 leading-snug cursor-text hover:text-white truncate"
          title={opp.Opp_Name}
          onClick={() => setEditingName(true)}
        >
          {opp.Opp_Name || <span className="text-gray-600 italic">Untitled</span>}
        </h3>
      )}

      {/* ── Opp Link ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-2 min-h-[1.25rem]">
        {editingLink ? (
          <input
            ref={linkInputRef}
            autoFocus
            placeholder="https://..."
            value={localLink}
            onChange={(e) => setLocalLink(e.target.value)}
            onBlur={saveLink}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="flex-1 bg-gray-800 text-blue-400 text-xs rounded px-2 py-0.5 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        ) : opp.Link ? (
          <>
            <a
              href={opp.Link}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline truncate flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              {opp.Link.replace(/^https?:\/\//, '')}
            </a>
            <button
              onClick={() => setEditingLink(true)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 transition-opacity flex-shrink-0"
              title="Edit link"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditingLink(true)}
            className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
          >
            + Add link
          </button>
        )}
      </div>

      {/* ── Meeting Date ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          value={opp.Meeting_Date || ''}
          onChange={(e) => onUpdate(opp.Id, { Meeting_Date: e.target.value })}
          className="text-xs text-gray-400 bg-transparent border-0 p-0 focus:outline-none focus:text-gray-200 cursor-pointer"
        />
      </div>

      {/* ── Languages (multi-select tags) ─────────────────────────── */}
      <div className="mb-2 relative" ref={langRef}>
        <div className="flex flex-wrap gap-1 items-center">
          {currentLangs.map((lang) => (
            <span
              key={lang}
              className={`text-xs px-1.5 py-0.5 rounded border font-mono ${
                LANG_BADGE[lang] || 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {lang}
            </span>
          ))}
          <button
            onClick={() => setShowLangs((s) => !s)}
            className="text-xs text-gray-700 hover:text-gray-400 transition-colors px-1"
          >
            {currentLangs.length === 0 ? '+ Languages' : '+'}
          </button>
        </div>

        {showLangs && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2 w-52">
            <div className="grid grid-cols-2 gap-0.5">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-700/60 text-xs text-gray-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={currentLangs.includes(lang)}
                    onChange={() => toggleLang(lang)}
                    className="accent-blue-500 w-3 h-3 flex-shrink-0"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom row: Pain + Source ──────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-800/60">
        {/* Pain Validated Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdate(opp.Id, { Pain_Validated: String(!painValidated) })}
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
              painValidated ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
            title={painValidated ? 'Pain validated' : 'Pain not validated'}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                painValidated ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-xs transition-colors ${painValidated ? 'text-emerald-400' : 'text-gray-600'}`}>
            Pain
          </span>
        </div>

        {/* Source dropdown */}
        <select
          value={opp.Source || ''}
          onChange={(e) => onUpdate(opp.Id, { Source: e.target.value })}
          className="ml-auto text-xs bg-gray-800/80 border border-gray-700 text-gray-400 rounded-lg px-2 py-0.5 focus:outline-none focus:border-gray-500 cursor-pointer"
        >
          <option value="">Source…</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* ── Footer: Last updated + Delete ─────────────────────────── */}
      {!isOverlay && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-700 font-mono">
            {opp.Last_Updated
              ? new Date(opp.Last_Updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ''}
          </span>
          <button
            onClick={() => onDelete(opp.Id)}
            className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all"
            title="Delete opportunity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
