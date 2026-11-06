import { clampSpeed, SPEED_LIMITS, CardSide } from '../models';

export interface TimingEngineConfig {
  initialIntervalMs?: number;
  frontDurationMs?: number;
  backDurationMs?: number;
  loop?: boolean;
  totalCards: number;
}

export type TimingEvent =
  | { type: 'TICK'; index: number; side: CardSide; timestamp: number }
  | { type: 'STATE_CHANGE'; isPlaying: boolean; currentIndex: number; currentSide: CardSide; intervalMs: number }
  | { type: 'COMPLETED' };

export type TimingListener = (event: TimingEvent) => void;

export interface TimeProvider {
  now(): number;
  requestFrame(callback: () => void): number;
  cancelFrame(handle: number): void;
}

export class DefaultTimeProvider implements TimeProvider {
  now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  requestFrame(callback: () => void): number {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame(callback);
    }
    return (setTimeout(callback, 16) as unknown) as number;
  }

  cancelFrame(handle: number): void {
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(handle);
    } else {
      clearTimeout(handle);
    }
  }
}

export class TimingEngine {
  private isPlaying: boolean = false;
  private currentIndex: number = 0;
  private currentSide: CardSide = 'FRONT';
  private intervalMs: number = SPEED_LIMITS.DEFAULT_MS;
  private frontDurationMs: number = SPEED_LIMITS.DEFAULT_MS;
  private backDurationMs: number = SPEED_LIMITS.DEFAULT_MS;
  private loop: boolean = true;
  private totalCards: number = 0;

  private accumulator: number = 0;
  private lastTimestamp: number = 0;
  private frameHandle: number | null = null;
  private listeners: Set<TimingListener> = new Set();

  constructor(
    config: TimingEngineConfig,
    private timeProvider: TimeProvider = new DefaultTimeProvider()
  ) {
    this.totalCards = Math.max(0, config.totalCards);
    this.intervalMs = clampSpeed(config.initialIntervalMs ?? SPEED_LIMITS.DEFAULT_MS);
    this.frontDurationMs = clampSpeed(config.frontDurationMs ?? this.intervalMs);
    this.backDurationMs = clampSpeed(config.backDurationMs ?? this.intervalMs);
    this.loop = config.loop ?? true;
  }

  public play(): void {
    if (this.isPlaying || this.totalCards === 0) return;
    this.isPlaying = true;
    this.lastTimestamp = this.timeProvider.now();
    this.accumulator = 0;

    this.emitStateChange();
    this.scheduleNextTick();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.cancelScheduledTick();
    this.accumulator = 0;
    this.emitStateChange();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setIntervalMs(ms: number): void {
    this.intervalMs = clampSpeed(ms);
    this.frontDurationMs = this.intervalMs;
    this.backDurationMs = this.intervalMs;
    this.emitStateChange();
  }

  public setDurations(frontMs: number, backMs: number): void {
    this.frontDurationMs = clampSpeed(frontMs);
    this.backDurationMs = clampSpeed(backMs);
    this.emitStateChange();
  }

  public adjustSpeed(deltaMs: number): void {
    this.setIntervalMs(this.intervalMs + deltaMs);
  }

  public toggleSide(): void {
    this.currentSide = this.currentSide === 'FRONT' ? 'BACK' : 'FRONT';
    this.accumulator = 0;
    this.emitTick();
    this.emitStateChange();
  }

  public setSide(side: CardSide): void {
    if (this.currentSide !== side) {
      this.currentSide = side;
      this.accumulator = 0;
      this.emitTick();
      this.emitStateChange();
    }
  }

  public next(): void {
    this.stepForward(true);
  }

  public prev(): void {
    if (this.totalCards === 0) return;
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
    } else if (this.loop) {
      this.currentIndex = this.totalCards - 1;
    }
    this.currentSide = 'FRONT';
    this.accumulator = 0;
    this.emitTick();
    this.emitStateChange();
  }

