import { useDraggable } from '@dnd-kit/core';
import { useState, useRef, useEffect, useCallback } from 'react';

const LANGUAGES = [
  'Java', 'JavaScript', 'Angular', 'React', 'TypeScript', 'Node.js', 'Scala',
  'Python', 'C#', '.NET', 'Go', 'C++ (GCC)', 'C (GCC)',
];

const SOURCES = ['Outbound', 'LinkedIn', 'Referral', 'Inbound', 'Cold Call', 'Event', 'Partner', 'Email Campaign'];

const AES = ['Daniel', 'Bruce', 'Jake', 'Arik', 'JVL'];

// Left accent colour per stage
const STAGE_HEX = {
  'Meeting Not Accepted': '#e2445c',
  'S0':                   '#fdab3d',
  'S0 Occurred':          '#a25ddc',
  'S1':                   '#00c875',
};

// Light pastel language badges
const LANG_BADGE = {
  Java:         'bg-orange-50 text-orange-700 border-orange-200',
  JavaScript:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Angular:      'bg-red-50    text-red-700    border-red-200',
  React:        'bg-cyan-50   text-cyan-700   border-cyan-200',
  TypeScript:   'bg-blue-50   text-blue-700   border-blue-200',
  'Node.js':    'bg-green-50  text-green-700  border-green-200',
  Scala:        'bg-red-700 bg-opacity-10 text-red-700 border-red-200',
  Python:       'bg-sky-50    text-sky-700    border-sky-200',
  'C#':         'bg-purple-50 text-purple-700 border-purple-200',
  '.NET':       'bg-indigo-50 text-indigo-700 border-indigo-200',
  Go:           'bg-cyan-50   text-cyan-700   border-cyan-200',
  'C++ (GCC)':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'C (GCC)':    'bg-slate-50  text-slate-700  border-slate-200',
};

// Light pastel source badges
const SOURCE_BADGE = {
  Outbound:    'bg-[#e8f5fd] text-[#0073ea] border-[#c0dff9]',
  LinkedIn:    'bg-[#e8f0fe] text-[#1a56db] border-[#bfd0fb]',
  Referral:    'bg-[#edf9f0] text-[#038048] border-[#b6e9ca]',
  Inbound:     'bg-[#fff3e0] text-[#b36200] border-[#ffd8a3]',
  'Cold Call': 'bg-[#fce8ff] text-[#8b00c9] border-[#e5b5fa]',
  Event:          'bg-[#e8fdf8] text-[#007c70] border-[#a8eed8]',
  Partner:        'bg-[#fef0e0] text-[#965200] border-[#f5cfa0]',
  'Email Campaign': 'bg-[#f0e8fd] text-[#6b21a8] border-[#e9d5ff]',
};

