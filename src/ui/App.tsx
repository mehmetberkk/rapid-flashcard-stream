import React, { useState } from 'react';
import type { Deck } from '../core/models';
import { DashboardView } from './views/DashboardView';
import { StreamView } from './views/StreamView';

export const App: React.FC = () => {
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  if (activeDeck) {
    return (
      <StreamView
        deck={activeDeck}
        onBackToDashboard={() => setActiveDeck(null)}
      />
    );
  }

  return <DashboardView onSelectDeck={(deck) => setActiveDeck(deck)} />;
};

export default App;

