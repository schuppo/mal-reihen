import React, { createContext, useContext, useState } from 'react';

interface SettingsContextValue {
  testLength: number;
  setTestLength: (n: number) => void;
  questionTimer: number | null;
  setQuestionTimer: (n: number | null) => void;
  showCorrectAnswer: boolean;
  setShowCorrectAnswer: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  testLength: 20,
  setTestLength: () => {},
  questionTimer: 10,
  setQuestionTimer: () => {},
  showCorrectAnswer: false,
  setShowCorrectAnswer: () => {},
});

interface SettingsProviderProps {
  children: React.ReactNode;
  initialTestLength?: number;
  initialQuestionTimer?: number | null;
  initialShowCorrectAnswer?: boolean;
}

export function SettingsProvider({
  children,
  initialTestLength = 20,
  initialQuestionTimer = 10,
  initialShowCorrectAnswer = false,
}: SettingsProviderProps) {
  const [testLength, setTestLength] = useState(initialTestLength);
  const [questionTimer, setQuestionTimer] = useState<number | null>(initialQuestionTimer);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(initialShowCorrectAnswer);
  return (
    <SettingsContext.Provider value={{ testLength, setTestLength, questionTimer, setQuestionTimer, showCorrectAnswer, setShowCorrectAnswer }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
