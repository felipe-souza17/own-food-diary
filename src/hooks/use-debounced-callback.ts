"use client";

import { useEffect, useMemo, useRef } from "react";

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 400,
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useMemo(
    () =>
      (...args: Args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
      },
    [delayMs],
  );
}
