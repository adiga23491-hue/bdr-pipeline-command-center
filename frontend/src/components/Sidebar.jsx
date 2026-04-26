import { useState } from 'react';

const NAV_ITEMS = [
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'playbook',
    label: 'Playbook',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'racheli',
    label: 'Racheli Opps',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export default function Sidebar({ activePage, onChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="flex-shrink-0 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-200 shadow-sm"
      style={{ width: expanded ? 200 : 60 }}
    >
      {/* Logo mark */}
      <div className="flex items-center gap-3 px-3.5 py-4 border-b border-gray-100 overflow-hidden" style={{ minHeight: 57 }}>
        <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#0073ea] via-[#a25ddc] to-[#00c875] flex items-center justify-center shadow shadow-blue-200">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        {expanded && (
          <span className="text-xs font-bold text-gray-800 whitespace-nowrap tracking-tight leading-tight">
            BDR<br />Suite
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id ||
            (item.id === 'dashboard' && (activePage === 'dashboard' || activePage === 'bdr-dashboard')) ||
            (item.id === 'racheli' && activePage === 'racheli');

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all text-left overflow-hidden group ${
                isActive
                  ? 'bg-[#e8f2fd] text-[#0073ea]'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {expanded && (
                <span className={`text-xs font-semibold whitespace-nowrap transition-all ${isActive ? 'text-[#0073ea]' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              )}
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 w-0.5 h-6 bg-[#0073ea] rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom hint */}
      {expanded && (
        <div className="px-3 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 font-medium">SeaLights BDRs</p>
        </div>
      )}
    </aside>
  );
}
