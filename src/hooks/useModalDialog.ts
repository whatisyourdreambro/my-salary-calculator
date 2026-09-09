"use client";

import { useEffect, type RefObject } from "react";

/** Native modal semantics provide focus containment, background inertness and focus return. */
export function useModalDialog(open: boolean, ref: RefObject<HTMLDialogElement>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const overflow = document.body.style.overflow;
    const opener = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    // Keep boundary tabbing inside the document instead of handing focus to browser chrome.
    const containTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const stops = Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,summary,[tabindex]'))
        .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
      const first = stops[0], last = stops[stops.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", containTab);
    return () => {
      dialog.removeEventListener("keydown", containTab);
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected && !dialog.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
