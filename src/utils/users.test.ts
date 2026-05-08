import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadUsers, registerUser, loginUser, updateUserSettings,
  getSessionUserId, setSessionUserId, clearSession,
  DEFAULT_SETTINGS,
} from '../utils/users';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => {
  (AsyncStorage as any).clear();
});

describe('registerUser', () => {
  it('creates a new user with default settings', async () => {
    const result = await registerUser('alice', 'pass');
    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('alice');
    expect(result.user?.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('rejects duplicate usernames (case-insensitive)', async () => {
    await registerUser('alice', 'pass');
    const result = await registerUser('Alice', 'other');
    expect(result.success).toBe(false);
    expect(result.error).toBe('errorUsernameTaken');
  });

  it('rejects empty username', async () => {
    const result = await registerUser('  ', 'pass');
    expect(result.success).toBe(false);
    expect(result.error).toBe('errorUsernameEmpty');
  });
});

describe('loginUser', () => {
  beforeEach(() => registerUser('bob', 'secret'));

  it('returns the user on correct credentials', async () => {
    const user = await loginUser('bob', 'secret');
    expect(user?.username).toBe('bob');
  });

  it('returns null for wrong password', async () => {
    expect(await loginUser('bob', 'wrong')).toBeNull();
  });

  it('returns null for unknown username', async () => {
    expect(await loginUser('unknown', 'secret')).toBeNull();
  });

  it('is case-insensitive on username', async () => {
    expect(await loginUser('BOB', 'secret')).not.toBeNull();
  });
});

describe('updateUserSettings', () => {
  it('persists updated settings', async () => {
    const { user } = await registerUser('carol', 'pw');
    await updateUserSettings(user!.id, { ...DEFAULT_SETTINGS, testLength: 30 });
    const users = await loadUsers();
    expect(users.find(u => u.id === user!.id)?.settings.testLength).toBe(30);
  });
});

describe('session helpers', () => {
  it('stores and retrieves session userId', async () => {
    await setSessionUserId('abc');
    expect(await getSessionUserId()).toBe('abc');
  });

  it('clears session', async () => {
    await setSessionUserId('abc');
    await clearSession();
    expect(await getSessionUserId()).toBeNull();
  });
});
