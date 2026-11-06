import React from 'react';
import { Repeat } from 'lucide-react';

interface ProgressBarProps {
  currentIndex: number;
  totalCards: number;
  loop: boolean;
  onToggleLoop: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalCards,
  loop,
  onToggleLoop
}) => {
  const percentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 select-none">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="font-semibold text-slate-300">
          Kart {totalCards > 0 ? currentIndex + 1 : 0} / {totalCards}
        </span>

        <button
          onClick={onToggleLoop}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition ${
            loop
              ? 'text-indigo-400 bg-indigo-500/10 font-medium'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title={loop ? 'Döngü Açık (Bittiğinde Başa Sar)' : 'Döngü Kapalı (Bittiğinde Dur)'}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{loop ? 'Döngü Açık' : 'Tek Sefer'}</span>
        </button>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

