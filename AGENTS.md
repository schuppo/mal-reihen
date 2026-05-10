# AGENTS.md — Mal-Reihen

Mobile-first **Progressive Web App** (PWA) for practising multiplication tables 1×1 to 10×10. Built with **Vite + React + TypeScript** — no React Native, no Expo, no react-native-web.

Installs to the home screen on iOS and Android via "Add to Home Screen" / Chrome's native install prompt, and runs full-screen (no browser bar) thanks to `"display": "standalone"` in the PWA manifest.

## Repository layout

```
times-rows/              ← Repo root; all active development happens here
  index.html
  vite.config.ts         Vite + vite-plugin-pwa; generates manifest.webmanifest + Workbox service worker
  vitest.config.ts       Vitest unit test config (environment: jsdom, globals: true)
  playwright.config.ts   Cross-browser e2e config; auto-starts Vite dev server on port 8081
  tsconfig.json
  package.json
  AGENTS.md
  public/
    icon-192.png         PWA icon (192×192)
    icon-512.png         PWA icon (512×512, maskable)
    apple-touch-icon.png iOS home-screen icon (180×180)
    favicon.ico
  src/
    main.tsx             ReactDOM.createRoot entry point
    App.tsx              BrowserRouter + UserProvider + SettingsProvider + Routes
    index.css            CSS reset, safe-area padding, shake/pop keyframe animations
    test-setup.ts        In-memory localStorage polyfill for Vitest (jsdom)
    utils/
      storage.ts         Async localStorage wrapper (drop-in replacement for AsyncStorage)
      users.ts           localStorage-backed user store; registerUser, loginUser, session helpers
      users.test.ts
      scoreboard.ts      localStorage-backed score persistence (key: scoreboard_{userId})
      scoreboard.test.ts
    i18n/
      translations.ts    Bilingual string table (en/de); useTranslations(language) hook
    hooks/
      useExercise.ts     All game logic (pure React, no platform deps)
      useExercise.test.ts
    context/
      UserContext.tsx        Auth state; UserProvider & useUser hook
      UserContext.test.tsx
      SettingsContext.tsx    Per-user settings; SettingsProvider & useSettings hook
      SettingsContext.test.tsx
    components/
      NumPad.tsx         Digit-entry pad (plain HTML buttons); 4×3 layout [7,8,9/4,5,6/1,2,3/⌫,0,✓]
      NumPad.test.tsx
    screens/
      LoginScreen.tsx        Password-free auth; account list (tap to login) + register mode
      HomeScreen.tsx         Table filter + mode cards (Training / Test); header with 🏅⚙️🚪
      ExerciseScreen.tsx     Core game UI; keyboard handler; CSS animations; question timer
      ResultScreen.tsx       End-of-session summary; grade(); saves score to scoreboard
      ScoreboardScreen.tsx   Trouble-spots panel + session history; loads on mount
      SettingsScreen.tsx     Settings UI: test length, timer, show-correct-answer, language, delete
  e2e/
    scroll.spec.ts       Cross-browser scroll regression tests (Chromium, WebKit, Mobile Chrome)

.github/workflows/
  deploy.yml             CI: install → unit tests → vite build → deploy to GitHub Pages
```

**Data flow:** App starts → `UserProvider` restores session from `localStorage` → if no session: `LoginScreen` → after login/register: `SettingsProvider` mounts (keyed by `userId`) → `HomeScreen` (table filter + mode) → `navigate('/exercise', { state: { mode, tableFilter } })` → `ExerciseScreen` → on completion/finish: `navigate('/result', { replace: true, state: { ... } })` → `ResultScreen` saves score and offers replay or home.

**Routing** uses `react-router-dom` v7 (`BrowserRouter` + `Routes`/`Route`). Screen params are passed via `navigate(path, { state })` and read with `useLocation().state`. No type-safe param list — screens guard missing state with `if (!params) return <Navigate to="/" replace />`.

**Header buttons:** `HomeScreen` renders 🏅 (Scoreboard), ⚙️ (Settings), 🚪 (Logout) inline in its own header bar (no navigation library header).

## PWA

`vite-plugin-pwa` (in `vite.config.ts`) generates:
- `manifest.webmanifest` — `display: standalone`, `theme_color: #6C63FF`, `background_color: #F0EFFF`, portrait orientation, 192 + 512 icons
- `sw.js` + `workbox-*.js` — Workbox service worker; precaches all static assets for offline use
- `registerSW.js` — auto-registers the service worker on load (`registerType: 'autoUpdate'`)

