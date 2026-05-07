import { renderHook, act } from '@testing-library/react-native';
import { useExercise } from './useExercise';

jest.useFakeTimers();

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
    act(() => {
      String(answer).split('').forEach(d => result.current.appendDigit(d));
    });
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
    const first = result.current.current;
    const wrong = first.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    expect(result.current.feedback).toBe('wrong');

    act(() => { jest.advanceTimersByTime(1200); });
    expect(result.current.feedback).toBeNull();
    expect(result.current.input).toBe('');
  });

  it('ignores input and submit while feedback is showing', () => {
    const { result } = renderHook(() => useExercise('training'));
    const wrong = result.current.current.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    // Try to type more while feedback is active
    act(() => { result.current.appendDigit('9'); });
    expect(result.current.input).toBe(wrong); // unchanged
  });
});

describe('useExercise – test mode', () => {
  it('increments progress with each answered question', () => {
    const testLength = 5;
    const { result } = renderHook(() => useExercise('test', testLength));

    const answerCurrent = () => {
      const { answer } = result.current.current;
      act(() => {
        String(answer).split('').forEach(d => result.current.appendDigit(d));
      });
      act(() => { result.current.submit(); });
      act(() => { jest.advanceTimersByTime(800); });
    };

    answerCurrent();
    expect(result.current.progress).toBeCloseTo(1 / testLength);
  });

  it('marks done after testLength answers', () => {
    const testLength = 3;
    const { result } = renderHook(() => useExercise('test', testLength));

    for (let i = 0; i < testLength; i++) {
      const { answer } = result.current.current;
      act(() => {
        String(answer).split('').forEach(d => result.current.appendDigit(d));
      });
      act(() => { result.current.submit(); });
      act(() => { jest.advanceTimersByTime(800); });
    }

    expect(result.current.done).toBe(true);
  });

  it('tracks correctCount accurately', () => {
    const testLength = 2;
    const { result } = renderHook(() => useExercise('test', testLength));

    // Answer first question correctly
    act(() => {
      String(result.current.current.answer).split('').forEach(d => result.current.appendDigit(d));
    });
    act(() => { result.current.submit(); });
    act(() => { jest.advanceTimersByTime(800); });

    // Answer second question wrongly
    const wrong = result.current.current.answer === 1 ? '2' : '1';
    act(() => { result.current.appendDigit(wrong); });
    act(() => { result.current.submit(); });
    act(() => { jest.advanceTimersByTime(800); });

    expect(result.current.correctCount).toBe(1);
    expect(result.current.answered).toHaveLength(2);
  });
});
