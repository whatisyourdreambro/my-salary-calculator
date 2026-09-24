// 구형 브라우저 전면 실패 방지 게이트 (2026-09-25 감사 B3 · CLIENT-06):
//  - MediaQueryList.addEventListener 없는 Safari 13 이하: addListener 폴백(해제도 같은 짝).
//  - <dialog>.showModal 없는 Safari 15.3 이하: open 속성 폴백, cleanup 은 close() 또는 removeAttribute.
//  - <dialog> 자체를 모르는 브라우저: globals.css 의 dialog:not([open]) 규칙이 SSR 된 메뉴 오버레이를 숨긴다.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { subscribeMediaQuery } from "@/lib/mediaQueryListener";
import { closeDialog, openDialog } from "@/hooks/useModalDialog";

const read = (p: string) => readFileSync(path.resolve(process.cwd(), p), "utf8");

describe("subscribeMediaQuery", () => {
  it("uses addEventListener/removeEventListener('change') on modern browsers", () => {
    const mq = { addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() };
    const listener = () => undefined;
    const stop = subscribeMediaQuery(mq as unknown as MediaQueryList, listener);
    expect(mq.addEventListener).toHaveBeenCalledWith("change", listener);
    expect(mq.addListener).not.toHaveBeenCalled();
    stop();
    expect(mq.removeEventListener).toHaveBeenCalledWith("change", listener);
    expect(mq.removeListener).not.toHaveBeenCalled();
  });

  it("falls back to addListener/removeListener when addEventListener is missing (Safari 13)", () => {
    const mq = { addListener: vi.fn(), removeListener: vi.fn() };
    const listener = () => undefined;
    const stop = subscribeMediaQuery(mq as unknown as MediaQueryList, listener);
    expect(mq.addListener).toHaveBeenCalledWith(listener);
    stop();
    expect(mq.removeListener).toHaveBeenCalledWith(listener);
  });

  it("Header and SalaryTable subscribe through the helper (no bare mq.addEventListener)", () => {
    for (const file of ["src/components/Header.tsx", "src/components/SalaryTable.tsx"]) {
      const src = read(file);
      expect(src, file).toContain("subscribeMediaQuery(");
      expect(src, file).not.toMatch(/\.addEventListener\("change"/);
    }
  });
});

const fakeDialog = (api: { showModal?: () => void; close?: () => void }) => {
  const attrs = new Map<string, string>();
  return Object.assign({
    setAttribute: vi.fn((k: string, v: string) => { attrs.set(k, v); }),
    removeAttribute: vi.fn((k: string) => { attrs.delete(k); }),
    hasAttribute: (k: string) => attrs.has(k),
    attrs,
  }, api);
};

describe("openDialog / closeDialog", () => {
  it("uses showModal and close when supported", () => {
    const d = fakeDialog({ showModal: vi.fn(), close: vi.fn() });
    openDialog(d as unknown as HTMLDialogElement);
    expect(d.showModal).toHaveBeenCalledTimes(1);
    expect(d.setAttribute).not.toHaveBeenCalled();
    closeDialog(d as unknown as HTMLDialogElement);
    expect(d.close).toHaveBeenCalledTimes(1);
    expect(d.removeAttribute).not.toHaveBeenCalled();
  });

  it("falls back to the open attribute when showModal/close are missing (Safari < 15.4)", () => {
    const d = fakeDialog({});
    openDialog(d as unknown as HTMLDialogElement);
    expect(d.attrs.get("open")).toBe("");
    closeDialog(d as unknown as HTMLDialogElement);
    expect(d.attrs.has("open")).toBe(false);
  });

  it("still shows the dialog when showModal throws", () => {
    const d = fakeDialog({ showModal: vi.fn(() => { throw new DOMException("not connected", "InvalidStateError"); }), close: vi.fn() });
    expect(() => openDialog(d as unknown as HTMLDialogElement)).not.toThrow();
    expect(d.attrs.get("open")).toBe("");
  });

  it("useModalDialog opens and closes through the guarded helpers", () => {
    const src = read("src/hooks/useModalDialog.ts");
    expect(src).toContain("openDialog(dialog);");
    expect(src).toContain("closeDialog(dialog);");
    // showModal 은 openDialog 의 typeof 가드 안에서만 호출된다.
    expect(src.match(/\.showModal\(\)/g)).toHaveLength(1);
    expect(src).toContain('typeof dialog.showModal === "function"');
  });
});

describe("globals.css closed-dialog rule", () => {
  it("hides closed dialogs even in browsers without native <dialog>", () => {
    expect(read("src/app/globals.css")).toMatch(/dialog:not\(\[open\]\)\s*\{\s*display:\s*none;\s*\}/);
  });
});
