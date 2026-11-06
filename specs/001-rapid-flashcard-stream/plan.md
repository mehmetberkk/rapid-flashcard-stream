# Implementation Plan: Rapid Flashcard Stream

**Branch**: `001-rapid-flashcard-stream` | **Date**: 2026-11-05 (Updated: 2026-11-06) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-rapid-flashcard-stream/spec.md` with Granular Duration Controls (1ms step), Favorites Derived Deck Stream, and Single-Word Meaning Ergonomics.

## Summary

The Rapid Flashcard Stream application is a high-speed desktop vocabulary review tool designed for rapid word recognition (e.g. YDS, TOEFL, GRE). The system enables continuous streaming of flashcards at user-defined speeds between 50ms and 2000ms with instant-cut transitions and a locked central optical focus. 

### Core State Machine & Architectural Invariants

1. **Two-Phase State Machine (`currentSide: 'FRONT' | 'BACK'`)**:
   - Sequential presentation: Phase 1 (`FRONT`, English term) for `frontDurationMs`, followed immediately by Phase 2 (`BACK`, Turkish definition) for `backDurationMs`.
   - Tick transitions: on `FRONT` timeout, switch to `BACK` (keep `currentIndex`); on `BACK` timeout, switch to `FRONT` and advance `currentIndex + 1` (or loop to `0`).
2. **Granular Duration Control & Input Synchronization**:
   - Range slider: `min="50" max="2000" step="1"`.
   - Direct Numeric Input: `<input type="number" min="50" max="2000" step="1" />` synchronized bidirectionally.
   - Duration-Oriented Buttons:
     - `-` button decreases millisecond duration (`Math.max(50, currentMs - 10)`), making playback faster.
     - `+` button increases millisecond duration (`Math.min(2000, currentMs + 10)`), giving the user more display time.
3. **Favorites Mode & Derived Deck Architecture**:
   - `deckFilter: 'ALL' | 'FAVORITES'` state.
   - Derived array feeding engine: `activeCards = deckFilter === 'FAVORITES' ? cards.filter(c => c.isFavorite) : cards`.
   - Filter switch automatically resets card pointer (`seek(0)`).
   - Empty favorites guard: blocks stream playback and shows an informative notice when 0 favorites exist.
4. **Single-Word Meaning Ergonomics (Zero Horizontal Saccades)**:
   - 1 English Word = 1 Turkish Word standard across pre-seeded sample data (`src/core/storage/seedData.ts`) and card entry forms.
   - Eliminates reading eye movements across wide text, locking user gaze directly on screen center.

### Desktop Shell & ESM Compliance Architecture

Because `package.json` defines `"type": "module"`, all Electron Main and Preload processes strictly follow modern ECMAScript Module (ESM) standards:
1. **No CommonJS Globals**: CommonJS globals (`__dirname`, `__filename`, `require`) are strictly prohibited in Electron scripts.
2. **ESM Path Resolution**: Directory paths are deterministically derived via `node:url` and `node:path`:
   ```typescript
   import path from 'node:path';
   import { fileURLToPath } from 'node:url';

   const currentDir = path.dirname(fileURLToPath(import.meta.url));
   ```
3. **Preload & Asset Resolution**: Preload script binding and packaged `.asar` file paths adhere to the ESM path resolution standard across development and production builds.

---

## Technical Context

- **Language/Version**: TypeScript 5.x / Node.js v24.22.1 / React 19 (ESM: `"type": "module"`)
- **Primary Dependencies**: React 19, Vite, Electron, electron-builder, Dexie.js, Tailwind CSS, Lucide-React
- **Storage**: IndexedDB via Dexie.js (local-first, zero native compilation required, handles 50,000+ cards)
- **Testing**: Vitest (headless unit testing with fake timers and mocked time providers)
- **Target Platform**: Windows 10/11 Desktop (`.exe` standalone portable application / installer)
- **Project Type**: Desktop Application (Electron + React)
- **Performance Goals**: 60–120 FPS smooth rendering, zero timing drift across 50ms–2000ms intervals (1ms step), <2ms card navigation latency
- **Constraints**: 100% offline-capable, zero external backend/cloud server, strict prohibition of 3D card-flip animations (instant cut only), full keyboard control, strict ESM path resolution in Electron main/preload, strict Single-Side Exclusivity (no stacked front/back)
- **Scale/Scope**: Supports decks containing up to 10,000+ words with instantaneous CSV importing and diagnostic reporting

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Principle | Requirement | Plan Alignment | Status |
|---|---|---|:---:|
| **I. Bilişsel Ergonomi ve Sabit Odak** | Fixed optical center, zero 3D flip / slide animations, instant cut transitions, Single-Side Exclusivity, Single-Word Meaning | Stream view locks text in central focal box; transitions switch DOM state instantly; `currentSide` conditional rendering ensures word and meaning are never stacked; single-word Turkish meanings eliminate saccades | **PASS** |
| **II. Hassas Zamanlama Motoru** | Drift-free 50ms–2000ms loop via `performance.now()` with 1ms precision and delta-time accumulator | `TimingEngine` class implements two-phase transition logic (`FRONT` -> `BACK` -> next card `FRONT`) with 1ms granularity and fake-timer testability | **PASS** |
| **III. Klavye Öncelikli Kontrol** | `Space` (Play/Pause), `Up/Down` (Duration), `Right/Left` (Nav), `Enter/T` (Face toggle), `F` (Favorite) | Window-level keyboard listener with input-field protection (allows typing in numeric speed input) | **PASS** |
| **IV. Local-First ve Hataya Dayanıklı Veri** | Offline IndexedDB storage, fault-tolerant CSV parsing with diagnostic reports | Pure Dexie.js client database; streaming CSV parser collects line errors without failing valid lines | **PASS** |
| **V. Headless İş Mantığı ve Test Edilebilirlik** | Decoupled core in pure TypeScript with unit tests | `TimingEngine`, `CsvParser`, and storage repositories written without React/DOM dependencies and tested via Vitest | **PASS** |
| **Performans ve Kod Standartları** | Strict TypeScript, zero `any`, minimal overhead | `strict: true` in tsconfig, strict ESM path resolution in Electron (`node:url` + `node:path`) | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-rapid-flashcard-stream/
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 research decisions (Electron ESM, Dexie, TimingEngine, Granular Duration, Favorites)
├── data-model.md        # Phase 1 data entities, derived deck model, database schema
├── quickstart.md        # Phase 1 end-to-end verification guide
├── contracts/           # Phase 1 headless API contracts
│   ├── timing-engine.contract.md        # Two-phase timing engine contract
│   ├── ui-speed-favorites.contract.md   # SpeedControl & Favorites filter contract
│   ├── csv-parser.contract.md
│   └── storage.contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── spec.md              # Feature specification
```

