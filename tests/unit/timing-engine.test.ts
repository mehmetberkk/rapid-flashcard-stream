import { describe, it, expect } from 'vitest';
import { TimingEngine, TimeProvider } from '../../src/core/timing-engine/TimingEngine';
import { SPEED_LIMITS } from '../../src/core/models';

class MockTimeProvider implements TimeProvider {
  public currentTime: number = 0;
  private pendingCallback: (() => void) | null = null;
  private nextHandle: number = 1;

  now(): number {
    return this.currentTime;
  }

  requestFrame(callback: () => void): number {
    this.pendingCallback = callback;
    return this.nextHandle++;
  }

  cancelFrame(_handle: number): void {
    this.pendingCallback = null;
  }

  advanceTime(ms: number): void {
    this.currentTime += ms;
    if (this.pendingCallback) {
      const cb = this.pendingCallback;
      this.pendingCallback = null;
      cb();
    }
  }
}

describe('TimingEngine Unit Tests', () => {
  it('clamps interval speed to strictly between 50ms and 2000ms with 1ms granularity', () => {
    const engine = new TimingEngine({ totalCards: 10, initialIntervalMs: 20 });
    expect(engine.getState().intervalMs).toBe(SPEED_LIMITS.MIN_MS);

    engine.setIntervalMs(5000);
    expect(engine.getState().intervalMs).toBe(SPEED_LIMITS.MAX_MS);
    expect(SPEED_LIMITS.MAX_MS).toBe(2000);

    engine.setIntervalMs(187);
    expect(engine.getState().intervalMs).toBe(187);

    engine.adjustSpeed(1);
    expect(engine.getState().intervalMs).toBe(188);

    engine.adjustSpeed(-10);
    expect(engine.getState().intervalMs).toBe(178);
  });

  it('manages play, pause, and toggle states', () => {
    const engine = new TimingEngine({ totalCards: 5 });
    expect(engine.getState().isPlaying).toBe(false);

    engine.play();
    expect(engine.getState().isPlaying).toBe(true);

    engine.pause();
    expect(engine.getState().isPlaying).toBe(false);

    engine.toggle();
    expect(engine.getState().isPlaying).toBe(true);
    engine.toggle();
    expect(engine.getState().isPlaying).toBe(false);
  });

  it('navigates forward and backward with looping enabled and resets currentSide to FRONT', () => {
    const engine = new TimingEngine({ totalCards: 3, loop: true });
    expect(engine.getState().currentIndex).toBe(0);
    expect(engine.getState().currentSide).toBe('FRONT');

    // Toggle to BACK then navigate next
    engine.toggleSide();
    expect(engine.getState().currentSide).toBe('BACK');

    engine.next();
    expect(engine.getState().currentIndex).toBe(1);
    expect(engine.getState().currentSide).toBe('FRONT');

    engine.next();
    expect(engine.getState().currentIndex).toBe(2);

    // Loop back to 0
    engine.next();
    expect(engine.getState().currentIndex).toBe(0);
    expect(engine.getState().currentSide).toBe('FRONT');

    // Loop back from 0 to 2
    engine.prev();
    expect(engine.getState().currentIndex).toBe(2);
    expect(engine.getState().currentSide).toBe('FRONT');
  });

  it('executes two-phase cycle: FRONT -> BACK on index 0, then BACK -> FRONT on index 1', () => {
    const mockTime = new MockTimeProvider();
    const engine = new TimingEngine(
      { totalCards: 5, initialIntervalMs: 200, loop: true },
      mockTime
    );

    const ticks: Array<{ index: number; side: string }> = [];
    engine.subscribe((e) => {
      if (e.type === 'TICK') {
        ticks.push({ index: e.index, side: e.side });
      }
    });

    engine.play();
    expect(engine.getState().currentIndex).toBe(0);
    expect(engine.getState().currentSide).toBe('FRONT');

    // Advance by 100ms (< 200ms frontDurationMs -> should remain on FRONT, index 0)
    mockTime.advanceTime(100);
    expect(engine.getState().currentIndex).toBe(0);
    expect(engine.getState().currentSide).toBe('FRONT');

    // Advance by another 100ms (total 200ms -> Phase 1 completes: switch to BACK, index STILL 0)
    mockTime.advanceTime(100);
    expect(engine.getState().currentIndex).toBe(0);
    expect(engine.getState().currentSide).toBe('BACK');
    expect(ticks).toEqual([{ index: 0, side: 'BACK' }]);

    // Advance by 200ms (backDurationMs completes: switch to FRONT, index advances to 1)
    mockTime.advanceTime(200);
    expect(engine.getState().currentIndex).toBe(1);
    expect(engine.getState().currentSide).toBe('FRONT');
    expect(ticks).toEqual([
      { index: 0, side: 'BACK' },
      { index: 1, side: 'FRONT' }
    ]);
  });

  it('allows independent frontDurationMs and backDurationMs', () => {
    const mockTime = new MockTimeProvider();
    const engine = new TimingEngine(
      { totalCards: 3, frontDurationMs: 100, backDurationMs: 300, loop: true },
      mockTime
    );

    engine.play();
    expect(engine.getState().currentSide).toBe('FRONT');

    // After 100ms front duration, switch to BACK
    mockTime.advanceTime(100);
    expect(engine.getState().currentSide).toBe('BACK');
    expect(engine.getState().currentIndex).toBe(0);

    // After another 100ms (< 300ms back duration), should remain BACK
    mockTime.advanceTime(100);
    expect(engine.getState().currentSide).toBe('BACK');
    expect(engine.getState().currentIndex).toBe(0);

    // After another 200ms (total 300ms back duration), switch to FRONT on next card
    mockTime.advanceTime(200);
    expect(engine.getState().currentSide).toBe('FRONT');
    expect(engine.getState().currentIndex).toBe(1);
  });

  it('allows manual toggleSide and setSide between FRONT and BACK', () => {
    const engine = new TimingEngine({ totalCards: 3 });
    expect(engine.getState().currentSide).toBe('FRONT');

    engine.toggleSide();
    expect(engine.getState().currentSide).toBe('BACK');

    engine.toggleSide();
    expect(engine.getState().currentSide).toBe('FRONT');

    engine.setSide('BACK');
    expect(engine.getState().currentSide).toBe('BACK');
  });

  it('stops and emits COMPLETED when loop is disabled and deck finishes last card BACK phase', () => {
    const mockTime = new MockTimeProvider();
    const engine = new TimingEngine(
      { totalCards: 2, initialIntervalMs: 100, loop: false },
      mockTime
    );

    let completed = false;
    engine.subscribe((e) => {
      if (e.type === 'COMPLETED') completed = true;
    });

    engine.play();
    // Card 0 FRONT -> BACK
    mockTime.advanceTime(100);
    expect(engine.getState().currentIndex).toBe(0);
    expect(engine.getState().currentSide).toBe('BACK');

    // Card 0 BACK -> Card 1 FRONT
    mockTime.advanceTime(100);
    expect(engine.getState().currentIndex).toBe(1);
    expect(engine.getState().currentSide).toBe('FRONT');

    // Card 1 FRONT -> BACK
    mockTime.advanceTime(100);
    expect(engine.getState().currentIndex).toBe(1);
    expect(engine.getState().currentSide).toBe('BACK');

    // Card 1 BACK -> End of deck reached
    mockTime.advanceTime(100);
    expect(completed).toBe(true);
    expect(engine.getState().isPlaying).toBe(false);
  });

  it('seeks accurately within bounds and resets side to FRONT', () => {
    const engine = new TimingEngine({ totalCards: 5 });
    engine.toggleSide();
    expect(engine.getState().currentSide).toBe('BACK');

    engine.seek(3);
    expect(engine.getState().currentIndex).toBe(3);
    expect(engine.getState().currentSide).toBe('FRONT');

    engine.seek(99);
    expect(engine.getState().currentIndex).toBe(4);

    engine.seek(-10);
    expect(engine.getState().currentIndex).toBe(0);
  });
});
