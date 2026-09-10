"use client";

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type SyntheticEvent } from "react";
import { deleteNumberAtSeparator, equivalentNumberDraft, formatNumberDraft, normalizeNumberDraft, numberCaretPosition, numberDraftValue, numberInputDraft } from "@/lib/numberInput";

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "text" | "number";
  allowDecimal?: boolean;
  allowNegative?: boolean;
  onValueChange?: (rawValue: string) => void;
}

/** Keep the DOM grouped while existing Number(event.target.value) consumers receive raw digits. */
function numericEvent<T extends SyntheticEvent<HTMLInputElement>>(event: T, raw: string): T {
  const input = event.currentTarget;
  const target = new Proxy(input, {
    get(element, key) {
      if (key === "value") return numberDraftValue(raw);
      if (key === "valueAsNumber") return numberDraftValue(raw) === "" ? NaN : Number(raw);
      const result = Reflect.get(element, key, element);
      return typeof result === "function" ? result.bind(element) : result;
    },
    set(element, key, next) { return Reflect.set(element, key, next, element); },
  });
  return new Proxy(event, {
    get(original, key) {
      if (key === "target" || key === "currentTarget") return target;
      const result = Reflect.get(original, key, original);
      return typeof result === "function" ? result.bind(original) : result;
    },
  });
}

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A controlled/uncontrolled number field with a separate editing draft.
 * Formatting changes neither calculator state nor precision. Native number
 * callers keep raw event values, refs, range constraints and arrow stepping.
 */
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput({
  value, defaultValue, onChange, onInput, onBlur, onFocus, onKeyDown,
  onCompositionStart, onCompositionEnd, onValueChange, type = "text", inputMode,
  allowDecimal = type === "number" || inputMode !== "numeric", allowNegative: negativeOption,
  min, max, step, maxLength, className, ...props
}, forwardedRef) {
  const external = numberInputDraft(value);
  const allowNegative = negativeOption ?? (type === "number" || inputMode !== "numeric" || (min !== undefined && Number(min) < 0));
  const [draft, setDraft] = useState(() => numberInputDraft(value ?? defaultValue));
  const [focused, setFocused] = useState(false);
  const lastExternal = useRef(external);
  const lastEmitted = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const composing = useRef(false);
  const compositionBase = useRef("");
  const selection = useRef<{ start: number; end: number } | null>(null);
  const currentDraft = useRef(draft);
  currentDraft.current = draft;

  const attachRef = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (typeof forwardedRef === "function") forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef]);

  useBrowserLayoutEffect(() => {
    if (value === undefined || external === lastExternal.current) return;
    lastExternal.current = external;
    if (focused && lastEmitted.current !== null && equivalentNumberDraft(external, lastEmitted.current)) return;
    setDraft(external);
    lastEmitted.current = null;
  }, [external, focused, value]);

  const display = composing.current ? draft : formatNumberDraft(draft);
  useBrowserLayoutEffect(() => {
    const element = inputRef.current;
    if (element && selection.current && document.activeElement === element) {
      element.setSelectionRange(selection.current.start, selection.current.end);
      selection.current = null;
    }
  });

  useEffect(() => {
    const element = inputRef.current;
    if (!element || type !== "number") return;
    const numeric = numberDraftValue(draft);
    const number = Number(numeric);
    const message = draft !== "" && numeric === "" ? "숫자를 입력해 주세요."
      : numeric !== "" && min !== undefined && number < Number(min)
      ? `최솟값 ${formatNumberDraft(String(min))} 이상을 입력해 주세요.`
      : numeric !== "" && max !== undefined && number > Number(max)
        ? `최댓값 ${formatNumberDraft(String(max))} 이하를 입력해 주세요.` : "";
    element.setCustomValidity(message);
  }, [draft, min, max, type]);

  const commit = (text: string, event: SyntheticEvent<HTMLInputElement>, caret = event.currentTarget.selectionStart ?? text.length, end = event.currentTarget.selectionEnd ?? caret) => {
    const cleaned = normalizeNumberDraft(text, { allowDecimal, allowNegative });
    if (cleaned === null || (maxLength !== undefined && cleaned.length > maxLength)) {
      event.currentTarget.value = formatNumberDraft(currentDraft.current);
      setDraft(currentDraft.current);
      return;
    }
    const formatted = formatNumberDraft(cleaned);
    selection.current = { start: numberCaretPosition(text, caret, formatted), end: numberCaretPosition(text, end, formatted) };
    lastEmitted.current = cleaned;
    currentDraft.current = cleaned;
    setDraft(cleaned);
    // React may bail out for the same draft (e.g. deleting an inserted comma).
    event.currentTarget.value = formatted;
    event.currentTarget.setSelectionRange(selection.current.start, selection.current.end);
    onValueChange?.(numberDraftValue(cleaned));
    onChange?.(numericEvent(event, cleaned) as ChangeEvent<HTMLInputElement>);
  };

  return <input
    {...props}
    ref={attachRef}
    type="text"
    inputMode={allowDecimal && inputMode === "numeric" ? "decimal" : inputMode ?? (allowDecimal ? "decimal" : "numeric")}
    data-number-input="grouped"
    value={display}
    className={className}
    min={min}
    max={max}
    step={step}
    role={props.role ?? (type === "number" ? "spinbutton" : undefined)}
    aria-valuemin={type === "number" && min !== undefined ? Number(min) : undefined}
    aria-valuemax={type === "number" && max !== undefined ? Number(max) : undefined}
    aria-valuenow={type === "number" && numberDraftValue(draft) !== "" ? Number(draft) : undefined}
    onChange={event => {
      if (composing.current) { setDraft(event.target.value); return; }
      commit(event.target.value, event);
    }}
    onInput={event => {
      if (composing.current) return;
      const cleaned = normalizeNumberDraft(event.currentTarget.value, { allowDecimal, allowNegative });
      if (cleaned !== null) onInput?.(numericEvent(event, cleaned));
    }}
    onFocus={event => { setFocused(true); onFocus?.(numericEvent(event, currentDraft.current)); }}
    onBlur={event => {
      setFocused(false);
      onBlur?.(numericEvent(event, currentDraft.current));
      // Restore the parent's accepted/clamped value only after editing has ended.
      if (value !== undefined) setDraft(numberInputDraft(value));
      lastEmitted.current = null;
    }}
    onKeyDown={event => {
      onKeyDown?.(numericEvent(event, currentDraft.current));
      if (event.defaultPrevented || props.readOnly || props.disabled || composing.current) return;
      const input = event.currentTarget;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? start;
      if (start === end && (event.key === "Backspace" || event.key === "Delete")) {
        const edit = deleteNumberAtSeparator(input.value, start, event.key === "Backspace" ? "backward" : "forward");
        if (edit) { event.preventDefault(); commit(edit.text, event, edit.caret, edit.caret); }
      }
      if (type === "number" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        const increment = step === "any" || step === undefined ? 1 : Number(step);
        if (!Number.isFinite(increment) || increment <= 0) return;
        let next = Number(numberDraftValue(currentDraft.current)) + (event.key === "ArrowUp" ? increment : -increment);
        if (min !== undefined) next = Math.max(Number(min), next);
        if (max !== undefined) next = Math.min(Number(max), next);
        const precision = Math.max(String(increment).split(".")[1]?.length ?? 0, currentDraft.current.split(".")[1]?.length ?? 0);
        const raw = numberInputDraft(Number(next.toFixed(Math.min(precision, 12))));
        commit(raw, event, raw.length, raw.length);
      }
    }}
    onCompositionStart={event => { compositionBase.current = currentDraft.current; composing.current = true; onCompositionStart?.(event); }}
    onCompositionEnd={event => { composing.current = false; currentDraft.current = compositionBase.current; commit(event.currentTarget.value, event); onCompositionEnd?.(numericEvent(event, currentDraft.current)); }}
  />;
});

export default NumberInput;
