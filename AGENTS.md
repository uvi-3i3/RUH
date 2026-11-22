# AGENTS.md — Ruh (رُوح) Engineering Handbook & Change Log

> **Maintenance Rule for Future Coding Agents:**  
> Whenever you add a feature, refactor architecture, change persistence schemas, add assets, or fix a notable bug in this repository, **update this file before finishing your turn** — specifically appending a dated entry to the **Change Log** section and keeping the **Architecture Map**, **Storage Keys**, and **Invariants** accurate.

---

## 1. Project Overview

**Ruh (رُوح)** is an offline-capable Islamic spiritual sanctuary and daily practice companion built as a static SPA (web + PWA + Capacitor iOS/Android).

- **Framework & Build:** React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), `vite-plugin-pwa`
- **Native Shell:** Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/haptics`, `@capacitor/local-notifications`, `@capacitor/preferences`, `@capacitor/status-bar`, `@capacitor/splash-screen`)
- **Prayer Calculations:** `adhan` (`^4.4.3`)
- **Typography:** Bundled `@fontsource/cormorant-garamond`, `@fontsource/amiri`, `@fontsource/aref-ruqaa`
- **Backend:** None — 100% client-side, privacy-first, offline-ready (`localStorage` + Capacitor Preferences mirroring + JSON export/restore).

---

## 2. Essential Commands

```bash
# Development server (port 3000)
npm run dev

# Production bundle check
npm run build

# ESLint check (includes react-hooks / React Compiler memoization rules)
npm run lint