export default function OpportunityCard({ opp, onUpdate, onDelete, isOverlay, isGhost }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opp.Id,
    disabled: isOverlay,
  });

  const [editingName, setEditingName] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [localName, setLocalName]     = useState(opp.Opp_Name);
  const [localLink, setLocalLink]     = useState(opp.Link);
  const [localNotes, setLocalNotes]   = useState(opp.Notes || '');
  const [showLangs, setShowLangs]     = useState(false);
  const langRef = useRef(null);

  const currentLangs  = opp.Languages ? opp.Languages.split(',').filter(Boolean) : [];
  const painValidated = opp.Pain_Validated === 'true';
  const accentHex     = STAGE_HEX[opp.Stage] || '#0073ea';

  useEffect(() => { setLocalName(opp.Opp_Name); }, [opp.Opp_Name]);
  useEffect(() => { setLocalLink(opp.Link); },     [opp.Link]);
  useEffect(() => { setLocalNotes(opp.Notes || ''); }, [opp.Notes]);

  useEffect(() => {
    if (!showLangs) return;
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setShowLangs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangs]);

  const toggleLang = useCallback((lang) => {
    const next = currentLangs.includes(lang)
      ? currentLangs.filter((l) => l !== lang)
      : [...currentLangs, lang];
    onUpdate(opp.Id, { Languages: next.join(',') });
  }, [currentLangs, opp.Id, onUpdate]);

  const saveName = () => {
    setEditingName(false);
    if (localName.trim() && localName !== opp.Opp_Name) onUpdate(opp.Id, { Opp_Name: localName.trim() });
    else setLocalName(opp.Opp_Name);
  };

  const saveLink = () => {
    setEditingLink(false);
    if (localLink !== opp.Link) onUpdate(opp.Id, { Link: localLink.trim() });
  };

  const saveNotes = () => {
    setEditingNotes(false);
    if (localNotes !== (opp.Notes || '')) onUpdate(opp.Id, { Notes: localNotes.trim() });
  };

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  // Ghost slot while dragging
  if (isGhost || (isDragging && !isOverlay)) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 h-36 opacity-60"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl border border-gray-200 overflow-hidden group transition-all duration-150 ${
        isOverlay ? 'shadow-2xl rotate-1 scale-[1.03]' : 'shadow-sm hover:shadow-md hover:border-gray-300'
      }`}
    >
      {/* Coloured left accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accentHex }} />

      <div className="pl-4 pr-3 pt-3 pb-3">

        {/* ── Drag handle ────────────────────────────────────────── */}
        {!isOverlay && (
          <div
            {...listeners}
            {...attributes}
            className="drag-handle absolute top-2.5 right-2.5 p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-opacity rounded"
            title="Drag to move"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="7"  cy="5"  r="1.2" /><circle cx="13" cy="5"  r="1.2" />
              <circle cx="7"  cy="10" r="1.2" /><circle cx="13" cy="10" r="1.2" />
              <circle cx="7"  cy="15" r="1.2" /><circle cx="13" cy="15" r="1.2" />
            </svg>
          </div>
        )}

        {/* ── BDR Name + AE (top row) ────────────────────────────── */}
        <div className="flex gap-1.5 mb-1.5 text-xs">
          {opp.BDR_Name && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              {opp.BDR_Name}
            </span>
          )}
          {opp.AE_Name && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              AE: {opp.AE_Name}
            </span>
          )}
        </div>

        {/* ── Opp Name ───────────────────────────────────────────── */}
        {editingName ? (
          <input
            autoFocus
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="w-full text-sm font-semibold text-gray-800 border border-gray-300 rounded-lg px-2 py-1 mb-2 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 pr-7"
          />
        ) : (
          <h3
            className="font-semibold text-sm text-gray-800 mb-2 pr-6 leading-snug cursor-text hover:text-[#0073ea] truncate transition-colors"
            title={opp.Opp_Name}
            onClick={() => setEditingName(true)}
          >
            {opp.Opp_Name || <span className="text-gray-400 italic font-normal">Untitled</span>}
          </h3>
        )}

        {/* ── Opp Link ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-2.5 min-h-[1.1rem]">
          {editingLink ? (
            <input
              autoFocus
              placeholder="https://…"
              value={localLink}
              onChange={(e) => setLocalLink(e.target.value)}
              onBlur={saveLink}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
              className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-0.5 text-[#0073ea] focus:outline-none focus:border-[#0073ea]"
            />
          ) : opp.Link ? (
            <>
              <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m6.1-6.1a4 4 0 00-5.656 0l-1.1 1.1" />
              </svg>
              <a
                href={opp.Link} target="_blank" rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-[#0073ea] hover:text-[#0060c0] hover:underline truncate flex-1"
              >
                {opp.Link.replace(/^https?:\/\//, '')}
              </a>
              <button
                onClick={() => setEditingLink(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity flex-shrink-0"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingLink(true)}
              className="text-xs text-gray-300 hover:text-[#0073ea] transition-colors"
            >
              + Add link
            </button>
          )}
        </div>

        {/* ── Meeting Date ───────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={opp.Meeting_Date || ''}
            onChange={(e) => onUpdate(opp.Id, { Meeting_Date: e.target.value })}
            className="text-xs text-gray-500 bg-transparent border-0 p-0 focus:outline-none cursor-pointer hover:text-gray-700"
          />
        </div>

        {/* ── Languages ──────────────────────────────────────────── */}
        <div className="mb-2.5 relative" ref={langRef}>
          <div className="flex flex-wrap gap-1 items-center">
            {currentLangs.map((lang) => (
              <span
                key={lang}
                className={`text-xs px-1.5 py-0.5 rounded border font-medium ${LANG_BADGE[lang] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
              >
                {lang}
              </span>
            ))}
            <button
              onClick={() => setShowLangs((s) => !s)}
              className="text-xs text-gray-300 hover:text-[#0073ea] transition-colors px-0.5"
            >
              {currentLangs.length === 0 ? '+ Languages' : '+'}
            </button>
          </div>

          {showLangs && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-52">
              <div className="grid grid-cols-2 gap-0.5">
                {LANGUAGES.map((lang) => (
                  <label
                    key={lang}
                    className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[#f0f7ff] text-xs text-gray-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={currentLangs.includes(lang)}
                      onChange={() => toggleLang(lang)}
                      className="accent-[#0073ea] w-3 h-3 flex-shrink-0"
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Notes ──────────────────────────────────────────────── */}
        {editingNotes ? (
          <textarea
            autoFocus
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={saveNotes}
            className="w-full text-xs text-gray-700 border border-gray-300 rounded-lg px-2 py-1 mb-2.5 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 resize-none h-16"
            placeholder="Add notes…"
          />
        ) : opp.Notes ? (
          <div
            onClick={() => setEditingNotes(true)}
            className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 mb-2.5 border border-gray-100 cursor-text hover:border-gray-200 transition-colors whitespace-pre-wrap"
          >
            {opp.Notes}
          </div>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            className="w-full text-xs text-gray-300 hover:text-[#0073ea] text-left px-2 py-1.5 mb-2.5 transition-colors"
          >
            + Add notes
          </button>
        )}

        {/* ── Pain + Source + AE ─────────────────────────────────── */}
        <div className="pt-2.5 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            {/* Pain toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdate(opp.Id, { Pain_Validated: String(!painValidated) })}
                className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${painValidated ? 'bg-[#00c875]' : 'bg-gray-200'}`}
                title={painValidated ? 'Pain validated' : 'Mark pain validated'}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${painValidated ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-xs font-medium transition-colors ${painValidated ? 'text-[#007038]' : 'text-gray-400'}`}>
                Pain
              </span>
            </div>

            {/* Source badge / dropdown */}
            {opp.Source ? (
              <select
                value={opp.Source}
                onChange={(e) => onUpdate(opp.Id, { Source: e.target.value })}
                className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none ${SOURCE_BADGE[opp.Source] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                style={{ appearance: 'none' }}
              >
                <option value="">Source…</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <select
                value=""
                onChange={(e) => onUpdate(opp.Id, { Source: e.target.value })}
                className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 cursor-pointer focus:outline-none hover:border-gray-300"
              >
                <option value="">Source…</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* AE dropdown */}
          <select
            value={opp.AE_Name || ''}
            onChange={(e) => onUpdate(opp.Id, { AE_Name: e.target.value })}
            className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none hover:border-gray-300 focus:border-[#0073ea]"
          >
            <option value="">Assign AE…</option>
            {AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}
          </select>
        </div>

        {/* ── Footer: date + delete ──────────────────────────────── */}
        {!isOverlay && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-300">
              {opp.Last_Updated
                ? new Date(opp.Last_Updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''}
            </span>
            <button
              onClick={() => onDelete(opp.Id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
