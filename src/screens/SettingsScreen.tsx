import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { useUser } from '../context/UserContext';

const LENGTH_OPTIONS = [5, 10, 15, 20, 25, 30];
const TIMER_OPTIONS = [5, 8, 10, 15, 20, 30];

function Chip({ selected, onClick, children, wide, lang }: { selected: boolean; onClick: () => void; children: React.ReactNode; wide?: boolean; lang?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: lang ? 140 : wide ? 100 : 80,
        height: lang ? 56 : 80,
        borderRadius: 20, border: `2px solid ${selected ? '#6C63FF' : '#ddd'}`,
        background: selected ? '#6C63FF' : '#fff', color: selected ? '#fff' : '#555',
        fontSize: lang ? 16 : 22, fontWeight: 800, cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >{children}</button>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { testLength, setTestLength, questionTimer, setQuestionTimer, showCorrectAnswer, setShowCorrectAnswer, language, setLanguage } = useSettings();
  const t = useTranslations(language);
  const { deleteAccount } = useUser();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sep = <div style={{ height: 1, background: '#ddd', margin: '28px 0' }} />;

  return (
    <div style={{ height: '100%', background: '#F0EFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#6C63FF', padding: '12px 20px', paddingTop: 'calc(12px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center' }}>
        <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', marginRight: 12 }} onClick={() => navigate('/')}>←</button>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>⚙️ Settings</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, paddingBottom: 48, background: '#F0EFFF' }}>

        {/* Test Length */}
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#333', marginBottom: 6, marginTop: 8 }}>{t.settingsTestLength}</h2>
        <p style={{ fontSize: 15, color: '#777', marginBottom: 20 }}>{t.settingsTestLengthDesc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {LENGTH_OPTIONS.map(n => <Chip key={n} selected={n === testLength} onClick={() => setTestLength(n)}>{n}</Chip>)}
        </div>
        <p style={{ marginTop: 16, marginBottom: 4, fontSize: 14, color: '#999' }}>{t.settingsTestLengthHint(testLength)}</p>

        {sep}

        {/* Question Timer */}
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#333', marginBottom: 6, marginTop: 8 }}>{t.settingsTimer}</h2>
        <p style={{ fontSize: 15, color: '#777', marginBottom: 20 }}>{t.settingsTimerDesc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          <Chip selected={questionTimer === null} onClick={() => setQuestionTimer(null)} wide>{t.settingsTimerOff}</Chip>
          {TIMER_OPTIONS.map(s => <Chip key={s} selected={s === questionTimer} onClick={() => setQuestionTimer(s)}>{s}s</Chip>)}
        </div>
        <p style={{ marginTop: 16, marginBottom: 4, fontSize: 14, color: '#6C63FF', fontWeight: 800 }}>
          {questionTimer === null ? t.settingsTimerHintOff : t.settingsTimerHint(questionTimer)}
        </p>

        {sep}

        {/* Show Correct Answer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#333', marginBottom: 6 }}>{t.settingsShowCorrect}</h2>
            <p style={{ fontSize: 15, color: '#777' }}>{t.settingsShowCorrectDesc}</p>
          </div>
          <div
            onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
            style={{ width: 51, height: 31, borderRadius: 16, background: showCorrectAnswer ? '#6C63FF' : '#ddd', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
          >
            <div style={{ position: 'absolute', top: 2, left: showCorrectAnswer ? 22 : 2, width: 27, height: 27, borderRadius: 14, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        {sep}

        {/* Language */}
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#333', marginBottom: 6 }}>{t.settingsLanguage}</h2>
        <p style={{ fontSize: 15, color: '#777', marginBottom: 20 }}>{t.settingsLanguageDesc}</p>
        <div style={{ display: 'flex', gap: 14 }}>
          {(['en', 'de'] as const).map(lang => (
            <Chip key={lang} selected={lang === language} onClick={() => setLanguage(lang)} lang>
              {lang === 'en' ? t.settingsLangEn : t.settingsLangDe}
            </Chip>
          ))}
        </div>

        {sep}

        {/* Delete Account */}
        {confirmDelete ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #FFD0D0' }}>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 12, textAlign: 'center' }}>{t.deleteAccountConfirm}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#f5f5f5', border: 'none', fontWeight: 700, color: '#888', cursor: 'pointer' }} onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#E74C3C', border: 'none', fontWeight: 700, color: '#fff', cursor: 'pointer' }} onClick={deleteAccount} data-testid="confirm-delete-account">{t.deleteAccount}</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            data-testid="delete-account-btn"
            style={{ width: '100%', borderRadius: 16, border: '1.5px solid #FFD0D0', background: '#FFF5F5', padding: 18, textAlign: 'left', cursor: 'pointer' }}
          >
            <p style={{ fontSize: 16, fontWeight: 800, color: '#E74C3C', marginBottom: 4 }}>{t.deleteAccount}</p>
            <p style={{ fontSize: 13, color: '#E74C3C', opacity: 0.75 }}>{t.deleteAccountDesc}</p>
          </button>
        )}
      </div>
    </div>
  );
}