  public seek(index: number): void {
    if (this.totalCards === 0) {
      this.currentIndex = 0;
      this.currentSide = 'FRONT';
      return;
    }
    const clampedIndex = Math.max(0, Math.min(this.totalCards - 1, Math.floor(index)));
    this.currentIndex = clampedIndex;
    this.currentSide = 'FRONT';
    this.accumulator = 0;
    this.emitTick();
    this.emitStateChange();
  }

  public setTotalCards(count: number): void {
    this.totalCards = Math.max(0, count);
    if (this.currentIndex >= this.totalCards && this.totalCards > 0) {
      this.currentIndex = this.totalCards - 1;
      this.currentSide = 'FRONT';
    } else if (this.totalCards === 0) {
      this.currentIndex = 0;
      this.currentSide = 'FRONT';
      if (this.isPlaying) {
        this.pause();
      }
    }
    this.emitStateChange();
  }

  public setLoop(loop: boolean): void {
    this.loop = loop;
  }

  public subscribe(listener: TimingListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      currentSide: this.currentSide,
      intervalMs: this.intervalMs,
      frontDurationMs: this.frontDurationMs,
      backDurationMs: this.backDurationMs,
      totalCards: this.totalCards,
      loop: this.loop
    };
  }

  public dispose(): void {
    this.pause();
    this.listeners.clear();
  }

  private scheduleNextTick(): void {
    if (!this.isPlaying) return;
    this.frameHandle = this.timeProvider.requestFrame(() => {
      this.onFrame();
    });
  }

  private cancelScheduledTick(): void {
    if (this.frameHandle !== null) {
      this.timeProvider.cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  private onFrame(): void {
    if (!this.isPlaying) return;

    const now = this.timeProvider.now();
    const delta = Math.max(0, now - this.lastTimestamp);
    this.lastTimestamp = now;
    this.accumulator += delta;

    let activeDuration = this.currentSide === 'FRONT' ? this.frontDurationMs : this.backDurationMs;

    while (this.accumulator >= activeDuration) {
      this.accumulator -= activeDuration;

      if (this.currentSide === 'FRONT') {
        // Phase 1 -> Phase 2: Switch to BACK without advancing currentIndex
        this.currentSide = 'BACK';
        this.emitTick();
        this.emitStateChange();
      } else {
        // Phase 2 -> Phase 1: Switch to FRONT and advance card index
        this.currentSide = 'FRONT';
        const canContinue = this.stepForward(false);
        if (!canContinue) {
          return;
        }
      }

      // Update activeDuration for next iteration if accumulator is still larger
      activeDuration = this.currentSide === 'FRONT' ? this.frontDurationMs : this.backDurationMs;
    }

    if (this.isPlaying) {
      this.scheduleNextTick();
    }
  }

  private stepForward(isManual: boolean): boolean {
    if (this.totalCards === 0) {
      this.pause();
      return false;
    }

    if (this.currentIndex + 1 < this.totalCards) {
      this.currentIndex += 1;
      this.currentSide = 'FRONT';
      this.emitTick();
      if (isManual) this.emitStateChange();
      return true;
    } else {
      // Reached end of deck
      if (this.loop) {
        this.currentIndex = 0;
        this.currentSide = 'FRONT';
        this.emitTick();
        if (isManual) this.emitStateChange();
        return true;
      } else {
        this.pause();
        this.emitEvent({ type: 'COMPLETED' });
        return false;
      }
    }
  }

  private emitTick(): void {
    this.emitEvent({
      type: 'TICK',
      index: this.currentIndex,
      side: this.currentSide,
      timestamp: this.timeProvider.now()
    });
  }

  private emitStateChange(): void {
    this.emitEvent({
      type: 'STATE_CHANGE',
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      currentSide: this.currentSide,
      intervalMs: this.intervalMs
    });
  }

  private emitEvent(event: TimingEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in TimingEngine listener:', err);
      }
    }
  }
}
