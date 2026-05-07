import React, { createContext, useContext, useState } from 'react';

interface SettingsContextValue {
  testLength: number;
  setTestLength: (n: number) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  testLength: 20,
  setTestLength: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [testLength, setTestLength] = useState(20);
  return (
    <SettingsContext.Provider value={{ testLength, setTestLength }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
