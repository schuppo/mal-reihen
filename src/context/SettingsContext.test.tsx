import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { SettingsProvider, useSettings } from './SettingsContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext – defaults', () => {
  it('provides testLength default of 20', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.testLength).toBe(20);
  });

  it('provides questionTimer default of 10', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.questionTimer).toBe(10);
  });

  it('provides showCorrectAnswer default of false', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.showCorrectAnswer).toBe(false);
  });
});

describe('SettingsContext – setters', () => {
  it('updates testLength via setTestLength', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => { result.current.setTestLength(5); });
    expect(result.current.testLength).toBe(5);
  });

  it('updates questionTimer via setQuestionTimer', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => { result.current.setQuestionTimer(15); });
    expect(result.current.questionTimer).toBe(15);
  });

  it('can disable the timer by setting questionTimer to null', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => { result.current.setQuestionTimer(null); });
    expect(result.current.questionTimer).toBeNull();
  });

  it('can re-enable timer after it was disabled', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => { result.current.setQuestionTimer(null); });
    act(() => { result.current.setQuestionTimer(8); });
    expect(result.current.questionTimer).toBe(8);
  });

  it('enables showCorrectAnswer via setShowCorrectAnswer', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => { result.current.setShowCorrectAnswer(true); });
    expect(result.current.showCorrectAnswer).toBe(true);
  });

  it('disables showCorrectAnswer again after enabling', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => { result.current.setShowCorrectAnswer(true); });
    act(() => { result.current.setShowCorrectAnswer(false); });
    expect(result.current.showCorrectAnswer).toBe(false);
  });
});
