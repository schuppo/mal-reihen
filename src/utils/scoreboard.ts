import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScoreEntry {
  id: string;
  date: string; // ISO string
  correct: number;
  total: number;
  timeSeconds: number;
  mode: 'training' | 'test';
  tableFilter: number | 'all';
}

const KEY = 'scoreboard';
const MAX_ENTRIES = 50;

export async function loadScores(): Promise<ScoreEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveScore(entry: Omit<ScoreEntry, 'id' | 'date'>): Promise<void> {
  try {
    const existing = await loadScores();
    const newEntry: ScoreEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // silently fail — scoreboard is non-critical
  }
}

export async function clearScores(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
