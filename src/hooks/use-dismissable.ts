"use client";

import { useEffect, type RefObject } from "react";

export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const element = ref.current;
      if (element && event.target instanceof Node && !element.contains(event.target)) {
        onDismiss();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, active, onDismiss]);
}
