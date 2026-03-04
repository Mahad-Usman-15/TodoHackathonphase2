import { useState, useEffect, RefObject } from "react";

export function usePullToRefresh(
  onRefresh: () => void,
  containerRef: RefObject<HTMLElement | null>
): { isPulling: boolean; pullProgress: number } {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [startY, setStartY] = useState(0);

  const THRESHOLD = 60;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (el.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
        setIsPulling(false);
        setPullProgress(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0) return;
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 0 && el.scrollTop === 0) {
        setIsPulling(true);
        setPullProgress(Math.min(deltaY / THRESHOLD, 1));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPulling) return;
      const deltaY = e.changedTouches[0].clientY - startY;
      if (deltaY > THRESHOLD && el.scrollTop === 0) {
        onRefresh();
      }
      setIsPulling(false);
      setPullProgress(0);
      setStartY(0);
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef, onRefresh, startY, isPulling]);

  return { isPulling, pullProgress };
}
