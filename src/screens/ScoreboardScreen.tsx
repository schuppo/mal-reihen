import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadScores, clearScores, ScoreEntry } from '../utils/scoreboard';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { useUser } from '../context/UserContext';

const RANK_COLORS = ['#E74C3C', '#E67E22', '#F1C40F', '#aaa', '#bbb'];

function buildTopMistakes(scores: ScoreEntry[]) {
  const map: Record<string, number> = {};
  for (const e of scores) for (const { a, b } of e.mistakes ?? []) { const k = `${a}x${b}`; map[k] = (map[k] ?? 0) + 1; }
  return Object.entries(map).map(([k, count]) => { const [a, b] = k.split('x').map(Number); return { a, b, count }; }).sort((x, y) => y.count - x.count).slice(0, 5);
}

function formatTime(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; }
function formatDate(iso: string) { return new Date(iso).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function gradeColor(pct: number) { if (pct === 100) return '#FFD700'; if (pct >= 80) return '#6C63FF'; if (pct >= 60) return '#FF9F43'; return '#E74C3C'; }
function calcTimingStats(timings?: number[]) {
  if (!timings || timings.length === 0) return null;
  const sorted = [...timings].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return { min: sorted[0], max: sorted[sorted.length - 1], median: sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid] };
}

export default function ScoreboardScreen() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const t = useTranslations(language);
  const { currentUser } = useUser();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => { loadScores(currentUser?.id).then(setScores); }, [currentUser?.id]);

  async function executeClear() { await clearScores(currentUser?.id); setScores([]); setConfirmClear(false); }

  const top = buildTopMistakes(scores);
  const maxCount = top[0]?.count ?? 1;

  return (
    <div style={{ height: '100%', background: '#F0EFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#6C63FF', padding: '12px 20px', paddingTop: 'calc(12px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center' }}>
        <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', marginRight: 12 }} onClick={() => navigate('/')}>←</button>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>🏅 {t.scoreboardTitle ?? 'Scoreboard'}</span>
        {scores.length > 0 && !confirmClear && (
          <button style={{ marginLeft: 'auto', background: '#FFE8E8', border: 'none', borderRadius: 12, padding: '6px 14px', color: '#E74C3C', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={() => setConfirmClear(true)}>
            {t.scoreboardClearAll}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Confirm clear */}
        {confirmClear && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #FFD0D0' }}>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 12, textAlign: 'center' }}>{t.scoreboardClearConfirm}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#f5f5f5', border: 'none', fontWeight: 700, color: '#888', cursor: 'pointer' }} onClick={() => setConfirmClear(false)}>Cancel</button>
              <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#E74C3C', border: 'none', fontWeight: 700, color: '#fff', cursor: 'pointer' }} onClick={executeClear}>{t.scoreboardClearAll}</button>
            </div>
          </div>
        )}

        {/* Trouble spots */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 4px 16px rgba(108,99,255,0.08)' }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: '#333', marginBottom: 12 }}>{t.scoreboardHeatmapTitle}</p>
          {top.length === 0
            ? <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>{t.scoreboardHeatmapEmpty}</p>
            : top.map(({ a, b, count }, i) => (
              <div key={`${a}x${b}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: RANK_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#333', width: 90 }}>{a} × {b} = {a * b}</span>
                <div style={{ flex: 1, height: 10, background: '#F0EFFF', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((count / maxCount) * 100)}%`, background: '#6C63FF', borderRadius: 5 }} />
                </div>
                <div style={{ background: '#FFE8E8', borderRadius: 8, padding: '2px 7px' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#E74C3C' }}>{count}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Session list */}
        {scores.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 40 }}>
            <span style={{ fontSize: 64, marginBottom: 16 }}>🏅</span>
            <p style={{ fontSize: 16, color: '#aaa', textAlign: 'center', lineHeight: '24px' }}>{t.scoreboardEmpty}</p>
          </div>
        ) : (
          scores.map((item, index) => {
            const pct = Math.round((item.correct / item.total) * 100);
            const color = gradeColor(pct);
            const ts = calcTimingStats(item.timings);
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: 20, padding: 16, display: 'flex', alignItems: 'flex-start', boxShadow: '0 4px 16px rgba(108,99,255,0.08)', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#bbb', minWidth: 36 }}>#{index + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color, minWidth: 52 }}>{pct}%</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#555', flex: 1 }}>{item.correct}/{item.total}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 8, background: item.mode === 'test' ? '#EDE9FF' : '#E8FFF0', fontSize: 11, fontWeight: 700, color: '#555' }}>
                      {item.mode === 'test' ? t.scoreboardModeTest : t.scoreboardModeTraining}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 8, background: '#FFF3E0', fontSize: 11, fontWeight: 700, color: '#E67E22' }}>
                      {item.tableFilter === 'all' ? t.scoreboardTableAll : item.tableFilter.join(', ')}
                    </span>
                    <span style={{ fontSize: 11, color: '#bbb' }}>{formatDate(item.date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[
                      [formatTime(item.timeSeconds), t.time],
                      [`${(item.timeSeconds / item.total).toFixed(1)}s`, t.scoreboardTimePerAnswer],
                      [`${item.total - item.correct}`, t.mistakes],
                    ].map(([v, l]) => (
                      <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#333' }}>{v}</span>
                        <span style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                  {ts && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f5f5f5' }}>
                      {[[`${ts.min}s`, t.statMin], [`${ts.median}s`, t.statMedian], [`${ts.max}s`, t.statMax]].map(([v, l]) => (
                        <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#333' }}>{v}</span>
                          <span style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
