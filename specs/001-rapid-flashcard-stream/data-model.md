# Data Model: Rapid Flashcard Stream

**Feature**: `001-rapid-flashcard-stream`
**Date**: 2026-11-05 (Updated: 2026-11-06)

## Entity Definitions

### 1. Deck

Represents a collection of flashcards created by the user or imported from a CSV file.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` (UUID v4) | Yes | Primary key |
| `name` | `string` | Yes | Human-readable deck title (1-100 characters) |
| `description` | `string` | No | Optional notes or subject details |
| `cardCount` | `number` | Yes | Cached total number of cards in the deck |
| `createdAt` | `number` (timestamp) | Yes | Creation time in milliseconds |
| `updatedAt` | `number` (timestamp) | Yes | Last modification time in milliseconds |
| `lastReviewedAt` | `number` (timestamp) | No | Timestamp of the most recent streaming session |

**Validation Rules**:
- `name` must not be empty or whitespace only.
- `cardCount` must be non-negative integer.

---

### 2. Card

Represents a single flashcard item belonging to a specific deck with Single-Word Meaning ergonomics.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` (UUID v4) | Yes | Primary key |
| `deckId` | `string` (UUID v4) | Yes | Foreign key referencing parent `Deck.id` (Indexed) |
| `front` / `word` | `string` | Yes | Front face text (Term / English Word) |
| `back` / `meaning` | `string` | Yes | Back face text (Single-Word Turkish Definition) |
| `orderIndex` | `number` | Yes | Zero-based index determining sequence in the deck |
| `isFavorite` | `boolean` | Yes | Bookmark flag for difficult words (default: `false`) |
| `createdAt` | `number` (timestamp) | Yes | Record creation timestamp |

**Validation Rules**:
- `front` and `back` must contain at least 1 non-whitespace character.
- `back` is validated to promote exactly 1 word (no whitespace or commas) for optimal optical ergonomics.
- `orderIndex` must be a non-negative integer.

---

### 3. ImportReport

Diagnostic summary generated whenever a CSV or TSV file is parsed into a deck.

| Field | Type | Required | Description |
|---|---|---|---|
| `fileName` | `string` | Yes | Original file name uploaded by user |
| `totalLines` | `number` | Yes | Total physical lines in the file |
| `importedCount` | `number` | Yes | Total valid cards added to the deck |
| `skippedCount` | `number` | Yes | Total rejected or invalid lines |
| `errors` | `ImportErrorItem[]` | Yes | Detailed list of diagnostic entries |
| `timestamp` | `number` (timestamp) | Yes | When the import took place |

#### `ImportErrorItem`
- `lineNumber`: `number` (1-based physical line index)
- `rawContent`: `string` (The unparsed or malformed raw line text)
- `reason`: `string` (Human-readable explanation, e.g. "Missing delimiter", "Empty term")

---

### 4. PlaybackSession

Ephemeral or persistent runtime state of the active streaming engine with Two-Phase state machine, granular duration (50ms - 2000ms, step=1), and Favorites filtering.

| Field | Type | Default | Description |
|---|---|---|---|
| `deckId` | `string \| null` | `null` | Currently loaded deck ID |
| `currentIndex` | `number` | `0` | Active card pointer in the active subset |
| `currentSide` | `'FRONT' \| 'BACK'` | `'FRONT'` | Active face in the two-phase sequential cycle |
| `deckFilter` | `'ALL' \| 'FAVORITES'` | `'ALL'` | Active deck filtering view |
| `isPlaying` | `boolean` | `false` | Current playback state (`true` = running, `false` = paused) |
| `intervalMs` | `number` | `500` | Stream duration per phase (Clamped: `50` to `2000` ms, step=1) |
| `frontDurationMs` | `number` | `500` | Duration for Front face (Clamped: `50` to `2000` ms) |
| `backDurationMs` | `number` | `500` | Duration for Back face (Clamped: `50` to `2000` ms) |
| `loop` | `boolean` | `true` | When `true`, loops to card 0 upon completing the last card's Back face |

**Validation Rules**:
- `currentSide` must be either `'FRONT'` or `'BACK'`.
- `deckFilter` must be either `'ALL'` or `'FAVORITES'`.
- `intervalMs`, `frontDurationMs`, and `backDurationMs` must be integers between 50 and 2000.
- `currentIndex` must remain between `0` and `Math.max(0, activeCardCount - 1)`.

---

### 5. Derived Deck Architecture (Favorites Mode)

```
        Raw Cards from Storage [card_0, card_1, ... card_N]
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [deckFilter === 'ALL']         [deckFilter === 'FAVORITES']
                  │                               │
                  ▼                               ▼
        activeCards = cards           activeCards = cards.filter(c => c.isFavorite)
                  │                               │
                  └───────────────┬───────────────┘
                                  ▼
                   TimingEngine({ totalCards: activeCards.length })
```

---

## Database Schema (Dexie.js / IndexedDB)

```typescript
import Dexie, { Table } from 'dexie';

export interface DeckRecord {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  createdAt: number;
  updatedAt: number;
  lastReviewedAt?: number;
}

export interface CardRecord {
  id: string;
  deckId: string;
  front: string;
  back: string;
  orderIndex: number;
  isFavorite: boolean;
  createdAt: number;
}

export class FlashcardDatabase extends Dexie {
  decks!: Table<DeckRecord, string>;
  cards!: Table<CardRecord, string>;

  constructor() {
    super('RapidFlashcardDB');
    this.version(1).stores({
      decks: 'id, name, createdAt, lastReviewedAt',
      cards: 'id, deckId, orderIndex, isFavorite, createdAt'
    });
  }
}
```
