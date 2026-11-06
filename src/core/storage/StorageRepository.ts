import { FlashcardDatabase, db } from './Database';
import type { Deck, Card } from '../models';

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
  getAllDecks(): Promise<Deck[]>;
  getDeckById(id: string): Promise<Deck | null>;
  createDeck(input: CreateDeckInput): Promise<Deck>;
  updateDeck(id: string, updates: Partial<Pick<Deck, 'name' | 'description' | 'lastReviewedAt'>>): Promise<void>;
  deleteDeck(id: string): Promise<void>;
  getCardsByDeck(deckId: string): Promise<Card[]>;
  bulkAddCards(cards: CreateCardInput[]): Promise<number>;
  toggleFavorite(cardId: string): Promise<boolean>;
  deleteCard(cardId: string): Promise<void>;
  exportAllData(): Promise<{ decks: Deck[]; cards: Card[] }>;
  importBackupData(data: { decks: Deck[]; cards: Card[] }): Promise<void>;
}

export class StorageRepository implements IStorageRepository {
  constructor(private database: FlashcardDatabase = db) {}

  async getAllDecks(): Promise<Deck[]> {
    return await this.database.decks.orderBy('createdAt').reverse().toArray();
  }

  async getDeckById(id: string): Promise<Deck | null> {
    const deck = await this.database.decks.get(id);
    return deck || null;
  }

  async createDeck(input: CreateDeckInput): Promise<Deck> {
    const now = Date.now();
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      description: input.description?.trim(),
      cardCount: 0,
      createdAt: now,
      updatedAt: now
    };
    await this.database.decks.add(newDeck);
    return newDeck;
  }

  async updateDeck(id: string, updates: Partial<Pick<Deck, 'name' | 'description' | 'lastReviewedAt'>>): Promise<void> {
    const payload: Partial<Deck> = {
      ...updates,
      updatedAt: Date.now()
    };
    if (updates.name) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description.trim();
    await this.database.decks.update(id, payload);
  }

  async deleteDeck(id: string): Promise<void> {
    await this.database.transaction('rw', this.database.decks, this.database.cards, async () => {
      await this.database.cards.where('deckId').equals(id).delete();
      await this.database.decks.delete(id);
    });
  }

  async getCardsByDeck(deckId: string): Promise<Card[]> {
    return await this.database.cards
      .where('deckId')
      .equals(deckId)
      .sortBy('orderIndex');
  }

  async bulkAddCards(cardInputs: CreateCardInput[]): Promise<number> {
    if (cardInputs.length === 0) return 0;
    const now = Date.now();
    const deckId = cardInputs[0].deckId;

    return await this.database.transaction('rw', this.database.decks, this.database.cards, async () => {
      const existingCount = await this.database.cards.where('deckId').equals(deckId).count();
      
      const newCards: Card[] = cardInputs.map((input, idx) => ({
        id: crypto.randomUUID(),
        deckId: input.deckId,
        front: input.front.trim(),
        back: input.back.trim(),
        orderIndex: input.orderIndex ?? (existingCount + idx),
        isFavorite: false,
        createdAt: now
      }));

      await this.database.cards.bulkAdd(newCards);
      const totalCount = await this.database.cards.where('deckId').equals(deckId).count();
      await this.database.decks.update(deckId, {
        cardCount: totalCount,
        updatedAt: now
      });

      return newCards.length;
    });
  }

  async toggleFavorite(cardId: string): Promise<boolean> {
    const card = await this.database.cards.get(cardId);
    if (!card) return false;
    const nextState = !card.isFavorite;
    await this.database.cards.update(cardId, { isFavorite: nextState });
    return nextState;
  }

  async deleteCard(cardId: string): Promise<void> {
    const card = await this.database.cards.get(cardId);
    if (!card) return;
    await this.database.transaction('rw', this.database.decks, this.database.cards, async () => {
      await this.database.cards.delete(cardId);
      const totalCount = await this.database.cards.where('deckId').equals(card.deckId).count();
      await this.database.decks.update(card.deckId, {
        cardCount: totalCount,
        updatedAt: Date.now()
      });
    });
  }

  async exportAllData(): Promise<{ decks: Deck[]; cards: Card[] }> {
    const decks = await this.database.decks.toArray();
    const cards = await this.database.cards.toArray();
    return { decks, cards };
  }

  async importBackupData(data: { decks: Deck[]; cards: Card[] }): Promise<void> {
    await this.database.transaction('rw', this.database.decks, this.database.cards, async () => {
      if (data.decks?.length) {
        await this.database.decks.bulkPut(data.decks);
      }
      if (data.cards?.length) {
        await this.database.cards.bulkPut(data.cards);
      }
    });
  }
}

export const storageRepository = new StorageRepository();

