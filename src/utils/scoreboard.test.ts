import { saveScore, loadScores, clearScores } from './scoreboard';

// localStorage is reset in test-setup.ts beforeEach

describe('scoreboard utils', () => {
  describe('loadScores', () => {
    it('returns empty array when nothing stored', async () => {
      expect(await loadScores()).toEqual([]);
    });

    it('returns stored scores', async () => {
      localStorage.setItem('scoreboard', JSON.stringify([
        { id: '1', date: '2026-01-01T00:00:00.000Z', correct: 8, total: 10, timeSeconds: 45, mode: 'test', tableFilter: 'all' },
      ]));
      const scores = await loadScores();
      expect(scores).toHaveLength(1);
      expect(scores[0]).toMatchObject({ correct: 8, total: 10, timeSeconds: 45 });
    });

    it('returns empty array on corrupt data', async () => {
      localStorage.setItem('scoreboard', 'not-json{{{');
      expect(await loadScores()).toEqual([]);
    });
  });

  describe('saveScore', () => {
    it('saves a new entry with generated id and date', async () => {
      await saveScore({ correct: 9, total: 10, timeSeconds: 30, mode: 'test', tableFilter: 'all', mistakes: [] });
      const scores = await loadScores();
      expect(scores).toHaveLength(1);
      expect(scores[0]).toMatchObject({ correct: 9, total: 10, mode: 'test', tableFilter: 'all' });
      expect(scores[0].id).toBeDefined();
      expect(scores[0].date).toBeDefined();
    });

    it('prepends new entry (most recent first)', async () => {
      await saveScore({ correct: 5, total: 10, timeSeconds: 60, mode: 'training', tableFilter: [3], mistakes: [] });
      await saveScore({ correct: 9, total: 10, timeSeconds: 30, mode: 'test', tableFilter: 'all', mistakes: [] });
      const scores = await loadScores();
      expect(scores[0].correct).toBe(9);
      expect(scores[1].correct).toBe(5);
    });

    it('caps stored entries at 50', async () => {
      for (let i = 0; i < 55; i++) {
        await saveScore({ correct: i, total: 10, timeSeconds: 10, mode: 'test', tableFilter: 'all', mistakes: [] });
      }
      expect(await loadScores()).toHaveLength(50);
    });
  });

  describe('clearScores', () => {
    it('removes all stored scores', async () => {
      await saveScore({ correct: 10, total: 10, timeSeconds: 20, mode: 'test', tableFilter: 'all', mistakes: [] });
      await clearScores();
      expect(await loadScores()).toEqual([]);
    });
  });

  describe('userId scoping', () => {
    it('uses separate keys per userId', async () => {
      await saveScore({ correct: 1, total: 5, timeSeconds: 10, mode: 'test', tableFilter: 'all', mistakes: [] }, 'user1');
      await saveScore({ correct: 3, total: 5, timeSeconds: 15, mode: 'test', tableFilter: 'all', mistakes: [] }, 'user2');
      expect(await loadScores('user1')).toHaveLength(1);
      expect(await loadScores('user2')).toHaveLength(1);
      expect((await loadScores('user1'))[0].correct).toBe(1);
      expect((await loadScores('user2'))[0].correct).toBe(3);
    });
  });
});
