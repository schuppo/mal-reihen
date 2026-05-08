export type Language = 'en' | 'de';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  tapToBegin: string;
  trainingTitle: string;
  trainingDesc: string;
  testTitle: string;
  testDesc: (n: number) => string;
  chooseTable: string;
  chooseTableSubtitle: string;
  all: string;
  feedbackCorrect: string;
  feedbackWrong: string;
  feedbackWrongWithAnswer: (a: number, b: number, ans: number) => string;
  correctAnswers: string;
  score: string;
  time: string;
  mistakes: string;
  tryAgain: string;
  home: string;
  gradePerfect: string;
  gradeGreat: string;
  gradeGood: string;
  gradeKeep: string;
  settingsTestLength: string;
  settingsTestLengthDesc: string;
  settingsTestLengthHint: (n: number) => string;
  settingsTimer: string;
  settingsTimerDesc: string;
  settingsTimerOff: string;
  settingsTimerHintOff: string;
  settingsTimerHint: (s: number) => string;
  settingsShowCorrect: string;
  settingsShowCorrectDesc: string;
  settingsLanguage: string;
  settingsLanguageDesc: string;
  settingsLangEn: string;
  settingsLangDe: string;
  // ScoreboardScreen
  scoreboardTitle: string;
  scoreboardEmpty: string;
  scoreboardTimePerAnswer: string;
  scoreboardClearAll: string;
  scoreboardClearConfirm: string;
  scoreboardModeTest: string;
  scoreboardModeTraining: string;
  scoreboardTableAll: string;
  // Auth (LoginScreen / RegisterScreen)
  loginTitle: string;
  registerTitle: string;
  username: string;
  password: string;
  confirmPassword: string;
  loginButton: string;
  registerButton: string;
  goToRegister: string;
  goToLogin: string;
  errorUserNotFound: string;
  errorUsernameTaken: string;
  errorPasswordMismatch: string;
  errorUsernameEmpty: string;
  errorPasswordEmpty: string;
  logout: string;
  loggedInAs: (u: string) => string;
  deleteAccount: string;
  deleteAccountDesc: string;
  deleteAccountConfirm: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // HomeScreen
    appTitle: '✖️ Times Rows',
    appSubtitle: 'Master the multiplication tables\nfrom 1×1 to 10×10',
    tapToBegin: 'Tap a card to begin',
    trainingTitle: 'Training',
    trainingDesc: 'Practice at your own pace.\nInstant right/wrong feedback.',
    testTitle: 'Test',
    testDesc: (n: number) => `${n} questions, timed.\nGet your final score!`,

    // IntroScreen
    chooseTable: 'Choose a Table',
    chooseTableSubtitle: 'Practice one number or all at once',
    all: 'All',

    // ExerciseScreen
    feedbackCorrect: '🎉 Correct!',
    feedbackWrong: '❌ Wrong!',
    feedbackWrongWithAnswer: (a: number, b: number, ans: number) => `❌ ${a} × ${b} = ${ans}`,

    // ResultScreen
    correctAnswers: 'correct answers',
    score: 'Score',
    time: 'Time',
    mistakes: 'Mistakes',
    tryAgain: '🔁 Try Again',
    home: '🏠 Home',
    gradePerfect: 'Perfect!',
    gradeGreat: 'Great job!',
    gradeGood: 'Good effort!',
    gradeKeep: 'Keep practicing!',

    // SettingsScreen
    settingsTestLength: 'Test Length',
    settingsTestLengthDesc: 'How many questions per test?',
    settingsTestLengthHint: (n: number) => `Currently set to ${n} questions`,
    settingsTimer: 'Question Timer',
    settingsTimerDesc: 'Auto-submit as wrong when time runs out. Off = no limit.',
    settingsTimerOff: 'Off',
    settingsTimerHintOff: 'No time limit',
    settingsTimerHint: (s: number) => `Timer set to ${s} seconds per question`,
    settingsShowCorrect: 'Show Correct Answer',
    settingsShowCorrectDesc: 'Reveal the right answer when a wrong answer is given.',
    settingsLanguage: 'Language',
    settingsLanguageDesc: 'Choose the app language.',
    settingsLangEn: '🇬🇧 English',
    settingsLangDe: '🇩🇪 Deutsch',
    // ScoreboardScreen
    scoreboardTitle: '🏅 Scoreboard',
    scoreboardEmpty: 'No test results yet.\nComplete a test to see your scores here!',
    scoreboardTimePerAnswer: 'Time/Answer',
    scoreboardClearAll: 'Clear All',
    scoreboardClearConfirm: 'Are you sure you want to delete all scores?',
    scoreboardModeTest: '🏆 Test',
    scoreboardModeTraining: '🎓 Training',
    scoreboardTableAll: 'All',
    // Auth
    loginTitle: 'Welcome back',
    registerTitle: 'Create Account',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    loginButton: 'Login',
    registerButton: 'Create Account',
    goToRegister: "No account? Register",
    goToLogin: 'Already have an account? Login',
    errorUserNotFound: 'Username or password incorrect',
    errorUsernameTaken: 'Username already taken',
    errorPasswordMismatch: 'Passwords do not match',
    errorUsernameEmpty: 'Username cannot be empty',
    errorPasswordEmpty: 'Password cannot be empty',
    logout: 'Logout',
    loggedInAs: (u: string) => `👤 ${u}`,
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all scores.',
    deleteAccountConfirm: 'This will permanently delete your account and all your scores. This cannot be undone.',
  },
  de: {
    // HomeScreen
    appTitle: '✖️ Times Rows',
    appSubtitle: 'Lerne das kleine Einmaleins\nvon 1×1 bis 10×10',
    tapToBegin: 'Karte antippen zum Starten',
    trainingTitle: 'Training',
    trainingDesc: 'Übe in deinem eigenen Tempo.\nSofortiges Richtig/Falsch-Feedback.',
    testTitle: 'Test',
    testDesc: (n: number) => `${n} Fragen, mit Timer.\nMess dein Ergebnis!`,

    // IntroScreen
    chooseTable: 'Einmaleins wählen',
    chooseTableSubtitle: 'Übe eine Zahl oder alle auf einmal',
    all: 'Alle',

    // ExerciseScreen
    feedbackCorrect: '🎉 Richtig!',
    feedbackWrong: '❌ Falsch!',
    feedbackWrongWithAnswer: (a: number, b: number, ans: number) => `❌ ${a} × ${b} = ${ans}`,

    // ResultScreen
    correctAnswers: 'richtige Antworten',
    score: 'Ergebnis',
    time: 'Zeit',
    mistakes: 'Fehler',
    tryAgain: '🔁 Nochmal',
    home: '🏠 Home',
    gradePerfect: 'Perfekt!',
    gradeGreat: 'Super gemacht!',
    gradeGood: 'Gute Leistung!',
    gradeKeep: 'Weiter üben!',

    // SettingsScreen
    settingsTestLength: 'Testlänge',
    settingsTestLengthDesc: 'Wie viele Fragen pro Test?',
    settingsTestLengthHint: (n: number) => `Aktuell ${n} Fragen eingestellt`,
    settingsTimer: 'Fragentimer',
    settingsTimerDesc: 'Als falsch werten, wenn die Zeit abläuft. Aus = kein Limit.',
    settingsTimerOff: 'Aus',
    settingsTimerHintOff: 'Kein Zeitlimit',
    settingsTimerHint: (s: number) => `Timer auf ${s} Sekunden pro Frage eingestellt`,
    settingsShowCorrect: 'Richtige Antwort zeigen',
    settingsShowCorrectDesc: 'Zeige die richtige Antwort, wenn eine falsche Antwort gegeben wird.',
    settingsLanguage: 'Sprache',
    settingsLanguageDesc: 'App-Sprache auswählen.',
    settingsLangEn: '🇬🇧 English',
    settingsLangDe: '🇩🇪 Deutsch',
    // ScoreboardScreen
    scoreboardTitle: '🏅 Bestenliste',
    scoreboardEmpty: 'Noch keine Ergebnisse.\nMach einen Test, um Punkte zu sammeln!',
    scoreboardTimePerAnswer: 'Zeit/Frage',
    scoreboardClearAll: 'Alle löschen',
    scoreboardClearConfirm: 'Alle Ergebnisse wirklich löschen?',
    scoreboardModeTest: '🏆 Test',
    scoreboardModeTraining: '🎓 Training',
    scoreboardTableAll: 'Alle',
    // Auth
    loginTitle: 'Willkommen zurück',
    registerTitle: 'Konto erstellen',
    username: 'Benutzername',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    loginButton: 'Anmelden',
    registerButton: 'Konto erstellen',
    goToRegister: 'Kein Konto? Registrieren',
    goToLogin: 'Schon ein Konto? Anmelden',
    errorUserNotFound: 'Benutzername oder Passwort falsch',
    errorUsernameTaken: 'Benutzername bereits vergeben',
    errorPasswordMismatch: 'Passwörter stimmen nicht überein',
    errorUsernameEmpty: 'Benutzername darf nicht leer sein',
    errorPasswordEmpty: 'Passwort darf nicht leer sein',
    logout: 'Abmelden',
    loggedInAs: (u: string) => `👤 ${u}`,
    deleteAccount: 'Konto löschen',
    deleteAccountDesc: 'Konto und alle Ergebnisse dauerhaft löschen.',
    deleteAccountConfirm: 'Dein Konto und alle Ergebnisse werden dauerhaft gelöscht. Dies kann nicht rückgängig gemacht werden.',
  },
} as const;


export function useTranslations(language: Language): Translations {
  return translations[language];
}
