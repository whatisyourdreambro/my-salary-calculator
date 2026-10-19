type ModalEntry = {
  element: HTMLElement;
  opener: Element | null;
  onEscape: () => void;
  backdrop?: HTMLElement | null;
};

type SavedIsolation = { inert: string | null; hidden: string | null };
type ModalState = {
  entries: ModalEntry[];
  isolated: Map<Element, SavedIsolation>;
  overflow: string;
  observer: MutationObserver;
  keydown: (event: KeyboardEvent) => void;
  focusin: (event: FocusEvent) => void;
};

const states = new WeakMap<Document, ModalState>();
const focusSelector = 'a[href],button,input,select,textarea,summary,[tabindex]';

function tabStops(element: HTMLElement) {
  const candidates = Array.from(element.querySelectorAll<HTMLElement>(focusSelector))
    .filter(item => item.tabIndex >= 0 && !item.matches(':disabled') && !item.closest('[inert], [hidden]') &&
      item.getClientRects().length > 0 && getComputedStyle(item).visibility !== 'hidden');
  return candidates.filter(item => {
    if (!(item instanceof HTMLInputElement) || item.type !== 'radio' || !item.name) return true;
    const group = candidates.filter(candidate => candidate instanceof HTMLInputElement &&
      candidate.type === 'radio' && candidate.name === item.name && candidate.form === item.form) as HTMLInputElement[];
    return item === (group.find(radio => radio.checked) ?? group[0]);
  }).sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}

function focusInside(entry: ModalEntry) {
  const stops = tabStops(entry.element);
  const target = stops.find(item => item.hasAttribute('autofocus')) ?? stops[0] ?? entry.element;
  target.focus({ preventScroll: true });
}

function restoreIsolation(state: ModalState) {
  for (const [element, saved] of state.isolated) {
    for (const [name, value] of [['inert', saved.inert], ['aria-hidden', saved.hidden]] as const) {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
  }
  state.isolated.clear();
}

function isolateBackground(doc: Document, state: ModalState) {
  restoreIsolation(state);
  let branch: Element | null = state.entries.at(-1)?.element ?? null;
  while (branch?.parentElement) {
    const parent: HTMLElement = branch.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === branch || sibling === state.entries.at(-1)?.backdrop) continue;
      state.isolated.set(sibling, { inert: sibling.getAttribute('inert'), hidden: sibling.getAttribute('aria-hidden') });
      sibling.setAttribute('inert', '');
      sibling.setAttribute('aria-hidden', 'true');
    }
    if (parent === doc.body) break;
    branch = parent;
  }
}

/** No portal or visual changes: isolate only siblings of the existing modal branch.
 * A shared stack keeps nested cleanup from unlocking the body or stealing focus. */
export function activateModalFocus(element: HTMLElement, options: {
  onEscape: () => void;
  opener?: Element | null;
  focusRoot?: boolean;
  backdrop?: HTMLElement | null;
}) {
  const doc = element.ownerDocument;
  let state = states.get(doc);
  if (!state) {
    const next = {} as ModalState;
    next.entries = [];
    next.isolated = new Map();
    next.overflow = doc.body.style.overflow;
    next.keydown = event => {
      const entry = next.entries.at(-1);
      if (!entry) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        entry.onEscape();
        return;
      }
      if (event.key !== 'Tab') return;
      const stops = tabStops(entry.element);
      const first = stops[0], last = stops.at(-1);
      if (!first || !entry.element.contains(doc.activeElement) ||
        (event.shiftKey && (doc.activeElement === first || doc.activeElement === entry.element)) ||
        (!event.shiftKey && doc.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus({ preventScroll: true });
        if (!first) entry.element.focus({ preventScroll: true });
      }
    };
    let redirecting = false;
    next.focusin = event => {
      const entry = next.entries.at(-1);
      if (!entry || redirecting || entry.element.contains(event.target as Node)) return;
      redirecting = true;
      focusInside(entry);
      redirecting = false;
    };
    next.observer = new MutationObserver(() => isolateBackground(doc, next));
    next.observer.observe(doc.body, { childList: true, subtree: true });
    doc.addEventListener('keydown', next.keydown, true);
    doc.addEventListener('focusin', next.focusin, true);
    states.set(doc, next);
    state = next;
  }
  const entry: ModalEntry = { element, opener: options.opener === undefined ? doc.activeElement : options.opener, onEscape: options.onEscape, backdrop: options.backdrop };
  const savedTabIndex = element.getAttribute('tabindex');
  if (savedTabIndex === null) element.setAttribute('tabindex', '-1');
  state.entries.push(entry);
  doc.body.style.overflow = 'hidden';
  restoreIsolation(state);
  // Move focus before aria-hiding the opener's branch.
  if (options.focusRoot) element.focus({ preventScroll: true });
  else if (!element.contains(doc.activeElement)) focusInside(entry);
  isolateBackground(doc, state);
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    const wasTop = state.entries.at(-1) === entry;
    state.entries = state.entries.filter(item => item !== entry);
    isolateBackground(doc, state);
    if (savedTabIndex === null) element.removeAttribute('tabindex');
    if (!state.entries.length) {
      state.observer.disconnect();
      doc.removeEventListener('keydown', state.keydown, true);
      doc.removeEventListener('focusin', state.focusin, true);
      doc.body.style.overflow = state.overflow;
      states.delete(doc);
    }
    if (!wasTop) return;
    const current = state.entries.at(-1);
    if (entry.opener instanceof HTMLElement && entry.opener.isConnected && !entry.opener.closest('[inert]') &&
      !element.contains(entry.opener) && (!current || current.element.contains(entry.opener))) {
      entry.opener.focus({ preventScroll: true });
    } else if (current) focusInside(current);
  };
}

export function hasOtherOpenModal(current: HTMLElement | null, doc: Document = document) {
  return Array.from(doc.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"][aria-modal="true"]'))
    .some(element => element !== current && element.getClientRects().length > 0);
}
