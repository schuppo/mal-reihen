# ✖️ Mal-Reihen

A mobile-first **Progressive Web App** for practising multiplication tables from 1×1 to 10×10, built with **Vite + React + TypeScript**. Designed with kids in mind. Installs to the home screen on iOS and Android — no app store required.

## Features

- **Multiple user accounts** — password-free login; each player has their own profile, settings, and score history
- **Training mode** — unlimited practice with instant right/wrong feedback, a running score, and **weighted question selection** (wrong answers appear more often; correct answers fade back). Finish early at any time to see your results.
- **Test mode** — configurable number of questions with a final results screen (score, grade, elapsed time, avg per question)
- **Multi-select table filter** — choose one, several, or all multipliers (1–10) directly on the home screen
- **Per-question timer** — optional countdown that auto-submits as wrong when time runs out
- **Scoreboard** — persistent session list (up to 50 entries) with grade, time, avg-per-question, and mistake stats
- **"Hier übe ich noch" panel** — top 5 most-missed question pairs ranked by urgency (red → orange → yellow), with a relative bar and miss count
- **Settings** — customise test length, question timer, whether wrong answers reveal the correct answer, and UI language (English / Deutsch)
- Custom numeric keypad for distraction-free input
- Hardware keyboard support (digits, Backspace, Enter)
- Shake animation on wrong answers, scale animation on correct ones
- Grade tier on results: 🥇 Perfect · 🥈 Great job · 🥉 Good effort · 📚 Keep practicing
- **Offline support** — Workbox service worker precaches all assets; works without a network connection after first load

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install & run

```bash
git clone <repo-url>
cd times-rows
npm install
npm run dev        # Dev server on http://localhost:8081
```

### Build

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
```

## Install as a PWA

**Android (Chrome):** Chrome shows a native "Add to Home Screen" banner automatically.

**iOS (Safari):** tap the Share button → "Add to Home Screen". The app then runs full-screen with no browser bar.

## Project Structure

```
times-rows/
  index.html
  vite.config.ts         Vite + vite-plugin-pwa (manifest + Workbox service worker)
  vitest.config.ts       Unit test config (jsdom, globals)
  playwright.config.ts   E2E test config
  src/
    main.tsx             Entry point
    App.tsx              BrowserRouter + UserProvider + SettingsProvider + Routes
    index.css            CSS reset, safe-area padding, animations
    context/
      UserContext.tsx    Auth state; login/register/logout/saveSettings/deleteAccount
      SettingsContext.tsx  Per-user settings (testLength, questionTimer, showCorrectAnswer, language)
    screens/
      LoginScreen.tsx    Password-free auth; account-list (login) + username form (register)
      HomeScreen.tsx     Multi-select table filter + mode cards; header: 🏅⚙️🚪
      ExerciseScreen.tsx Question UI with NumPad, timer bar, animations, Finish Training button
      ResultScreen.tsx   End-of-session summary; saves score + mistakes to scoreboard
      ScoreboardScreen.tsx  Session history + trouble-spots panel
      SettingsScreen.tsx Settings UI
    hooks/
      useExercise.ts     All game logic and weighted question selection
    components/
      NumPad.tsx         Digit-entry pad (0–9, ⌫, ✓)
    i18n/
      translations.ts    Bilingual strings (en/de); useTranslations(language) hook
    utils/
      users.ts           localStorage-backed user store; password-free auth
      scoreboard.ts      localStorage-backed score persistence; per-user keyed storage
      storage.ts         Async localStorage wrapper
  e2e/
    scroll.spec.ts       Cross-browser scroll regression tests
```

## Settings

Tap ⚙️ on the Home screen to open Settings.

| Setting | Default | Options |
|---|---|---|
| Test Length | 20 questions | 5, 10, 15, 20, 25, 30 |
| Question Timer | 10 s | Off, 5 s, 8 s, 10 s, 15 s, 20 s, 30 s |
| Show Correct Answer | Off | On / Off |
| Language | Deutsch | 🇬🇧 English / 🇩🇪 Deutsch |

## Tech Stack

| Library | Purpose |
|---|---|
| Vite + vite-plugin-pwa | Build tooling, PWA manifest & Workbox service worker |
| React 19 + TypeScript | UI |
| react-router-dom v7 | Client-side routing |
| localStorage | User, settings & scoreboard persistence (no backend) |

## Type Checking & Testing

```bash
npx tsc --noEmit        # TypeScript check
npm test -- --run       # Vitest unit tests (67 tests, CI mode)
npm run test:e2e        # Playwright e2e tests (Chromium, Firefox, WebKit + mobile)
```

### Unit test coverage

| File | Tests |
|---|---|
| `hooks/useExercise.test.ts` | 24 |
| `utils/users.test.ts` | 9 |
| `utils/scoreboard.test.ts` | 8 |
| `context/SettingsContext.test.tsx` | 12 |
| `context/UserContext.test.tsx` | 9 |
| `components/NumPad.test.tsx` | 5 |
| **Total** | **67** |

## Deploy

Push to `main` → GitHub Actions runs `npm ci` → `npm test -- --run` → `npm run build` → deploys `dist/` to GitHub Pages.
