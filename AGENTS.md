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

# Run all pure-logic unit tests (node:test via tsx; currently 183 tests)
npx --yes tsx --test src/utils/*.test.js

# Native Capacitor build & sync
npm run cap:build
```

- **Automated Testing Bypass:** Append `?autostart=1` to skip initial onboarding and enter the main Sanctuary directly.

---

## 3. Non-Negotiable Invariants & Guardrails

1. **Preserve Burhan & Miracles IDs and scholarly balance (`src/data/burhanData.js`, `src/data/quranMiraclesData.js`).** Never rename existing `id` keys (which map to saved user reflections and explored states), and only modify the curated theological/scriptural texts when explicitly requested by the user.
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
- `layout/TasksView.jsx`, `layout/TasksIntentionsPanel.jsx`, `layout/HabitEditorSheet.jsx` — Fixed-viewport, zero-page-scroll Daily Practices workspace (two-column on desktop; 5-tab switcher including `Today` + compact bottom `Duas | Qada` quick tools bar on mobile) unifying Habits, Wird & Morning/Evening Adhkar (with expandable full Arabic/translation reader and Misbaha launch), live Today's Intentions checklist, and daily momentum ring.
- `layout/InsightsGatewayOverlay.jsx` — Full-screen radially expanding Twin-Portal Gateway launched from the middle (3rd of 5) Sanctuary nav icon, pairing **Burhan** and **Miracles** as full-bleed painted architectural doors with desktop "living split" flex choreography and LIFO sub-world expansion (`BurhanOverlay` / `MiraclesOverlay`).
- `layout/ProfileIdCard.jsx` — Interactive 3D Sanctuary Pass & Journey utility dock (Saved, Qada, Duas, Alerts, Settings).
- `layout/LearningPathPage.jsx`, `layout/AncientMapCanvas.jsx`, `layout/StudyIntroStage.jsx`, `layout/LessonQuizStage.jsx` — Full-screen Study Window featuring a calm introductory overview page, focused two-zone pillar reader (`Essence` / `Daily Life` / `Quick Check`), understanding checks, and completion stage.
- `layout/TopicQaSection.jsx` — Dual-theme, strictly topic-scoped editorial Q&A Codex embedded inside both `BurhanOverlay` and `MiraclesOverlay`, featuring numbered hairline rows (`01`..`07`), angle filter tabs, live reading-depth progress tracking (`ruh_qa_explored_v1`), `Expand all` / `Collapse all`, strictly in-topic related question jumps, sequential Prev/Next stepping, Q&A copy, and live Classical/Simple synchronization.
- `layout/QiblaModal.jsx`, `QadaModal.jsx`, `DuasModal.jsx`, `SavedVersesModal.jsx`, `SharePassModal.jsx`, `BurhanOverlay.jsx`, `MiraclesOverlay.jsx`, `TafakkurOverlay.jsx`, `AppErrorBoundary.jsx`.

### Pure Logic Modules & Unit Tests (`src/utils/`)
- `adhanChimeLogic.js` (+ `.test.js`) — Vocal Adhan profiles (`adhan_makkah`, `adhan_madinah`, `adhan_mishary`), automatic live Fajr dawn track routing, optional Web Audio chimes (`hijaz_whisper`, `fajr_ney`, legacy `sanctuary_bell`), and `silent`.
- `adhanChimePlayer.js` — `HTMLAudioElement` MP3 player with smooth volume fade-out, monotonic session cancellation (`invokeOnEnd` race protection), `ruh:adhan-chime` custom event emission, and synthesized Hijaz fallback.
- `locationLogic.js` (+ `.test.js`) — Haversine distance, nearest preset city lookup, country-code → prayer calculation method inference, Nominatim & Photon reverse-geocode parsers, coordinate/locality label formatters.
- `autopilotLogic.js` (+ `.test.js`) — Quiet Autopilot config normalization, Quiet Work Hours window matching (never silences Fajr), time-of-day practice auto-focus resolver, Friday Jumu'ah Sunnah task injection/cleanup, midnight Qada sweep calculation, and weekly rest-day streak protection.
- `settingsStructureLogic.js` (+ `.test.js`) — 5-section Settings taxonomy, 20-entry cross-category keyword/synonym search index, and live category summary formatter.
- `onboardingLogic.js` (+ `.test.js`) — Goal catalog, goal-tailored Step 2 struggle sets, expanded daily habit library, verse curation, and Daily Plan charter builder.
- `tasksPageLogic.js` (+ `.test.js`) — Daily Practices overview rollups, per-tab completion badges, habit status filtering, metadata formatting, and time-aware Up Next practice suggestions.
- `navInsightsLogic.js` (+ `.test.js`) — 5-item Sanctuary navigation bar ordering (exact midpoint placement for Burhan & Miracles), Twin-Portal Gateway metadata/progress builders, single active-destination resolver, standard/subtle/hidden nav presentation state, and cross-world transition planning.
- `topicQaLogic.js` (+ `.test.js`) — Strictly topic-scoped Q&A Codex logic covering all 18 Burhan treatises (`src/data/burhanQaData.js`, 109 Q&As) and all 22 Qur'anic Miracles (`src/data/miraclesQaData.js`, 132 Q&As) — angle filters, strictly in-topic follow-up resolution, Prev/Next stepping, and offline explored-progress persistence (`ruh_qa_explored_v1`).
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
- `ruh_qa_explored_v1` — Explored Q&A IDs tracked quietly across Burhan and Qur'anic Miracles topics.
- Theme/sensory preferences managed via `src/utils/preferencesLogic.js` & `src/utils/nativeStorage.js`.

---

## 5. Chronological Change Log

### 2026-11-23 — Subtle Sanctuary Nav Bar in Burhan/Miracles & Study Sanctuary (Removed Top-Left Back Buttons)
- **Subtle Persistent Sanctuary Navigation (`src/App.jsx`, `src/utils/navInsightsLogic.js`, `src/utils/navInsightsLogic.test.js`):**
  - Elevated the right-edge 5-icon Sanctuary nav bar to `z-[95]` in a whispered, translucent `subtle` presentation mode inside the Twin-Portal Gateway, Burhan, Miracles, and Study Sanctuary (`opacity-[0.44]`/`0.48` at rest, blooming smoothly to `100%` on hover, active press, or keyboard `:focus-visible`, with harmonized sanctuary teal tint in Burhan and gold tint in Miracles/Gateway/Study).
  - Added pure helpers `resolveActiveNavDestination`, `resolveSanctuaryNavPresentation`, and `resolveNavTargetTransition` + 3 new unit tests (**183 total passing tests**) ensuring single active-icon highlighting, hiding cleanly during onboarding and blocking modals, direct world-to-world and world-to-view switching without flashes, and tapping the middle `Burhan & Miracles` icon inside Burhan or Miracles to step smoothly back to the Twin-Portal Gateway.
- **Removed Top-Left Corner Back Buttons (`InsightsGatewayOverlay.jsx`, `BurhanOverlay.jsx`, `MiraclesOverlay.jsx`, `AncientMapCanvas.jsx`):**
  - Removed all top-left corner `Back` buttons across the Twin-Portal Gateway, Burhan, Miracles, and Study Sanctuary; rebalanced each header with calm editorial world identity / centered mastheads / aligned lesson progress bars, and added mobile right-edge clearance so the subtle nav rail never overlaps prose or actions.

### 2026-11-23 — Strictly Topic-Scoped Editorial Q&A Codex (Replacing AI-Style Chat Panel)
- **Full 40-Topic Ownership Audit (`src/data/burhanQaData.js`, `src/data/miraclesQaData.js`):**
  - Audited all 18 Burhan treatises (`b1`–`b18`) and all 22 Qur'anic Miracles (`m-*`) to verify every question, answer, and follow-up link strictly belongs to its own topic with zero orphan keys or cross-topic leaks.
  - Added `b13-q7` (*"Don't followers of every religion feel their own path is coherent from the inside?"*) to `burhanQaData.b13` (241 total Q&As) and removed the redundant standalone `Honest Question` box in `BurhanOverlay.jsx` that previously duplicated Q#1 on 17 of 18 treatises.
- **Removed AI-Style Inquiry Feature (`TopicInquiryPanel.jsx`, `topicInquiryLogic.js`, `topicInquiryLogic.test.js` deleted):**
  - Removed the fake-AI prompt input, `Ask` button, composing delay, chat bubbles, TF-IDF guessing engine, and cross-topic router.
- **New Editorial Q&A Codex (`src/components/layout/TopicQaSection.jsx`, `src/utils/topicQaLogic.js`, `src/utils/topicQaLogic.test.js`):**
  - Built an unboxed, hairline-divided numbered Q&A Codex (`01`–`06`/`07`) with Question `01` open by default, single-row angle filter tabs (`Objections`, `Logic & Proof` / `Evidence`, `Arabic & Context` / `Deep Dive`, `Daily Life` / `Reflection`), `Expand all` / `Collapse all`, strictly in-topic related question jumps, sequential `Previous` / `Next` stepping, `Copy Q&A`, persisted reading-depth progress bar (`ruh_qa_explored_v1`), and live Classical/Simple synchronization (**180 total passing tests**).

### 2026-11-22 — Offline Scholarly Inquiry Companion ("Mini-AI" Q&A) for Burhan & Miracles
- **240 Curated Topic Q&As (`src/data/burhanQaData.js`, `src/data/miraclesQaData.js`):**
  - Added 6 deeply anticipated questions & answers for **every single one of the 18 Burhan treatises** (108 Q&As) and **every single one of the 22 Qur'anic Miracles** (132 Q&As) — covering core logic/evidence, sharpest skeptical objections, classical tafsir vs. modern science, Arabic nuances, and daily spiritual application in both **Classical** and **Simple** modes.
- **Deterministic Offline Inquiry Engine (`src/utils/topicInquiryLogic.js`, `src/utils/topicInquiryLogic.test.js`):**
  - Built a lazy pre-indexed TF-IDF + stemming + domain-concept retrieval engine (0 external API calls, < 10ms cross-corpus scoring) with active-topic matching, cross-topic bridge routing (e.g., asking about the multiverse while reading *Cosmological Anchor* answers from *Fine-Tuning* and offers a one-tap jump), curated follow-up suggestion chains, grounded metadata excerpts, and honest non-hallucinating fallbacks.
  - Added 7 deterministic test suites validating 100% coverage across all 40 topics (**182 total passing tests**).
- **Editorial Inquiry Desk UI (`src/components/layout/TopicInquiryPanel.jsx`, `src/components/layout/BurhanOverlay.jsx`, `src/components/layout/MiraclesOverlay.jsx`):**
  - Embedded a dual-theme Night/Daylight Scholarly Inquiry desk inside both Burhan (teal) and Miracles (gold) with masthead quick-jump links (`Ask a question on this proof/sign ↓`), natural-language question input, category filter tabs (`Objections`, `Logic & Proof` / `Evidence`, `Arabic & Context` / `Deep Dive`, `Daily Life` / `Reflection`), expandable `All N questions` directory, one-tap follow-ups, copy-answer button, and live Classical/Simple voice re-sync across active threads.

### 2026-11-22 — Enriched Burhan (18 Treatises) & Qur'anic Miracles (22 Signs) Content Overhaul
- **Burhan Compendium (`src/data/burhanData.js`, `src/components/layout/BurhanOverlay.jsx`):**
  - Expanded from 14 to **18 structured treatises** (10 Theism & Fitrah + 8 Why Islam), preserving all 14 existing IDs (`b1`–`b14`) and adding 4 new treatises: *The Fine-Tuning of Cosmic Measure* (`b15`), *Consciousness & the Mystery of the Soul* (`b16`), *The Moral Revolution of Arabia* (`b17`), and *Self-Consistent Architecture Across 23 Years* (`b18`).
  - Upgraded **every treatise** with Qur'anic anchor translation + Surah:Ayah reference beneath the calligraphic banner, 3-movement Classical & Simple prose (activating the Closing Synthesis section), complete 3-step deductive `premises` + `conclusion` (fixing missing proofs on `b2`–`b8`), and an expandable **"Honest Question & Reply"** disclosure addressing real-world skepticism with clarity and grace.
- **Qur'anic Miracles Atlas (`src/data/quranMiraclesData.js`, `src/components/layout/MiraclesOverlay.jsx`):**
  - Expanded from 16 to **22 signs** across all 6 categories (Cosmology 3, Science 4, Biology 4, History 4, Numerology 3, Linguistic 4), adding *Precision Down to Every Fingertip* (`75:3–4`), *The Preserved Body of Pharaoh* (`10:92`), *Peaceful Entry into Makkah Foretold* (`48:27`), *Surah Al-Kawthar: Infinite Density in Ten Words* (`108:1–3`), *Radiant Sun vs. Reflected Moonlight* (`10:5`), and *Beyond Poetry & Prose: Unmatched Acoustic Form* (`17:88`).
  - Upgraded **every sign** with multi-paragraph Scriptural Sign & Evidence prose (Classical & Simple), an unboxed hairline-divided **Key Arabic Expressions** word spotlight (Arabic + transliteration + precision meaning), and an expandable **Balanced Perspective** scholarly context note.
- **Visual Catalog, Pure Logic & Build (`src/utils/worldVisualCatalog.js`, `src/utils/worldReaderLogic.js`, `src/utils/worldReaderLogic.test.js`, `vite.config.js`):**
  - Mapped tailored hand-drawn ink engravings to all 10 new entries, added `resolveBurhanStudyExtras` / `resolveMiracleStudyExtras` / `splitEditorialParagraphs` + 7th-century fulfillment time-bridge support, raised Workbox `maximumFileSizeToCacheInBytes` to `5 MiB`, and added full content-completeness tests (**175 total passing tests**).

### 2026-11-22 — Expanding Twin-Portal Gateway for Burhan & Miracles
- **Full-Screen Twin-Portal Gateway (`src/components/layout/InsightsGatewayOverlay.jsx`, `src/components/layout/FullScreenWorldShell.jsx`, `src/App.jsx`):**
  - Replaced the small floating popover (`NavInsightsPopover.jsx`, deleted) with a full-viewport (`100dvh`, zero-scroll) **Twin-Portal Gateway** that expands radially from the middle (3rd of 5) Sanctuary nav icon (`z-[85]`) while preserving the slim `32px` 5-icon nav bar.
  - Showcases **Burhan** (`بُرْهَان` · House of Reason & Fitrah) and **Miracles** (`إِعْجَاز` · Atlas of Qur'anic Signs) as two full-bleed painted architectural doors draped in Ruh's bundled Day & Night artwork with velvety dual-theme Night/Daylight scrims, live today's treatise/sign previews, and progress metadata.
  - Implemented a desktop **Living Split** (`md:flex-[1.16]` hovered vs `md:flex-[0.84]` sibling) with a live tracking hairline seam and centered celestial `✦` compass medallion, plus a balanced zero-scroll 2-row split on mobile (`390×844`).
  - Clicking either door expands `BurhanOverlay` or `MiraclesOverlay` directly from the clicked point at `z-[90]` above the Gateway; closing the sub-world via `< Back`, `Escape`, or Android hardware back returns cleanly to the Gateway (LIFO stack), and one more Back/Escape collapses the Gateway back to the Sanctuary.
- **Pure Logic (`src/utils/navInsightsLogic.js`, `src/utils/navInsightsLogic.test.js`):** Enriched `buildInsightsMenuOptions(...)` with `houseLabel`, `tagline`, `progressLabel`, and `enterLabel` metadata and updated unit tests (**173 total passing tests**).

### 2026-11-22 — Middle Nav Bar Window for Burhan & Miracles
- **Unified Middle Nav Window (`src/App.jsx`, `src/components/icons/Icons.jsx`, `src/components/layout/NavInsightsPopover.jsx`):**
  - Refined the right-edge vertical Sanctuary navigation pill into a slimmer, compact 5-icon island (`32px` wide, `26px` buttons) with **Burhan & Miracles** (`InsightsNavIcon`) placed in the exact middle (3rd of 5: Sanctuary · Practices · **Burhan & Miracles** · Learning Path · Journey).
  - Clicking the middle icon softens the background with a gentle `backdrop-blur-[5px]` wash and opens a cozy vertical 2-option popover (`rounded-[24px]`, warm glass rim, tone-matched hover tint) with **Burhan** `بُرْهَان` stacked above **Miracles** `إِعْجَاز`, supporting click-outside, `Escape`, and hardware-back dismissal.
  - Choosing either option closes the popover and expands the chosen full-screen world (`BurhanOverlay` or `MiraclesOverlay`) directly from the clicked option with all existing reading, reflection, and exploration tools intact.
- **Streamlined Daily Practices (`src/components/layout/TasksView.jsx`):** Removed the duplicated Burhan & Miracles cards from the Practices view, leaving a clean `Duas | Qada` quick tools bar alongside `Today's Intentions`.
- **Pure Logic (`src/utils/navInsightsLogic.js`, `src/utils/navInsightsLogic.test.js`):** Added pure nav-midpoint and vertical menu option builders + 3 unit tests (**173 total passing tests**).

### 2026-11-22 — Daily Practices Fixed-Viewport (Zero Page Scroll) Architecture
- **Zero Outer Page Scroll (`src/components/layout/TasksView.jsx`, `src/components/layout/TasksIntentionsPanel.jsx`):**
  - Locked `tasks-scroller` to `overflow-hidden` with a full-height flex workspace so the Daily Practices page never scrolls at the page level across desktop (`1440×900`, `1280×720`) and mobile (`390×844`).
  - Kept starter Habits, Today's Intentions, and Wird/Morning/Evening Adhkar fitted cleanly within one screen; any user-added overflow stays smoothly contained inside the card list region (`flex-1 min-h-0 overflow-y-auto`).
  - On **Desktop (`lg+`)**: Preserved the simultaneous two-column view (Practice Ledger on left + `Today's Intentions` and compact `Reflections & Tools` on right) within one viewport height.
  - On **Mobile (`< lg`)**: Replaced vertical multi-card stacking with a compact single-row masthead + progress ring, a **5-tab Practice Switcher** (`Habits` | `Today` | `Wird` | `Morning` | `Evening`), and a fixed 4-action bottom Reflections & Tools bar (`Burhan` · `Miracles` · `Duas` · `Qada`).
- **Pure Logic (`src/utils/tasksPageLogic.js`, `src/utils/tasksPageLogic.test.js`):** Added `resolveVisiblePracticeTab(activeTab, isDesktop)` + unit test so mobile's `today` tab falls back cleanly to `habits` on desktop (**170 total passing tests**).

### 2026-11-22 — Daily Practices (Tasks) Page Complete Overhaul
- **Pure Logic (`src/utils/tasksPageLogic.js`, `src/utils/tasksPageLogic.test.js`):** Extracted daily practice overview rollups, per-tab completion badges (`Habits`, `Wird`, `Morning`, `Evening`), status filtering (`All` / `Remaining` / `Completed`), readable metadata formatting, and time-aware Up Next suggestions (6 new unit tests; **169 total passing tests**).
- **Two-Column Responsive Workspace (`src/components/layout/TasksView.jsx`):**
  - Replaced the narrow `500px` desktop stack and cramped 8px uppercase micro-labels with a balanced `max-w-[960px]` two-column desktop layout (`minmax(0,1fr)` + `316px` companion rail) and a clean single-column mobile flow with zero horizontal overflow.
  - Added a live **Daily Momentum Ring** + smart one-click **Up Next** switcher aligned cleanly with the right companion column.
  - Upgraded **Habits** with a single-row filter/actions toolbar (`All` / `Remaining` / `Completed`, `Customize`, `Add Habit`), one-tap **Done** completion on multi-step habits, `36–40px` undo/reorder/edit controls, and improved dual-theme contrast.
  - Upgraded **Wird / Morning / Evening Adhkar** with a prominent **Open Misbaha** button, expandable **Read** panels revealing the full un-truncated Arabic text, English translation, and Hadith source, inline `−` undo, and per-row **Beads** launch controls.
  - Consolidated Burhan, Qur'an Miracles, Duas, and Qada into one clean hairline-divided **Reflections & Tools** card.
- **Unified Today's Intentions (`src/components/layout/TasksIntentionsPanel.jsx`):** Surfaced `dailyTodos` directly inside the Practices companion column with inline add, live checkboxes, delete for custom items, and `Clear done` — synced live with the Sanctuary's bottom-left Today dock.
- **Habit Editor Polish (`src/components/layout/HabitEditorSheet.jsx`):** Upgraded labels to clear everyday English and raised preset/unit/cadence touch targets.

### 2026-11-22 — Study Window Introductory Page & Decluttered Study Experience
- **Introductory Overview Stage (`src/components/layout/StudyIntroStage.jsx`):** Added a calm landing page at Step 0 of the Study Window displaying the lesson title, concise everyday-English overview, hairline-divided two-part roadmap (Five Pillars of Islam & Six Pillars of Faith) with live per-part progress and direct jump rows, and a single progress-aware primary CTA (`Start Lesson` / `Continue Lesson` / `Review Lesson`).
- **Decluttered Focused Study Pages (`src/components/layout/AncientMapCanvas.jsx`, `src/components/layout/LessonQuizStage.jsx`):**
  - Redesigned `islam-study` and `iman-study` into a calm two-zone layout pairing a single responsive `role="listbox"` selector (architectural hairline-underlined numbered strip on mobile, single-line rail on desktop) with a spacious one-topic-at-a-time study card.
  - Applied progressive disclosure inside the study card (`Essence` | `Daily Life` | `Quick Check`) so learners see one clean explanation and verse by default without walls of text.
  - Streamlined `LessonCompleteStage` with concise copy, quiet next-lesson note, and a `Lesson Overview` return control; ensured finishing or stepping past study sections consistently records group progress.
- **Plain-English Study Material & Pure Logic (`src/data/learningPathData.js`, `src/utils/learningPathLogic.js`, `src/utils/learningPathLogic.test.js`):**
  - Added `LESSON_ONE_INTRO`, concise `shortSummary` and 2-point `shortPractice` entries for all 11 pillars, and tightened check/quiz wording while preserving backward-compatible fields.
  - Added `intro` step at index `0` in `LESSON_ONE_STEPS` along with pure helpers `getLearningSteps`, `resolveResumeStepIndex`, `resolveFirstUnreadPillarId`, and `buildStudyIntroSummary` (14 unit tests in `learningPathLogic.test.js`; **163 total passing tests**).

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
