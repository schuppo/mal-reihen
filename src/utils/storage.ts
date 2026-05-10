/** Thin async wrapper around localStorage so utils keep their async signatures. */
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async setItem(key: string, value: string): Promise<void> {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  async removeItem(key: string): Promise<void> {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};
