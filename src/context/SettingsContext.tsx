import React, { createContext, useContext, useState } from 'react';
import { Language } from '../i18n/translations';
import { UserSettings } from '../utils/users';

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
  /** Called after any setting changes so the caller can persist the new values. */
  onSave?: (settings: UserSettings) => void;
}

export function SettingsProvider({
  children,
  initialTestLength = 20,
  initialQuestionTimer = 10,
  initialShowCorrectAnswer = false,
  initialLanguage = 'de' as Language,
  onSave,
}: SettingsProviderProps) {
  const [testLength, _setTestLength] = useState(initialTestLength);
  const [questionTimer, _setQuestionTimer] = useState<number | null>(initialQuestionTimer);
  const [showCorrectAnswer, _setShowCorrectAnswer] = useState(initialShowCorrectAnswer);
  const [language, _setLanguage] = useState<Language>(initialLanguage);

  function notify(patch: Partial<UserSettings>) {
    onSave?.({
      testLength,
      questionTimer,
      showCorrectAnswer,
      language,
      ...patch,
    });
  }

  function setTestLength(n: number) { _setTestLength(n); notify({ testLength: n }); }
  function setQuestionTimer(n: number | null) { _setQuestionTimer(n); notify({ questionTimer: n }); }
  function setShowCorrectAnswer(v: boolean) { _setShowCorrectAnswer(v); notify({ showCorrectAnswer: v }); }
  function setLanguage(l: Language) { _setLanguage(l); notify({ language: l }); }

  return (
    <SettingsContext.Provider value={{ testLength, setTestLength, questionTimer, setQuestionTimer, showCorrectAnswer, setShowCorrectAnswer, language, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
