# AGENTS.md — Times Rows

Expo + React Native app (targets iOS, Android, Web) for practising multiplication tables 1×1 to 10×10.

## Architecture

```
App.tsx              Navigation root; defines RootStackParamList type; wraps tree in GestureHandlerRootView
src/
  screens/
    HomeScreen.tsx   Entry point; two cards route to Exercise with mode param
    ExerciseScreen.tsx  Core game UI; consumes useExercise hook; owns animations
    ExerciseScreen.test.tsx  Component tests for keyboard input (native & web)
    ResultScreen.tsx    End-of-test summary (correct/total/time); grade(), formatTime() helpers
  hooks/
    useExercise.ts   All game logic (state machine, question gen, scoring); exports Question & AnsweredQuestion interfaces
  components/
    NumPad.tsx       Reusable digit-entry pad; 4×3 layout [7,8,9 / 4,5,6 / 1,2,3 / ⌫,0,✓]
```

**Data flow:** `HomeScreen` → navigate `Exercise` with `{ mode: 'training' | 'test' }` → `useExercise` manages state → on test completion `navigation.replace('Result', { correct, total, timeSeconds })`.

**ResultScreen actions:** "Try Again" → `navigation.replace('Exercise', { mode: 'test' })`; "Home" → `navigation.popToTop()`.

## Key Conventions

- **Navigation types** live in `App.tsx` (`RootStackParamList`); screens import from `'../../App'`.
- **All game logic** belongs in `useExercise.ts`, not in screens. Screens are pure presentation.
- **No navigation library** other than `@react-navigation/stack` — use `StackNavigationProp` / `RouteProp` for prop types.
- **Styles** use `StyleSheet.create` inline at the bottom of each file; no separate style files.
- **Brand colour** `#6C63FF` (purple) is used consistently across all files for primary accents; background colour is `#F0EFFF` (lavender).
- `TEST_LENGTH = 20` is defined as a constant in `ExerciseScreen.tsx` and passed to `useExercise`.
- Input is capped at 3 digits in `useExercise.appendDigit`; answers range 1–100.
- Feedback auto-advances after 1200 ms (training) / 800 ms (test) via `setTimeout` inside `useExercise.submit`.
- `NumPad` is disabled (`opacity: 0.4`, presses ignored) while feedback is showing.
- Animations (`shakeAnim`, `scaleAnim`) are owned by `ExerciseScreen`, not the hook. Background colour also flashes green (`#E8FFF0`) on correct and red (`#FFE8E8`) on wrong.
- `ResultScreen` computes a grade tier via `grade(pct)`: 100% → 🥇 Perfect, ≥80% → 🥈 Great job, ≥60% → 🥉 Good effort, else → 📚 Keep practicing.
- **Keyboard input** is supported on all platforms:
  - **Web** — a `keydown` listener on `window` maps digit keys → `appendDigit`, `Backspace` → `backspace`, `Enter` → `submit`. Guarded by `typeof window !== 'undefined'` so it is safe in the Jest (Node) environment.
  - **Native (iOS/Android)** — a zero-size, invisible `TextInput` (`testID="hidden-keyboard-input"`, `showSoftInputOnFocus={false}`) stays focused and routes `onKeyPress` / `onSubmitEditing` to the same hook callbacks. Re-focused after each feedback cycle via a `useEffect` on `feedback`.
- **testIDs** used in `ExerciseScreen`: `input-display` (the digit input Text), `hidden-keyboard-input` (the invisible native TextInput).

## Developer Workflows

```bash
npm start          # Start Expo dev server (Metro)
npm run ios        # Build & run on iOS simulator
npm run web        # Run in browser via react-native-web
npm test           # Run Jest test suite
```

TypeScript checking: `npx tsc --noEmit`.

## Testing

**TDD is mandatory.** All new logic must be covered by tests written before or alongside implementation.

Jest is configured via `jest-expo` preset (see `package.json`). Tests use `@testing-library/react-native` — import `renderHook`, `render`, `fireEvent`, and `act` from there (not from `@testing-library/react-hooks`).

Hook tests live alongside their source: `src/hooks/useExercise.test.ts` is the reference example. Use `jest.useFakeTimers()` and `jest.advanceTimersByTime()` to test `setTimeout`-based auto-advance logic.

**Component tests** (`src/screens/ExerciseScreen.test.tsx`) cover UI-layer behaviour that cannot be tested via the hook alone (keyboard wiring). Key patterns:
- Mock `navigation` and `route` directly — no need for a full navigator.
- Use `testID` props to query elements (`getByTestId`).
- When testing `submit()` (which schedules a `setTimeout`), call `jest.runAllTimers()` inside the same `act()` block to avoid `AggregateError` from React's act flush.
- For web keyboard tests, assign a `windowMock` object to `global.window` in `beforeEach` and restore in `afterEach`; dispatch synthetic events via the mock's `dispatchEvent`.

## Adding Features

- **New screen:** add route to `RootStackParamList` in `App.tsx`, register in `Stack.Navigator`, create file under `src/screens/`.
- **New game logic:** extend `useExercise.ts`; expose via its return value.
- **Web-specific layout:** use `Platform.OS === 'web'` guard (see `HomeScreen` title fontSize).
- **Cross-platform keyboard shortcuts:** add new key bindings in the `keydown` handler in `ExerciseScreen` (web) and the `onKeyPress` handler on the hidden `TextInput` (native).
