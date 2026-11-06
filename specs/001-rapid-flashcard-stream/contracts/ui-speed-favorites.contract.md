# Contract: SpeedControl & Favorites Derived State

**Feature**: `001-rapid-flashcard-stream`
**Module**: `src/ui/components/SpeedControl.tsx` & `src/ui/views/StreamView.tsx`

## 1. SpeedControl Component Contract

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

### Invariants:
1. **Slider Parameters**: `<input type="range" min={min} max={max} step={1} value={intervalMs} />`
2. **Synchronized Numeric Input**: `<input type="number" min={min} max={max} step={1} value={intervalMs} />`
   - Clamps on change / blur: `Math.max(50, Math.min(2000, Number(val)))`
3. **Stepper Semantics**:
   - Clicking `-` button executes `onStepDelta(-10)` (or `-1`), decrementing millisecond value.
   - Clicking `+` button executes `onStepDelta(+10)` (or `+1`), incrementing millisecond value.

---

## 2. Favorites Filtering & Derived Deck Contract

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

