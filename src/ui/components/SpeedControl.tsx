import React from 'react';
import { SPEED_LIMITS, clampSpeed } from '../../core/models';
import { Zap, Minus, Plus } from 'lucide-react';

interface SpeedControlProps {
  intervalMs: number;
  onSpeedChange: (ms: number) => void;
  onStepDelta: (deltaMs: number) => void;
}

const PRESETS = [100, 200, 350, 500, 1000];

export const SpeedControl: React.FC<SpeedControlProps> = ({
  intervalMs,
  onSpeedChange,
  onStepDelta
}) => {
  const cardsPerSec = (1000 / intervalMs).toFixed(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      onSpeedChange(clampSpeed(val));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl px-6 py-3.5 shadow-xl max-w-2xl mx-auto w-full">
      {/* Speed Readout & Direct Number Input */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={SPEED_LIMITS.MIN_MS}
              max={SPEED_LIMITS.MAX_MS}
              step={SPEED_LIMITS.STEP_MS}
              value={intervalMs}
              onChange={handleInputChange}
              className="w-20 px-2 py-0.5 text-center text-xl font-bold font-mono bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none select-text"
              title="Doğrudan ms değeri girin (50-2000)"
            />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ms / faz
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
            (~{cardsPerSec} kart/sn)
          </span>
        </div>
      </div>

      {/* Stepper (- decreases ms, + increases ms) and Slider (step=1) */}
      <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-sm">
        <button
          onClick={() => onStepDelta(-10)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 border border-slate-700"
          title="Süreyi Azalt (-10ms) (Daha Hızlı)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="range"
          min={SPEED_LIMITS.MIN_MS}
          max={SPEED_LIMITS.MAX_MS}
          step={SPEED_LIMITS.STEP_MS}
          value={intervalMs}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          title="Hassas Süre Kaydırıcısı (1ms hassasiyet)"
        />

        <button
          onClick={() => onStepDelta(10)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 border border-slate-700"
          title="Süreyi Artır (+10ms) (Daha Yavaş)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="hidden lg:flex items-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onSpeedChange(p)}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition ${
              intervalMs === p
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {p}ms
          </button>
        ))}
      </div>
    </div>
  );
};
