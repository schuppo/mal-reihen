import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScoreEntry {
  id: string;
  date: string; // ISO string
  correct: number;
  total: number;
  timeSeconds: number;
  mode: 'training' | 'test';
  tableFilter: number[] | 'all';
  mistakes?: { a: number; b: number }[];
}

const MAX_ENTRIES = 50;

function scoreKey(userId?: string) {
  return userId ? `scoreboard_${userId}` : 'scoreboard';
}

export async function loadScores(userId?: string): Promise<ScoreEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(scoreKey(userId));
    return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveScore(entry: Omit<ScoreEntry, 'id' | 'date'>, userId?: string): Promise<void> {
  try {
    const existing = await loadScores(userId);
    const newEntry: ScoreEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(scoreKey(userId), JSON.stringify(updated));
  } catch {
    // silently fail — scoreboard is non-critical
  }
}

export async function clearScores(userId?: string): Promise<void> {
  await AsyncStorage.removeItem(scoreKey(userId));
}
