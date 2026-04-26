import { useDraggable } from '@dnd-kit/core';
import { useState, useRef, useEffect, useCallback } from 'react';

const LANGUAGES = [
  'Java', 'JavaScript', 'Angular', 'React', 'TypeScript', 'Node.js', 'Kotlin',
  'Python', 'C#', '.NET', 'Go', 'C++ (GCC)', 'C (GCC)',
];

const SOURCES = ['Outbound', 'LinkedIn', 'Referral', 'Inbound', 'Cold Call', 'Event', 'Partner', 'Email Campaign'];
const AES = ['Daniel', 'Bruce', 'Jake', 'Arik', 'JVL'];

const STAGE_HEX = {
  'Meeting Not Accepted': '#e2445c',
  'S0':                   '#fdab3d',
  'S0 Occurred':          '#a25ddc',
  'S1':                   '#00c875',
  'S2':                   '#06b6d4',
  'Rejected':             '#dc2626',
};

const LANG_BADGE = {
  Java:         'bg-orange-50 text-orange-700 border-orange-200',
  JavaScript:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Angular:      'bg-red-50    text-red-700    border-red-200',
  React:        'bg-cyan-50   text-cyan-700   border-cyan-200',
  TypeScript:   'bg-blue-50   text-blue-700   border-blue-200',
  'Node.js':    'bg-green-50  text-green-700  border-green-200',
  Kotlin:       'bg-violet-50  text-violet-700  border-violet-200',
  Python:       'bg-sky-50    text-sky-700    border-sky-200',
  'C#':         'bg-purple-50 text-purple-700 border-purple-200',
  '.NET':       'bg-indigo-50 text-indigo-700 border-indigo-200',
  Go:           'bg-cyan-50   text-cyan-700   border-cyan-200',
  'C++ (GCC)':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'C (GCC)':    'bg-slate-50  text-slate-700  border-slate-200',
};

const SOURCE_BADGE = {
  Outbound:         'bg-[#e8f5fd] text-[#0073ea] border-[#c0dff9]',
  LinkedIn:         'bg-[#e8f0fe] text-[#1a56db] border-[#bfd0fb]',
  Referral:         'bg-[#edf9f0] text-[#038048] border-[#b6e9ca]',
  Inbound:          'bg-[#fff3e0] text-[#b36200] border-[#ffd8a3]',
  'Cold Call':      'bg-[#fce8ff] text-[#8b00c9] border-[#e5b5fa]',
  Event:            'bg-[#e8fdf8] text-[#007c70] border-[#a8eed8]',
  Partner:          'bg-[#fef0e0] text-[#965200] border-[#f5cfa0]',
  'Email Campaign': 'bg-[#f0e8fd] text-[#6b21a8] border-[#e9d5ff]',
};

function getMeetingStatus(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0)  return { label: 'Overdue', style: 'bg-red-50 text-red-600 border-red-200' };
  if (diff === 0) return { label: 'Today!',  style: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (diff === 1) return { label: 'Tomorrow', style: 'bg-amber-50 text-amber-600 border-amber-200' };
  if (diff <= 3)  return { label: `In ${diff}d`, style: 'bg-amber-50 text-amber-500 border-amber-100' };
  return null;
}

