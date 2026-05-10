import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTranslations } from '../i18n/translations';
import { loadUsers, User } from '../utils/users';

export default function LoginScreen() {
  const { login, register } = useUser();
  const t = useTranslations('en');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accounts, setAccounts] = useState<User[]>([]);

  useEffect(() => { loadUsers().then(setAccounts); }, []);

  async function handleLoginAs(name: string) {
    setError(''); setBusy(true);
    try { if (!(await login(name))) setError(t.errorUserNotFound); }
    finally { setBusy(false); }
  }

  function resolveError(key?: string) {
    if (!key) return '';
    return ({ errorUsernameTaken: t.errorUsernameTaken, errorUsernameEmpty: t.errorUsernameEmpty } as Record<string, string>)[key] ?? key;
  }

  async function handleSubmit() {
    setError(''); setBusy(true);
    try {
      const result = await register(username);
      if (!result.success) setError(resolveError(result.error));
      else loadUsers().then(setAccounts);
    } finally { setBusy(false); }
  }

  const isLogin = mode === 'login';

  const s = {
    page: { minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F0EFFF' } as React.CSSProperties,
    title: { fontSize: 48, fontWeight: 900, color: '#6C63FF', marginBottom: 8 } as React.CSSProperties,
    modeTitle: { fontSize: 20, fontWeight: 700, color: '#555', marginBottom: 28 } as React.CSSProperties,
    card: { background: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(108,99,255,0.12)', marginBottom: 20 } as React.CSSProperties,
    accountRow: { display: 'flex', alignItems: 'center', padding: '14px 4px', borderBottom: '1px solid #F0EFFF', cursor: 'pointer', gap: 12 } as React.CSSProperties,
    accountName: { flex: 1, fontSize: 17, fontWeight: 700, color: '#333' } as React.CSSProperties,
    label: { fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 6, marginTop: 12, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    input: { width: '100%', border: '1.5px solid #E0DEFF', borderRadius: 12, padding: '12px 14px', fontSize: 16, color: '#333', background: '#FAFAFE', outline: 'none' } as React.CSSProperties,
    error: { marginTop: 12, color: '#E74C3C', fontSize: 13, fontWeight: 600, textAlign: 'center' as const },
    btn: { marginTop: 24, background: '#6C63FF', borderRadius: 14, height: 54, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', border: 'none' } as React.CSSProperties,
    toggle: { color: '#6C63FF', fontSize: 14, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' } as React.CSSProperties,
    hint: { marginTop: 28, fontSize: 13, color: '#aaa', textAlign: 'center' as const, maxWidth: 300, lineHeight: '20px' },
  };

  return (
    <div style={s.page}>
      <div style={s.title}>✖️ Mal-Reihen</div>
      <div style={s.modeTitle}>{isLogin ? t.loginTitle : t.registerTitle}</div>

      {isLogin ? (
        <div style={s.card}>
          {accounts.length === 0
            ? <p style={{ textAlign: 'center', color: '#aaa', fontSize: 15, padding: '12px 0' }}>{t.noAccounts}</p>
            : accounts.map(acc => (
              <div key={acc.id} style={s.accountRow} onClick={() => !busy && handleLoginAs(acc.username)} data-testid={`account-${acc.username}`}>
                <span style={{ fontSize: 22 }}>👤</span>
                <span style={s.accountName}>{acc.username}</span>
                <span style={{ fontSize: 22, color: '#6C63FF', fontWeight: 700 }}>{busy ? '…' : '›'}</span>
              </div>
            ))}
          {error && <p style={s.error} data-testid="auth-error">{error}</p>}
        </div>
      ) : (
        <div style={s.card}>
          <label style={s.label}>{t.username}</label>
          <input
            style={s.input}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            data-testid="input-username"
          />
          {error && <p style={s.error} data-testid="auth-error">{error}</p>}
          <button style={s.btn} onClick={handleSubmit} disabled={busy} data-testid="auth-submit">
            {busy ? '…' : t.registerButton}
          </button>
        </div>
      )}

      <button style={s.toggle} onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setUsername(''); }} data-testid="auth-toggle">
        {isLogin ? t.goToRegister : t.goToLogin}
      </button>
      <p style={s.hint}>{t.localOnlyHint}</p>
    </div>
  );
}
