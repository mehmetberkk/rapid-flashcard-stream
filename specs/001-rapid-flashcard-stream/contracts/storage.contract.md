# Contract: Storage Repository

**Feature**: `001-rapid-flashcard-stream`
**Module**: `src/core/storage/StorageRepository.ts`

## Purpose

Abstracts local persistence for decks and cards, backed by IndexedDB (Dexie.js), conforming to Constitution Principle IV (Local-First).

## Interface Definition

```typescript
import { DeckRecord, CardRecord } from '../models';

export interface CreateDeckInput {
  name: string;
  description?: string;
}

export interface CreateCardInput {
  deckId: string;
  front: string;
  back: string;
  orderIndex?: number;
}

export interface IStorageRepository {
  // Deck operations
  getAllDecks(): Promise<DeckRecord[]>;
  getDeckById(id: string): Promise<DeckRecord | null>;
  createDeck(input: CreateDeckInput): Promise<DeckRecord>;
  updateDeck(id: string, updates: Partial<Pick<DeckRecord, 'name' | 'description' | 'lastReviewedAt'>>): Promise<void>;
  deleteDeck(id: string): Promise<void>; // Cascades deletion of all cards in deck

  // Card operations
  getCardsByDeck(deckId: string): Promise<CardRecord[]>;
  bulkAddCards(cards: CreateCardInput[]): Promise<number>; // Returns count of inserted cards
  toggleFavorite(cardId: string): Promise<boolean>;
  deleteCard(cardId: string): Promise<void>;

  // Export / Backup
  exportAllData(): Promise<{ decks: DeckRecord[]; cards: CardRecord[] }>;
  importBackupData(data: { decks: DeckRecord[]; cards: CardRecord[] }): Promise<void>;
}
```

## Behavior and Invariants

1. **Transactional Integrity**: When a deck is deleted, all cards associated with that `deckId` are deleted within a single database transaction.
2. **Offline-Only**: Zero network calls or external authentication. All operations run directly against the local browser/Electron storage sandbox.

