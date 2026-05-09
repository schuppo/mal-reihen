import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../i18n/translations';

export interface UserSettings {
  testLength: number;
  questionTimer: number | null;
  showCorrectAnswer: boolean;
  language: Language;
}

export const DEFAULT_SETTINGS: UserSettings = {
  testLength: 20,
  questionTimer: 10,
  showCorrectAnswer: false,
  language: 'de',
};

export interface User {
  id: string;
  username: string;
  settings: UserSettings;
}

const USERS_KEY = 'users';
const SESSION_KEY = 'activeUserId';

// ── User CRUD ─────────────────────────────────────────────────────────────────

export async function loadUsers(): Promise<User[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

async function persistUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(
  username: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  if (!username.trim()) return { success: false, error: 'errorUsernameEmpty' };
  const users = await loadUsers();
  if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return { success: false, error: 'errorUsernameTaken' };
  }
  const user: User = {
    id: Date.now().toString(),
    username: username.trim(),
    settings: { ...DEFAULT_SETTINGS },
  };
  await persistUsers([...users, user]);
  return { success: true, user };
}

export async function loginUser(
  username: string,
): Promise<User | null> {
  const users = await loadUsers();
  return (
    users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase(),
    ) ?? null
  );
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings,
): Promise<void> {
  const users = await loadUsers();
  await persistUsers(users.map(u => (u.id === userId ? { ...u, settings } : u)));
}

export async function deleteUser(userId: string): Promise<void> {
  const users = await loadUsers();
  await persistUsers(users.filter(u => u.id !== userId));
}

// ── Session ───────────────────────────────────────────────────────────────────

export async function getSessionUserId(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

export async function setSessionUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, userId);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
