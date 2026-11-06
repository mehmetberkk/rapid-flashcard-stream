import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { FlashcardDatabase } from '../../src/core/storage/Database';
import { StorageRepository } from '../../src/core/storage/StorageRepository';

describe('StorageRepository Unit Tests', () => {
  let db: FlashcardDatabase;
  let repo: StorageRepository;

  beforeEach(async () => {
    // Unique DB name per test to avoid state bleeding
    db = new FlashcardDatabase();
    repo = new StorageRepository(db);
  });

  it('creates, retrieves, and updates decks', async () => {
    const deck = await repo.createDeck({ name: 'Test YDS Deck', description: 'Sample' });
    expect(deck.id).toBeDefined();
    expect(deck.name).toBe('Test YDS Deck');
    expect(deck.cardCount).toBe(0);

    const retrieved = await repo.getDeckById(deck.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Test YDS Deck');

    await repo.updateDeck(deck.id, { name: 'Updated Title' });
    const afterUpdate = await repo.getDeckById(deck.id);
    expect(afterUpdate?.name).toBe('Updated Title');
  });

  it('adds cards in bulk and updates card count accurately', async () => {
    const deck = await repo.createDeck({ name: 'Vocab Deck' });
    const count = await repo.bulkAddCards([
      { deckId: deck.id, front: 'Abundant', back: 'Bol' },
      { deckId: deck.id, front: 'Scarce', back: 'Kıt' }
    ]);

    expect(count).toBe(2);

    const cards = await repo.getCardsByDeck(deck.id);
    expect(cards.length).toBe(2);
    expect(cards[0].front).toBe('Abundant');
    expect(cards[1].front).toBe('Scarce');

    const updatedDeck = await repo.getDeckById(deck.id);
    expect(updatedDeck?.cardCount).toBe(2);
  });

  it('cascades deletion of cards when a deck is deleted', async () => {
    const deck = await repo.createDeck({ name: 'To be deleted' });
    await repo.bulkAddCards([
      { deckId: deck.id, front: 'Card1', back: 'Meaning1' },
      { deckId: deck.id, front: 'Card2', back: 'Meaning2' }
    ]);

    await repo.deleteDeck(deck.id);

    const checkDeck = await repo.getDeckById(deck.id);
    expect(checkDeck).toBeNull();

    const remainingCards = await repo.getCardsByDeck(deck.id);
    expect(remainingCards.length).toBe(0);
  });

  it('toggles card favorite status', async () => {
    const deck = await repo.createDeck({ name: 'Fav Deck' });
    await repo.bulkAddCards([{ deckId: deck.id, front: 'Hard Word', back: 'Zor Anlam' }]);
    const [card] = await repo.getCardsByDeck(deck.id);

    expect(card.isFavorite).toBe(false);
    const toggled = await repo.toggleFavorite(card.id);
    expect(toggled).toBe(true);

    const afterToggle = (await repo.getCardsByDeck(deck.id))[0];
    expect(afterToggle.isFavorite).toBe(true);
  });
});

