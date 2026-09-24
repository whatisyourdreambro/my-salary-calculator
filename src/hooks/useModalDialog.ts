"use client";

import { useEffect, type RefObject } from "react";

/** Open a dialog modally where supported. Browsers without showModal (Safari < 15.4) get the plain
 *  `open` attribute instead of a TypeError; if showModal throws, the attribute still shows it. */
export function openDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.showModal === "function") {
    try {
      dialog.showModal();
      return;
    } catch {
      // Already open or not connected: fall through to the attribute.
    }
  }
  if (!dialog.hasAttribute("open")) dialog.setAttribute("open", "");
}

/** Mirror of openDialog for effect cleanup. */
export function closeDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

/** Native modal semantics provide focus containment, background inertness and focus return. */
export function useModalDialog(open: boolean, ref: RefObject<HTMLDialogElement>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const overflow = document.body.style.overflow;
    const opener = document.activeElement;
    openDialog(dialog);
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
      closeDialog(dialog);
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected && !dialog.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
