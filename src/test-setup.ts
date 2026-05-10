import '@testing-library/jest-dom';

// Node v26 ships an experimental (broken) localStorage that shadows jsdom's.
// Replace globalThis.localStorage with a reliable in-memory implementation.
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  get length() { return Object.keys(this.store).length; }
  key(n: number) { return Object.keys(this.store)[n] ?? null; }
}

const localStorageMock = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  localStorage.clear();
});
