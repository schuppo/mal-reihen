import { renderHook, act } from '@testing-library/react';
import { useExercise } from './useExercise';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('useExercise – initial state', () => {
  it('starts with an empty input and no feedback', () => {
    const { result } = renderHook(() => useExercise('training'));
    expect(result.current.input).toBe('');
    expect(result.current.feedback).toBeNull();
    expect(result.current.done).toBe(false);
    expect(result.current.answered).toHaveLength(0);
  });

  it('generates a question with operands between 1 and 10', () => {
    const { result } = renderHook(() => useExercise('training'));
    const { a, b, answer } = result.current.current;
    expect(a).toBeGreaterThanOrEqual(1);
    expect(a).toBeLessThanOrEqual(10);
    expect(b).toBeGreaterThanOrEqual(1);
    expect(b).toBeLessThanOrEqual(10);
    expect(answer).toBe(a * b);
  });

  it('returns null progress in training mode', () => {
    const { result } = renderHook(() => useExercise('training'));
    expect(result.current.progress).toBeNull();
  });

  it('returns 0 progress at the start of test mode', () => {
    const { result } = renderHook(() => useExercise('test', 20));
    expect(result.current.progress).toBe(0);
  });
});

describe('useExercise – input', () => {
  it('appends digits to input', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.appendDigit('4'); });
    act(() => { result.current.appendDigit('2'); });
    expect(result.current.input).toBe('42');
  });

  it('caps input at 3 digits', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.appendDigit('1'); });
    act(() => { result.current.appendDigit('2'); });
    act(() => { result.current.appendDigit('3'); });
    act(() => { result.current.appendDigit('4'); });
    expect(result.current.input).toBe('123');
  });

  it('removes the last digit on backspace', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.appendDigit('7'); });
    act(() => { result.current.appendDigit('2'); });
    act(() => { result.current.backspace(); });
    expect(result.current.input).toBe('7');
  });

  it('does nothing on backspace when input is empty', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.backspace(); });
    expect(result.current.input).toBe('');
  });
});

describe('useExercise – submit (training mode)', () => {
  it('does not submit when input is empty', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.submit(); });
    expect(result.current.feedback).toBeNull();
    expect(result.current.answered).toHaveLength(0);
  });

  it('sets feedback to "correct" on a right answer', () => {
    const { result } = renderHook(() => useExercise('training'));
    const { answer } = result.current.current;
    act(() => { String(answer).split('').forEach(d => result.current.appendDigit(d)); });
    act(() => { result.current.submit(); });
    expect(result.current.feedback).toBe('correct');
    expect(result.current.answered[0].correct).toBe(true);
  });

  it('sets feedback to "wrong" on a wrong answer', () => {
    const { result } = renderHook(() => useExercise('training'));
    const wrong = result.current.current.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    expect(result.current.feedback).toBe('wrong');
    expect(result.current.answered[0].correct).toBe(false);
  });

  it('advances to a new question after 1200 ms in training mode', () => {
    const { result } = renderHook(() => useExercise('training'));
    const wrong = result.current.current.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    expect(result.current.feedback).toBe('wrong');
    act(() => { vi.advanceTimersByTime(1200); });
    expect(result.current.feedback).toBeNull();
    expect(result.current.input).toBe('');
  });

  it('ignores input and submit while feedback is showing', () => {
    const { result } = renderHook(() => useExercise('training'));
    const wrong = result.current.current.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    act(() => { result.current.appendDigit('9'); });
    expect(result.current.input).toBe(wrong);
  });
});

