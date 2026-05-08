/**
 * Tests for the showCorrectAnswer setting in ExerciseScreen.
 *
 * These live in a separate file so `jest.mock('../hooks/useExercise')` can be
 * declared at module scope, freezing feedback state at mount without fighting
 * React 18's timer-flush requirements.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ExerciseScreen from './ExerciseScreen';
import { SettingsProvider } from '../context/SettingsContext';

jest.useFakeTimers();

const MOCK_QUESTION = { a: 3, b: 4, answer: 12 };
const mockUseExercise = jest.fn();

jest.mock('../hooks/useExercise', () => ({
  useExercise: (...args: any[]) => mockUseExercise(...args),
}));

const mockNavigation = {
  replace: jest.fn(),
  popToTop: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

function makeRoute() {
  return { params: { mode: 'training' } } as any;
}

function setupHook(feedback: 'correct' | 'wrong' | null) {
  mockUseExercise.mockReturnValue({
    current: MOCK_QUESTION,
    input: feedback === 'wrong' ? '1' : '',
    feedback,
    answered: [],
    done: false,
    correctCount: 0,
    appendDigit: jest.fn(),
    backspace: jest.fn(),
    submit: jest.fn(),
    submitTimeout: jest.fn(),
    progress: null,
  });
}

function renderExercise(showCorrectAnswer: boolean) {
  return render(
    <SettingsProvider initialShowCorrectAnswer={showCorrectAnswer} initialLanguage="en">
      <ExerciseScreen navigation={mockNavigation} route={makeRoute()} />
    </SettingsProvider>,
  );
}

describe('ExerciseScreen – showCorrectAnswer setting', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('shows "❌ Wrong!" when setting is off and answer is wrong', () => {
    setupHook('wrong');
    const { getByTestId } = renderExercise(false);
    expect(getByTestId('feedback-text').props.children).toBe('❌ Wrong!');
  });

  it('shows the equation "❌ a × b = answer" when setting is on and answer is wrong', () => {
    setupHook('wrong');
    const { getByTestId } = renderExercise(true);
    expect(getByTestId('feedback-text').props.children).toBe('❌ 3 × 4 = 12');
  });

  it('shows "🎉 Correct!" on a correct answer when setting is off', () => {
    setupHook('correct');
    const { getByTestId } = renderExercise(false);
    expect(getByTestId('feedback-text').props.children).toBe('🎉 Correct!');
  });

  it('shows "🎉 Correct!" on a correct answer even when showCorrectAnswer is on', () => {
    setupHook('correct');
    const { getByTestId } = renderExercise(true);
    expect(getByTestId('feedback-text').props.children).toBe('🎉 Correct!');
  });

  it('renders no feedback-text node when feedback is null', () => {
    setupHook(null);
    const { queryByTestId } = renderExercise(true);
    expect(queryByTestId('feedback-text')).toBeNull();
  });
});