`index.html` includes `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, and `apple-touch-icon` for iOS.

**Install:** Android Chrome shows a native install banner automatically. iOS: Safari → Share → "Add to Home Screen".

## Multi-User

All user data lives in `localStorage` — there is no backend.

### User model (`src/utils/users.ts`)
```typescript
interface User {
  id: string;
  username: string;   // case-insensitive matching on login
  settings: UserSettings;
}
```
`localStorage` keys:
- `'users'` — `User[]` array
- `'activeUserId'` — session persistence (restored on page load)

### Auth flow
- **No password required.** Login is username-only.
- `LoginScreen` in **login mode** loads all stored accounts on mount and displays each as a tappable row.
- **Register mode** shows a username `<input>` + submit button. Successful registration logs the user in immediately.
- `UserProvider` reads `activeUserId` from `localStorage` on mount and hydrates `currentUser`.
- While loading, a spinner (`⏳`) is shown. `App.tsx` renders `<LoginScreen />` for all routes when `currentUser === null`.
- Logout clears `currentUser` state and removes `activeUserId` from storage.

### Per-user settings
- `SettingsProvider` is **keyed by `currentUser.id`** so it remounts fresh for each user.
- The `onSave` callback on `SettingsProvider` calls `UserContext.saveSettings()`, which persists to `localStorage` and updates `currentUser` in state.

### Per-user scoreboard
- `loadScores(userId?)`, `saveScore(entry, userId?)`, `clearScores(userId?)` scope storage to `scoreboard_{userId}`.

## Key Conventions

- **All game logic** belongs in `useExercise.ts`, not in screens. Screens are pure presentation.
- **Styles** are inline JS objects (`style={{ ... }}`); no CSS modules, no separate style files.
- **Brand colour** `#6C63FF` (purple) for primary accents; background `#F0EFFF` (lavender).
- **i18n:** all user-facing strings come from `useTranslations(language)` (from `src/i18n/translations`). Screens read `language` from `useSettings()`. Never hardcode UI strings in screens.
- `testLength` comes from `SettingsContext` (default 20); `ExerciseScreen` reads it via `useSettings()` and passes it to `useExercise`.
- Input is capped at 3 digits in `useExercise.appendDigit`; answers range 1–100.
- Feedback auto-advances after 1200 ms (training) / 800 ms (test) via `setTimeout` inside `useExercise.submit`.
- **Training mode uses weighted question selection** — each `a×b` pair starts at weight 1. Wrong/timeout → weight ×3 (max 10). Correct → weight ×0.5 (min 0.25). Test mode always uses pure random selection.
- `NumPad` is disabled (`opacity: 0.4`, clicks ignored) while feedback is showing.
- **Animations** in `ExerciseScreen`: CSS class `anim-shake` (wrong answer), `anim-pop` (correct answer), defined in `index.css`. Background colour transitions green/red/lavender via inline `style` on the container. The `isMounted` ref skips the initial effect run.
- **Question timer:** a `<div>` width transitions from 100% → 0% over `questionTimer` seconds. A `setInterval` drives the `timeLeft` countdown label. `submitTimeoutRef` (`useRef` pointing at latest `submitTimeout`) is called from the `setTimeout` to avoid stale closure issues.
- **Keyboard input** — a `keydown` listener on `window` maps digit keys → `appendDigit`, `Backspace` → `backspace`, `Enter` → `submit`. Added in `useEffect` with cleanup.
- **`data-testid`** props used in `ExerciseScreen`: `input-display`, `feedback-text`, `finish-training-btn`.

## Settings

| Setting | Type | Default | Effect |
|---|---|---|---|
| `testLength` | `number` | `20` | Number of questions in a test |
| `questionTimer` | `number \| null` | `10` | Seconds per question; `null` = no limit |
| `showCorrectAnswer` | `boolean` | `false` | Shows `❌ a × b = answer` on wrong; otherwise `❌ Wrong!` |
| `language` | `'en' \| 'de'` | `'de'` | UI language |

## Scoreboard

- `ScoreEntry` stores: `id`, `date` (ISO), `correct`, `total`, `timeSeconds`, `mode`, `tableFilter`, `mistakes?` (`{ a, b }[]`), `timings?` (`number[]` — seconds per question).
- `ResultScreen` calls `saveScore()` after every completed session.
- `ScoreboardScreen` displays:
  - **Trouble-spots panel** — top 5 most-missed pairs, ranked by error count; coloured urgency circles, relative bar, error count badge.
  - **Session history** — ranked by recency; mode badge, table badge, grade colour, time/avg-per-answer, mistake count, min/median/max timing stats.
- Up to 50 entries retained (oldest dropped).
- "Clear All" uses an inline confirmation bar (no `window.confirm`).

## Training mode — Finish Early

After at least one answer in training mode, a **"Finish Training"** button appears. Pressing it navigates to `ResultScreen` with `total = answered.length` and the partial mistake list.

