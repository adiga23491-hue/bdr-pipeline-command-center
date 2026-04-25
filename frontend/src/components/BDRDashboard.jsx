import { useState, useMemo } from 'react';

const S1_GOAL = 8;

// Color schemes for BDRs
const BDR_COLORS = {
  Simon: '#4f8ef7',
  Steven: '#9b59b6',
  Eyal: '#27ae60',
  Rachel: '#e67e22',
};

// Stage colors
const STAGE_COLORS = {
  'Meeting Not Accepted': '#e74c3c',
  'S0': '#f39c12',
  'S0 Occurred': '#9b59b6',
  'S1': '#27ae60',
};

// Helper: Calculate CONV (S1 / (S0 + S0 Occurred + S1))
function getConv(s0, s0Occurred, s1) {
  const denom = s0 + s0Occurred + s1;
  if (denom === 0) return 0;
  return Math.round((s1 / denom) * 100);
}

// Helper: Get BDR stats from opportunities
function getBDRStats(opps, bdrName) {
  const bdrOpps = opps.filter(o => o.BDR_Name === bdrName);
  return {
    meetingNotAccepted: bdrOpps.filter(o => o.Stage === 'Meeting Not Accepted').length,
    s0: bdrOpps.filter(o => o.Stage === 'S0').length,
    s0Occurred: bdrOpps.filter(o => o.Stage === 'S0 Occurred').length,
    s1: bdrOpps.filter(o => o.Stage === 'S1').length,
    pain: bdrOpps.filter(o => o.Pain_Validated === 'true').length,
    total: bdrOpps.length,
  };
}