### Source Code Layout

```text
src/
├── core/                             # Headless pure TypeScript layer (Zero React/DOM imports)
│   ├── models/                       # Type definitions, SPEED_LIMITS (50-2000ms), validation helpers
│   │   └── index.ts
│   ├── timing-engine/                # Drift-free precision timer with two-phase state machine
│   │   └── TimingEngine.ts
│   ├── parser/                       # Resilient CSV/TSV parser
│   │   └── CsvParser.ts
│   └── storage/                      # Local-first persistence
│       ├── Database.ts               # Dexie.js instance
│       ├── seedData.ts               # 50 high-frequency YDS words (strict 1 Eng = 1 Tr word)
│       └── StorageRepository.ts      # Repository implementation
├── electron/                         # Native desktop shell (Strict ESM)
│   ├── main.ts                       # Electron main process (fileURLToPath ESM path resolution)
│   └── preload.ts                    # Context bridge
├── ui/                               # Presentation layer (React 19 + Tailwind)
│   ├── components/                   # Reusable ergonomic UI components
│   │   ├── FocalCardView.tsx         # Single-container conditional face renderer with badges
│   │   ├── SpeedControl.tsx          # 1ms step range slider, synchronized number input, duration steppers
│   │   ├── ProgressBar.tsx           # Deck progress indicator
│   │   ├── ImportReportModal.tsx     # Fault diagnostic modal
│   │   └── DeckCard.tsx              # Deck selection card
│   ├── views/                        # Main application screens
│   │   ├── DashboardView.tsx         # Deck list and CSV import screen
│   │   └── StreamView.tsx            # Fullscreen rapid review screen (Favorites filter tab, empty state alert)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTimingEngine.ts        # Bridges headless engine to React state (exposes currentSide)
│   │   ├── useKeyboardControls.ts    # Global hotkey dispatcher (protects typing in speed input)
│   │   └── useDecks.ts               # Storage query hook
│   ├── styles/                       # CSS & Tailwind entry
│   │   └── index.css
│   ├── App.tsx                       # Root view router / layout
│   └── main.tsx                      # React DOM mount point
tests/
├── unit/
│   ├── timing-engine.test.ts         # Two-phase transition & drift verification (50-2000ms)
│   ├── csv-parser.test.ts            # Delimiter detection & error tolerance tests
│   ├── storage.test.ts               # IndexedDB mock / repository operations
│   └── keyboard-controls.test.ts     # Input field protection & action mapping
package.json                          # "type": "module" enabled
tsconfig.json
vite.config.ts                        # ESM path resolution
electron-builder.json
```

---

## Complexity Tracking

*No constitution violations. All architecture decisions satisfy the core governance gates.*
