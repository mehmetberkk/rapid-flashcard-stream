import { describe, it, expect } from 'vitest';

export function shouldIgnoreKeyboardEvent(target: { tagName?: string; isContentEditable?: boolean } | null): boolean {
  if (!target) return false;
  const tag = target.tagName?.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function mapKeyToStreamAction(key: string): 'PLAY_PAUSE' | 'SPEED_UP' | 'SPEED_DOWN' | 'NEXT' | 'PREV' | 'EXIT' | null {
  switch (key) {
    case ' ':
    case 'Space':
      return 'PLAY_PAUSE';
    case 'ArrowUp':
      return 'SPEED_UP';
    case 'ArrowDown':
      return 'SPEED_DOWN';
    case 'ArrowRight':
      return 'NEXT';
    case 'ArrowLeft':
      return 'PREV';
    case 'Escape':
      return 'EXIT';
    default:
      return null;
  }
}

describe('Keyboard Controls Unit Tests', () => {
  it('suppresses keyboard events when typing in input, textarea, or contentEditable', () => {
    expect(shouldIgnoreKeyboardEvent({ tagName: 'INPUT' })).toBe(true);
    expect(shouldIgnoreKeyboardEvent({ tagName: 'TEXTAREA' })).toBe(true);
    expect(shouldIgnoreKeyboardEvent({ tagName: 'SELECT' })).toBe(true);
    expect(shouldIgnoreKeyboardEvent({ isContentEditable: true })).toBe(true);
    expect(shouldIgnoreKeyboardEvent({ tagName: 'DIV' })).toBe(false);
    expect(shouldIgnoreKeyboardEvent({ tagName: 'BODY' })).toBe(false);
  });

  it('accurately maps key names to stream actions', () => {
    expect(mapKeyToStreamAction(' ')).toBe('PLAY_PAUSE');
    expect(mapKeyToStreamAction('Space')).toBe('PLAY_PAUSE');
    expect(mapKeyToStreamAction('ArrowUp')).toBe('SPEED_UP');
    expect(mapKeyToStreamAction('ArrowDown')).toBe('SPEED_DOWN');
    expect(mapKeyToStreamAction('ArrowRight')).toBe('NEXT');
    expect(mapKeyToStreamAction('ArrowLeft')).toBe('PREV');
    expect(mapKeyToStreamAction('Escape')).toBe('EXIT');
    expect(mapKeyToStreamAction('KeyA')).toBe(null);
  });
});

