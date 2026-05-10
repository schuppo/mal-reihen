import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { SettingsProvider } from './context/SettingsContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import ResultScreen from './screens/ResultScreen';
import ScoreboardScreen from './screens/ScoreboardScreen';
import SettingsScreen from './screens/SettingsScreen';

function AppRoutes() {
  const { currentUser, isLoading, logout, saveSettings } = useUser();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F0EFFF' }}>
        <div style={{ fontSize: 40 }}>⏳</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    );
  }

  return (
    <SettingsProvider
      key={currentUser.id}
      initialTestLength={currentUser.settings.testLength}
      initialQuestionTimer={currentUser.settings.questionTimer}
      initialShowCorrectAnswer={currentUser.settings.showCorrectAnswer}
      initialLanguage={currentUser.settings.language}
      onSave={saveSettings}
    >
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/exercise" element={<ExerciseScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/scoreboard" element={<ScoreboardScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
