# Contract: Headless Timing Engine (Two-Phase State Machine)

**Feature**: `001-rapid-flashcard-stream`
**Module**: `src/core/timing-engine/TimingEngine.ts`

## Purpose

Provides a drift-free, millisecond-accurate timer loop decoupled from React or DOM rendering. Operates an explicit two-phase sequential cycle (`FRONT` -> `BACK` -> next card `FRONT`) that satisfies Constitution Principle I (Fixed Focal Point & Single-Side Exclusivity), Principle II (Drift-Free Timing), and Principle V (Headless Business Logic).

## Interface Definition

```typescript
export type CardSide = 'FRONT' | 'BACK';

export interface TimingEngineConfig {
  initialIntervalMs?: number; // Base duration in ms (Default: 500, Range: 50 - 2000)
  frontDurationMs?: number;   // Front face duration (Default: initialIntervalMs)
  backDurationMs?: number;    // Back face duration (Default: initialIntervalMs)
  loop?: boolean;             // Default: true
  totalCards: number;
}

export type TimingEvent = 
  | { type: 'TICK'; index: number; side: CardSide; timestamp: number }
  | { type: 'STATE_CHANGE'; isPlaying: boolean; currentIndex: number; currentSide: CardSide; intervalMs: number }
  | { type: 'COMPLETED' };

export type TimingListener = (event: TimingEvent) => void;

export interface ITimingEngine {
  /** Starts playback loop */
  play(): void;

  /** Pauses playback loop */
  pause(): void;

  /** Toggles between play and pause */
  toggle(): void;

  /** Sets base interval speed in milliseconds (clamped between 50 and 2000) */
  setIntervalMs(ms: number): void;

  /** Sets independent front and back durations */
  setDurations(frontMs: number, backMs: number): void;

  /** Increments or decrements speed by step delta */
  adjustSpeed(deltaMs: number): void;

  /** Advances to next card (resets currentSide to FRONT) */
  next(): void;

  /** Returns to previous card (resets currentSide to FRONT) */
  prev(): void;

  /** Toggles active face manually between FRONT and BACK */
  toggleSide(): void;

  /** Explicitly sets current face */
  setSide(side: CardSide): void;

  /** Jumps directly to a specific card index (resets currentSide to FRONT) */
  seek(index: number): void;

  /** Updates total card count when deck changes */
  setTotalCards(count: number): void;

  /** Subscribes to engine state events */
  subscribe(listener: TimingListener): () => void;

  /** Returns snapshot of current engine state */
  getState(): {
    isPlaying: boolean;
    currentIndex: number;
    currentSide: CardSide;
    intervalMs: number;
    frontDurationMs: number;
    backDurationMs: number;
    totalCards: number;
    loop: boolean;
  };

  /** Cleans up running timers / animation frames */
  dispose(): void;
}
```

## Behavior and Invariants

1. **Two-Phase Tick Transition**:
   - When `currentSide === 'FRONT'`: The accumulator compares against `frontDurationMs`. When expired, `currentIndex` remains unchanged and `currentSide = 'BACK'`. Emits `TICK` with `(currentIndex, 'BACK')`.
   - When `currentSide === 'BACK'`: The accumulator compares against `backDurationMs`. When expired, `currentSide = 'FRONT'` and `currentIndex` advances to `currentIndex + 1` (or `0` if looping at the end). Emits `TICK` with `(nextIndex, 'FRONT')`.
2. **Single-Side Exclusivity Guarantee**: At any instant, `currentSide` is strictly `'FRONT'` or `'BACK'`. The UI uses this state to render only one face in the fixed focal area.
3. **Drift-Free Guarantee**: The loop calculates delta time using `performance.now()`. If a frame delays, the delta accumulator tracks the exact elapsed time without skipping phases or cards silently.
4. **Bounds Enforcement**:
   - `intervalMs`, `frontDurationMs`, `backDurationMs` are strictly clamped: `50 <= duration <= 2000`.
   - `currentIndex` is strictly clamped: `0 <= currentIndex < totalCards`.
5. **Purity**: Zero DOM or React imports; accepts a pluggable `TimeProvider` for 100% deterministic unit testing with fake timers.
