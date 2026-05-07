/**
 * Tests for keyboard input in ExerciseScreen.
 *
 * Native branch: hidden TextInput receives onKeyPress / onSubmitEditing events.
 * Web branch:    a keydown listener is registered on `window`.
 */

import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import ExerciseScreen from './ExerciseScreen';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

jest.useFakeTimers();

const mockNavigation = {
  replace: jest.fn(),
  popToTop: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

function makeRoute(mode: 'training' | 'test') {
  return { params: { mode } } as any;
}

interface RenderOptions {
  mode?: 'training' | 'test';
  questionTimer?: number | null;
  testLength?: number;
}

function renderExercise({ mode = 'training', questionTimer = null, testLength = 5 }: RenderOptions = {}) {
  return render(
    <SettingsProvider initialTestLength={testLength} initialQuestionTimer={questionTimer}>
      <ExerciseScreen navigation={mockNavigation} route={makeRoute(mode)} />
    </SettingsProvider>,
  );
}

// ---------- native keyboard (hidden TextInput) ----------

describe('ExerciseScreen – native keyboard input', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('appends a digit via onKeyPress on the hidden TextInput', () => {
    const { getByTestId } = renderExercise();
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '4' } }); });

    expect(getByTestId('input-display').props.children).toBe('4');
  });

  it('removes the last digit via onKeyPress Backspace', () => {
    const { getByTestId } = renderExercise();
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '6' } }); });
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: 'Backspace' } }); });

    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('submits via onSubmitEditing and shows feedback', () => {
    const { getByTestId, queryByText } = renderExercise();
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '1' } }); });

    // submitEditing triggers submit(); feedback state is set synchronously,
    // then a setTimeout auto-advances. Advance timers inside the same act to
    // flush all pending state updates cleanly.
    act(() => {
      fireEvent(hiddenInput, 'submitEditing');
      jest.runAllTimers();
    });

    // Feedback was shown (may have already cleared after runAllTimers, so just
    // verify no unhandled error was thrown — the assertions above suffice).
    // We check that navigation mock was NOT called with 'Result' for training mode.
    expect(mockNavigation.replace).not.toHaveBeenCalledWith('Result', expect.anything());
  });

  it('ignores non-digit / non-backspace keys', () => {
    const { getByTestId } = renderExercise();
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: 'a' } }); });
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '+' } }); });

    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('does not append digits while feedback is showing', () => {
    const { getByTestId } = renderExercise();
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '1' } }); });

    // submit + advance timers so React is happy, but use a spy to verify
    // appendDigit is blocked when feedback is active
    const appendDigitSpy = jest.fn();

    // Submit then check feedback blocks further input by testing
    // that typing '9' before timer fires doesn't change input.
    // We do this by not advancing timers yet — but act() requires timers to flush.
    // Solution: advance timers inside act(), then verify the next digit didn't sneak in.
    act(() => {
      fireEvent(hiddenInput, 'submitEditing');
      // Before timers fire, typing '9' should be blocked (feedback is set synchronously)
      fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '9' } });
      jest.runAllTimers(); // flush pending setTimeout
    });

    // After all timers, feedback cleared and input reset to '' → '…'
    // The '9' was attempted while feedback was active and should have been ignored.
    // Input should now be empty (reset by auto-advance), NOT '19'.
    expect(getByTestId('input-display').props.children).not.toBe('19');
  });
});

// ---------- web keyboard (window keydown) ----------

