import { useEffect } from 'react';

export interface KeyboardControlHandlers {
  onPlayPause?: () => void;
  onSpeedUp?: () => void;
  onSpeedDown?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onExit?: () => void;
  onToggleFavorite?: () => void;
  onToggleSide?: () => void;
  isEnabled?: boolean;
}

export function useKeyboardControls({
  onPlayPause,
  onSpeedUp,
  onSpeedDown,
  onNext,
  onPrev,
  onExit,
  onToggleFavorite,
  onToggleSide,
  isEnabled = true
}: KeyboardControlHandlers) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName.toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onPlayPause?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onSpeedUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onSpeedDown?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev?.();
          break;
        case 'Escape':
          event.preventDefault();
          onExit?.();
          break;
        case 'KeyF':
          event.preventDefault();
          onToggleFavorite?.();
          break;
        case 'Enter':
        case 'KeyT':
          event.preventDefault();
          onToggleSide?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, onPlayPause, onSpeedUp, onSpeedDown, onNext, onPrev, onExit, onToggleFavorite, onToggleSide]);
}
