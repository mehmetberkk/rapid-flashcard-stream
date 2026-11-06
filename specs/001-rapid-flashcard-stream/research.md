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

## 11. Left Vertical Speed Dock & Vertical Slider Architecture

- **Decision**: **Independent fixed overlay dock (`fixed left-6 top-1/2 -translate-y-1/2 z-20`) with Chromium-native CSS vertical slider (`writing-mode: vertical-lr`, `direction: rtl`, fixed height `160px - 180px`) and streamlined bottom footer**.
- **Rationale**:
  - **Fixed / Out-of-Flow Overlay**: Positioning the dock out of document flow (`position: fixed` or `position: absolute` with `left: 24px`, `top: 50%`, `transform: translateY(-50%)`) guarantees that the central vocabulary card (`FocalCardView`) remains locked on the exact geometric center of the viewport (0px layout displacement), strictly honoring Constitution Principle I (Fixed Focal Point).
  - **Native Chromium Vertical Slider**: Native `<input type="range">` with `writing-mode: vertical-lr` and `direction: rtl` naturally flips the axis in Chromium/Electron so that the top corresponds to maximum duration in milliseconds (longer display time, matching the `+` button directly above it) and the bottom corresponds to minimum duration in milliseconds (shorter display time, matching the `-` button directly below it) without requiring JavaScript drag handlers or external dependencies.
  - **Compact Width (`88px - 110px`)**: With a compact width (e.g. 96px / `w-24`), the control dock stays completely clear of the central 300x200 pixel focal area on all supported desktop resolutions (1024x768 and up).
  - **Bottom Footer Streamlining**: Removing the horizontal slider from the footer simplifies the bottom bar to only three intuitive sections: deck progress bar (`ProgressBar`), central transport buttons (Reset, Prev, Play/Pause, Next), and keyboard shortcut reminder badges.
