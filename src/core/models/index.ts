export type CardSide = 'FRONT' | 'BACK';
export type DeckFilter = 'ALL' | 'FAVORITES';

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  createdAt: number;
  updatedAt: number;
  lastReviewedAt?: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  word?: string;
  meaning?: string;
  orderIndex: number;
  isFavorite: boolean;
  createdAt: number;
}

export interface ImportErrorItem {
  lineNumber: number;
  rawContent: string;
  reason: string;
}

export interface ImportReport {
  fileName: string;
  totalLines: number;
  importedCount: number;
  skippedCount: number;
  errors: ImportErrorItem[];
  timestamp: number;
  detectedDelimiter?: string;
}

export interface PlaybackSession {
  deckId: string | null;
  currentIndex: number;
  currentSide: CardSide;
  deckFilter: DeckFilter;
  isPlaying: boolean;
  intervalMs: number;
  frontDurationMs: number;
  backDurationMs: number;
  loop: boolean;
}

export interface UserSettings {
  defaultSpeedMs: number;
  stepSizeMs: number;
  theme: 'dark' | 'light';
  loopDefault: boolean;
}

export const SPEED_LIMITS = {
  MIN_MS: 50,
  MAX_MS: 2000,
  DEFAULT_MS: 500,
  STEP_MS: 1
} as const;

export function clampSpeed(ms: number): number {
  if (isNaN(ms)) return SPEED_LIMITS.DEFAULT_MS;
  return Math.max(SPEED_LIMITS.MIN_MS, Math.min(SPEED_LIMITS.MAX_MS, Math.round(ms)));
}

export function isSingleWord(text: string): boolean {
  if (!text) return false;
  return text.trim().split(/\s+/).length === 1;
}

export function validateCardInput(front: string, back: string): { isValid: boolean; error?: string; isSingleWordMeaning?: boolean } {
  if (!front || front.trim().length === 0) {
    return { isValid: false, error: 'Kelime/Ön yüz boş olamaz' };
  }
  if (!back || back.trim().length === 0) {
    return { isValid: false, error: 'Anlam/Arka yüz boş olamaz' };
  }
  const singleWord = isSingleWord(back);
  return { isValid: true, isSingleWordMeaning: singleWord };
}
