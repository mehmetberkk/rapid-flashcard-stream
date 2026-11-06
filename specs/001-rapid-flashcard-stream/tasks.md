# Tasks: Rapid Flashcard Stream

**Input**: Design documents from `specs/001-rapid-flashcard-stream/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/  
**Organization**: Tasks are grouped by user story (P1 to P5) and architectural hardening phases.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency management, and build configuration.

- [X] T001 Initialize npm project with `package.json` configuring React 19, TypeScript 5.x, Vite, Electron, electron-builder, Dexie, Tailwind CSS, Lucide-React, and Vitest in `package.json`
- [X] T002 [P] Configure TypeScript compiler options in `tsconfig.json` and `tsconfig.node.json` with strict mode (`strict: true`, no implicit `any`)
- [X] T003 [P] Configure Vite build and Electron dev/prod integration in `vite.config.ts`
- [X] T004 [P] Configure electron-builder packaging settings for standalone Windows `.exe` output in `electron-builder.json`
- [X] T005 [P] Configure Tailwind CSS and PostCSS configuration for minimalist styling in `tailwind.config.js` and `postcss.config.js`
- [X] T006 [P] Configure Vitest test runner with fake timers and mocked time providers in `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models, Dexie.js database, Electron desktop shell, and application entry points.  
**⚠️ CRITICAL**: Must complete before any user story implementation can begin.

- [X] T007 Implement core TypeScript data models (`Deck`, `Card`, `ImportReport`, `PlaybackSession`) enforcing constraints (`front` and `back` non-empty strings, `intervalMs` clamped between 50 and 3000) in `src/core/models/index.ts`
- [X] T008 Implement Dexie.js database class `FlashcardDatabase` with tables `decks` (`id, name, createdAt, updatedAt`) and `cards` (`id, deckId, [deckId+orderIndex], isFavorite, createdAt`) in `src/core/storage/Database.ts`
- [X] T009 Implement `StorageRepository` conforming to `IStorageRepository` contract for local deck and card persistence in `src/core/storage/StorageRepository.ts`
- [X] T010 Implement unit tests for `StorageRepository` CRUD and cascade delete operations in `tests/unit/storage.test.ts`
- [X] T011 Setup Electron main process window creation with secure sandbox and native window controls in `src/electron/main.ts`
- [X] T012 [P] Setup Electron preload script with context isolation bridge in `src/electron/preload.ts`
- [X] T013 Setup base React application mount and Tailwind CSS stylesheet in `src/ui/styles/index.css` and `src/ui/main.tsx`

**Checkpoint**: Foundation ready — headless models, storage layer, and desktop shell are operational.

---

## Phase 3: User Story 1 - Rapid Flashcard Stream & Playback Engine (Priority: P1) 🎯 MVP

**Goal**: Continuous, drift-free high-speed stream playback (50ms – 3000ms) with instant-cut transitions and central optical focal point.  
**Independent Test**: Load a test deck, start stream playback, observe instant-cut transitions at the exact center of the screen without 3D animations, adjust speed between 50ms and 3000ms, and verify timer accuracy.

### Tests for User Story 1

- [X] T014 [P] [US1] Unit test for `TimingEngine` verifying drift-free delta accumulation via `performance.now()`, interval clamping (50ms–3000ms), and boundary seek handling in `tests/unit/timing-engine.test.ts`

### Implementation for User Story 1

- [X] T015 [US1] Implement headless `TimingEngine` class implementing `ITimingEngine` with delta-time accumulator loop and zero DOM dependencies in `src/core/timing-engine/TimingEngine.ts`
- [X] T016 [US1] Implement custom React hook `useTimingEngine` connecting headless timing events (`TICK`, `STATE_CHANGE`, `COMPLETED`) to React state in `src/ui/hooks/useTimingEngine.ts`
- [X] T017 [P] [US1] Implement `FocalCardView` component rendering front and back text centered at a fixed optical focal point with instant cut transitions (zero 3D flip or slide animations) in `src/ui/components/FocalCardView.tsx`
- [X] T018 [P] [US1] Implement `SpeedControl` component displaying millisecond speed (50ms – 3000ms) with interactive slider and stepper buttons in `src/ui/components/SpeedControl.tsx`
- [X] T019 [US1] Implement `StreamView` full-screen review screen integrating `FocalCardView`, `SpeedControl`, progress indicator, and play/pause controls in `src/ui/views/StreamView.tsx`

