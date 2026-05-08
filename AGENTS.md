# AGENTS.md — Times Rows

Expo + React Native app (targets iOS, Android, Web) for practising multiplication tables 1×1 to 10×10.

## Architecture

```
App.tsx              Navigation root; defines RootStackParamList type; wraps tree in GestureHandlerRootView & SettingsProvider
src/
  context/
    SettingsContext.tsx  Global settings state (testLength, questionTimer, showCorrectAnswer); SettingsProvider accepts initialXxx props for tests
  screens/
    HomeScreen.tsx   Entry point; two cards route to Exercise with mode param; reads testLength from SettingsContext
    ExerciseScreen.tsx  Core game UI; consumes useExercise hook and SettingsContext; owns animations and per-question timer
    ExerciseScreen.test.tsx              Component tests for keyboard input (native & web) and question timer
    ExerciseScreen.showCorrectAnswer.test.tsx  Rendering tests for the showCorrectAnswer setting (mocks useExercise at module scope)
    ResultScreen.tsx    End-of-test summary (correct/total/time); grade(), formatTime() helpers
    SettingsScreen.tsx  Settings UI: test length chips, question timer chips, show-correct-answer toggle
  hooks/
    useExercise.ts   All game logic (state machine, question gen, scoring, weighted training); exports Question & AnsweredQuestion interfaces
  components/
    NumPad.tsx       Reusable digit-entry pad; 4×3 layout [7,8,9 / 4,5,6 / 1,2,3 / ⌫,0,✓]
```

**Data flow:** `HomeScreen` → navigate `Exercise` with `{ mode: 'training' | 'test' }` → `useExercise` manages state → on test completion `navigation.replace('Result', { correct, total, timeSeconds })`.

**ResultScreen actions:** "Try Again" → `navigation.replace('Exercise', { mode: 'test' })`; "Home" → `navigation.popToTop()`.

## Key Conventions

- **Navigation types** live in `App.tsx` (`RootStackParamList` includes `Home`, `Exercise`, `Result`, `Settings`); screens import from `'../../App'`.
- **All game logic** belongs in `useExercise.ts`, not in screens. Screens are pure presentation.
- **No navigation library** other than `@react-navigation/stack` — use `StackNavigationProp` / `RouteProp` for prop types.
- **Styles** use `StyleSheet.create` inline at the bottom of each file; no separate style files.
- **Brand colour** `#6C63FF` (purple) is used consistently across all files for primary accents; background colour is `#F0EFFF` (lavender).
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

User-configurable settings live in `SettingsContext` and are edited via `SettingsScreen` (reachable via the ⚙️ button in the Home header).

| Setting | Type | Default | Effect |
|---|---|---|---|
| `testLength` | `number` | `20` | Number of questions in a test |
| `questionTimer` | `number \| null` | `10` | Seconds per question; `null` = no limit. On timeout `useExercise.submitTimeout()` is called, recording the question as wrong (`userAnswer: -1`) and advancing. |
| `showCorrectAnswer` | `boolean` | `false` | When `true`, wrong-answer feedback shows `❌ a × b = answer`; when `false` shows `❌ Wrong!`. Has no effect on correct-answer feedback (`🎉 Correct!`). |

### Per-question timer internals (`ExerciseScreen`)
- A `Animated.timing` bar drains left-to-right over `questionTimer` seconds inside the question card.
- A `timeLeft` countdown label (e.g. `10s`, `9s`, …) is shown in the bar; turns red in the last 30% of time.
- Both are hidden while feedback is showing.
- The timer effect depends on `[current, feedback, questionTimer]`; it is cancelled on cleanup and restarted for each new question.
- `submitTimeoutRef` (a `useRef` always pointing to the latest `submitTimeout`) is used inside the `setTimeout` so the callback always has access to current hook state regardless of closure age.

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
- Wrap renders in `SettingsProvider` with `initialXxx` props to inject settings synchronously.
- Mock `navigation` and `route` directly — no need for a full navigator.
- Use `testID` props to query elements (`getByTestId`).
- When testing `submit()` (which schedules a `setTimeout`), call `jest.runAllTimers()` inside the same `act()` block to avoid `AggregateError` from React's act flush.
- For web keyboard tests, assign a `windowMock` object to `global.window` in `beforeEach` and restore in `afterEach`; dispatch synthetic events via the mock's `dispatchEvent`.

**Rendering tests** for presentation-only settings (e.g. `showCorrectAnswer`) live in a separate file (`ExerciseScreen.showCorrectAnswer.test.tsx`) where `jest.mock('../hooks/useExercise')` is declared at module scope. This freezes `feedback` at a specific value from mount, avoiding timer-flush constraints entirely.

**Context tests** (`src/context/SettingsContext.test.tsx`) verify defaults and all setters using `renderHook` with a `SettingsProvider` wrapper.

## Adding Features

- **New screen:** add route to `RootStackParamList` in `App.tsx`, register in `Stack.Navigator`, create file under `src/screens/`.
- **New game logic:** extend `useExercise.ts`; expose via its return value.
- **New setting:** add field + setter to `SettingsContext` (including `initialXxx` prop on `SettingsProvider`), add UI to `SettingsScreen`, consume in the relevant screen/hook, add tests to `SettingsContext.test.tsx` and the relevant screen test file.
- **Web-specific layout:** use `Platform.OS === 'web'` guard (see `HomeScreen` title fontSize).
- **Cross-platform keyboard shortcuts:** add new key bindings in the `keydown` handler in `ExerciseScreen` (web) and the `onKeyPress` handler on the hidden `TextInput` (native).