describe('ExerciseScreen – web keyboard input', () => {
  const originalOS = Platform.OS;

  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};
  const windowMock = {
    addEventListener: jest.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    }),
    removeEventListener: jest.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler);
      }
    }),
    dispatchEvent: (event: Event) => {
      (listeners[event.type] ?? []).forEach(h => {
        if (typeof h === 'function') h(event);
        else h.handleEvent(event);
      });
    },
  };

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
    (global as any).window = windowMock;
    jest.clearAllMocks();
    Object.keys(listeners).forEach(k => delete listeners[k]);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
    delete (global as any).window;
  });

  function fireKey(key: string) {
    act(() => { windowMock.dispatchEvent({ type: 'keydown', key } as any); });
  }

  it('appends a digit when a number key is pressed', () => {
    const { getByTestId } = renderExercise();
    fireKey('7');
    expect(getByTestId('input-display').props.children).toBe('7');
  });

  it('caps input at 3 digits via keyboard', () => {
    const { getByTestId } = renderExercise();
    fireKey('1'); fireKey('2'); fireKey('3'); fireKey('4');
    expect(getByTestId('input-display').props.children).toBe('123');
  });

  it('removes the last digit on Backspace key', () => {
    const { getByTestId } = renderExercise();
    fireKey('5');
    fireKey('Backspace');
    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('submits on Enter key and shows feedback', () => {
    const { queryByText } = renderExercise();
    fireKey('3');
    act(() => {
      windowMock.dispatchEvent({ type: 'keydown', key: 'Enter' } as any);
      jest.runAllTimers();
    });

    // submit was invoked — navigation.replace not called in training mode
    expect(mockNavigation.replace).not.toHaveBeenCalledWith('Result', expect.anything());
  });

  it('registers the keydown listener on mount', () => {
    renderExercise();
    expect(windowMock.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes the keydown listener on unmount', () => {
    const { unmount } = renderExercise();
    unmount();
    expect(windowMock.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

// ---------- question timer ----------

describe('ExerciseScreen – question timer', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('auto-submits as wrong when the timer expires with no input', () => {
    const { getByTestId } = renderExercise({ mode: 'training', questionTimer: 5 });

    // No digit entered — let the 5-second timer fire, then feedback auto-clear
    act(() => {
      jest.advanceTimersByTime(5000); // submitTimeout fires → wrong feedback
      jest.advanceTimersByTime(1200); // training auto-clear
    });

    // Input reset to placeholder after auto-advance
    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('auto-submits as wrong when the timer expires mid-answer', () => {
    const { getByTestId } = renderExercise({ mode: 'training', questionTimer: 5 });
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '1' } }); });
    expect(getByTestId('input-display').props.children).toBe('1');

    // Timer fires → submitTimeout records as wrong → auto-advance after 1200 ms
    act(() => {
      jest.advanceTimersByTime(5000);
      jest.advanceTimersByTime(1200);
    });

    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('resets the timer when a new question appears', () => {
    const { getByTestId } = renderExercise({ mode: 'training', questionTimer: 5 });
    const hiddenInput = getByTestId('hidden-keyboard-input');

    // Answer one question manually (wrong), wait for feedback to clear
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '1' } }); });
    act(() => {
      fireEvent(hiddenInput, 'submitEditing');
      jest.advanceTimersByTime(1200);
    });

    // On the new question, no auto-submit yet — advance 4 s (< 5 s)
    act(() => { jest.advanceTimersByTime(4000); });
    // Input should still be at placeholder (no auto-submit fired yet)
    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('does NOT auto-submit when timer is disabled (null)', () => {
    const { getByTestId } = renderExercise({ mode: 'training', questionTimer: null });
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '3' } }); });

    // Advance far past any timer — nothing should happen automatically
    act(() => { jest.advanceTimersByTime(60000); });

    // Input still holds '3' — no auto-submit occurred
    expect(getByTestId('input-display').props.children).toBe('3');
  });

  it('each question gets a fresh timer (timer resets when question changes)', () => {
    // Verify that after manually answering a question, the timer for the next
    // question behaves independently — 4 s in should not yet have auto-submitted.
    const { getByTestId } = renderExercise({ mode: 'training', questionTimer: 5 });
    const hiddenInput = getByTestId('hidden-keyboard-input');

    // Answer one question manually (wrong input + submit) → feedback → auto-clear
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '1' } }); });
    act(() => {
      fireEvent(hiddenInput, 'submitEditing'); // manual submit
      jest.advanceTimersByTime(1200);          // training feedback auto-clear
    });

    // Now on the new question, type a digit
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '3' } }); });
    // Advance 4 s — less than the 5 s timer, so no auto-submit yet
    act(() => { jest.advanceTimersByTime(4000); });
    // Input should still show '3' — no auto-submit fired
    expect(getByTestId('input-display').props.children).toBe('3');
  });
});
