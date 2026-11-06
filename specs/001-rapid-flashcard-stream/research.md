# Technical Research: Rapid Flashcard Stream

**Feature**: `001-rapid-flashcard-stream`
**Date**: 2026-11-05 (Updated: 2026-11-06)
**Author**: Antigravity Assistant

## 1. Desktop Shell & Windows .exe Packaging

- **Decision**: **Electron + electron-builder** with Vite + React + TypeScript and **Strict ESM Architecture**.
- **Rationale**:
  - Standalone Windows `.exe` executable output without requiring Rust toolchain.
  - Strict ESM compliance: `fileURLToPath(import.meta.url)` and `path.dirname()` resolve all directories; zero CommonJS globals (`__dirname`).
- **Alternatives Considered**: Tauri (requires Rust/MSVC), Browser-only (no .exe).

## 2. Frontend Framework & UI Library

- **Decision**: **React 19 + TypeScript + Vite + Tailwind CSS**.
- **Rationale**: Clean, modern, distraction-free interface with instant state propagation and high-contrast typography.

## 3. Local Storage / Database Architecture

- **Decision**: **Dexie.js (IndexedDB wrapper)** with JSON export/import backup.
- **Rationale**: High performance, zero native binary compilation issues on Windows, instant filtered queries on `isFavorite`.

## 4. Drift-Free Timing Engine & Two-Phase State Machine

- **Decision**: **Headless `TimingEngine` class using `performance.now()` with delta-time accumulator, sub-frame scheduling, and two-phase sequential state machine (`currentSide: 'FRONT' | 'BACK'`)**.
- **Rationale**: Complies strictly with Constitution Principle II: Drift-free timing across 50ms – 2000ms/3000ms.
- **Two-Phase Transition Logic**:
  - In `FRONT`: wait `frontDurationMs`, switch to `BACK` without incrementing index.
  - In `BACK`: wait `backDurationMs`, switch to `FRONT` and advance index (`currentIndex + 1`).

## 5. Fault-Tolerant CSV Parser

- **Decision**: **Headless pure TypeScript streaming/line-by-line parser** with automated delimiter detection (`,`, `;`, `\t`), BOM removal, and structured diagnostics report.

## 6. Keyboard Control System

- **Decision**: **Window-level Keyboard Dispatcher with input-field protection**.
- **Rationale**: Space (Play/Pause), Up/Down (Duration), Left/Right (Step), Enter/T (Face toggle), F (Favorite bookmark), Esc (Back). Protects typing in numeric speed input.

## 7. Single-Side Exclusivity & Focal Rendering Architecture

- **Decision**: **Single-Container Conditional Rendering (`currentSide === 'FRONT' ? card.word : card.meaning`) with visual distinction**.
- **Rationale**: Front and Back are never stacked. Exactly one centered text node exists in DOM at any millisecond.

## 8. Granular Duration Control & Input Synchronization

- **Decision**: **Linear 1ms-resolution range slider (`min=50 max=2000 step=1`) synchronized bidirectionally with a `<input type="number" />` and millisecond-oriented steppers**.
- **Rationale**:
  - Cognitive recognition limits differ by tens of milliseconds. Coarse 50ms quantization prevented precise speed matching.
  - **Direction Semantics**:
    - Stepper `-` decreases millisecond duration (`Math.max(50, currentMs - 10)` or `-1`), making cards advance faster.
    - Stepper `+` increases millisecond duration (`Math.min(2000, currentMs + 10)` or `+1`), giving the learner more time.
  - **Numeric Input**: Direct keyboard entry with blur/change clamping guarantees fast setting of exact targets (e.g. 187ms) without slider hunting.

## 9. Favorites Filtering & Derived Deck Architecture

- **Decision**: **Declarative Derived State (`activeCards = deckFilter === 'FAVORITES' ? cards.filter(c => c.isFavorite) : cards`) feeding the timing engine**.
- **Rationale**:
  - Isolates problem cards into a dedicated review loop without altering database deck structures.
  - Automatic index resetting (`seek(0)`) prevents out-of-bounds pointer invalidation when filtering.
  - Empty-state guard prevents playback initialization when 0 favorites exist, displaying an ergonomic modal/toast notice.

## 10. Single-Word Meaning Ergonomics (Zero Saccade Standard)

- **Decision**: **1 English Word = 1 Turkish Word standard across pre-seeded sample data and entry validation**.
- **Rationale**:
  - Multi-word phrases or definitions with comma separations require horizontal eye saccades.
  - At speeds under 300ms, saccades induce cognitive fatigue and blur recognition. Restricting definition to a single Turkish equivalent keeps user gaze perfectly motionless at the screen center.
