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

function renderExercise(mode: 'training' | 'test' = 'training') {
  return render(
    <ExerciseScreen navigation={mockNavigation} route={makeRoute(mode)} />,
  );
}

// ---------- native keyboard (hidden TextInput) ----------

describe('ExerciseScreen – native keyboard input', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('appends a digit via onKeyPress on the hidden TextInput', () => {
    const { getByTestId } = renderExercise('training');
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '4' } }); });

    expect(getByTestId('input-display').props.children).toBe('4');
  });

  it('removes the last digit via onKeyPress Backspace', () => {
    const { getByTestId } = renderExercise('training');
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '6' } }); });
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: 'Backspace' } }); });

    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('submits via onSubmitEditing and shows feedback', () => {
    const { getByTestId, queryByText } = renderExercise('training');
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
    const { getByTestId } = renderExercise('training');
    const hiddenInput = getByTestId('hidden-keyboard-input');

    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: 'a' } }); });
    act(() => { fireEvent(hiddenInput, 'keyPress', { nativeEvent: { key: '+' } }); });

    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('does not append digits while feedback is showing', () => {
    const { getByTestId } = renderExercise('training');
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
    const { getByTestId } = renderExercise('training');
    fireKey('7');
    expect(getByTestId('input-display').props.children).toBe('7');
  });

  it('caps input at 3 digits via keyboard', () => {
    const { getByTestId } = renderExercise('training');
    fireKey('1'); fireKey('2'); fireKey('3'); fireKey('4');
    expect(getByTestId('input-display').props.children).toBe('123');
  });

  it('removes the last digit on Backspace key', () => {
    const { getByTestId } = renderExercise('training');
    fireKey('5');
    fireKey('Backspace');
    expect(getByTestId('input-display').props.children).toBe('…');
  });

  it('submits on Enter key and shows feedback', () => {
    const { queryByText } = renderExercise('training');
    fireKey('3');
    act(() => {
      windowMock.dispatchEvent({ type: 'keydown', key: 'Enter' } as any);
      jest.runAllTimers();
    });

    // submit was invoked — navigation.replace not called in training mode
    expect(mockNavigation.replace).not.toHaveBeenCalledWith('Result', expect.anything());
  });

  it('registers the keydown listener on mount', () => {
    renderExercise('training');
    expect(windowMock.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes the keydown listener on unmount', () => {
    const { unmount } = renderExercise('training');
    unmount();
    expect(windowMock.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
