import React from 'react';
import { SPEED_LIMITS, clampSpeed } from '../../core/models';
import { Zap, Minus, Plus } from 'lucide-react';

interface SpeedControlProps {
  intervalMs: number;
  onSpeedChange: (ms: number) => void;
  onStepDelta: (deltaMs: number) => void;
  className?: string;
}

const PRESETS = [100, 200, 350, 500, 1000];

export const SpeedControl: React.FC<SpeedControlProps> = ({
  intervalMs,
  onSpeedChange,
  onStepDelta,
  className = ''
}) => {
  const cardsPerSec = (1000 / intervalMs).toFixed(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      onSpeedChange(clampSpeed(val));
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-3 shadow-2xl w-24 select-none ${className}`}
      title="Hız Kontrol Kulesi"
    >
      {/* 1. Speed Icon */}
      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
        <Zap className="w-4 h-4" />
      </div>

      {/* 2. Direct Number Input & Speed Readout */}
      <div className="flex flex-col items-center text-center w-full">
        <input
          type="number"
          min={SPEED_LIMITS.MIN_MS}
          max={SPEED_LIMITS.MAX_MS}
          step={SPEED_LIMITS.STEP_MS}
          value={intervalMs}
          onChange={handleInputChange}
          className="w-16 px-1 py-1 text-center text-sm font-bold font-mono bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white outline-none select-text"
          title="Doğrudan ms değeri girin (50-2000)"
        />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          ms / faz
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          ~{cardsPerSec}/s
        </span>
      </div>

      {/* 3. Duration Stepper (+) Button - Slower / Increases ms */}
      <button
        onClick={() => onStepDelta(10)}
        className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 border border-slate-700"
        title="Süreyi Artır (+10ms) (Daha Yavaş)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* 4. Vertical Range Slider (step=1) */}
      <div className="py-1 flex items-center justify-center">
        <input
          type="range"
          min={SPEED_LIMITS.MIN_MS}
          max={SPEED_LIMITS.MAX_MS}
          step={SPEED_LIMITS.STEP_MS}
          value={intervalMs}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="h-44 w-2 cursor-pointer accent-indigo-500"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          title="Dikey Süre Kaydırıcısı (1ms hassasiyet; yukarı daha yavaş, aşağı daha hızlı)"
        />
      </div>

      {/* 5. Duration Stepper (-) Button - Faster / Decreases ms */}
      <button
        onClick={() => onStepDelta(-10)}
        className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 border border-slate-700"
        title="Süreyi Azalt (-10ms) (Daha Hızlı)"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* 6. Quick Presets */}
      <div className="grid grid-cols-2 gap-1 w-full mt-0.5">
        {PRESETS.map((p, idx) => (
          <button
            key={p}
            onClick={() => onSpeedChange(p)}
            className={`px-1 py-1 text-[10px] font-mono font-medium rounded-lg transition text-center ${
              idx === PRESETS.length - 1 ? 'col-span-2' : ''
            } ${
              intervalMs === p
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700/50'
            }`}
            title={`${p} milisaniye`}
          >
            {p}ms
          </button>
        ))}
      </div>
    </div>
  );
};