**Checkpoint**: User Story 1 (MVP) is fully functional — users can stream cards at high speed with instant cuts.

---

## Phase 4: User Story 2 - Keyboard-First Stream Operation (Priority: P2)

**Goal**: Full keyboard-driven stream navigation (`Space` play/pause, `ArrowUp`/`ArrowDown` speed adjust, `ArrowLeft`/`ArrowRight` manual card step) without touching the mouse.  
**Independent Test**: Conduct an active stream session purely through keyboard hotkeys; verify smooth state changes and that default browser page scrolling is suppressed.

### Tests for User Story 2

- [X] T020 [P] [US2] Unit test for keyboard shortcut dispatcher verifying key event suppression when typing in input fields and correct action triggering in `tests/unit/keyboard-controls.test.ts`

### Implementation for User Story 2

- [X] T021 [US2] Implement `useKeyboardControls` custom hook with global window listener, active text input suppression, and `preventDefault` for navigation hotkeys in `src/ui/hooks/useKeyboardControls.ts`
- [X] T022 [US2] Integrate `useKeyboardControls` into `StreamView` and add on-screen keyboard shortcut hint badges in `src/ui/views/StreamView.tsx`

**Checkpoint**: User Stories 1 AND 2 work together — hands-free, distraction-free keyboard navigation is complete.

---

## Phase 5: User Story 3 - Fault-Tolerant CSV File Import (Priority: P3)

**Goal**: Upload vocabulary CSV/TSV files, auto-detect delimiters (`,`, `;`, `\t`), skip corrupt rows, and generate a clear diagnostic report.  
**Independent Test**: Upload a CSV file containing valid rows, empty lines, and malformed rows; verify valid cards are saved into a deck, bad lines skipped, and an accurate `ImportReport` dialog displayed.

### Tests for User Story 3

- [X] T023 [P] [US3] Unit test for `CsvParser` verifying delimiter auto-detection, BOM stripping, quotation parsing, and malformed row error reporting in `tests/unit/csv-parser.test.ts`

### Implementation for User Story 3

- [X] T024 [US3] Implement headless `CsvParser` class implementing `ICsvParser` with row-by-row validation, BOM removal, and error accumulation in `src/core/parser/CsvParser.ts`
- [X] T025 [P] [US3] Implement `ImportReportModal` component displaying total lines, imported card count, and table of skipped rows with line numbers and reasons in `src/ui/components/ImportReportModal.tsx`
- [X] T026 [US3] Implement `CsvImportDropzone` component supporting drag-and-drop file upload, file picker, and delimiter selection in `src/ui/components/CsvImportDropzone.tsx`

**Checkpoint**: User Stories 1, 2, and 3 are functional — users can import custom vocabularies and study them at high speed.

---

## Phase 6: User Story 4 - Deck Creation and Local Management (Priority: P4)

**Goal**: Create, name, select, rename, and delete flashcard decks locally in Dexie.js without requiring external accounts or servers.  
**Independent Test**: Create multiple decks, import cards into each, switch between decks, delete a deck with confirmation, and verify data persists upon relaunching the application.

### Implementation for User Story 4

- [X] T027 [P] [US4] Implement custom hook `useDecks` wrapping Dexie repository operations with reactive state updates in `src/ui/hooks/useDecks.ts`
- [X] T028 [P] [US4] Implement `DeckCard` component displaying deck title, card count, last reviewed date, and action menu in `src/ui/components/DeckCard.tsx`
- [X] T029 [US4] Implement `DashboardView` screen providing deck grid, create deck modal, and import action triggers in `src/ui/views/DashboardView.tsx`
- [X] T030 [US4] Connect `App.tsx` routing between `DashboardView` and `StreamView` with active deck state management in `src/ui/App.tsx`

