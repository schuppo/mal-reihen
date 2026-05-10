import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { useUser } from '../context/UserContext';

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { testLength, language } = useSettings();
  const t = useTranslations(language);
  const { currentUser, logout } = useUser();
  const [selected, setSelected] = useState<number[] | 'all'>('all');

  function toggleNumber(n: number) {
    if (selected === 'all') { setSelected([n]); return; }
    const next = selected.includes(n) ? selected.filter(x => x !== n) : [...selected, n];
    setSelected(next.length === 0 ? 'all' : next.sort((a, b) => a - b));
  }

  const chip = (isSelected: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
    width: 52, height: 52, borderRadius: 14,
    background: isSelected ? '#6C63FF' : '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17, fontWeight: 700, color: isSelected ? '#fff' : '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', border: 'none',
    ...extra,
  });

  return (
    <div style={{ minHeight: '100%', background: '#F0EFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#6C63FF', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'calc(12px + env(safe-area-inset-top))' }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>✖️ Mal-Reihen</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }} onClick={() => navigate('/scoreboard')} title="Scoreboard">🏅</button>
          <button style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }} onClick={() => navigate('/settings')} title="Settings">⚙️</button>
          <button style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }} onClick={logout} title="Logout">🚪</button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#6C63FF', marginBottom: 4 }}>{t.appTitle}</h1>
        {currentUser && <p style={{ fontSize: 13, color: '#6C63FF', fontWeight: 700, marginBottom: 6 }}>{t.loggedInAs(currentUser.username)}</p>}
        <p style={{ fontSize: 15, color: '#777', textAlign: 'center', marginBottom: 28, lineHeight: '22px', maxWidth: 340 }}>{t.appSubtitle}</p>

        {/* Table filter */}
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#6C63FF', marginBottom: 4 }}>{t.chooseTable}</h2>
        <p style={{ fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 16 }}>{t.chooseTableSubtitle}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 400, marginBottom: 8 }}>
          <button
            style={chip(selected === 'all', { width: 72, borderRadius: 18, border: '2px solid #6C63FF', background: selected === 'all' ? '#6C63FF' : '#F0EFFF', color: selected === 'all' ? '#fff' : '#6C63FF', fontSize: 15 })}
            onClick={() => setSelected('all')}
          >{t.all}</button>
          {NUMBERS.map(n => {
            const isSel = selected !== 'all' && selected.includes(n);
            return <button key={n} style={chip(isSel)} onClick={() => toggleNumber(n)}>{n}</button>;
          })}
        </div>

        {selected !== 'all' && <p style={{ fontSize: 13, color: '#6C63FF', fontWeight: 600, marginBottom: 4 }}>{selected.join(', ')}</p>}

        {/* Mode cards */}
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          <button
            style={{ background: '#fff', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', width: '100%' }}
            onClick={() => navigate('/exercise', { state: { mode: 'training', tableFilter: selected } })}
          >
            <span style={{ fontSize: 40, marginBottom: 6 }}>🎓</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#333', marginBottom: 4 }}>{t.trainingTitle}</span>
            <span style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: '20px' }}>{t.trainingDesc}</span>
          </button>

          <button
            style={{ background: '#6C63FF', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 6px 20px rgba(108,99,255,0.3)', border: 'none', cursor: 'pointer', width: '100%' }}
            onClick={() => navigate('/exercise', { state: { mode: 'test', tableFilter: selected } })}
          >
            <span style={{ fontSize: 40, marginBottom: 6 }}>🏆</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.testTitle}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: '20px' }}>{t.testDesc(testLength)}</span>
          </button>
        </div>

        <p style={{ marginTop: 24, fontSize: 13, color: '#aaa' }}>{t.tapToBegin}</p>
      </div>
    </div>
  );
}
