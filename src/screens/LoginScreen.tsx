import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { useTranslations } from '../i18n/translations';
import { loadUsers, User } from '../utils/users';

/**
 * LoginScreen – shown when no user is logged in.
 * Toggles between "Login" and "Register" modes inline.
 * No navigation prop needed: auth state change in UserContext causes App.tsx
 * to switch to the main screen group automatically.
 */
export default function LoginScreen() {
  const { login, register } = useUser();
  const t = useTranslations('en');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accounts, setAccounts] = useState<User[]>([]);

  useEffect(() => {
    loadUsers().then(setAccounts);
  }, []);

  async function handleLoginAs(name: string) {
    setError('');
    setBusy(true);
    try {
      const ok = await login(name);
      if (!ok) setError(t.errorUserNotFound);
    } finally {
      setBusy(false);
    }
  }

  function resolveError(key: string | undefined): string {
    if (!key) return '';
    const map: Record<string, string> = {
      errorUsernameTaken: t.errorUsernameTaken,
      errorUsernameEmpty: t.errorUsernameEmpty,
    };
    return map[key] ?? key;
  }

  async function handleSubmit() {
    setError('');
    setBusy(true);
    try {
      const result = await register(username);
      if (!result.success) {
        setError(resolveError(result.error));
      } else {
        // refresh account list in case user goes back to login mode
        loadUsers().then(setAccounts);
      }
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setError('');
    setUsername('');
  }

  const isLogin = mode === 'login';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.appTitle}>✖️ Mal-Reihen</Text>
          <Text style={styles.modeTitle}>{isLogin ? t.loginTitle : t.registerTitle}</Text>

          {isLogin ? (
            <View style={styles.card}>
              {accounts.length === 0 ? (
                <Text style={styles.noAccounts}>{t.noAccounts}</Text>
              ) : (
                accounts.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    style={styles.accountRow}
                    onPress={() => handleLoginAs(acc.username)}
                    disabled={busy}
                    testID={`account-${acc.username}`}
                  >
                    <Text style={styles.accountAvatar}>👤</Text>
                    <Text style={styles.accountName}>{acc.username}</Text>
                    {busy ? <ActivityIndicator size="small" color="#6C63FF" /> : <Text style={styles.accountArrow}>›</Text>}
                  </TouchableOpacity>
                ))
              )}
              {!!error && <Text style={styles.error} testID="auth-error">{error}</Text>}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.label}>{t.username}</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                testID="input-username"
              />
              {!!error && <Text style={styles.error} testID="auth-error">{error}</Text>}
              <TouchableOpacity
                style={styles.btn}
                onPress={handleSubmit}
                disabled={busy}
                testID="auth-submit"
              >
                {busy
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>{t.registerButton}</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={toggleMode} testID="auth-toggle">
            <Text style={styles.toggle}>
              {isLogin ? t.goToRegister : t.goToLogin}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0EFFF' },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  appTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 40,
    fontWeight: '900',
    color: '#6C63FF',
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#555',
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0DEFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFE',
  },
  error: {
    marginTop: 12,
    color: '#E74C3C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  btn: {
    marginTop: 24,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  toggle: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFFF',
  },
  accountAvatar: {
    fontSize: 22,
    marginRight: 12,
  },
  accountName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  accountArrow: {
    fontSize: 22,
    color: '#6C63FF',
    fontWeight: '700',
  },
  noAccounts: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 15,
    paddingVertical: 12,
  },
});
