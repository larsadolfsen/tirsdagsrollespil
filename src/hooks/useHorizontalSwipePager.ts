import { useRef } from "react";
import type { TouchEventHandler } from "react";

type HorizontalSwipePagerOptions = {
  minDistance?: number;
  onNext: () => void;
  onPrevious: () => void;
  verticalTolerance?: number;
};

export function useHorizontalSwipePager({
  minDistance = 48,
  onNext,
  onPrevious,
  verticalTolerance = 1.25,
}: HorizontalSwipePagerOptions): {
  onTouchCancel: TouchEventHandler<HTMLDivElement>;
  onTouchEnd: TouchEventHandler<HTMLDivElement>;
  onTouchStart: TouchEventHandler<HTMLDivElement>;
} {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchCancel: TouchEventHandler<HTMLDivElement> = () => {
    touchStartRef.current = null;
  };

  const onTouchEnd: TouchEventHandler<HTMLDivElement> = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < minDistance || Math.abs(deltaX) < Math.abs(deltaY) * verticalTolerance) {
      return;
    }

    if (deltaX < 0) {
      event.stopPropagation();
      onNext();
      return;
    }

    event.stopPropagation();
    onPrevious();
  };

  return { onTouchCancel, onTouchEnd, onTouchStart };
}
