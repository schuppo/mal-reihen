# AGENTS.md — Times Rows

Expo + React Native app (targets iOS, Android, Web) for practising multiplication tables 1×1 to 10×10.

## Architecture

```
App.tsx              Navigation root; defines RootStackParamList type; wraps tree in GestureHandlerRootView, SafeAreaProvider & UserProvider; conditionally renders AuthNavigator or AppNavigator based on auth state
src/
  context/
    UserContext.tsx      Auth state (currentUser, isLoading); login/register/logout/saveSettings; session persistence via AsyncStorage 'activeUserId'; UserProvider & useUser hook
    SettingsContext.tsx  Per-user settings state (testLength, questionTimer, showCorrectAnswer, language); accepts initialXxx props and optional onSave callback for persistence; SettingsProvider keyed by userId in AppNavigator
  screens/
    LoginScreen.tsx  Combined login + register UI (toggle between modes); calls useUser(); no navigation prop needed — auth state change in UserContext triggers App.tsx re-render
    LoginScreen.test.tsx  Tests for auth form: rendering, error states, mode toggle, successful register
    HomeScreen.tsx   Entry point; shows logged-in username; table-filter picker (1–10 or All) + mode cards; navigates directly to Exercise; logout button in header (App.tsx)
    ExerciseScreen.tsx  Core game UI; consumes useExercise hook and SettingsContext; owns animations and per-question timer
    ExerciseScreen.test.tsx              Component tests for keyboard input (native & web) and question timer
    ExerciseScreen.showCorrectAnswer.test.tsx  Rendering tests for the showCorrectAnswer setting (mocks useExercise at module scope)
    ResultScreen.tsx    End-of-test summary (correct/total/time); grade(), formatTime() helpers; saves score via scoreboard util (scoped to currentUser.id)
    ScoreboardScreen.tsx  Persistent high-score list; loads/clears entries scoped to currentUser.id; uses useFocusEffect to reload on focus
    SettingsScreen.tsx  Settings UI: test length chips, question timer chips, show-correct-answer toggle, language picker
  hooks/
    useExercise.ts   All game logic (state machine, question gen, scoring, weighted training); exports Question & AnsweredQuestion interfaces
  components/
    NumPad.tsx       Reusable digit-entry pad; 4×3 layout [7,8,9 / 4,5,6 / 1,2,3 / ⌫,0,✓]
  i18n/
    translations.ts  Bilingual string table (en/de); Language type ('en' | 'de'); useTranslations(language) hook; includes auth strings (loginTitle, registerTitle, errorUserNotFound, etc.)
  utils/
    users.ts         AsyncStorage-backed user store (key 'users'); User interface; registerUser(), loginUser(), updateUserSettings(), session helpers (getSessionUserId/setSessionUserId/clearSession)
    users.test.ts    Tests for registerUser, loginUser, updateUserSettings, session helpers
    scoreboard.ts    AsyncStorage-backed score persistence; key 'scoreboard_{userId}' when userId provided, 'scoreboard' otherwise; ScoreEntry interface; loadScores(userId?), saveScore(entry, userId?), clearScores(userId?)
    scoreboard.test.ts  Tests for scoreboard utilities
```

**Data flow:** App starts → `UserProvider` restores session from AsyncStorage → if no session: `AuthNavigator` shows `LoginScreen` → after login/register: `AppNavigator` mounts with `SettingsProvider` keyed by `userId` (initialised from `currentUser.settings`) → `HomeScreen` (table filter + mode selection) → user picks table filter & mode → navigate `Exercise` with `{ mode, tableFilter }` → `useExercise` manages state → on test completion `navigation.replace('Result', { correct, total, timeSeconds, mode, tableFilter })` → `ResultScreen` saves score (scoped to `currentUser.id`) and offers replay or home.

**ResultScreen actions:** "Try Again" → `navigation.replace('Exercise', { mode: 'test', tableFilter })`;  "Home" → `navigation.popToTop()`.

