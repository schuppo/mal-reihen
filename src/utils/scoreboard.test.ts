import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveScore, loadScores, clearScores, ScoreEntry } from './scoreboard';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('scoreboard utils', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('loadScores', () => {
    it('returns empty array when nothing stored', async () => {
      const scores = await loadScores();
      expect(scores).toEqual([]);
    });

    it('returns stored scores', async () => {
      const entry: ScoreEntry = { id: '1', date: '2026-01-01T00:00:00.000Z', correct: 8, total: 10, timeSeconds: 45, mode: 'test', tableFilter: 'all' };
      await AsyncStorage.setItem('scoreboard', JSON.stringify([entry]));
      const scores = await loadScores();
      expect(scores).toHaveLength(1);
      expect(scores[0]).toMatchObject({ correct: 8, total: 10, timeSeconds: 45 });
    });

    it('returns empty array on corrupt data', async () => {
      await AsyncStorage.setItem('scoreboard', 'not-json{{{');
      const scores = await loadScores();
      expect(scores).toEqual([]);
    });
  });

  describe('saveScore', () => {
    it('saves a new entry with generated id and date', async () => {
      await saveScore({ correct: 9, total: 10, timeSeconds: 30, mode: 'test', tableFilter: 'all' });
      const scores = await loadScores();
      expect(scores).toHaveLength(1);
      expect(scores[0].correct).toBe(9);
      expect(scores[0].total).toBe(10);
      expect(scores[0].timeSeconds).toBe(30);
      expect(scores[0].mode).toBe('test');
      expect(scores[0].tableFilter).toBe('all');
      expect(scores[0].id).toBeDefined();
      expect(scores[0].date).toBeDefined();
    });

    it('prepends new entry (most recent first)', async () => {
      await saveScore({ correct: 5, total: 10, timeSeconds: 60, mode: 'training', tableFilter: [3] });
      await saveScore({ correct: 9, total: 10, timeSeconds: 30, mode: 'test', tableFilter: 'all' });
      const scores = await loadScores();
      expect(scores[0].correct).toBe(9); // latest first
      expect(scores[0].mode).toBe('test');
      expect(scores[0].tableFilter).toBe('all');
      expect(scores[1].correct).toBe(5);
      expect(scores[1].mode).toBe('training');
      expect(scores[1].tableFilter).toEqual([3]);
    });

    it('caps stored entries at 50', async () => {
      for (let i = 0; i < 55; i++) {
        await saveScore({ correct: i, total: 10, timeSeconds: 10, mode: 'test', tableFilter: 'all' });
      }
      const scores = await loadScores();
      expect(scores).toHaveLength(50);
    });
  });

  describe('clearScores', () => {
    it('removes all stored scores', async () => {
      await saveScore({ correct: 10, total: 10, timeSeconds: 20, mode: 'test', tableFilter: 'all' });
      await clearScores();
      const scores = await loadScores();
      expect(scores).toEqual([]);
    });
  });
});
