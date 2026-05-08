import React, { createContext, useContext, useState } from 'react';
import { Language } from '../i18n/translations';

interface SettingsContextValue {
  testLength: number;
  setTestLength: (n: number) => void;
  questionTimer: number | null;
  setQuestionTimer: (n: number | null) => void;
  showCorrectAnswer: boolean;
  setShowCorrectAnswer: (v: boolean) => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  testLength: 20,
  setTestLength: () => {},
  questionTimer: 10,
  setQuestionTimer: () => {},
  showCorrectAnswer: false,
  setShowCorrectAnswer: () => {},
  language: 'de',
  setLanguage: () => {},
});

interface SettingsProviderProps {
  children: React.ReactNode;
  initialTestLength?: number;
  initialQuestionTimer?: number | null;
  initialShowCorrectAnswer?: boolean;
  initialLanguage?: Language;
}

export function SettingsProvider({
  children,
  initialTestLength = 20,
  initialQuestionTimer = 10,
  initialShowCorrectAnswer = false,
  initialLanguage = 'de' as Language,
}: SettingsProviderProps) {
  const [testLength, setTestLength] = useState(initialTestLength);
  const [questionTimer, setQuestionTimer] = useState<number | null>(initialQuestionTimer);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(initialShowCorrectAnswer);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  return (
    <SettingsContext.Provider value={{ testLength, setTestLength, questionTimer, setQuestionTimer, showCorrectAnswer, setShowCorrectAnswer, language, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
