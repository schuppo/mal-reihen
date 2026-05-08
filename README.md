# ✖️ Times Rows

A mobile-first app for practising multiplication tables from 1×1 to 10×10, built with Expo and React Native. Runs on iOS, Android, and Web.

## Features

- **Training mode** — unlimited practice with instant right/wrong feedback, a running score, and **weighted question selection** (wrong answers appear more often; correct answers fade back)
- **Test mode** — configurable number of questions with a final results screen (score, grade, elapsed time)
- **Table filter** — pick a single multiplier (1–10) or all tables directly on the home screen
- **Per-question timer** — optional countdown that auto-submits as wrong when time runs out
- **Scoreboard** — persistent high-score list (up to 50 entries) with grade, time, and mistake stats
- **Settings** — customise test length, question timer, whether wrong answers reveal the correct answer, and UI language (English / Deutsch)
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
    SettingsContext.tsx       Global settings state (testLength, questionTimer, showCorrectAnswer, language)
  screens/
    HomeScreen.tsx           App entry point; table-filter picker + mode cards; links to Scoreboard, Settings
    ExerciseScreen.tsx       Question UI with NumPad, timer bar, and animations
    ResultScreen.tsx         End-of-test summary with grade; saves score to scoreboard
    ScoreboardScreen.tsx     Persistent high-score list (ranked by recency)
    SettingsScreen.tsx       Settings UI (chips + toggle + language picker)
  hooks/
    useExercise.ts           All game logic, state, and weighted question selection (training)
  components/
    NumPad.tsx               Digit-entry pad (0–9, ⌫, ✓)
  i18n/
    translations.ts          Bilingual strings (en/de); useTranslations(language) hook
  utils/
    scoreboard.ts            AsyncStorage-backed score persistence
```

## Settings

Tap ⚙️ on the Home or Intro screen to open Settings.

| Setting | Default | Options |
|---|---|---|
| Test Length | 20 questions | 5, 10, 15, 20, 25, 30 |
| Question Timer | 10 s | Off, 5 s, 8 s, 10 s, 15 s, 20 s, 30 s |
| Show Correct Answer | Off | On / Off |
| Language | Deutsch | 🇬🇧 English / 🇩🇪 Deutsch |

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

> ⚠️ **Apple Developer membership required.** EAS cloud builds require an **active paid Apple Developer Program membership** ($99/year). If your account does not have an active membership, `eas build` will fail with a 403 error. Sign up at [developer.apple.com/enroll](https://developer.apple.com/enroll).

**Prerequisites**
- An active [Apple Developer Program membership](https://developer.apple.com/enroll) (paid, $99/year)
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

### Troubleshooting iOS builds

**`No iOS devices available in Simulator.app`**
No simulator runtime is installed. Open **Xcode → Settings → Platforms** and download an iOS runtime (e.g. iOS 18, ~7 GB), then re-run `npm run ios`.

**Swift compile errors in `ExpoReactNativeFactory.swift` or `EXReactRootViewFactory.mm`**
The `ios/Pods` directory is out of sync with `node_modules`. Delete and regenerate:
```bash
cd ios && rm -rf Pods Podfile.lock && pod install
```
Then run `npm run ios` again.

## Tech Stack

| Library | Purpose |
|---|---|
| Expo 55 | Build tooling & native runtime |
| React Native 0.83 | Cross-platform UI |
| React Navigation (Stack) | Screen navigation |
| react-native-web | Browser support |
| AsyncStorage | Scoreboard persistence |

## Type Checking & Testing

```bash
npx tsc --noEmit   # TypeScript check
npm test           # Jest test suite
```

Tests use `@testing-library/react-native` with `jest-expo`. Coverage includes hook logic (`useExercise.test.ts`), component behaviour (`ExerciseScreen.test.tsx`), rendering of settings (`ExerciseScreen.showCorrectAnswer.test.tsx`), context state (`SettingsContext.test.tsx`), and scoreboard utilities (`scoreboard.test.ts`).
