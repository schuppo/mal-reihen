import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider, useUser } from './UserContext';
import { registerUser, DEFAULT_SETTINGS } from '../utils/users';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => {
  (AsyncStorage as any).clear();
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

describe('UserContext – initial state', () => {
  it('starts with no user and finishes loading', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('restores session from AsyncStorage on mount', async () => {
    const { user } = await registerUser('alice');
    await AsyncStorage.setItem('activeUserId', user!.id);

    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});
    expect(result.current.currentUser?.username).toBe('alice');
  });
});

describe('UserContext – register', () => {
  it('registers a new user and sets currentUser', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.register('bob');
    });
    expect(result.current.currentUser?.username).toBe('bob');
  });

  it('returns error for duplicate username', async () => {
    await registerUser('bob');
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});

    let res: { success: boolean; error?: string } = { success: true };
    await act(async () => {
      res = await result.current.register('bob');
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('errorUsernameTaken');
    expect(result.current.currentUser).toBeNull();
  });
});

describe('UserContext – login', () => {
  it('logs in an existing user', async () => {
    await registerUser('carol');
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});

    let ok = false;
    await act(async () => { ok = await result.current.login('carol'); });
    expect(ok).toBe(true);
    expect(result.current.currentUser?.username).toBe('carol');
  });

  it('returns false for an unknown username', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});

    let ok = true;
    await act(async () => { ok = await result.current.login('nobody'); });
    expect(ok).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });
});

describe('UserContext – logout', () => {
  it('clears currentUser and removes session', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});
    await act(async () => { await result.current.register('dave'); });
    expect(result.current.currentUser).not.toBeNull();

    await act(async () => { await result.current.logout(); });
    expect(result.current.currentUser).toBeNull();
    expect(await AsyncStorage.getItem('activeUserId')).toBeNull();
  });
});

describe('UserContext – saveSettings', () => {
  it('persists updated settings and reflects them in currentUser', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});
    await act(async () => { await result.current.register('eve'); });

    const newSettings = { ...DEFAULT_SETTINGS, testLength: 30 };
    await act(async () => { await result.current.saveSettings(newSettings); });
    expect(result.current.currentUser?.settings.testLength).toBe(30);
  });
});

describe('UserContext – deleteAccount', () => {
  it('removes the user and clears session', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await act(async () => {});
    await act(async () => { await result.current.register('frank'); });
    expect(result.current.currentUser).not.toBeNull();

    await act(async () => { await result.current.deleteAccount(); });
    expect(result.current.currentUser).toBeNull();
    expect(await AsyncStorage.getItem('activeUserId')).toBeNull();
  });
});