**Checkpoint**: User Stories 1 through 4 are complete — complete local-first deck and session lifecycle.

---

## Phase 7: User Story 5 - Minimalist Modern Visual Experience & Ergonomics (Priority: P5)

**Goal**: Deliver a distraction-free, high-contrast visual interface with locked central optical focus and responsive typography.  
**Independent Test**: Verify central optical alignment across window resize, test dark/light high-contrast theme, and verify zero layout jump during fast card transitions.

### Implementation for User Story 5

- [X] T031 [P] [US5] Implement optical alignment styling, high-contrast dark/light palette, and instant-cut DOM transition rules in `src/ui/styles/focal-theme.css`
- [X] T032 [US5] Implement `ProgressBar` and deck completion summary screen with restart and return-to-dashboard options in `src/ui/components/ProgressBar.tsx`
- [X] T033 [US5] Refine responsive text scaling and letter spacing in `FocalCardView` for long word definitions in `src/ui/components/FocalCardView.tsx`

**Checkpoint**: All user stories (P1 to P5) are implemented and visually polished.

---

## Phase 8: Polish, Packaging & Cross-Cutting Concerns

**Purpose**: Pre-seeded demo data, test suite execution, quickstart validation, and Windows `.exe` packaging.

- [X] T034 [P] Create default sample vocabulary deck (50 high-frequency YDS words) pre-seeded for initial launch in `src/core/storage/seedData.ts`
- [X] T035 Execute full Vitest unit test suite verifying 100% passing tests across timing engine, parser, and storage
- [X] T036 Execute end-to-end quickstart validation scenarios from `specs/001-rapid-flashcard-stream/quickstart.md`
- [X] T037 Configure and verify Windows `.exe` packaging command (`npm run package`) producing standalone executable in `dist-release/win-unpacked`

---

## Phase 9: Electron ESM Compatibility & Packaging Fixes

**Purpose**: Eliminate `__dirname is not defined in ES module scope` runtime errors and ensure strict ESM compatibility across Electron main process, preload scripts, and electron-builder packaging.

- [X] T038 [P] Refactor `src/electron/main.ts` to replace CommonJS `__dirname` and `__filename` with `fileURLToPath(import.meta.url)` and `path.dirname()` from `node:url` and `node:path`
- [X] T039 [P] Update `vite.config.ts` and `vitest.config.ts` to eliminate `__dirname` and resolve `@` alias paths using `fileURLToPath(import.meta.url)` in `vite.config.ts` and `vitest.config.ts`
- [X] T040 [P] Configure `electron-builder.json` with ESM-compatible Windows directory target (`dir`) and asset paths in `electron-builder.json`
- [X] T041 Execute full Vitest unit test suite verifying zero ESM import or path resolution errors in `tests/`
- [X] T042 Execute production build and Windows packaging command (`npm run package`) verifying standalone executable at `dist-release/win-unpacked/Rapid Flashcard Stream.exe`

---

## Phase 10: Two-Phase Sequential State Machine & Single-Side Exclusivity Refactoring

**Purpose**: Eliminate stacked front/back layout, implement deterministic `currentSide: 'FRONT' | 'BACK'` two-phase state machine transitions, and enforce Single-Side Exclusivity with high-contrast optical distinction.

