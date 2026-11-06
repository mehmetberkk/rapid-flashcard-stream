# Contract: SpeedControl & Favorites Derived State

**Feature**: `001-rapid-flashcard-stream`
**Module**: `src/ui/components/SpeedControl.tsx` & `src/ui/views/StreamView.tsx`

## 1. Left Vertical Speed Dock Component Contract

```typescript
export interface SpeedControlProps {
  intervalMs: number;
  min?: number;              // Default: 50
  max?: number;              // Default: 2000
  step?: number;             // Default: 1
  onSpeedChange: (ms: number) => void;
  onStepDelta: (deltaMs: number) => void;
}
```

### DOM & Styling Architecture Invariants:

1. **Spatial Layout & Independent Layer**:
   - Container positioned as an independent overlay: `fixed left-6 top-1/2 -translate-y-1/2 z-20` (or `absolute left-6 top-1/2 -translate-y-1/2 z-20`).
   - Width: strictly constrained to `88px - 110px` (e.g. `w-24` = 96px).
   - Layout: `flex flex-col items-center gap-2.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-3 shadow-2xl`.
   - Optical Center Invariant: Mounting or unmounting the dock produces **0px** displacement on the central focal card (`FocalCardView`).

2. **Dikey Panel İçi Hiyerarşi (Top to Bottom)**:
   - **Header**: Speed Icon (`Zap`, `w-4 h-4 text-indigo-400` inside rounded badge).
   - **Direct Numeric Input & Rate**:
     - Numeric input: `<input type="number" min={min} max={max} step={1} value={intervalMs} />` (`w-16 text-center font-mono`).
     - Sub-labels: `ms/faz` and `~{cardsPerSec} kart/sn`.
   - **Duration Stepper `(+)` (Above Slider)**:
     - Button triggering `onStepDelta(+10)` (increases ms, slower flow).
   - **Dikey Range Slider**:
     - `<input type="range" min={min} max={max} step={1} value={intervalMs} />`
     - Height: strictly fixed between `160px` and `180px` (`h-44` = 176px / `h-[160px]`).
     - CSS: `style={{ writingMode: 'vertical-lr', direction: 'rtl' }}` ensuring top = higher duration (ms), bottom = lower duration (ms).
   - **Duration Stepper `(-)` (Below Slider)**:
     - Button triggering `onStepDelta(-10)` (decreases ms, faster flow).
   - **Quick Speed Presets**:
     - Compact buttons (`100ms`, `200ms`, `350ms`, `500ms`, `1000ms`) stacked vertically or in a 2-column grid (`grid grid-cols-2 gap-1 w-full`).

---

## 2. StreamView Bottom Bar Contract

### Simplified Footer Layout:
- Top: `<ProgressBar currentIndex={currentIndex} totalCards={activeCards.length} loop={loop} onToggleLoop={...} />`
- Middle: Main Transport Controls (Reset `RotateCcw`, Prev `SkipBack`, Play/Pause `Play`/`Pause`, Next `SkipForward`).
- Bottom: Keyboard shortcut badges (`Space`, `↑/↓`, `←/→`, `Enter/T`, `F`, `Esc`).
- Invariant: Zero speed adjustment controls are rendered inside the bottom footer.

---

## 3. Favorites Filtering & Derived Deck Contract

```typescript
export type DeckFilter = 'ALL' | 'FAVORITES';

export interface StreamViewState {
  cards: Card[];
  deckFilter: DeckFilter;
}
```

### Derivation Rule:
```typescript
const activeCards = deckFilter === 'FAVORITES' 
  ? cards.filter((c) => c.isFavorite) 
  : cards;
```

### Invariants:
1. `useTimingEngine` receives `totalCards: activeCards.length`.
2. When `deckFilter` transitions (e.g. `'ALL'` -> `'FAVORITES'`), `seek(0)` is executed immediately.
3. If `deckFilter === 'FAVORITES'` and `activeCards.length === 0`:
   - Start playback is blocked.
   - Informative notice is displayed: `"Favorilere eklenmiş kart bulunmuyor."`
4. Card bookmarking (`F` or star button) toggles `card.isFavorite` and immediately persists to Dexie.js without losing current focal position.
