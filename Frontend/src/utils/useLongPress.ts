import { useRef } from "react";

export function useLongPress(onLongPress: () => void, ms = 450) {
  const timerRef = useRef<number | null>(null);
  const longPressedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const MOVE_THRESHOLD = 10;

  const clear = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    longPressedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    clear();
    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, ms);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) clear();
  };

  const onPointerUp = () => clear();
  const onPointerCancel = () => clear();
  const onPointerLeave = () => clear();

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    },
    wasLongPressed: () => longPressedRef.current,
  };
}