describe('useExercise – test mode', () => {
  it('increments progress with each answered question', () => {
    const testLength = 5;
    const { result } = renderHook(() => useExercise('test', testLength));
    const answerCurrent = () => {
      const { answer } = result.current.current;
      act(() => { String(answer).split('').forEach(d => result.current.appendDigit(d)); });
      act(() => { result.current.submit(); });
      act(() => { vi.advanceTimersByTime(800); });
    };
    answerCurrent();
    expect(result.current.progress).toBeCloseTo(1 / testLength);
  });

  it('marks done after testLength answers', () => {
    const testLength = 3;
    const { result } = renderHook(() => useExercise('test', testLength));
    for (let i = 0; i < testLength; i++) {
      const { answer } = result.current.current;
      act(() => { String(answer).split('').forEach(d => result.current.appendDigit(d)); });
      act(() => { result.current.submit(); });
      act(() => { vi.advanceTimersByTime(800); });
    }
    expect(result.current.done).toBe(true);
  });

  it('tracks correctCount accurately', () => {
    const testLength = 2;
    const { result } = renderHook(() => useExercise('test', testLength));
    act(() => { String(result.current.current.answer).split('').forEach(d => result.current.appendDigit(d)); });
    act(() => { result.current.submit(); });
    act(() => { vi.advanceTimersByTime(800); });
    const wrong = result.current.current.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    act(() => { vi.advanceTimersByTime(800); });
    expect(result.current.correctCount).toBe(1);
    expect(result.current.answered).toHaveLength(2);
  });
});

describe('useExercise – submitTimeout', () => {
  it('records a wrong answer even with empty input (training)', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.submitTimeout(); });
    expect(result.current.feedback).toBe('wrong');
    expect(result.current.answered).toHaveLength(1);
    expect(result.current.answered[0].correct).toBe(false);
    expect(result.current.answered[0].userAnswer).toBe(-1);
  });

  it('does nothing if feedback is already showing', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.submitTimeout(); });
    act(() => { result.current.submitTimeout(); });
    expect(result.current.answered).toHaveLength(1);
  });

  it('advances to next question after 1200 ms in training mode', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.submitTimeout(); });
    act(() => { vi.advanceTimersByTime(1200); });
    expect(result.current.feedback).toBeNull();
    expect(result.current.input).toBe('');
  });

  it('records wrong in test mode and advances after 800 ms', () => {
    const { result } = renderHook(() => useExercise('test', 3));
    act(() => { result.current.submitTimeout(); });
    expect(result.current.feedback).toBe('wrong');
    act(() => { vi.advanceTimersByTime(800); });
    expect(result.current.feedback).toBeNull();
    expect(result.current.answered).toHaveLength(1);
  });

  it('marks done after testLength timeouts in test mode', () => {
    const testLength = 2;
    const { result } = renderHook(() => useExercise('test', testLength));
    for (let i = 0; i < testLength; i++) {
      act(() => { result.current.submitTimeout(); });
      act(() => { vi.advanceTimersByTime(800); });
    }
    expect(result.current.done).toBe(true);
  });

  it('clears partial input after feedback clears', () => {
    const { result } = renderHook(() => useExercise('training'));
    act(() => { result.current.appendDigit('4'); });
    act(() => { result.current.submitTimeout(); });
    act(() => { vi.advanceTimersByTime(1200); });
    expect(result.current.input).toBe('');
  });
});

describe('useExercise – tableFilter', () => {
  it('generates questions only from selected table numbers', () => {
    const { result } = renderHook(() => useExercise('training', 20, [3, 7]));
    for (let i = 0; i < 20; i++) {
      expect([3, 7]).toContain(result.current.current.a);
      act(() => {
        result.current.appendDigit(String(result.current.current.answer));
        result.current.submit();
        vi.advanceTimersByTime(1200);
      });
    }
  });

  it('generates questions only from single selected table number', () => {
    const { result } = renderHook(() => useExercise('test', 5, [5]));
    for (let i = 0; i < 5; i++) {
      expect(result.current.current.a).toBe(5);
      act(() => {
        result.current.appendDigit(String(result.current.current.answer));
        result.current.submit();
        vi.advanceTimersByTime(800);
      });
    }
  });
});
