import Dexie, { type Table } from 'dexie';
import type { Deck, Card } from '../models';

export class FlashcardDatabase extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;

  constructor() {
    super('RapidFlashcardDB');
    this.version(1).stores({
      decks: 'id, name, createdAt, updatedAt',
      cards: 'id, deckId, [deckId+orderIndex], isFavorite, createdAt'
    });
  }
}

export const db = new FlashcardDatabase();