// Avatar component
function Avatar({ name, color, size = 28 }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color + '22',
        border: `1.5px solid ${color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 600,
        color: color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// Progress bar component
function ProgressBar({ value, max, color, height = 8, showLabel = false }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          flex: 1,
          height,
          background: '#e8eaed',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 14 }}>
          {value}
        </span>
      )}
    </div>
  );
}

// S1 Goal bar component
function S1GoalBar({ s1 }) {
  const pct = Math.min((s1 / S1_GOAL) * 100, 100);
  const color = pct >= 100 ? '#27ae60' : pct >= 62 ? '#4f8ef7' : pct >= 37 ? '#f39c12' : '#e74c3c';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <div
        style={{
          flex: 1,
          height: 10,
          background: '#e8eaed',
          borderRadius: 5,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 5,
            transition: 'width 0.4s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 2,
            height: '100%',
            background: '#ccc',
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32 }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// BDR Card component
function BDRCard({ bdrName, stats, color }) {
  const maxBar = Math.max(stats.total, 1);
  const bars = [
    { label: 'Meeting Not Acc.', value: stats.meetingNotAccepted, color: STAGE_COLORS['Meeting Not Accepted'] },
    { label: 'S0', value: stats.s0, color: STAGE_COLORS['S0'] },
    { label: 'S0 Occurred', value: stats.s0Occurred, color: STAGE_COLORS['S0 Occurred'] },
    { label: 'S1', value: stats.s1, color: STAGE_COLORS['S1'] },
  ];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: '16px 20px',
        border: '1px solid #e8eaed',
        flex: '1 1 420px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Avatar name={bdrName} color={color} size={30} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{bdrName}</div>
          <div style={{ color: '#888', fontSize: 11 }}>
            {stats.total} active opportunity{stats.total !== 1 ? 'ies' : ''}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bars.map((b) => (
          <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                color: '#666',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {b.label}
            </span>
            <ProgressBar value={b.value} max={maxBar} color={b.color} height={9} showLabel={true} />
          </div>
        ))}
        <div
          style={{
            marginTop: 6,
            padding: '8px 10px',
            background: '#f8f9fa',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>S1 Goal Progress</span>
          <S1GoalBar s1={stats.s1} />
          <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
            {stats.s1} / {S1_GOAL}
          </span>
        </div>
      </div>
    </div>
  );
}

// Edit Modal component
function EditModal({ bdrName, stats, color, onSave, onCancel, onUpdate }) {
  const fields = [
    { key: 'meetingNotAccepted', label: 'Meeting Not Accepted', color: STAGE_COLORS['Meeting Not Accepted'] },
    { key: 's0', label: 'S0', color: STAGE_COLORS['S0'] },
    { key: 's0Occurred', label: 'S0 Occurred', color: STAGE_COLORS['S0 Occurred'] },
    { key: 's1', label: 'S1', color: STAGE_COLORS['S1'] },
    { key: 'pain', label: 'PAIN', color: '#4f8ef7' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 340,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Avatar name={bdrName} color={color} size={32} />
          <div style={{ fontWeight: 600, fontSize: 15 }}>Edit {bdrName}</div>
        </div>
        {fields.map((f) => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color }} />
              {f.label}
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={stats[f.key] || 0}
              onChange={(e) => onUpdate({ [f.key]: parseInt(e.target.value) || 0 })}
              style={{
                width: 70,
                padding: '5px 8px',
                borderRadius: 6,
                border: '1.5px solid #e0e0e0',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        ))}
        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>S1 Goal Preview</div>
          <S1GoalBar s1={stats.s1 || 0} />
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
            {stats.s1 || 0} of {S1_GOAL} S1s → {Math.round(Math.min(((stats.s1 || 0) / S1_GOAL) * 100, 100))}%
            {(stats.s1 || 0) >= S1_GOAL && ' 🎯 Goal reached!'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSave}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 7,
              border: 'none',
              background: '#4f8ef7',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 7,
              border: '1.5px solid #e0e0e0',
              background: '#fff',
              color: '#555',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard component
export default function BDRDashboard({ opps, bdrNames = ['Simon', 'Steven', 'Eyal', 'Rachel'] }) {
  const [tab, setTab] = useState('breakdown');
  const [editingBdr, setEditingBdr] = useState(null);
  const [editStats, setEditStats] = useState({});

  // Get stats for all BDRs
  const bdrStats = useMemo(
    () => {
      const stats = {};
      bdrNames.forEach((name) => {
        stats[name] = getBDRStats(opps, name);
      });
      return stats;
    },
    [opps, bdrNames]
  );

  // Calculate totals
  const totalOpps = useMemo(
    () => bdrNames.reduce((sum, name) => sum + (bdrStats[name]?.total || 0), 0),
    [bdrNames, bdrStats]
  );

  const totalS1 = useMemo(
    () => bdrNames.reduce((sum, name) => sum + (bdrStats[name]?.s1 || 0), 0),
    [bdrNames, bdrStats]
  );

  const openEdit = (bdrName) => {
    setEditingBdr(bdrName);
    setEditStats({ ...bdrStats[bdrName] });
  };

  const saveEdit = async () => {
    if (!editingBdr) return;
    // Here you could make an API call to persist the changes
    // For now, we'll just close the modal
    setEditingBdr(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'breakdown', label: 'BDR Breakdown' },
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Pipeline Overview</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
            {totalOpps} active opportunities across all BDRs
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8eaed', marginBottom: 20 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 13,
              color: tab === t.id ? '#1a1a2e' : '#888',
              borderBottom: tab === t.id ? '2px solid #4f8ef7' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BDR Performance Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #e8eaed',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14 }}>👥</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>BDR Performance</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888', fontStyle: 'italic' }}>
            Pipeline bar = S1 progress toward {S1_GOAL} S1 goal
          </span>
        </div>

        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 50px 50px 50px 50px 60px',
            padding: '0 0 8px',
            borderBottom: '1px solid #f0f0f0',
            gap: 8,
          }}
        >
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            BDR
          </span>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PIPELINE (S1 / {S1_GOAL})
          </span>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
            S0
          </span>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
            S1
          </span>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
            PAIN
          </span>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
            CONV
          </span>
          <span />
        </div>

        {/* Table rows */}
        {bdrNames.map((bdrName) => {
          const stats = bdrStats[bdrName] || { s0: 0, s0Occurred: 0, s1: 0, pain: 0, total: 0 };
          const conv = getConv(stats.s0, stats.s0Occurred, stats.s1);
          const pct = Math.min((stats.s1 / S1_GOAL) * 100, 100);
          const color = BDR_COLORS[bdrName] || '#999';
          const barColor = pct >= 100 ? '#27ae60' : color;
          const convColor = conv >= 50 ? '#27ae60' : conv >= 30 ? '#f39c12' : '#e74c3c';

          return (
            <div
              key={bdrName}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 50px 50px 50px 50px 60px',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #f8f8f8',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={bdrName} color={color} size={26} />
                <span style={{ fontWeight: 500, fontSize: 13 }}>{bdrName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    background: '#e8eaed',
                    borderRadius: 5,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: barColor,
                      borderRadius: 5,
                      transition: 'width 0.4s ease',
                    }}
                  />
                  {pct >= 100 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ✓ GOAL
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#888', minWidth: 48, textAlign: 'right' }}>
                  {stats.s1}/{S1_GOAL} ({Math.round(pct)}%)
                </span>
              </div>
              <span style={{ textAlign: 'right', color: '#444', fontSize: 13 }}>{stats.s0}</span>
              <span style={{ textAlign: 'right', color: '#444', fontSize: 13, fontWeight: 600 }}>
                {stats.s1}
              </span>
              <span style={{ textAlign: 'right', color: '#444', fontSize: 13 }}>{stats.pain}</span>
              <span style={{ textAlign: 'right', color: convColor, fontWeight: 700, fontSize: 13 }}>
                {conv}%
              </span>
              <button
                onClick={() => openEdit(bdrName)}
                style={{
                  textAlign: 'right',
                  background: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: 5,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: '#666',
                }}
              >
                Edit
              </button>
            </div>
          );
        })}

        <div style={{ marginTop: 10, color: '#aaa', fontSize: 11 }}>
          Conv = S1 / (S0 + S0 Occurred + S1) · Pipeline = S1 progress toward {S1_GOAL} S1 goal (100% = {S1_GOAL} S1s)
        </div>
      </div>

      {/* BDR Cards Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {bdrNames.map((bdrName) => (
          <BDRCard
            key={bdrName}
            bdrName={bdrName}
            stats={bdrStats[bdrName] || { meetingNotAccepted: 0, s0: 0, s0Occurred: 0, s1: 0, pain: 0, total: 0 }}
            color={BDR_COLORS[bdrName] || '#999'}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingBdr && (
        <EditModal
          bdrName={editingBdr}
          stats={editStats}
          color={BDR_COLORS[editingBdr] || '#999'}
          onSave={saveEdit}
          onCancel={() => setEditingBdr(null)}
          onUpdate={(updates) => setEditStats({ ...editStats, ...updates })}
        />
      )}
    </div>
  );
}
