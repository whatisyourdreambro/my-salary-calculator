"use client";

import { useEffect, type RefObject } from "react";
import { activateModalFocus } from "@/lib/modalFocus";

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

/** Retain native top-layer behavior, with keyboard/background isolation for the open fallback. */
export function useModalDialog(open: boolean, ref: RefObject<HTMLDialogElement | null>, returnFocusRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    // Async openers can temporarily become disabled and lose document.activeElement.
    const opener = returnFocusRef?.current ?? document.activeElement;
    openDialog(dialog);
    const previousModal = dialog.getAttribute("aria-modal");
    dialog.setAttribute("aria-modal", "true");
    const releaseFocus = activateModalFocus(dialog, {
      opener,
      // The fallback has no native Escape/cancel behavior. Use the same caller contract.
      onEscape: () => dialog.dispatchEvent(new Event("cancel", { cancelable: true })),
    });
    return () => {
      closeDialog(dialog);
      releaseFocus();
      if (previousModal === null) dialog.removeAttribute("aria-modal");
      else dialog.setAttribute("aria-modal", previousModal);
    };
  }, [open, ref, returnFocusRef]);
}
