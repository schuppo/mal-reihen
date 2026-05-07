import React, { createContext, useContext, useState } from 'react';

interface SettingsContextValue {
  testLength: number;
  setTestLength: (n: number) => void;
  questionTimer: number | null;
  setQuestionTimer: (n: number | null) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  testLength: 20,
  setTestLength: () => {},
  questionTimer: 10,
  setQuestionTimer: () => {},
});

interface SettingsProviderProps {
  children: React.ReactNode;
  initialTestLength?: number;
  initialQuestionTimer?: number | null;
}

export function SettingsProvider({
  children,
  initialTestLength = 20,
  initialQuestionTimer = 10,
}: SettingsProviderProps) {
  const [testLength, setTestLength] = useState(initialTestLength);
  const [questionTimer, setQuestionTimer] = useState<number | null>(initialQuestionTimer);
  return (
    <SettingsContext.Provider value={{ testLength, setTestLength, questionTimer, setQuestionTimer }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
