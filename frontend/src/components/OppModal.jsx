import { useState, useEffect } from 'react';

const STAGES   = ['Meeting Not Accepted', 'S0', 'S0 Occurred', 'S1', 'S2', 'Rejected'];
const SOURCES  = ['Outbound', 'LinkedIn', 'Referral', 'Inbound', 'Cold Call', 'Event', 'Partner', 'Email Campaign'];
const AES      = ['Daniel', 'Bruce', 'Jake', 'Arik', 'JVL'];
const LANGUAGES = [
  'Java', 'JavaScript', 'Angular', 'React', 'TypeScript', 'Node.js', 'Kotlin',
  'Python', 'C#', '.NET', 'Go', 'C++ (GCC)', 'C (GCC)',
];

const EMPTY = {
  Opp_Name: '', Stage: 'S0', Meeting_Date: '', Languages: '',
  Pain_Validated: 'false', Source: '', Link: '', BDR_Name: '',
  AE_Name: '', Notes: '', Email: '', Next_Step: '',
};

export default function OppModal({ opp, bdrNames = [], onSave, onClose }) {
  const isEdit = !!opp;
  const [form, setForm] = useState(isEdit ? { ...opp } : { ...EMPTY });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(isEdit ? { ...opp } : { ...EMPTY });
  }, [opp]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleLang = (lang) => {
    const current = form.Languages ? form.Languages.split(',').filter(Boolean) : [];
    const next = current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang];
    set('Languages', next.join(','));
  };

  const currentLangs = form.Languages ? form.Languages.split(',').filter(Boolean) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Opp_Name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">
            {isEdit ? 'Edit Opportunity' : '+ Add Opportunity'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Company name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name *</label>
            <input
              autoFocus
              required
              value={form.Opp_Name}
              onChange={(e) => set('Opp_Name', e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10"
            />
          </div>

          {/* Stage + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stage</label>
              <select
                value={form.Stage}
                onChange={(e) => set('Stage', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] bg-white"
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date</label>
              <input
                type="date"
                value={form.Meeting_Date || ''}
                onChange={(e) => set('Meeting_Date', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
              />
            </div>
          </div>

          {/* BDR + AE row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">BDR</label>
              <select
                value={form.BDR_Name || ''}
                onChange={(e) => set('BDR_Name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] bg-white"
              >
                <option value="">— None —</option>
                {bdrNames.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">AE</label>
              <select
                value={form.AE_Name || ''}
                onChange={(e) => set('AE_Name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] bg-white"
              >
                <option value="">— None —</option>
                {AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}
              </select>
            </div>
          </div>

          {/* Source + Pain row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Source</label>
              <select
                value={form.Source || ''}
                onChange={(e) => set('Source', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] bg-white"
              >
                <option value="">— None —</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pain Validated</label>
              <div className="flex gap-2 mt-1">
                {[{ label: 'Yes', val: 'true' }, { label: 'No', val: 'false' }].map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('Pain_Validated', val)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      form.Pain_Validated === val
                        ? val === 'true'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-gray-200 text-gray-700 border-gray-300'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
            <input
              type="email"
              value={form.Email || ''}
              onChange={(e) => set('Email', e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Languages</label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(lang)}
                  className={`px-2 py-1 text-xs rounded border font-medium transition-all ${
                    currentLangs.includes(lang)
                      ? 'bg-[#0073ea] text-white border-[#0073ea]'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">CRM Link</label>
            <input
              value={form.Link || ''}
              onChange={(e) => set('Link', e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
            <textarea
              value={form.Notes || ''}
              onChange={(e) => set('Notes', e.target.value)}
              placeholder="Any context or observations…"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] resize-none"
            />
          </div>

          {/* Next Step */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Next Step</label>
            <textarea
              value={form.Next_Step || ''}
              onChange={(e) => set('Next_Step', e.target.value)}
              placeholder="What's the next action?"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0073ea] resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.Opp_Name.trim()}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0073ea] hover:bg-[#0063d0] disabled:opacity-50 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Opportunity'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
