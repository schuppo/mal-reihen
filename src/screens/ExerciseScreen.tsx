import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useExercise } from '../hooks/useExercise';
import NumPad from '../components/NumPad';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';

interface ExerciseParams {
  mode: 'training' | 'test';
  tableFilter: number[] | 'all';
}

export default function ExerciseScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state as ExerciseParams | undefined;

  if (!params) return <Navigate to="/" replace />;

  const { mode, tableFilter } = params;
  const { testLength: TEST_LENGTH, questionTimer, showCorrectAnswer, language } = useSettings();
  const t = useTranslations(language);

  const {
    current, input, feedback, answered, done,
    correctCount, appendDigit, backspace, submit, submitTimeout, progress,
  } = useExercise(mode, TEST_LENGTH, tableFilter);

  const startTime = useRef(Date.now());
  const questionStartTime = useRef(Date.now());
  const timings = useRef<number[]>([]);
  const submitTimeoutRef = useRef(submitTimeout);
  useEffect(() => { submitTimeoutRef.current = submitTimeout; }, [submitTimeout]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerPct, setTimerPct] = useState(100);
  const [animClass, setAnimClass] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  // Record per-question timing
  useEffect(() => {
    if (feedback !== null) {
      const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
      timings.current = [...timings.current, elapsed];
    } else {
      questionStartTime.current = Date.now();
    }
  }, [feedback]);

  // Navigate to result when test done
  useEffect(() => {
    if (done) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      navigate('/result', {
        replace: true,
        state: {
          correct: correctCount,
          total: TEST_LENGTH,
          timeSeconds: elapsed,
          mode,
          tableFilter,
          mistakes: answered.filter(q => !q.correct).map(q => ({ a: q.a, b: q.b })),
          timings: timings.current,
        },
      });
    }
  }, [done]);

  function handleFinishTraining() {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    navigate('/result', {
      replace: true,
      state: {
        correct: correctCount,
        total: answered.length,
        timeSeconds: elapsed,
        mode,
        tableFilter,
        mistakes: answered.filter(q => !q.correct).map(q => ({ a: q.a, b: q.b })),
        timings: timings.current,
      },
    });
  }

  // CSS animations on feedback
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    if (feedback === 'wrong') {
      setAnimClass('anim-shake');
      setTimeout(() => setAnimClass(''), 400);
    }
    if (feedback === 'correct') {
      setAnimClass('anim-pop');
      setTimeout(() => setAnimClass(''), 300);
    }
  }, [feedback]);

  // Question timer
  useEffect(() => {
    if (questionTimer === null || feedback) { setTimeLeft(null); setTimerPct(100); return; }
    setTimeLeft(questionTimer);
    setTimerPct(100);

    const startMs = Date.now();
    const totalMs = questionTimer * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startMs;
      const remaining = Math.max(0, questionTimer - Math.floor(elapsed / 1000));
      const pct = Math.max(0, ((totalMs - elapsed) / totalMs) * 100);
      setTimeLeft(remaining);
      setTimerPct(pct);
    }, 100);

    const timeout = setTimeout(() => { submitTimeoutRef.current(); }, totalMs);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [current, feedback, questionTimer]);

  // Keyboard handler
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Enter') submit();
  }, [appendDigit, backspace, submit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const bgColor = feedback === 'correct' ? '#E8FFF0' : feedback === 'wrong' ? '#FFE8E8' : '#F0EFFF';
  const timerDanger = timeLeft !== null && questionTimer !== null && timeLeft <= Math.ceil(questionTimer * 0.3);
  const timerColor = timerDanger ? '#E74C3C' : '#6C63FF';

  const headerTitle = mode === 'training' ? '🎓 Training' : '🏆 Test';

  return (
    <div style={{ height: '100%', background: bgColor, display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}>
      {/* Header */}
      <div style={{ background: '#6C63FF', padding: '12px 20px', paddingTop: 'calc(12px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center' }}>
        <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', marginRight: 12 }} onClick={() => navigate('/')}>←</button>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{headerTitle}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', padding: 16, overflowY: 'auto' }}>
        {/* Progress bar — test mode */}
        {mode === 'test' && (
          <div style={{ width: '100%', maxWidth: 360, position: 'relative' }}>
            <div style={{ height: 10, background: '#ddd', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(progress ?? 0) * 100}%`, background: '#6C63FF', borderRadius: 10, transition: 'width 0.3s' }} />
            </div>
            <span style={{ position: 'absolute', right: 0, top: 14, fontSize: 12, color: '#999' }}>{answered.length} / {TEST_LENGTH}</span>
          </div>
        )}

        {/* Training score */}
        {mode === 'training' && answered.length > 0 && (
          <p style={{ fontSize: 18, fontWeight: 700, color: '#6C63FF' }}>✅ {correctCount} / {answered.length}</p>
        )}

        {/* Question card */}
        <div
          ref={cardRef}
          className={animClass}
          style={{ background: '#fff', borderRadius: 28, paddingTop: 0, paddingBottom: 32, paddingLeft: 40, paddingRight: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, boxShadow: '0 8px 32px rgba(108,99,255,0.15)', minHeight: 200, overflow: 'hidden' }}
        >
          {/* Timer bar */}
          {questionTimer !== null && (
            <div style={{ width: 'calc(100% + 80px)', height: 6, background: '#eee', marginBottom: 24, position: 'relative', alignSelf: 'stretch', marginLeft: -40, marginRight: -40 }}>
              <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, transition: 'background 0.5s' }} />
              {timeLeft !== null && !feedback && (
                <span style={{ position: 'absolute', right: 8, top: 9, fontSize: 11, fontWeight: 700, color: timerColor }}>{timeLeft}s</span>
              )}
            </div>
          )}

          <p style={{ fontSize: 52, fontWeight: 900, color: '#333', letterSpacing: 2, marginBottom: 16 }}>
            {current.a} × {current.b} = ?
          </p>

          <div style={{ width: 120, height: 64, borderRadius: 16, border: '3px solid #6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7FF' }}>
            <span data-testid="input-display" style={{ fontSize: 36, fontWeight: 800, color: input ? '#333' : '#ccc' }}>
              {input || '…'}
            </span>
          </div>

          {feedback && (
            <p data-testid="feedback-text" style={{ marginTop: 16, fontSize: 20, fontWeight: 700, color: feedback === 'correct' ? '#2ECC71' : '#E74C3C' }}>
              {feedback === 'correct'
                ? t.feedbackCorrect
                : showCorrectAnswer
                  ? t.feedbackWrongWithAnswer(current.a, current.b, current.answer)
                  : t.feedbackWrong}
            </p>
          )}
        </div>

        {/* NumPad */}
        <NumPad onDigit={appendDigit} onBackspace={backspace} onConfirm={submit} disabled={!!feedback} />

        {/* Finish training button */}
        {mode === 'training' && answered.length > 0 && (
          <button
            data-testid="finish-training-btn"
            style={{ padding: '12px 28px', borderRadius: 14, border: '2px solid #6C63FF', background: 'transparent', color: '#6C63FF', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            onClick={handleFinishTraining}
          >
            {t.finishTraining}
          </button>
        )}
      </div>
    </div>
  );
}
