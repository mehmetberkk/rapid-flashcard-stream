import React, { useState, useEffect } from 'react';
import type { Deck, Card, DeckFilter } from '../../core/models';
import { useTimingEngine } from '../hooks/useTimingEngine';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { storageRepository } from '../../core/storage/StorageRepository';
import { FocalCardView } from '../components/FocalCardView';
import { SpeedControl } from '../components/SpeedControl';
import { ProgressBar } from '../components/ProgressBar';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw, Star, AlertCircle } from 'lucide-react';

interface StreamViewProps {
  deck: Deck;
  onBackToDashboard: () => void;
}

export const StreamView: React.FC<StreamViewProps> = ({ deck, onBackToDashboard }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loop, setLoop] = useState<boolean>(true);
  const [deckFilter, setDeckFilter] = useState<DeckFilter>('ALL');

  // Load cards for active deck
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    storageRepository.getCardsByDeck(deck.id).then((deckCards) => {
      if (isMounted) {
        setCards(deckCards);
        setIsLoading(false);
      }
    });

    // Update last reviewed timestamp
    storageRepository.updateDeck(deck.id, { lastReviewedAt: Date.now() });

    return () => {
      isMounted = false;
    };
  }, [deck.id]);

  // Derived deck state
  const favoriteCards = cards.filter((c) => c.isFavorite);
  const activeCards = deckFilter === 'FAVORITES' ? favoriteCards : cards;

  const {
    isPlaying,
    currentIndex,
    currentSide,
    intervalMs,
    toggle,
    next,
    prev,
    seek,
    toggleSide,
    setIntervalMs,
    adjustSpeed
  } = useTimingEngine({
    totalCards: activeCards.length,
    initialIntervalMs: 500,
    loop
  });

  const currentCard = activeCards.length > 0 ? activeCards[currentIndex] : null;

  const handleToggleFavorite = async () => {
    if (!currentCard) return;
    const nextState = await storageRepository.toggleFavorite(currentCard.id);
    setCards((prevCards) =>
      prevCards.map((c) => (c.id === currentCard.id ? { ...c, isFavorite: nextState } : c))
    );
  };

  const handleFilterChange = (newFilter: DeckFilter) => {
    setDeckFilter(newFilter);
    seek(0);
  };

  const handlePlayToggle = () => {
    if (activeCards.length === 0) return;
    toggle();
  };

  // Setup Keyboard Ergonomics (Constitution Principle III)
  useKeyboardControls({
    onPlayPause: handlePlayToggle,
    onSpeedUp: () => adjustSpeed(10), // Up arrow: increase duration (slower)
    onSpeedDown: () => adjustSpeed(-10), // Down arrow: decrease duration (faster)
    onNext: next,
    onPrev: prev,
    onExit: onBackToDashboard,
    onToggleFavorite: handleToggleFavorite,
    onToggleSide: toggleSide,
    isEnabled: !isLoading && activeCards.length > 0
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950 text-slate-400">
        <p className="text-sm font-medium animate-pulse">Kartlar yükleniyor...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-surface-950 text-slate-300 p-6 space-y-4">
        <p className="text-xl font-bold">Bu destede hiç kelime yok.</p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
        >
          Destelere Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-950 text-slate-100 select-none overflow-hidden justify-between p-6 relative">
      {/* Left Vertical Speed Dock (Independent Floating Overlay - 0px Focal Shift) */}
      <SpeedControl
        intervalMs={intervalMs}
        onSpeedChange={setIntervalMs}
        onStepDelta={adjustSpeed}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-20"
      />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full gap-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Çıkış (ESC)</span>
        </button>

        {/* Center: Deck Name & Filter Tabs */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">{deck.name}</h2>
            <span className="text-xs text-slate-400 font-mono">
              ({activeCards.length > 0 ? currentIndex + 1 : 0} / {activeCards.length})
            </span>
          </div>

          {/* Filter Tabs: Tüm Kartlar / Favorilerim */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                deckFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tüm Kartlar ({cards.length})
            </button>
            <button
              onClick={() => handleFilterChange('FAVORITES')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                deckFilter === 'FAVORITES'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favorilerim ({favoriteCards.length})</span>
            </button>
          </div>
        </div>

        {/* Phase Indicator & Manual Side Flip */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSide}
            disabled={activeCards.length === 0}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 ${
              currentSide === 'FRONT'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
            }`}
            title="Ön/Arka Yüz Değiştir (Enter / T)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentSide === 'FRONT' ? 'bg-indigo-400' : 'bg-emerald-400'
              }`}
            />
            <span>{currentSide === 'FRONT' ? 'ÖN YÜZ' : 'ARKA YÜZ'}</span>
          </button>
        </div>
      </header>

      {/* Main Optical Focal Content (Constitution Principle I: Fixed Focal Point & Single-Side Exclusivity) */}
      <main className="flex-1 flex items-center justify-center my-auto">
        {deckFilter === 'FAVORITES' && activeCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Favorilere Eklenmiş Kart Bulunmuyor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Zorlandığınız kelimeleri favorilere eklemek için <strong className="text-white">"Tüm Kartlar"</strong> moduna geçip kart üzerindeki yıldıza tıklayabilir veya <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-xs">F</kbd> tuşuna basabilirsiniz.
            </p>
            <button
              onClick={() => handleFilterChange('ALL')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Tüm Kartlara Geri Dön
            </button>
          </div>
        ) : (
          <FocalCardView
            card={currentCard}
            currentSide={currentSide}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Bottom Controls Area (Streamlined Transport Footer) */}
      <footer className="max-w-4xl mx-auto w-full space-y-5">
        {/* Progress Bar */}
        <ProgressBar
          currentIndex={currentIndex}
          totalCards={activeCards.length}
          loop={loop}
          onToggleLoop={() => setLoop(!loop)}
        />

        {/* Main Transport Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => seek(0)}
            disabled={activeCards.length === 0}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white disabled:opacity-50 rounded-2xl transition active:scale-95"
            title="Başa Dön"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={prev}
            disabled={activeCards.length === 0}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-50 rounded-2xl transition active:scale-95"
            title="Önceki Kart (Sol Ok)"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handlePlayToggle}
            disabled={activeCards.length === 0}
            className={`p-4 rounded-2xl text-white font-bold transition shadow-xl active:scale-95 disabled:opacity-50 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
            title="Başlat / Duraklat (Space)"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={next}
            disabled={activeCards.length === 0}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white disabled:opacity-50 rounded-2xl transition active:scale-95"
            title="Sonraki Kart (Sağ Ok)"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard shortcut reminder pills */}
        <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Space</kbd> Başlat/Durdur</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↑/↓</kbd> Süre (ms)</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">←/→</kbd> İleri/Geri</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Enter / T</kbd> Çevir</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">F</kbd> Favori</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Esc</kbd> Çıkış</span>
        </div>
      </footer>
    </div>
  );
};