- [X] T043 [P] [US1] Update unit tests in `tests/unit/timing-engine.test.ts` to verify the two-phase state machine (FRONT -> BACK tick transition, currentIndex advancement only after BACK, frontDurationMs/backDurationMs)
- [X] T044 [P] [US1] Update core TypeScript type definitions in `src/core/models/index.ts` to add `CardSide` (`'FRONT' | 'BACK'`), duration configs (`frontDurationMs`, `backDurationMs`), and update `PlaybackSession`
- [X] T045 [US1] Refactor `TimingEngine` in `src/core/timing-engine/TimingEngine.ts` to implement two-phase state machine (`currentSide`, sequential transitions, `toggleSide`, `setSide`, `setDurations`)
- [X] T046 [US1] Refactor custom hook `useTimingEngine` in `src/ui/hooks/useTimingEngine.ts` to expose `currentSide`, `toggleSide`, and two-phase tick event handling
- [X] T047 [P] [US1] Refactor `FocalCardView` in `src/ui/components/FocalCardView.tsx` to eliminate stacked display and implement single-container conditional rendering (`currentSide === 'FRONT' ? card.front : card.back`) with distinct typography colors and badges
- [X] T048 [US1] Update `StreamView` in `src/ui/views/StreamView.tsx` to connect `currentSide` to `FocalCardView`, display current side indicator, and wire manual phase toggle shortcut
- [X] T049 [P] Execute Vitest unit test suite verifying 100% passing tests for two-phase timing engine and all core modules in `tests/unit/`
- [X] T050 Execute build and packaging verification with `npm run build` and `npm run package` verifying binary at `dist-release/win-unpacked/Rapid Flashcard Stream.exe`

---

## Phase 11: Granular Duration Control, Favorites Stream Filtering & Single-Word Ergonomics

**Purpose**: Implement 1ms granular duration slider (50ms - 2000ms), synchronized direct number input, duration-oriented stepper buttons, Favorites derived deck filtering, and strict single-word Turkish definitions.

- [X] T051 [P] [US1] Update `SPEED_LIMITS` in `src/core/models/index.ts` to set `MAX_MS: 2000`, `STEP_MS: 1` and export single-word validator
- [X] T052 [P] [US5] Update default seed vocabulary in `src/core/storage/seedData.ts` with 50 academic/YDS flashcards strictly having single-word Turkish definitions
- [X] T053 [US1] Refactor `SpeedControl` component in `src/ui/components/SpeedControl.tsx` to support range 50-2000 with `step=1`, corrected duration-oriented +/- buttons (- decreases ms, + increases ms), and synchronized number input
- [X] T054 [US4] Implement Favorites filtering tab ('ALL' | 'FAVORITES') and derived deck state (`activeCards`) with empty favorites warning in `src/ui/views/StreamView.tsx`
- [X] T055 [US1] Update `useTimingEngine` and keyboard shortcut handlers in `src/ui/views/StreamView.tsx` and `src/ui/hooks/useKeyboardControls.ts` to align +/- duration adjustments with the new duration semantics
- [X] T056 [P] Update unit tests in `tests/unit/timing-engine.test.ts` to verify 50-2000ms bounds and 1ms step adjustments
- [X] T057 [P] Execute Vitest unit test suite to verify 100% passing tests across all test suites in `tests/unit/`
- [X] T058 Execute production build and packaging with `npm run build` and `npm run package` to verify Windows .exe in `dist-release/win-unpacked/`

---

## Phase 12: Left Vertical Speed Dock & Bottom Bar Simplification (User Story 1 Refactor)

**Purpose**: Relocate speed controls from the bottom footer to an independent Left Vertical Speed Dock (`fixed left-6 top-1/2 -translate-y-1/2`), implement a native vertical slider (`writing-mode: vertical-lr; direction: rtl`, height 160px–180px, width 88px–110px), compact preset buttons, and simplify the bottom bar to progress and transport controls only.

- [X] T059 [P] [US1] Refactor `SpeedControl` component in `src/ui/components/SpeedControl.tsx` to implement the Left Vertical Speed Dock:
  - Structure as a compact vertical tower (`w-24`, 96px width, `flex flex-col items-center gap-2.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-3 shadow-2xl`)
  - Speed Icon (`Zap` ⚡) in soft indigo container at the top
  - Direct numeric input (`[ 50 ] ms`) with rate indicator (`~20.0 kart/sn`)
  - `(+)` Stepper Button (duration increase / slower flow) placed directly above the slider
  - Native vertical slider: `<input type="range">` with fixed height (`h-44` / 176px), `min=50`, `max=2000`, `step=1`, and inline CSS `style={{ writingMode: 'vertical-lr', direction: 'rtl' }}` so pulling up increases ms and pulling down decreases ms
  - `(-)` Stepper Button (duration decrease / faster flow) placed directly below the slider
  - Compact preset buttons (`100ms`, `200ms`, `350ms`, `500ms`, `1000ms`) arranged in a 2-column grid (`grid grid-cols-2 gap-1 w-full`)