# Run all pure-logic unit tests (node:test via tsx; currently 162 tests)
npx --yes tsx --test src/utils/*.test.js

# Native Capacitor build & sync
npm run cap:build
```

- **Automated Testing Bypass:** Append `?autostart=1` to skip initial onboarding and enter the main Sanctuary directly.

---

## 3. Non-Negotiable Invariants & Guardrails

1. **Do NOT edit `src/data/burhanData.js`.** Its curated theological texts and structure are protected.
2. **Preserve the calm Sanctuary canvas.** Never crowd the main screen with extra widgets, telemetry tickers, or loud status banners. New configuration belongs inside **Settings** or **Sacred Reminders**.
3. **Pure Logic First (`src/utils/*Logic.js` + `*.test.js`).** Keep calculations, state normalization, parsers, routing rules, and search indexes out of React components and covered by `node:test` unit tests.
4. **Dual-Theme Contrast (Night & Daylight).** Every new surface, border, text color, and control must be legible in both dark obsidian Night mode (`isLightMode === false`) and warm parchment Daylight mode (`isLightMode === true`).
5. **Visual Restraint.** Avoid static pill badge clutter (render static metadata as unboxed text with `·` separators), avoid nested cards-within-cards (prefer unified hairline-divided groups), and keep touch targets `>= 40px` (`>= 44px` on mobile).
6. **Copy Style.** Prefer clear, direct, simple everyday English sentences over dense or overly ornate prose (especially in onboarding and settings).
7. **ESLint React Hooks Compliance.** `eslint-plugin-react-hooks` enforces strict manual memoization rules (`react-hooks/preserve-manual-memoization`) — extract optional-chained properties into local constants before referencing them inside `useCallback` / `useMemo` dependency arrays.
8. **Static SPA Network Safety.** External client requests must be CORS-safe and have offline fallbacks (no backend proxy exists).

---

## 4. Architecture & Directory Map

### Core Entry & Context
- `src/App.jsx` — Root layout shell (Sanctuary, Practices, Learning Path, Journey views, modal orchestration, onboarding lifecycle).
- `src/context/SanctuaryContext.jsx` & `src/context/sanctuaryStore.js` — Shared state provider exposing `devotionData`, `prayerTimes`, `notifications`, and UI preferences (`isLightMode`, `setIsLightMode`, `toggleLightMode`, `devTimePhase`, `isHapticsEnabled`, `isTactileAudioEnabled`, `isTravelMode`).

### Custom Hooks (`src/hooks/`)
- `useDevotionData.js` — Central persisted user state (prayers, Qada ledger, habits, streaks, reflections, saved verses, reminders, Adhan preference, Quiet Autopilot config, JSON backup export/import, midnight Qada sweep, Friday Jumu'ah autopilot task syncing, weekly auto-rest day protection).
- `usePrayerTimes.js` — Live solar prayer times via `adhan`, Qibla bearing, GPS location detection, multi-provider reverse geocoding (OpenStreetMap Nominatim → Komoot Photon → offline nearest-city preset), auto country-to-calculation-method detection, and legacy `'GPS Location'` backfill.
- `useLocalNotifications.js` — Web Notification / Service Worker / Capacitor 14-day rolling solar scheduler, in-app `SacredNotificationToast` delivery, Quiet Autopilot silence gating, and token-guarded vocal Adhan / chime playback lifecycle.
- `useTemporalPhase.js` — Maps real solar prayer times (or manual override) to atmospheric sky palettes (`Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha`).
- `useHijriDate.js` — Islamic Hijri calendar date formatting.
- `useCanvasEngine.js` — Ambient Sanctuary background sky/starfield canvas renderer.

### Key UI Components (`src/components/`)
- `onboarding/OnboardingFlow.jsx` — Non-scrolling viewport-fitted guided setup wizard with goal-adaptive Step 2 struggles, 8+ daily habit picks, live Adhan voice preview/stop, and live GPS locality detection.
- `layout/SettingsModal.jsx` — 5-category two-pane desktop / tabbed mobile Settings workspace with live category status summaries, instant cross-category search, Theme Mode switcher, and Adhan Alerts quick shortcut.
- `layout/RemindersModal.jsx` — Sacred Reminders modal with Adhan Voice & Sound picker (6 options), lead timing, live solar sync, 5 daily prayer toggles, and personal custom reminders.
- `layout/SacredNotificationToast.jsx` — In-app prayer alert toast with **Mark Prayed**, live **Stop Adhan** control while vocal Adhan plays, paused progress bar, and **Later** dismiss.
- `layout/CityPickerModal.jsx` — GPS current-location detector with resolved locality card (neighborhood/city, region/country, coordinates) plus searchable global city presets.
- `layout/TasksView.jsx` — Daily Practices view (Habits, Morning/Evening Adhkar, Misbaha) supporting Quiet Autopilot time-of-day auto-focus.
- `layout/ProfileIdCard.jsx` — Interactive 3D Sanctuary Pass & Journey utility dock (Saved, Qada, Duas, Alerts, Settings).
- `layout/QiblaModal.jsx`, `QadaModal.jsx`, `DuasModal.jsx`, `SavedVersesModal.jsx`, `SharePassModal.jsx`, `LearningPathPage.jsx`, `BurhanOverlay.jsx`, `MiraclesOverlay.jsx`, `TafakkurOverlay.jsx`, `AppErrorBoundary.jsx`.

### Pure Logic Modules & Unit Tests (`src/utils/`)
- `adhanChimeLogic.js` (+ `.test.js`) — Vocal Adhan profiles (`adhan_makkah`, `adhan_madinah`, `adhan_mishary`), automatic live Fajr dawn track routing, optional Web Audio chimes (`hijaz_whisper`, `fajr_ney`, legacy `sanctuary_bell`), and `silent`.
- `adhanChimePlayer.js` — `HTMLAudioElement` MP3 player with smooth volume fade-out, monotonic session cancellation (`invokeOnEnd` race protection), `ruh:adhan-chime` custom event emission, and synthesized Hijaz fallback.
- `locationLogic.js` (+ `.test.js`) — Haversine distance, nearest preset city lookup, country-code → prayer calculation method inference, Nominatim & Photon reverse-geocode parsers, coordinate/locality label formatters.
- `autopilotLogic.js` (+ `.test.js`) — Quiet Autopilot config normalization, Quiet Work Hours window matching (never silences Fajr), time-of-day practice auto-focus resolver, Friday Jumu'ah Sunnah task injection/cleanup, midnight Qada sweep calculation, and weekly rest-day streak protection.
- `settingsStructureLogic.js` (+ `.test.js`) — 5-section Settings taxonomy, 20-entry cross-category keyword/synonym search index, and live category summary formatter.
- `onboardingLogic.js` (+ `.test.js`) — Goal catalog, goal-tailored Step 2 struggle sets, expanded daily habit library, verse curation, and Daily Plan charter builder.
- `devotionLogic.js` (+ `.test.js`), `notificationLogic.js` (+ `.test.js`), `prayerWindowLogic.js` (+ `.test.js`), `habitLogic.js` (+ `.test.js`), `badgeLogic.js` (+ `.test.js`), `preferencesLogic.js` (+ `.test.js`), `atmosphereSyncLogic.js` (+ `.test.js`), `profileCardLogic.js` (+ `.test.js`), `sharePassLogic.js` (+ `.test.js`), `tactileAudioLogic.js` (+ `.test.js`), `hapticLogic.js` (+ `.test.js`), `learningPathLogic.js` (+ `.test.js`), `worldReaderLogic.js` (+ `.test.js`), `miraclesLogic.js` (+ `.test.js`), `propheticDiagramLogic.js` (+ `.test.js`), `rewardRevealLogic.js` (+ `.test.js`), `smoothInteractionLogic.js` (+ `.test.js`), `localAiLogic.js` (+ `.test.js`).

### Bundled Offline Media (`public/audio/`)
Loudness-normalized (`-16 LUFS`, 48 kbps mono 24 kHz MP3, metadata stripped):
- `/audio/adhan-makkah.mp3` — Makkah Adhan (default)
- `/audio/adhan-madinah.mp3` — Madinah Adhan
- `/audio/adhan-mishary.mp3` — Mishary Rashid Al-Afasy Adhan
- `/audio/adhan-fajr.mp3` — Dedicated Fajr Dawn Adhan (*As-salatu khayrun min an-nawm*)

### Key `localStorage` Keys
- `ruh_devotion_v1` — Main user progress, prayers, habits, autopilot config, notification settings, Qada ledger, reflections.
- `ruh_location_v1` — Saved location object (`lat`, `lng`, `cityName`, `locality`, `region`, `country`, `countryCode`, `postcode`, `source`).
- `ruh_calc_method_v1` — Active `adhan` calculation method key (e.g., `MoonsightingCommittee`, `NorthAmerica`, `UmmAlQura`, `Singapore`).
- `ruh_onboarding_v1` — Onboarding completion/skip metadata.
- Theme/sensory preferences managed via `src/utils/preferencesLogic.js` & `src/utils/nativeStorage.js`.

---

## 5. Chronological Change Log

### 2026-11-22 — Dev Server Startup Fix
- **Dev Script (`package.json`):** Simplified `"dev"` from `"vite --port 3000 --host 0.0.0.0"` to `"vite"` so runtime-injected `--port 3000 --host 0.0.0.0` flags are not duplicated (while `vite.config.js` retains `port: 3000`, `host: '0.0.0.0'`, and `allowedHosts: true` as defaults), restarted the dev server cleanly, and verified HTTP `200` + live app mount with zero console errors.

### 2026-11-22 — Agent Engineering Handbook (`AGENTS.md`)
- Created `AGENTS.md` at the repository root documenting architecture, invariants, commands, storage keys, bundled assets, and the full change history so future coding agents have immediate context.

### 2026-11-22 — Structured 5-Category Settings Workspace
- **Pure Logic:** Added `src/utils/settingsStructureLogic.js` and `src/utils/settingsStructureLogic.test.js` (4 test suites; total suite now **162 passing tests**).
- **UI Architecture (`src/components/layout/SettingsModal.jsx`):** Replaced the flat 12-card vertical scroll stack with 5 prioritized categories:
  1. **Prayer & Location** (GPS locality + city picker, calculation method, live Adhan & Prayer Alerts summary + **Configure** shortcut, Travel Mode)
  2. **Quiet Autopilot** (master switch + 5 hairline-divided rules inside one unified group)
  3. **Appearance & Reading** (new in-settings **Night / Daylight** theme switcher, Sanctuary Atmosphere solar phases, Simple English Translation, Ambient Dhikr Whisper)
  4. **Sound & Touch** (Tactile Audio Cues, Tactile Haptics + inline feel test buttons)
  5. **Profile & Data** (Seeker Identity, Guided Setup replay, Sanctuary Backup export/restore, separated Danger Zone reset)
- **Navigation & Search:** Two-pane desktop layout (`max-w-4xl`) with live status summaries on the left rail, compact scrollable tab strip on mobile (`390×844`), `Escape` key handling, and instant cross-category keyword/synonym search with smooth jump-and-highlight.
- **Wiring (`src/App.jsx`):** Passed `onOpenReminders` to `SettingsModal` so users can jump straight from Prayer & Location settings to Adhan & Prayer Alerts.
- **Polish Fixed in Browser Audit:** Switched search input from `type="search"` to `type="text" role="searchbox"` to eliminate Chromium's duplicate native clear `×` icon, and tightened mobile category tab spacing so the 5th tab visibly peeks in.

### 2026-11-21 — Authentic Vocal Adhan Notifications & Live GPS Locality Resolution
- **Vocal Adhan Audio Assets:** Bundled 4 loudness-normalized offline MP3 tracks in `public/audio/` (`adhan-makkah.mp3`, `adhan-madinah.mp3`, `adhan-mishary.mp3`, `adhan-fajr.mp3`).
- **Adhan Engine (`src/utils/adhanChimeLogic.js`, `src/utils/adhanChimePlayer.js`):**
  - Set `DEFAULT_ADHAN_CHIME_PROFILE = 'adhan_makkah'`.
  - Exposed 6 profiles (**Makkah Adhan**, **Madinah Adhan**, **Mishary Al-Afasy**, **Hijaz Chime**, **Dawn Ney**, **Silent**) with backward compatibility for legacy `'sanctuary_bell'`.
  - Automatically plays `/audio/adhan-fajr.mp3` for live Fajr alerts when a vocal Adhan is selected.
  - Upgraded `adhanChimePlayer.js` for `HTMLAudioElement` playback with smooth fade-out, synthesized Maqam Hijaz fallback if decoding fails, and superseded-session race fix (`stopAdhanChime({ invokeOnEnd: false })`).
- **Notification & Toast Controls (`src/hooks/useLocalNotifications.js`, `src/components/layout/SacredNotificationToast.jsx`, `src/components/layout/RemindersModal.jsx`, `src/App.jsx`):**
  - Added monotonic `playbackTokenRef` guarding so switching previews or firing **Preview Alert** immediately after previewing a voice never clears active playback state.
  - Kept prayer alert toast open while vocal Adhan plays (auto-dismisses 4.5s after audio ends) with an explicit **Stop Adhan** button.
- **Live GPS Locality Resolution (`src/utils/locationLogic.js`, `src/hooks/usePrayerTimes.js`, `src/components/layout/CityPickerModal.jsx`, `src/components/layout/SettingsModal.jsx`, `src/components/onboarding/OnboardingFlow.jsx`):**
  - Replaced hardcoded `"GPS Location"` with real reverse-geocoded neighborhood/locality, city, region, and country (OpenStreetMap Nominatim → Komoot Photon → offline nearest-city preset fallback).
  - Auto-selects regional prayer calculation convention from detected country code (e.g., ISNA, MoonsightingCommittee, UmmAlQura, MUIS, Karachi, Dubai, Egyptian).
  - Automatically backfills legacy saved `"GPS Location"` entries on mount.

### Earlier in Session — Quiet Autopilot & Onboarding Refinements
- **Quiet Autopilot (Set-It-and-Forget-It):** Added `src/utils/autopilotLogic.js` (+ `.test.js`) and wired Quiet Work Hours, Auto-Focus Time of Day (Morning/Evening Adhkar in `TasksView.jsx`), Friday (Jumu'ah) Surah Al-Kahf & Salawat auto-tasks, Midnight Qada Sweep, and Weekly Auto-Rest Day streak protection without altering the main Sanctuary canvas.
- **Onboarding Experience (`src/components/onboarding/OnboardingFlow.jsx`, `src/utils/onboardingLogic.js`):**
  - Rewrote copy into clear, simple everyday sentences and fitted each step cleanly into the viewport without vertical page scrolling.
  - Fixed a `TypeError` crash (`Cannot read properties of undefined (reading 'toLowerCase')`) in onboarding city search filtering.
  - Made Step 2 struggles dynamically tailored to the specific goal chosen in Step 1 with stronger visual prominence.
  - Expanded daily habit picks to 8+ choices across categories.