export default function OpportunityCard({ opp, onUpdate, onDelete, isOverlay, isGhost, bdrNames = [], onEdit, onMoveStage }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opp.Id,
    disabled: isOverlay,
  });

  const [editingName, setEditingName]   = useState(false);
  const [editingLink, setEditingLink]   = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingNextStep, setEditingNextStep] = useState(false);
  const [editingRejection, setEditingRejection] = useState(false);
  const [expanded, setExpanded]         = useState(false);
  const [showLangs, setShowLangs]       = useState(false);

  const [localName,      setLocalName]      = useState(opp.Opp_Name);
  const [localLink,      setLocalLink]      = useState(opp.Link);
  const [localNotes,     setLocalNotes]     = useState(opp.Notes || '');
  const [localEmail,     setLocalEmail]     = useState(opp.Email || '');
  const [localNextStep,  setLocalNextStep]  = useState(opp.Next_Step || '');
  const [localRejection, setLocalRejection] = useState(opp.Rejection_Reason || '');
  const langRef = useRef(null);

  const currentLangs  = opp.Languages ? opp.Languages.split(',').filter(Boolean) : [];
  const painValidated = opp.Pain_Validated === 'true';
  const accentHex     = STAGE_HEX[opp.Stage] || '#0073ea';
  const meetingStatus = getMeetingStatus(opp.Meeting_Date);

  useEffect(() => { setLocalName(opp.Opp_Name); },         [opp.Opp_Name]);
  useEffect(() => { setLocalLink(opp.Link); },              [opp.Link]);
  useEffect(() => { setLocalNotes(opp.Notes || ''); },      [opp.Notes]);
  useEffect(() => { setLocalEmail(opp.Email || ''); },      [opp.Email]);
  useEffect(() => { setLocalNextStep(opp.Next_Step || ''); }, [opp.Next_Step]);
  useEffect(() => { setLocalRejection(opp.Rejection_Reason || ''); }, [opp.Rejection_Reason]);

  useEffect(() => {
    if (!showLangs) return;
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangs]);

  const toggleLang = useCallback((lang) => {
    const next = currentLangs.includes(lang)
      ? currentLangs.filter((l) => l !== lang)
      : [...currentLangs, lang];
    onUpdate(opp.Id, { Languages: next.join(',') });
  }, [currentLangs, opp.Id, onUpdate]);

  const saveName      = () => { setEditingName(false);      if (localName.trim() && localName !== opp.Opp_Name) onUpdate(opp.Id, { Opp_Name: localName.trim() }); else setLocalName(opp.Opp_Name); };
  const saveLink      = () => { setEditingLink(false);      if (localLink !== opp.Link) onUpdate(opp.Id, { Link: localLink.trim() }); };
  const saveNotes     = () => { setEditingNotes(false);     if (localNotes !== (opp.Notes || '')) onUpdate(opp.Id, { Notes: localNotes.trim() }); };
  const saveEmail     = () => { setEditingEmail(false);     if (localEmail !== (opp.Email || '')) onUpdate(opp.Id, { Email: localEmail.trim() }); };
  const saveNextStep  = () => { setEditingNextStep(false);  if (localNextStep !== (opp.Next_Step || '')) onUpdate(opp.Id, { Next_Step: localNextStep.trim() }); };
  const saveRejection = () => {
    setEditingRejection(false);
    if (localRejection !== (opp.Rejection_Reason || '')) onUpdate(opp.Id, { Meeting_Rejected: 'true', Rejection_Reason: localRejection.trim() });
  };

  const toggleRejection = () => {
    if (opp.Meeting_Rejected === 'true') {
      onUpdate(opp.Id, { Meeting_Rejected: 'false', Rejection_Reason: '' });
      setLocalRejection('');
    } else {
      setEditingRejection(true);
    }
  };

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  if (isGhost || (isDragging && !isOverlay)) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 h-28 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl border overflow-hidden group transition-all duration-150 ${
        isOverlay
          ? 'shadow-2xl rotate-1 scale-[1.03] border-gray-200'
          : 'shadow-sm hover:shadow-md border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Left accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accentHex }} />

      <div className="pl-4 pr-3 pt-3 pb-2.5">

        {/* Drag handle */}
        {!isOverlay && (
          <div
            {...listeners}
            {...attributes}
            className="drag-handle absolute top-2.5 right-7 p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-opacity rounded"
            title="Drag to move"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="7" cy="5" r="1.2" /><circle cx="13" cy="5" r="1.2" />
              <circle cx="7" cy="10" r="1.2" /><circle cx="13" cy="10" r="1.2" />
              <circle cx="7" cy="15" r="1.2" /><circle cx="13" cy="15" r="1.2" />
            </svg>
          </div>
        )}

        {/* Edit (pencil) icon — visible on hover */}
        {!isOverlay && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(opp); }}
            className="absolute top-2.5 right-2 p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#0073ea] transition-opacity rounded"
            title="Edit opportunity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {/* ── TOP ROW: BDR + AE badges ─────────────────────────── */}
        {(opp.BDR_Name || opp.AE_Name) && (
          <div className="flex gap-1.5 mb-2 text-xs">
            {opp.BDR_Name && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                <img
                  src={`/bdr-images/${opp.BDR_Name.toLowerCase()}.jpg`}
                  alt={opp.BDR_Name}
                  className="w-4 h-4 rounded-full object-cover border border-blue-200"
                  onError={(e) => e.target.style.display = 'none'}
                />
                {opp.BDR_Name}
              </div>
            )}
            {opp.AE_Name && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                AE: {opp.AE_Name}
              </span>
            )}
            {opp.Source && (
              <span className={`ml-auto px-1.5 py-0.5 rounded-full text-xs font-semibold border ${SOURCE_BADGE[opp.Source] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {opp.Source}
              </span>
            )}
          </div>
        )}

        {/* ── Opp Name ─────────────────────────────────────────── */}
        {editingName ? (
          <input
            autoFocus
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="w-full text-sm font-semibold text-gray-800 border border-gray-300 rounded-lg px-2 py-1 mb-2 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10"
          />
        ) : (
          <h3
            className="font-semibold text-sm text-gray-800 mb-1.5 pr-4 leading-snug cursor-text hover:text-[#0073ea] truncate transition-colors"
            title={opp.Opp_Name}
            onClick={() => setEditingName(true)}
          >
            {opp.Opp_Name || <span className="text-gray-400 italic font-normal">Untitled</span>}
          </h3>
        )}

        {/* ── Meeting date + status badge ──────────────────────── */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
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
          {meetingStatus && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${meetingStatus.style}`}>
              {meetingStatus.label}
            </span>
          )}
        </div>

        {/* ── Languages ────────────────────────────────────────── */}
        <div className="mb-2 relative" ref={langRef}>
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
                  <label key={lang} className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[#f0f7ff] text-xs text-gray-600 transition-colors">
                    <input type="checkbox" checked={currentLangs.includes(lang)} onChange={() => toggleLang(lang)} className="accent-[#0073ea] w-3 h-3 flex-shrink-0" />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Pain + Source row ────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-2">
          {/* Pain toggle */}
          <button
            onClick={() => onUpdate(opp.Id, { Pain_Validated: String(!painValidated) })}
            title={painValidated ? 'Pain validated — click to unmark' : 'Mark pain validated'}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
              painValidated
                ? 'bg-[#e6f9f1] text-[#007038] border-[#b0e8cf]'
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-[#b0e8cf] hover:text-[#007038]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${painValidated ? 'bg-[#00c875]' : 'bg-gray-300'}`} />
            Pain {painValidated ? '✓' : '?'}
          </button>

          {!opp.Source && (
            <select
              value=""
              onChange={(e) => onUpdate(opp.Id, { Source: e.target.value })}
              className="ml-auto text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-2 py-0.5 cursor-pointer focus:outline-none hover:border-gray-300"
            >
              <option value="">+ Source</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {opp.Source && !opp.BDR_Name && (
            <select
              value={opp.Source}
              onChange={(e) => onUpdate(opp.Id, { Source: e.target.value })}
              className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none ${SOURCE_BADGE[opp.Source] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
              style={{ appearance: 'none' }}
            >
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {/* ── Notes (collapsed by default) ─────────────────────── */}
        {opp.Notes && !expanded && (
          <div
            onClick={() => setExpanded(true)}
            className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 mb-2 border border-gray-100 cursor-pointer hover:border-gray-200 transition-colors truncate"
            title={opp.Notes}
          >
            📝 {opp.Notes}
          </div>
        )}

        {/* ── Expand / collapse secondary fields ───────────────── */}
        {!isOverlay && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {expanded ? 'Show less' : 'More details'}
          </button>
        )}

        {/* ── Expanded section ─────────────────────────────────── */}
        {(expanded || isOverlay) && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">

            {/* Link */}
            <div className="flex items-center gap-1 min-h-[1.1rem]">
              {editingLink ? (
                <input autoFocus placeholder="https://…" value={localLink} onChange={(e) => setLocalLink(e.target.value)}
                  onBlur={saveLink} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-0.5 text-[#0073ea] focus:outline-none focus:border-[#0073ea]"
                />
              ) : opp.Link ? (
                <div className="flex items-center gap-1 w-full">
                  <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m6.1-6.1a4 4 0 00-5.656 0l-1.1 1.1" />
                  </svg>
                  <a href={opp.Link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                    className="text-xs text-[#0073ea] hover:text-[#0060c0] hover:underline truncate flex-1">
                    {opp.Link.replace(/^https?:\/\//, '')}
                  </a>
                  <button onClick={() => setEditingLink(true)} className="text-gray-300 hover:text-gray-500 transition-opacity flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingLink(true)} className="text-xs text-gray-300 hover:text-[#0073ea] transition-colors">
                  + Add link
                </button>
              )}
            </div>

            {/* Email */}
            {editingEmail ? (
              <input autoFocus type="email" placeholder="email@example.com" value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)} onBlur={saveEmail}
                onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#0073ea]"
              />
            ) : opp.Email ? (
              <div className="flex items-center gap-1.5">
                <div onClick={() => setEditingEmail(true)}
                  className="flex-1 text-xs text-[#0073ea] bg-blue-50 rounded-lg px-2 py-1 border border-blue-100 cursor-text hover:border-blue-200 transition-colors truncate">
                  {opp.Email}
                </div>
                <a href={`mailto:${opp.Email}`} onClick={(e) => e.stopPropagation()} title="Send email"
                  className="text-gray-300 hover:text-[#0073ea] transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            ) : (
              <button onClick={() => setEditingEmail(true)} className="text-xs text-gray-300 hover:text-[#0073ea] transition-colors">
                + Add email
              </button>
            )}

            {/* Notes */}
            {editingNotes ? (
              <textarea autoFocus value={localNotes} onChange={(e) => setLocalNotes(e.target.value)} onBlur={saveNotes}
                className="w-full text-xs text-gray-700 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 resize-none h-16"
                placeholder="Add notes…"
              />
            ) : opp.Notes ? (
              <div onClick={() => setEditingNotes(true)}
                className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100 cursor-text hover:border-gray-200 transition-colors whitespace-pre-wrap">
                {opp.Notes}
              </div>
            ) : (
              <button onClick={() => setEditingNotes(true)} className="text-xs text-gray-300 hover:text-[#0073ea] text-left transition-colors">
                + Add notes
              </button>
            )}

            {/* Next Step */}
            {editingNextStep ? (
              <textarea autoFocus value={localNextStep} onChange={(e) => setLocalNextStep(e.target.value)} onBlur={saveNextStep}
                className="w-full text-xs text-gray-700 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 resize-none h-16"
                placeholder="Next steps…"
              />
            ) : opp.Next_Step ? (
              <div onClick={() => setEditingNextStep(true)}
                className="text-xs text-gray-600 bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-100 cursor-text hover:border-blue-200 transition-colors whitespace-pre-wrap">
                <span className="font-medium text-blue-600 block mb-0.5 text-[10px] uppercase tracking-wide">Next Step</span>
                {opp.Next_Step}
              </div>
            ) : (
              <button onClick={() => setEditingNextStep(true)} className="text-xs text-gray-300 hover:text-[#0073ea] text-left transition-colors">
                + Add next steps
              </button>
            )}

            {/* AE + BDR dropdowns */}
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={opp.AE_Name || ''}
                onChange={(e) => onUpdate(opp.Id, { AE_Name: e.target.value })}
                className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none hover:border-gray-300 focus:border-[#0073ea]"
              >
                <option value="">Assign AE…</option>
                {AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}
              </select>

              {bdrNames.length > 0 && (
                <select
                  value={opp.BDR_Name || ''}
                  onChange={(e) => onUpdate(opp.Id, { BDR_Name: e.target.value })}
                  className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none hover:border-blue-300 focus:border-[#0073ea]"
                >
                  <option value="">Assign BDR…</option>
                  {bdrNames.map((bdr) => <option key={bdr} value={bdr}>{bdr}</option>)}
                </select>
              )}
            </div>

            {/* Source if BDR already shown in top row */}
            {opp.BDR_Name && (
              <select
                value={opp.Source || ''}
                onChange={(e) => onUpdate(opp.Id, { Source: e.target.value })}
                className={`w-full text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${opp.Source ? (SOURCE_BADGE[opp.Source] || 'bg-gray-100 text-gray-600 border-gray-200') : 'text-gray-400 bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                style={{ appearance: 'none' }}
              >
                <option value="">Source…</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Rejection toggle */}
            {editingRejection ? (
              <textarea autoFocus value={localRejection} onChange={(e) => setLocalRejection(e.target.value)} onBlur={saveRejection}
                className="w-full text-xs text-gray-700 border border-red-300 rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 resize-none h-14"
                placeholder="Why was meeting rejected?"
              />
            ) : opp.Meeting_Rejected === 'true' ? (
              <div className="bg-red-50 rounded-lg px-2 py-1.5 border border-red-100">
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleRejection}
                    className="relative w-5 h-5 rounded-md bg-red-200 flex items-center justify-center flex-shrink-0 hover:bg-red-300 transition-colors"
                    title="Mark as not rejected">
                    <svg className="w-3 h-3 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <div className="flex-1 cursor-text" onClick={() => setEditingRejection(true)}>
                    <p className="text-xs font-semibold text-red-700">Rejected</p>
                    <p className="text-xs text-red-600">{opp.Rejection_Reason || 'No reason provided'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={toggleRejection}
                className="text-xs text-gray-300 hover:text-red-500 text-left transition-colors">
                + Mark as Rejected
              </button>
            )}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        {!isOverlay && (
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50">
            <span className="text-xs text-gray-300">
              {opp.Last_Updated
                ? new Date(opp.Last_Updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Move S1 ↔ S2 button */}
              {onMoveStage && (opp.Stage === 'S1' || opp.Stage === 'S2') && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveStage(opp.Id, opp.Stage === 'S1' ? 'S2' : 'S1'); }}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all text-[#0073ea] hover:bg-blue-50 border border-transparent hover:border-blue-200"
                  title={opp.Stage === 'S1' ? 'Move to S2' : 'Move to S1'}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={opp.Stage === 'S1' ? 'M13 7l5 5m0 0l-5 5m5-5H6' : 'M11 17l-5-5m0 0l5-5m-5 5h12'} />
                  </svg>
                  {opp.Stage === 'S1' ? 'S2' : 'S1'}
                </button>
              )}
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
          </div>
        )}
      </div>
    </div>
  );
}