- [X] T060 [US1] Mount Left Vertical Speed Dock as an independent floating overlay in `src/ui/views/StreamView.tsx`:
  - Position container at `fixed left-6 top-1/2 -translate-y-1/2 z-20` (out-of-flow)
  - Ensure central optical container (`<main>` with `FocalCardView`) maintains 0px horizontal layout shift and remains strictly centered on screen
- [X] T061 [US1] Streamline bottom control footer in `src/ui/views/StreamView.tsx`:
  - Remove `SpeedControl` from `footer`
  - Retain exclusively: `ProgressBar` ("Kart X / Y", "Döngü Açık"), Transport Buttons (`RotateCcw`, `SkipBack`, `Play`/`Pause`, `SkipForward`), and keyboard shortcut reminder badges
- [X] T062 [P] [US1] Verify input protection and shortcuts in `tests/unit/keyboard-controls.test.ts` to ensure focused typing in the dock's numeric input suppresses playback hotkeys
- [X] T063 [P] Execute Vitest unit test suite to verify 100% passing tests across all test suites in `tests/unit/`
- [X] T064 Execute production build and packaging with `npm run build` and `npm run package` to verify Windows `.exe` at `dist-release/win-unpacked/Rapid Flashcard Stream.exe`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001-T006) [DONE]
       │
       ▼
Phase 2: Foundational (T007-T013) [DONE]
       │
       ├────────────────────────┬────────────────────────┐
       ▼                        ▼                        ▼
Phase 3: US1 Stream (T014-T019)  Phase 5: US3 CSV (T023-T026)  Phase 6: US4 Decks (T027-T030)
[DONE]                           [DONE]                        [DONE]
       │
       ▼
Phase 4: US2 Keyboard (T020-T022) [DONE]
       │
       ▼
Phase 7: US5 Visual Ergonomics (T031-T033) [DONE]
       │
       ▼
Phase 8: Polish & Packaging (T034-T037) [DONE]
       │
       ▼
Phase 9: Electron ESM Compatibility & Packaging Fixes (T038-T042) [DONE]
       │
       ▼
Phase 10: Two-Phase Sequential State Machine Refactoring (T043-T050) [DONE]
       │
       ▼
Phase 11: Granular Duration Control, Favorites & Single-Word Ergonomics (T051-T058) [DONE]
       │
       ▼
Phase 12: Left Vertical Speed Dock & Bottom Bar Simplification (T059-T064) [DONE]
       ├─ T059 (SpeedControl vertical tower refactor) [DONE]
       ├─ T060 (StreamView floating dock mounting) [DONE]
       ├─ T061 (StreamView bottom footer streamlining) [DONE]
       ├─ T062 (Keyboard controls input protection verification) [DONE]
       ├─ T063 (Vitest 100% test pass) [DONE]
       └─ T064 (Production build & Windows .exe package) [DONE]
```

### Parallel Opportunities in Phase 12

- **T059** (`SpeedControl.tsx`) can be coded while **T062** (`keyboard-controls.test.ts`) is verified.
- **T060** & **T061** (`StreamView.tsx`) can be implemented in unified layout updates.
- **T063** and **T064** run at the completion checkpoint.

---

## Notes

- Total Tasks: 64 (T001 - T064)
- Completed Tasks: 64 (T001 - T064)
- Pending Tasks: 0
- Target Executable: `dist-release/win-unpacked/Rapid Flashcard Stream.exe` (188 MB)
- Format Verification: 100% compliant with `- [ ] [TaskID] [P?] [Story?] Description with file path` standard.