**Header buttons:** Home screen shows 🏅 (Scoreboard), ⚙️ (Settings), and 🚪 (Logout) icons in the header right.

## Multi-User

The app supports multiple local user accounts. All user data is stored in AsyncStorage — there is no backend.

### User model (`src/utils/users.ts`)
```typescript
interface User {
  id: string;
  username: string;   // case-insensitive matching on login
  password: string;   // plaintext — local-only offline app
  settings: UserSettings;  // per-user copy of all settings
}
```
AsyncStorage keys:
- `'users'` — `User[]` array
- `'activeUserId'` — session persistence (restored on app restart)

### Auth flow
- `UserProvider` (in `App.tsx`) reads `activeUserId` on mount and hydrates `currentUser`.
- While loading, a full-screen `ActivityIndicator` is shown.
- `RootNavigator` renders `AuthNavigator` (Login screen only) when `currentUser === null`, or `AppNavigator` (full app) when a user is logged in.
- `LoginScreen` toggles between login and register modes inline. On success, `UserContext` sets `currentUser`; `RootNavigator` re-renders automatically.
- Logout (🚪 button in Home header) clears `currentUser` and removes `activeUserId` from storage.

### Per-user settings
- `SettingsProvider` in `AppNavigator` is **keyed by `currentUser.id`**, so it remounts fresh for each user with that user's saved settings as `initialXxx` props.
- The `onSave` callback on `SettingsProvider` calls `UserContext.saveSettings()`, which calls `updateUserSettings()` and also updates `currentUser` in state.
- No circular imports: `SettingsContext` ↔ `UserContext` never import each other; `App.tsx` wires them via props.

### Per-user scoreboard
- `loadScores(userId?)`, `saveScore(entry, userId?)`, `clearScores(userId?)` accept an optional `userId`.
- When provided, the storage key is `'scoreboard_{userId}'`; without it, falls back to `'scoreboard'` (backward compat).
- `ResultScreen` and `ScoreboardScreen` pass `currentUser?.id`.

## Key Conventions

- **Navigation types** live in `App.tsx` (`RootStackParamList` includes `Login`, `Home`, `Exercise`, `Result`, `Settings`, `Scoreboard`); screens import from `'../../App'`.
- **`Exercise` params:** `{ mode: 'training' | 'test'; tableFilter: number | 'all' }`. When `tableFilter` is a number, only questions involving that multiplier are generated.
- **`Result` params:** `{ correct, total, timeSeconds, mode, tableFilter }`.
- **All game logic** belongs in `useExercise.ts`, not in screens. Screens are pure presentation.
- **No navigation library** other than `@react-navigation/stack` — use `StackNavigationProp` / `RouteProp` for prop types.
- **Styles** use `StyleSheet.create` inline at the bottom of each file; no separate style files.
- **Brand colour** `#6C63FF` (purple) is used consistently across all files for primary accents; background colour is `#F0EFFF` (lavender).
- **i18n:** all user-facing strings come from `useTranslations(language)` (imported from `src/i18n/translations`). Screens read `language` from `useSettings()` and pass it to `useTranslations`. Never hardcode UI strings in screens.
- `testLength` comes from `SettingsContext` (default 20); `ExerciseScreen` reads it via `useSettings()` and passes it to `useExercise`.
- Input is capped at 3 digits in `useExercise.appendDigit`; answers range 1–100.
- Feedback auto-advances after 1200 ms (training) / 800 ms (test) via `setTimeout` inside `useExercise.submit`.
- **Training mode uses weighted question selection** — each `a×b` pair starts with weight 1. A wrong answer (or timeout) multiplies the weight by **3** (max 10), making it appear more often. A correct answer multiplies the weight by **0.5** (min 0.25), making it appear less often. `pickWeightedQuestion` draws the next question proportionally to these weights. Test mode always uses pure random selection.
- `NumPad` is disabled (`opacity: 0.4`, presses ignored) while feedback is showing.
- Animations (`shakeAnim`, `scaleAnim`) are owned by `ExerciseScreen`, not the hook. The animation `useEffect` skips the initial mount via an `isMounted` ref. Background colour also flashes green (`#E8FFF0`) on correct and red (`#FFE8E8`) on wrong.
- `ResultScreen` computes a grade tier via `grade(pct)`: 100% → 🥇 Perfect, ≥80% → 🥈 Great job, ≥60% → 🥉 Good effort, else → 📚 Keep practicing.
- **Keyboard input** is supported on all platforms:
  - **Web** — a `keydown` listener on `window` maps digit keys → `appendDigit`, `Backspace` → `backspace`, `Enter` → `submit`. Guarded by `typeof window !== 'undefined'` so it is safe in the Jest (Node) environment.
  - **Native (iOS/Android)** — a zero-size, invisible `TextInput` (`testID="hidden-keyboard-input"`, `showSoftInputOnFocus={false}`) stays focused and routes `onKeyPress` / `onSubmitEditing` to the same hook callbacks. Re-focused after each feedback cycle via a `useEffect` on `feedback`.
