import React from 'react';
import type { Card, CardSide } from '../../core/models';
import { Star } from 'lucide-react';

interface FocalCardViewProps {
  card: Card | null;
  currentSide?: CardSide;
  onToggleFavorite?: () => void;
}

export const FocalCardView: React.FC<FocalCardViewProps> = ({
  card,
  currentSide = 'FRONT',
  onToggleFavorite
}) => {
  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p className="text-xl font-medium">Bu destede henüz kart bulunmuyor.</p>
      </div>
    );
  }

  const isFront = currentSide === 'FRONT';
  const displayText = isFront
    ? (card.word ?? card.front)
    : (card.meaning ?? card.back);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[380px] p-8 select-none">
      {/* Top action: Favorite bookmark */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleFavorite}
          className="p-2.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors focus:outline-none"
          title="Favorilere Ekle / Çıkar (F)"
        >
          <Star
            className={`w-6 h-6 ${card.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
          />
        </button>
      </div>

      {/* Central Fixed Optical Focal Area (Single-Side Exclusivity) */}
      <div className="focal-instant-cut flex flex-col items-center text-center space-y-6 max-w-3xl justify-center min-h-[220px]">
        {/* Subtle Face Badge Indicator */}
        <div className="flex items-center justify-center">
          {isFront ? (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-slate-800/90 text-slate-300 border border-slate-700 shadow-sm">
              Kelime
            </span>
          ) : (
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50">
              Anlam
            </span>
          )}
        </div>

        {/* Single Centered Optical Text Container - Zero Layout Shift */}
        <div className="flex items-center justify-center w-full px-4">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-sans break-words leading-tight drop-shadow-sm select-none transition-none ${
              isFront
                ? 'text-white'
                : 'text-emerald-300'
            }`}
          >
            {displayText}
          </h1>
        </div>
      </div>
    </div>
  );
};
