# ✖️ Times Rows

A mobile-first app for practising multiplication tables from 1×1 to 10×10, built with Expo and React Native. Runs on iOS, Android, and Web.

## Features

- **Training mode** — unlimited practice with instant right/wrong feedback, a running score, and **weighted question selection** (wrong answers appear more often; correct answers fade back)
- **Test mode** — configurable number of questions with a final results screen (score, grade, elapsed time)
- **Per-question timer** — optional countdown that auto-submits as wrong when time runs out
- **Settings** — customise test length (5–30 questions), question timer (5–30 s or off), and whether wrong answers reveal the correct answer
- Custom numeric keypad for distraction-free input
- Hardware keyboard support on all platforms (digits, Backspace, Enter)
- Shake animation on wrong answers, scale animation on correct ones
- Grade tier on results: 🥇 Perfect · 🥈 Great job · 🥉 Good effort · 📚 Keep practicing

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
App.tsx                      Navigation root, route types, SettingsProvider
src/
  context/
    SettingsContext.tsx       Global settings state (testLength, questionTimer, showCorrectAnswer)
  screens/
    HomeScreen.tsx           Mode selection (Training / Test)
    ExerciseScreen.tsx       Question UI with NumPad, timer bar, and animations
    ResultScreen.tsx         End-of-test summary with grade
    SettingsScreen.tsx       Settings UI (chips + toggle)
  hooks/
    useExercise.ts           All game logic, state, and weighted question selection (training)
  components/
    NumPad.tsx               Digit-entry pad (0–9, ⌫, ✓)
```

## Settings

Tap ⚙️ on the Home screen to open Settings.

| Setting | Default | Options |
|---|---|---|
| Test Length | 20 questions | 5, 10, 15, 20, 25, 30 |
| Question Timer | 10 s | Off, 5 s, 8 s, 10 s, 15 s, 20 s, 30 s |
| Show Correct Answer | Off | On / Off |

## How To: Install on a Physical iOS Device

You have two options — Expo Go (quick, no Apple account required) or a native build (runs standalone, no Expo Go needed).

### Option A — Expo Go (easiest)

> ⚠️ **SDK mismatch gotcha:** This project uses **Expo SDK 55**. Expo Go on the App Store may ship with an older SDK and show a *"Download the latest version of Expo Go"* error even after updating. If that happens, skip to Option B — a development build is the most reliable path for SDK 55+.

1. Install **Expo Go** from the App Store on your iPhone.
2. Start the dev server on your computer:
   ```bash
   npm start
   ```
3. Open the Camera app (or the built-in QR scanner in Expo Go) and scan the QR code shown in the terminal.
4. The app opens immediately in Expo Go. Your phone and computer must be on the **same Wi-Fi network**.

### Option B — Standalone build with EAS (no Expo Go needed)

This creates a proper `.ipa` that installs directly on your device via TestFlight or direct sideloading.

**Prerequisites**
- An [Apple Developer account](https://developer.apple.com) (free account works for sideloading; paid account required for TestFlight)
- Xcode installed on your Mac
- EAS CLI: `npm install -g eas-cli`

**Steps**

1. Log in to your Expo account:
   ```bash
   eas login
   ```
2. Configure the build (first time only):
   ```bash
   eas build:configure
   ```
3. Register your device (adds its UDID to your provisioning profile):
   ```bash
   eas device:create
   ```
4. Build a development or ad-hoc distribution build:
   ```bash
   eas build --platform ios --profile development
   ```
5. Once the build finishes, EAS provides a QR code / link. Open it on your iPhone to install via the built-in installer.

> **Tip:** For a quick local build without EAS Cloud, run `npm run ios` and choose your connected physical device as the target in the Xcode scheme selector.

## Tech Stack

| Library | Purpose |
|---|---|
| Expo 55 | Build tooling & native runtime |
| React Native 0.85 | Cross-platform UI |
| React Navigation (Stack) | Screen navigation |
| react-native-web | Browser support |

## Type Checking & Testing

```bash
npx tsc --noEmit   # TypeScript check
npm test           # Jest test suite
```

Tests use `@testing-library/react-native` with `jest-expo`. Coverage includes hook logic (`useExercise.test.ts`), component behaviour (`ExerciseScreen.test.tsx`), rendering of settings (`ExerciseScreen.showCorrectAnswer.test.tsx`), and context state (`SettingsContext.test.tsx`).