- **testIDs** used in `ExerciseScreen`: `input-display` (the digit input Text), `hidden-keyboard-input` (the invisible native TextInput), `feedback-text` (the feedback message Text).

## Settings

User-configurable settings live in `SettingsContext` and are edited via `SettingsScreen` (reachable via the ⚙️ button in the Home/Intro header).

| Setting | Type | Default | Effect |
|---|---|---|---|
| `testLength` | `number` | `20` | Number of questions in a test |
| `questionTimer` | `number \| null` | `10` | Seconds per question; `null` = no limit. On timeout `useExercise.submitTimeout()` is called, recording the question as wrong (`userAnswer: -1`) and advancing. |
| `showCorrectAnswer` | `boolean` | `false` | When `true`, wrong-answer feedback shows `❌ a × b = answer`; when `false` shows `❌ Wrong!`. Has no effect on correct-answer feedback (`🎉 Correct!`). |
| `language` | `'en' \| 'de'` | `'de'` | UI language; all strings resolved via `useTranslations(language)` |

### Per-question timer internals (`ExerciseScreen`)
- A `Animated.timing` bar drains left-to-right over `questionTimer` seconds inside the question card.
- A `timeLeft` countdown label (e.g. `10s`, `9s`, …) is shown in the bar; turns red in the last 30% of time.
- Both are hidden while feedback is showing.
- The timer effect depends on `[current, feedback, questionTimer]`; it is cancelled on cleanup and restarted for each new question.
- `submitTimeoutRef` (a `useRef` always pointing to the latest `submitTimeout`) is used inside the `setTimeout` so the callback always has access to current hook state regardless of closure age.

## Scoreboard

- `ScoreEntry` (defined in `src/utils/scoreboard.ts`) stores: `id`, `date` (ISO), `correct`, `total`, `timeSeconds`, `mode`, `tableFilter`.
- `ResultScreen` calls `saveScore()` after every completed test.
- `ScoreboardScreen` loads entries on focus (`useFocusEffect`) and displays them ranked by recency. Shows mode badge, table badge, grade colour, time/answer stat, and mistake count.
- Up to 50 entries are retained (oldest dropped automatically).
- "Clear All" uses `Alert` on native, an inline confirmation bar on web.

## Developer Workflows

```bash
npm start          # Start Expo dev server (Metro)
npm run ios        # Build & run on iOS simulator
npm run web        # Run in browser via react-native-web
npm test           # Run Jest test suite
```

TypeScript checking: `npx tsc --noEmit`.

### iOS build prerequisites

