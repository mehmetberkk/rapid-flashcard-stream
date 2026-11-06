import { useState, useEffect, useCallback } from 'react';
import { storageRepository } from '../../core/storage/StorageRepository';
import { SAMPLE_YDS_DECK } from '../../core/storage/seedData';
import type { Deck, Card } from '../../core/models';

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let list = await storageRepository.getAllDecks();

      // Seed default sample deck on first run if database is empty
      if (list.length === 0) {
        const seedDeck = await storageRepository.createDeck({
          name: SAMPLE_YDS_DECK.name,
          description: SAMPLE_YDS_DECK.description
        });
        await storageRepository.bulkAddCards(
          SAMPLE_YDS_DECK.cards.map((c, i) => ({
            deckId: seedDeck.id,
            front: c.front,
            back: c.back,
            orderIndex: i
          }))
        );
        list = await storageRepository.getAllDecks();
      }

      setDecks(list);
    } catch (err: unknown) {
      console.error('Failed to load decks:', err);
      setError('Desteler yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const createDeck = async (name: string, description?: string): Promise<Deck> => {
    const newDeck = await storageRepository.createDeck({ name, description });
    await loadDecks();
    return newDeck;
  };

  const deleteDeck = async (id: string): Promise<void> => {
    await storageRepository.deleteDeck(id);
    await loadDecks();
  };

  const getDeckCards = async (deckId: string): Promise<Card[]> => {
    return await storageRepository.getCardsByDeck(deckId);
  };

  return {
    decks,
    isLoading,
    error,
    reloadDecks: loadDecks,
    createDeck,
    deleteDeck,
    getDeckCards
  };
}

