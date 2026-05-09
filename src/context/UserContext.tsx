import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, UserSettings,
  loginUser, registerUser, updateUserSettings, loadUsers, deleteUser,
  getSessionUserId, setSessionUserId, clearSession,
} from '../utils/users';
import { clearScores } from '../utils/scoreboard';

interface UserContextValue {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string) => Promise<boolean>;
  register: (username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  saveSettings: (settings: UserSettings) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  currentUser: null,
  isLoading: true,
  login: async () => false,
  register: async () => ({ success: false }),
  logout: async () => {},
  saveSettings: async () => {},
  deleteAccount: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const userId = await getSessionUserId();
      if (userId) {
        const users = await loadUsers();
        const user = users.find(u => u.id === userId) ?? null;
        setCurrentUser(user);
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(username: string): Promise<boolean> {
    const user = await loginUser(username);
    if (user) {
      setCurrentUser(user);
      await setSessionUserId(user.id);
      return true;
    }
    return false;
  }

  async function register(
    username: string,
  ): Promise<{ success: boolean; error?: string }> {
    const result = await registerUser(username);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      await setSessionUserId(result.user.id);
    }
    return { success: result.success, error: result.error };
  }

  async function logout(): Promise<void> {
    setCurrentUser(null);
    await clearSession();
  }

  async function saveSettings(settings: UserSettings): Promise<void> {
    if (!currentUser) return;
    await updateUserSettings(currentUser.id, settings);
    setCurrentUser(u => (u ? { ...u, settings } : null));
  }

  async function deleteAccount(): Promise<void> {
    if (!currentUser) return;
    await clearScores(currentUser.id);
    await deleteUser(currentUser.id);
    setCurrentUser(null);
    await clearSession();
  }

  return (
    <UserContext.Provider value={{ currentUser, isLoading, login, register, logout, saveSettings, deleteAccount }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