- Xcode with at least one iOS Simulator runtime installed (**Xcode → Settings → Platforms**). Without a runtime `npm run ios` fails with `No iOS devices available in Simulator.app`.
- If you see Swift compile errors in `ExpoReactNativeFactory.swift` or `EXReactRootViewFactory.mm`, the Pods are out of sync with `node_modules`. Fix with:
  ```bash
  cd ios && rm -rf Pods Podfile.lock && pod install
  ```

### EAS cloud builds (physical device)

Requires an **active paid Apple Developer Program membership** ($99/year). Without one `eas build` fails with a 403 "not associated with an active membership" error. See [developer.apple.com/enroll](https://developer.apple.com/enroll).

## Testing

**TDD is mandatory.** All new logic must be covered by tests written before or alongside implementation.

Jest is configured via `jest-expo` preset (see `package.json`). Tests use `@testing-library/react-native` — import `renderHook`, `render`, `fireEvent`, and `act` from there (not from `@testing-library/react-hooks`).

Hook tests live alongside their source: `src/hooks/useExercise.test.ts` is the reference example. Use `jest.useFakeTimers()` and `jest.advanceTimersByTime()` to test `setTimeout`-based auto-advance logic.

**Component tests** (`src/screens/ExerciseScreen.test.tsx`) cover UI-layer behaviour that cannot be tested via the hook alone (keyboard wiring, question timer). Key patterns:
- Wrap renders in `SettingsProvider` with `initialXxx` props to inject settings synchronously (including `initialLanguage`).
- Mock `navigation` and `route` directly — no need for a full navigator.
- Use `testID` props to query elements (`getByTestId`).
- When testing `submit()` (which schedules a `setTimeout`), call `jest.runAllTimers()` inside the same `act()` block to avoid `AggregateError` from React's act flush.
- For web keyboard tests, assign a `windowMock` object to `global.window` in `beforeEach` and restore in `afterEach`; dispatch synthetic events via the mock's `dispatchEvent`.

**Rendering tests** for presentation-only settings (e.g. `showCorrectAnswer`) live in a separate file (`ExerciseScreen.showCorrectAnswer.test.tsx`) where `jest.mock('../hooks/useExercise')` is declared at module scope. This freezes `feedback` at a specific value from mount, avoiding timer-flush constraints entirely.

**Context tests** (`src/context/SettingsContext.test.tsx`) verify defaults and all setters using `renderHook` with a `SettingsProvider` wrapper.

**User tests** (`src/utils/users.test.ts`) cover `registerUser`, `loginUser`, `updateUserSettings`, and session helpers with a mocked `AsyncStorage`.

**LoginScreen tests** (`src/screens/LoginScreen.test.tsx`) cover form rendering, error states, mode toggle, and successful registration — rendered inside `UserProvider` with a mocked `AsyncStorage`.

**Scoreboard tests** (`src/utils/scoreboard.test.ts`) cover `loadScores`, `saveScore`, and `clearScores` with a mocked `AsyncStorage`.

## Adding Features

- **New screen:** add route to `RootStackParamList` in `App.tsx`, register in the appropriate navigator (`AuthNavigator` or `AppNavigator`), create file under `src/screens/`.
- **New game logic:** extend `useExercise.ts`; expose via its return value.
- **New setting:** add field + setter to `SettingsContext` (including `initialXxx` prop on `SettingsProvider` and `UserSettings` in `users.ts`), add UI to `SettingsScreen`, consume in the relevant screen/hook, add tests to `SettingsContext.test.tsx` and the relevant screen test file.
- **New i18n string:** add the key + type to the `Translations` interface and both `en` and `de` entries in `translations.ts`.
- **Web-specific layout:** use `Platform.OS === 'web'` guard (see `HomeScreen` title fontSize).
- **Cross-platform keyboard shortcuts:** add new key bindings in the `keydown` handler in `ExerciseScreen` (web) and the `onKeyPress` handler on the hidden `TextInput` (native).
- **Adding a user field:** update the `User` interface in `users.ts`, update `registerUser` defaults, and update `UserContext.saveSettings` if the field is part of `UserSettings`.
