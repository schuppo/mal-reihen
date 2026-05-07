
A mobile-first app for practising multiplication tables from 1×1 to 10×10, built with Expo and React Native. Runs on iOS, Android, and Web.

## Features

- **Training mode** — unlimited practice with instant right/wrong feedback and a running score
- **Test mode** — 20 timed questions with a final results screen (score + elapsed time)
- Custom numeric keypad for distraction-free input
- Shake animation on wrong answers, scale animation on correct ones

## Getting Started

### Prerequisites

- Node.js ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For iOS: Xcode + iOS Simulator

### Install

```bash
git clone <repo-url>
cd times-rows
npm install
```

### Run

```bash
npm start          # Start Metro bundler (scan QR with Expo Go)
npm run ios        # Launch iOS simulator
npm run web        # Open in browser
```

## Project Structure

```
App.tsx                      Navigation root & route type definitions
src/
  screens/
    HomeScreen.tsx           Mode selection (Training / Test)
    ExerciseScreen.tsx       Question UI with NumPad and animations
    ResultScreen.tsx         End-of-test summary
  hooks/
    useExercise.ts           All game logic and state
  components/
    NumPad.tsx               Digit-entry pad (0–9, ⌫, ✓)
```

## Tech Stack

| Library | Purpose |
|---|---|
| Expo 55 | Build tooling & native runtime |
| React Native 0.85 | Cross-platform UI |
| React Navigation (Stack) | Screen navigation |
| react-native-web | Browser support |

## Type Checking & Testing

```bash
npx tsc --noEmit
```

No test runner is configured yet — **TDD is mandatory**. Set up Jest + `@testing-library/react-hooks` before adding features that require new logic.
