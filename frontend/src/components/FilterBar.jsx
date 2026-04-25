const SOURCES = ['Outbound', 'LinkedIn', 'Referral', 'Inbound', 'Cold Call', 'Event', 'Partner', 'Email Campaign'];

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

export default function FilterBar({ filters, onChange, bdrNames, resultCount, totalCount }) {
  const hasActive = filters.search || filters.source || filters.pain !== null || filters.bdr;

  const setFilter = (key, value) => onChange({ ...filters, [key]: value });

  const clearAll = () => onChange({ search: '', source: '', pain: null, bdr: '' });

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm mb-5">

      {/* Search */}
      <div className="relative flex-shrink-0">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="Search name, email…"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 w-48"
        />
        {filters.search && (
          <button
            onClick={() => setFilter('search', '')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-gray-200 hidden sm:block" />

      {/* Source filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Source:</span>
        <button
          onClick={() => setFilter('source', '')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            !filters.source
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          All
        </button>
        {SOURCES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('source', filters.source === s ? '' : s)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              filters.source === s
                ? `${SOURCE_BADGE[s]} shadow-sm`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-200 hidden sm:block" />

      {/* Pain validated */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-medium">Pain:</span>
        {[{ label: 'Any', value: null }, { label: '✓ Validated', value: true }, { label: '✗ Not yet', value: false }].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setFilter('pain', filters.pain === value ? null : value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              filters.pain === value
                ? value === true
                  ? 'bg-[#e6f9f1] text-[#007038] border-[#b0e8cf]'
                  : value === false
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Result count + clear */}
      <div className="ml-auto flex items-center gap-2">
        {hasActive && (
          <>
            <span className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{resultCount}</span> of {totalCount}
            </span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          </>
        )}
        {!hasActive && (
          <span className="text-xs text-gray-400">{totalCount} total</span>
        )}
      </div>
    </div>
  );
}
