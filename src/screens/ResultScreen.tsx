import React, { useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { saveScore } from '../utils/scoreboard';
import { useUser } from '../context/UserContext';

interface ResultParams {
  correct: number;
  total: number;
  timeSeconds: number;
  mode: 'training' | 'test';
  tableFilter: number[] | 'all';
  mistakes: { a: number; b: number }[];
  timings?: number[];
}

function grade(pct: number, t: ReturnType<typeof useTranslations>) {
  if (pct === 100) return { emoji: '🥇', label: t.gradePerfect, color: '#FFD700' };
  if (pct >= 80)   return { emoji: '🥈', label: t.gradeGreat,   color: '#6C63FF' };
  if (pct >= 60)   return { emoji: '🥉', label: t.gradeGood,    color: '#FF9F43' };
  return              { emoji: '📚', label: t.gradeKeep,    color: '#E74C3C' };
}

function formatTime(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function calcTimingStats(timings?: number[]) {
  if (!timings || timings.length === 0) return null;
  const sorted = [...timings].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  return { min: sorted[0], max: sorted[sorted.length - 1], median };
}

export default function ResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state as ResultParams | undefined;

  if (!params) return <Navigate to="/" replace />;

  const { correct, total, timeSeconds, mode, tableFilter, mistakes, timings } = params;
  const { language } = useSettings();
  const t = useTranslations(language);
  const { currentUser } = useUser();
  const pct = Math.round((correct / total) * 100);
  const { emoji, label, color } = grade(pct, t);
  const ts = calcTimingStats(timings);

  useEffect(() => {
    saveScore({ correct, total, timeSeconds, mode, tableFilter, mistakes, timings }, currentUser?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stat = (num: string, lbl: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <span style={{ fontSize: 22, fontWeight: 800, color: '#333' }}>{num}</span>
      <span style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{lbl}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: '#F0EFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 32 }}>{label}</div>

      <div style={{ background: '#fff', borderRadius: 28, padding: 32, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 32px rgba(108,99,255,0.12)', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: '#6C63FF' }}>{correct}</span>
          <span style={{ fontSize: 40, color: '#ccc', margin: '0 8px' }}>/</span>
          <span style={{ fontSize: 40, fontWeight: 700, color: '#ccc' }}>{total}</span>
        </div>
        <p style={{ fontSize: 14, color: '#aaa', marginBottom: 24 }}>{t.correctAnswers}</p>

        <div style={{ width: '100%', height: 1, background: '#f0f0f0', marginBottom: 24 }} />

        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          {stat(`${pct}%`, t.score)}
          {stat(formatTime(timeSeconds), t.time)}
          {stat(`${(timeSeconds / total).toFixed(1)}s`, t.scoreboardTimePerAnswer)}
          {stat(`${total - correct}`, t.mistakes)}
        </div>

        {ts && (
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            {stat(`${ts.min}s`, t.statMin)}
            {stat(`${ts.median}s`, t.statMedian)}
            {stat(`${ts.max}s`, t.statMax)}
          </div>
        )}
      </div>

      <button
        style={{ width: '100%', maxWidth: 360, height: 60, borderRadius: 18, background: color, border: 'none', color: '#fff', fontSize: 20, fontWeight: 800, cursor: 'pointer', marginBottom: 12 }}
        onClick={() => navigate('/exercise', { state: { mode: 'test', tableFilter } })}
      >{t.tryAgain}</button>

      <button
        style={{ width: '100%', maxWidth: 360, height: 60, borderRadius: 18, background: '#fff', border: '2px solid #ddd', color: '#888', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >{t.home}</button>
    </div>
  );
}
