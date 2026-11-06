import React from 'react';
import type { Deck } from '../../core/models';
import { Play, Trash2, Layers, Clock } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onSelectDeck: (deck: Deck) => void;
  onDeleteDeck: (id: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onSelectDeck,
  onDeleteDeck
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`"${deck.name}" destesini silmek istediğinizden emin misiniz?`)) {
      onDeleteDeck(deck.id);
    }
  };

  const formatDate = (ts?: number) => {
    if (!ts) return 'Henüz çalışılmadı';
    return new Date(ts).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      onClick={() => onSelectDeck(deck)}
      className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Title and Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {deck.name}
          </h3>
          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700/60 rounded-full text-xs font-mono font-semibold text-indigo-300 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            {deck.cardCount} kart
          </span>
        </div>

        {/* Description */}
        {deck.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {deck.description}
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(deck.lastReviewedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="Desteyi Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectDeck(deck)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Başlat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

