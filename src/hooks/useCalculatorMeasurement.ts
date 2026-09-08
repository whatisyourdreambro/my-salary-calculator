"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { usePathname } from "next/navigation";
import { calculationTracking } from "@/lib/calculationTracking";
import { isValidCalculationEdit } from "@/lib/calculationMeasurement";

/**
 * Attach inputProps only to calculation controls and resultRef to the result itself.
 * Results must be finite/current AND visible. Defaults/shared restoration cannot succeed.
 * resultKey stays in React memory and is never sent to analytics.
 */
export function useCalculatorMeasurement({ calcType, valid, resultKey, onSuccess, allowNegativeInput = false }: {
  calcType: string;
  valid: boolean;
  resultKey: unknown;
  onSuccess?: () => void;
  allowNegativeInput?: boolean;
}) {
  const pathname = usePathname() || "/";
  const [resultElement, setResultElement] = useState<HTMLElement | null>(null);
  const [interaction, setInteraction] = useState({ path: pathname, calcType, revision: 0 });
  const contextRef = useRef({ pathname, calcType, interacted: false });
  if (contextRef.current.pathname !== pathname || contextRef.current.calcType !== calcType) {
    contextRef.current = { pathname, calcType, interacted: false };
  }
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const userResult = contextRef.current.interacted;
  const [visibility, setVisibility] = useState<{
    context: typeof contextRef.current;
    element: HTMLElement;
    visible: boolean;
  } | null>(null);
  // A retained component can render the next route before its observer effect resets.
  // Keep visibility scoped to this visit and result node, including A -> B -> A.
  const visible = visibility?.context === contextRef.current
    && visibility.element === resultElement && visibility.visible;

  useEffect(() => { calculationTracking.visit(pathname); }, [pathname]);

  const interact = useCallback((event: SyntheticEvent) => {
    if (!event.nativeEvent.isTrusted) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    // Button presses belong here only when the caller places inputProps around controls.
    if (event.type === "click") {
      if (!target.closest('button, input[type="checkbox"], input[type="radio"]')) return;
    } else if (!target.closest("input, select, textarea")) return;
    calculationTracking.interact(pathname, calcType, true);
    // Rejected text such as "350a" can leave the old valid/default result intact.
    // It starts an attempt, but cannot make that old result a successful calculation.
    const numberInput = event.type !== "click" && target instanceof HTMLInputElement
      && !["checkbox", "radio"].includes(target.type);
    contextRef.current.interacted = !numberInput || isValidCalculationEdit(
      target.value, allowNegativeInput, target.inputMode !== "numeric",
    );
    setInteraction((current) => ({ path: pathname, calcType,
      revision: current.path === pathname && current.calcType === calcType ? current.revision + 1 : 1 }));
  }, [pathname, calcType, allowNegativeInput]);

  useEffect(() => {
    if (!resultElement || typeof IntersectionObserver === "undefined") return;
    let active = true;
    const context = contextRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (active) setVisibility({ context, element: resultElement,
        visible: entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.01) });
    }, { threshold: 0.01 });
    observer.observe(resultElement);
    return () => { active = false; observer.disconnect(); };
  }, [resultElement, pathname, calcType]);

  useEffect(() => {
    if (calculationTracking.result(pathname, calcType, { valid, visible, userResult })) {
      onSuccessRef.current?.();
    }
  }, [pathname, calcType, valid, visible, userResult, interaction.revision, resultKey]);

  return {
    resultRef: setResultElement,
    inputProps: { onChangeCapture: interact, onClickCapture: interact },
    interact,
  };
}
