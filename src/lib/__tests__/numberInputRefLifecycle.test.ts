import { describe, expect, it, vi } from "vitest";
import type { Ref, RefCallback } from "react";
import NumberInput, { type NumberInputProps } from "@/components/NumberInput";

const state = vi.hoisted(() => ({ forwarded: null as Ref<HTMLInputElement> | null }));
vi.mock("react", () => ({
  forwardRef: (render: (props: NumberInputProps, ref: Ref<HTMLInputElement> | null) => unknown) =>
    (props: NumberInputProps) => render(props, state.forwarded),
  useCallback: (callback: unknown) => callback,
  useEffect: () => {},
  useLayoutEffect: () => {},
  useRef: (initial: unknown) => ({ current: initial }),
  useState: (initial: unknown) => [typeof initial === "function" ? initial() : initial, () => {}],
}));
vi.mock("react/jsx-runtime", () => ({
  jsx: (type: unknown, props: unknown) => ({ type, props }),
  jsxs: (type: unknown, props: unknown) => ({ type, props }),
}));
vi.mock("react/jsx-dev-runtime", () => ({
  jsxDEV: (type: unknown, props: unknown) => ({ type, props }),
}));

function attach(ref: Ref<HTMLInputElement>) {
  state.forwarded = ref;
  const render = NumberInput as unknown as (props: NumberInputProps) => {
    props: { ref: (element: HTMLInputElement | null) => void | (() => void) };
  };
  return render({ value: "1234" }).props.ref;
}

describe("NumberInput ref composition (offline hook fixture)", () => {
  it("preserves ordinary object-ref mount and detach", () => {
    const ref = { current: null as HTMLInputElement | null }, callback = attach(ref);
    const input = {} as HTMLInputElement;
    callback(input); expect(ref.current).toBe(input);
    callback(null); expect(ref.current).toBeNull();
  });
  it("preserves the null-detach contract for callbacks without cleanup", () => {
    const ref = vi.fn(), callback = attach(ref), input = {} as HTMLInputElement;
    expect(callback(input)).toBeUndefined(); callback(null);
    expect(ref.mock.calls).toEqual([[input], [null]]);
  });
  it("forwards a React 19 callback cleanup through mount-cleanup-remount", () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup) as RefCallback<HTMLInputElement>;
    const callback = attach(ref), input = {} as HTMLInputElement;
    const detach = callback(input);
    expect(typeof detach).toBe("function"); detach?.();
    const detachAgain = callback(input); detachAgain?.();
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(ref).toHaveBeenCalledTimes(2);
    expect(ref).not.toHaveBeenCalledWith(null);
  });
});
