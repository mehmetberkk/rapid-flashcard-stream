import { useState, useEffect, useRef, useCallback } from 'react';
import { TimingEngine } from '../../core/timing-engine/TimingEngine';
import { SPEED_LIMITS, CardSide } from '../../core/models';

export interface UseTimingEngineOptions {
  totalCards: number;
  initialIntervalMs?: number;
  frontDurationMs?: number;
  backDurationMs?: number;
  loop?: boolean;
  onComplete?: () => void;
}

export function useTimingEngine({
  totalCards,
  initialIntervalMs = SPEED_LIMITS.DEFAULT_MS,
  frontDurationMs,
  backDurationMs,
  loop = true,
  onComplete
}: UseTimingEngineOptions) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSide, setCurrentSide] = useState<CardSide>('FRONT');
  const [intervalMs, setIntervalMsState] = useState<number>(initialIntervalMs);

  const engineRef = useRef<TimingEngine | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const engine = new TimingEngine({
      totalCards,
      initialIntervalMs,
      frontDurationMs,
      backDurationMs,
      loop
    });
    engineRef.current = engine;

    const unsubscribe = engine.subscribe((event) => {
      if (event.type === 'TICK') {
        setCurrentIndex(event.index);
        setCurrentSide(event.side);
      } else if (event.type === 'STATE_CHANGE') {
        setIsPlaying(event.isPlaying);
        setCurrentIndex(event.currentIndex);
        setCurrentSide(event.currentSide);
        setIntervalMsState(event.intervalMs);
      } else if (event.type === 'COMPLETED') {
        setIsPlaying(false);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    });

    return () => {
      unsubscribe();
      engine.dispose();
      engineRef.current = null;
    };
  }, [totalCards, loop, initialIntervalMs, frontDurationMs, backDurationMs]);

  const play = useCallback(() => engineRef.current?.play(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const toggle = useCallback(() => engineRef.current?.toggle(), []);
  const next = useCallback(() => engineRef.current?.next(), []);
  const prev = useCallback(() => engineRef.current?.prev(), []);
  const seek = useCallback((index: number) => engineRef.current?.seek(index), []);
  const toggleSide = useCallback(() => engineRef.current?.toggleSide(), []);
  const setSide = useCallback((side: CardSide) => engineRef.current?.setSide(side), []);
  const setIntervalMs = useCallback((ms: number) => engineRef.current?.setIntervalMs(ms), []);
  const setDurations = useCallback((f: number, b: number) => engineRef.current?.setDurations(f, b), []);
  const adjustSpeed = useCallback((deltaMs: number) => engineRef.current?.adjustSpeed(deltaMs), []);

  return {
    isPlaying,
    currentIndex,
    currentSide,
    intervalMs,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    toggleSide,
    setSide,
    setIntervalMs,
    setDurations,
    adjustSpeed
  };
}
