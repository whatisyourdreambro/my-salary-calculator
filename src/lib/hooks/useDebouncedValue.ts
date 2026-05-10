"use client";

import { useEffect, useState } from "react";

/**
 * 입력값을 지정 시간만큼 지연시켜 반환.
 * 계산기에서 빠르게 입력 중인 값으로 매 키스트로크마다 무거운 계산을 돌리는 걸 방지.
 *
 * @example
 * const [salary, setSalary] = useState(0);
 * const debouncedSalary = useDebouncedValue(salary, 200);
 * const result = useMemo(() => compute(debouncedSalary), [debouncedSalary]);
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