## Table Filter (Multi-Select)

- "All" chip resets to `'all'`. Tapping a number chip toggles it. Deselecting the last number resets to `'all'`.
- `tableFilter` is typed as `number[] | 'all'` throughout (route state, `ScoreEntry`, `useExercise`).

## Developer Workflows

Run everything from the repo root:

```bash
npm run dev            # Start Vite dev server on port 8081 (hot reload)
npm test               # Run Vitest unit tests (watch mode)
npm test -- --run      # Run Vitest once (CI mode)
npm run build          # Production build → dist/
npm run preview        # Preview production build locally

npm run test:e2e       # Run Playwright e2e tests (headless, all browsers)
npm run test:e2e:ui    # Playwright interactive UI mode
npm run test:e2e:report  # Open last Playwright HTML report
```

TypeScript checking: `npx tsc --noEmit`.

**Deploy:** push to `main` → GitHub Actions runs `npm ci` → `npm test -- --run` → `npm run build` → deploys `dist/` to GitHub Pages.

## Testing

**TDD is mandatory.** All new logic must be covered by tests written before or alongside implementation.

Vitest is configured via `vitest.config.ts` (`environment: jsdom`, `globals: true`). Tests use `@testing-library/react` — import `renderHook`, `render`, `fireEvent`, `screen`, and `act` from there.

**localStorage** is polyfilled in `src/test-setup.ts` with an in-memory implementation (needed because Node.js v26 ships an experimental, non-functional `localStorage` that shadows jsdom's). `localStorage.clear()` is called in `beforeEach`.

**Timer tests** use `vi.useFakeTimers()` / `vi.advanceTimersByTime()`. Declare in `beforeEach`/`afterEach` pairs.

**Hook tests** (`src/hooks/useExercise.test.ts`) are the reference example — use `renderHook` + `act` + fake timers.

**Context tests** use `renderHook` with a Provider wrapper. `SettingsContext.test.tsx` verifies defaults, setters, and `onSave`. `UserContext.test.tsx` covers register, login, logout, saveSettings, deleteAccount, session restore.

**Component tests** (`NumPad.test.tsx`) use `render` + `fireEvent.click` + `screen.getByText`.

**Util tests** (`users.test.ts`, `scoreboard.test.ts`) call the async functions directly against the in-memory localStorage mock — no AsyncStorage mock needed.

### Test counts (current)
| File | Tests |
|---|---|
| `hooks/useExercise.test.ts` | 24 |
| `utils/users.test.ts` | 9 |
| `utils/scoreboard.test.ts` | 8 |
| `context/SettingsContext.test.tsx` | 12 |
| `context/UserContext.test.tsx` | 9 |
| `components/NumPad.test.tsx` | 5 |
| **Total** | **67** |

## E2E / Cross-Browser Testing (Playwright)

Config: `playwright.config.ts` — targets **Chromium**, **Firefox**, **WebKit**, plus mobile viewports (Pixel 5, iPhone 12). Vite dev server starts automatically on port 8081 (`reuseExistingServer: true`).

### E2E test files

| File | What it covers |
|---|---|
| `e2e/scroll.spec.ts` | Mouse-wheel scroll, keyboard Arrow-Down scroll, CSS overflow audit |

### Key patterns

- **CSS overflow audit** — flags elements where `scrollHeight > clientHeight` but `overflow` is `hidden`. No longer a problem since we use native HTML `overflowY: auto` — the test acts as a regression guard.
- **Mouse-wheel simulation** — `page.mouse.wheel(0, 200)`. Falls back to `page.evaluate(() => window.scrollBy(0, 200))` on mobile WebKit (wheel not supported in mobile emulation).
- **Seeding localStorage** for e2e tests that need a logged-in user: `page.evaluate(() => localStorage.setItem('users', JSON.stringify([...])))`

### Adding new e2e tests

Add `.spec.ts` files under `e2e/`. Use `page.goto('/')` to start from the login screen.

## Adding Features

- **New screen:** add a `<Route path="..." element={<MyScreen />} />` in `App.tsx`, create the file under `src/screens/`.
- **New game logic:** extend `useExercise.ts`; expose via its return value.
- **New setting:** add field + setter to `SettingsContext` (including `initialXxx` prop and `UserSettings` in `users.ts`), add UI to `SettingsScreen`, consume in the relevant screen/hook, add tests to `SettingsContext.test.tsx`.
- **New i18n string:** add the key + type to the `Translations` interface and both `en` and `de` entries in `translations.ts`.
- **Adding a user field:** update `User` interface in `users.ts`, update `registerUser` defaults, update `UserContext.saveSettings` if the field is part of `UserSettings`.
