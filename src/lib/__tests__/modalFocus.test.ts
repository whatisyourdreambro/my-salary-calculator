import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateModalFocus, hasOtherOpenModal } from '@/lib/modalFocus';

// Inert DOM/event fixtures only. Native dialog/browser behavior is covered by guarded localhost QA.
type Listener = (event: { target?: FakeElement; key?: string; shiftKey?: boolean; preventDefault(): void; stopPropagation(): void }) => void;
class FakeDocument {
  body = new FakeElement(this, 'body');
  activeElement: FakeElement = this.body;
  listeners = new Map<string, Set<Listener>>();
  addEventListener(name: string, listener: Listener) { const list = this.listeners.get(name) ?? new Set(); list.add(listener); this.listeners.set(name, list); }
  removeEventListener(name: string, listener: Listener) { this.listeners.get(name)?.delete(listener); }
  emit(name: string, event: Parameters<Listener>[0]) { for (const fn of this.listeners.get(name) ?? []) fn(event); }
  querySelectorAll() { return this.body.descendants().filter(el => el.tag === 'dialog' && el.hasAttribute('open') || el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true'); }
}
class FakeElement {
  attrs = new Map<string, string>();
  children: FakeElement[] = [];
  parentElement: FakeElement | null = null;
  style = { overflow: '' };
  hidden = false;
  visibility = 'visible';
  disabled = false;
  constructor(public ownerDocument: FakeDocument, public tag = 'div') {}
  get isConnected(): boolean { return this === this.ownerDocument.body || Boolean(this.parentElement?.isConnected); }
  get tabIndex() { return Number(this.attrs.get('tabindex') ?? (['input', 'button', 'a', 'select'].includes(this.tag) ? 0 : -1)); }
  setAttribute(key: string, value: string) { this.attrs.set(key, value); }
  getAttribute(key: string) { return this.attrs.get(key) ?? null; }
  hasAttribute(key: string) { return this.attrs.has(key); }
  removeAttribute(key: string) { this.attrs.delete(key); }
  append(...items: FakeElement[]) { for (const item of items) { item.parentElement = this; this.children.push(item); } }
  descendants(): FakeElement[] { return this.children.flatMap(child => [child, ...child.descendants()]); }
  querySelectorAll() { return this.descendants().filter(el => ['button', 'input', 'a', 'select', 'summary'].includes(el.tag) || el.hasAttribute('tabindex')); }
  contains(item: FakeElement | null): boolean { return Boolean(item && (item === this || this.children.some(child => child.contains(item)))); }
  matches(selector: string) { return selector === ':disabled' && this.disabled; }
  closest(selector: string): FakeElement | null {
    const attrNames = [...selector.matchAll(/\[([^\]]+)\]/g)].map(match => match[1]);
    return attrNames.some(name => this.hasAttribute(name)) ? this : this.parentElement?.closest(selector) ?? null;
  }
  getClientRects() { return this.hidden ? [] : [{}]; }
  focus() {
    if (this.closest('[inert]') || this.hidden) return;
    this.ownerDocument.activeElement = this;
    this.ownerDocument.emit('focusin', { target: this, preventDefault() {}, stopPropagation() {} });
  }
}
class FakeInput extends FakeElement {
  type = 'radio'; name = 'group'; checked = false; form = null;
  constructor(doc: FakeDocument) { super(doc, 'input'); }
}
let mutation: (() => void) | undefined;
class FakeObserver {
  constructor(callback: () => void) { mutation = callback; }
  observe() {}
  disconnect() { mutation = undefined; }
}
const releases: (() => void)[] = [];
const activate = (element: FakeElement, options: Parameters<typeof activateModalFocus>[1]) => {
  const cleanup = activateModalFocus(element as unknown as HTMLElement, options);
  releases.push(cleanup);
  return cleanup;
};
function fixture() {
  const doc = new FakeDocument();
  const page = new FakeElement(doc), opener = new FakeElement(doc, 'button');
  const modal = new FakeElement(doc), first = new FakeElement(doc, 'button'), last = new FakeElement(doc, 'button');
  page.append(opener, modal); modal.append(first, last); doc.body.append(page); opener.focus();
  return { doc, page, opener, modal, first, last };
}
function key(doc: FakeDocument, value: string, shiftKey = false) {
  const event = { key: value, shiftKey, preventDefault: vi.fn(), stopPropagation: vi.fn() };
  doc.emit('keydown', event); return event;
}
beforeEach(() => {
  vi.stubGlobal('HTMLElement', FakeElement);
  vi.stubGlobal('HTMLInputElement', FakeInput);
  vi.stubGlobal('MutationObserver', FakeObserver);
  vi.stubGlobal('getComputedStyle', (el: FakeElement) => ({ visibility: el.visibility }));
  vi.stubGlobal('fetch', () => { throw new Error('Network forbidden in modal tests'); });
});
afterEach(() => { for (const release of releases.splice(0).reverse()) release(); vi.unstubAllGlobals(); });

describe('modal focus isolation', () => {
  it('focuses inside, isolates every sibling branch, and restores the exact previous attributes and opener', () => {
    const { doc, page, opener, modal, first } = fixture();
    const side = new FakeElement(doc); side.setAttribute('inert', 'existing'); side.setAttribute('aria-hidden', 'false'); doc.body.append(side);
    doc.body.style.overflow = 'scroll';
    const stop = activate(modal, { onEscape: vi.fn() });
    expect(doc.activeElement).toBe(first);
    expect(opener.hasAttribute('inert')).toBe(true); expect(side.getAttribute('aria-hidden')).toBe('true');
    expect(page.hasAttribute('inert')).toBe(false); expect(modal.hasAttribute('inert')).toBe(false);
    stop();
    expect(doc.activeElement).toBe(opener); expect(doc.body.style.overflow).toBe('scroll');
    expect(opener.hasAttribute('inert')).toBe(false); expect(opener.hasAttribute('aria-hidden')).toBe(false);
    expect(side.getAttribute('inert')).toBe('existing'); expect(side.getAttribute('aria-hidden')).toBe('false');
    expect(modal.hasAttribute('tabindex')).toBe(false);
  });
  it('wraps real boundary Tab keys and redirects unexpected outside focus', () => {
    const { doc, modal, first, last, opener } = fixture();
    activate(modal, { onEscape: vi.fn(), focusRoot: true });
    expect(doc.activeElement).toBe(modal);
    expect(key(doc, 'Tab', true).preventDefault).toHaveBeenCalled(); expect(doc.activeElement).toBe(last);
    key(doc, 'Tab'); expect(doc.activeElement).toBe(first);
    key(doc, 'Tab', true); expect(doc.activeElement).toBe(last);
    doc.activeElement = opener;
    doc.emit('focusin', { target: opener, preventDefault() {}, stopPropagation() {} });
    expect(doc.activeElement).toBe(first);
  });
  it('restores an explicit opener after async loading temporarily disabled it and moved focus to body', () => {
    const { doc, opener, modal, first } = fixture();
    opener.disabled = true;
    doc.activeElement = doc.body;
    opener.disabled = false;
    const close = activate(modal, { onEscape: vi.fn(), opener: opener as unknown as HTMLElement });
    expect(doc.activeElement).toBe(first);
    close();
    expect(doc.activeElement).toBe(opener);
  });
  it('holds an empty dialog safely and leaves ordinary keys alone', () => {
    const { doc, modal } = fixture(); modal.children = [];
    activate(modal, { onEscape: vi.fn() });
    expect(key(doc, 'Tab').preventDefault).toHaveBeenCalled(); expect(doc.activeElement).toBe(modal);
    expect(key(doc, 'ArrowRight').preventDefault).not.toHaveBeenCalled();
  });
  it('dispatches Escape only to the top modal and retains body lock until all modals close', () => {
    const { doc, modal, opener, first } = fixture();
    const outerEscape = vi.fn(), innerEscape = vi.fn();
    const closeOuter = activate(modal, { onEscape: outerEscape });
    const inner = new FakeElement(doc), close = new FakeElement(doc, 'button'); inner.append(close); doc.body.append(inner);
    const closeInner = activate(inner, { onEscape: innerEscape });
    key(doc, 'Escape'); expect(innerEscape).toHaveBeenCalledTimes(1); expect(outerEscape).not.toHaveBeenCalled();
    closeInner(); expect(doc.activeElement).toBe(first); expect(doc.body.style.overflow).toBe('hidden');
    key(doc, 'Escape'); expect(outerEscape).toHaveBeenCalledTimes(1);
    closeOuter(); expect(doc.activeElement).toBe(opener); expect(doc.body.style.overflow).toBe('');
  });
  it('does not unlock or steal focus when an underlying modal unmounts first', () => {
    const { doc, modal } = fixture(); const closeOuter = activate(modal, { onEscape: vi.fn() });
    const inner = new FakeElement(doc), button = new FakeElement(doc, 'button'); inner.append(button); doc.body.append(inner);
    const closeInner = activate(inner, { onEscape: vi.fn() });
    closeOuter(); expect(doc.activeElement).toBe(button); expect(doc.body.style.overflow).toBe('hidden');
    closeInner(); expect(doc.body.style.overflow).toBe('');
  });
  it('isolates newly mounted background branches but preserves the pointer-only dismiss backdrop', () => {
    const { doc, page, modal } = fixture(); const backdrop = new FakeElement(doc); backdrop.setAttribute('aria-hidden', 'true'); page.append(backdrop);
    const stop = activate(modal, { onEscape: vi.fn(), backdrop: backdrop as unknown as HTMLElement });
    expect(backdrop.hasAttribute('inert')).toBe(false); expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    const late = new FakeElement(doc); doc.body.append(late); mutation?.();
    expect(late.hasAttribute('inert')).toBe(true); stop(); expect(late.hasAttribute('inert')).toBe(false);
  });
  it('uses the checked native radio as the group Tab stop without intercepting Arrow keys', () => {
    const { doc, modal, first, last } = fixture(); const a = new FakeInput(doc), b = new FakeInput(doc); b.checked = true;
    modal.children = []; modal.append(a, b, last); first.disabled = true;
    activate(modal, { onEscape: vi.fn() });
    expect(doc.activeElement).toBe(b); key(doc, 'Tab', true); expect(doc.activeElement).toBe(last);
    key(doc, 'Tab'); expect(doc.activeElement).toBe(b);
    expect(key(doc, 'ArrowDown').preventDefault).not.toHaveBeenCalled();
  });
  it('recognizes custom modal sheets and native dialogs, excluding its own dialog and nonmodal banners', () => {
    const { doc, modal } = fixture(); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    expect(hasOtherOpenModal(null, doc as unknown as Document)).toBe(true);
    expect(hasOtherOpenModal(modal as unknown as HTMLElement, doc as unknown as Document)).toBe(false);
    modal.hidden = true; expect(hasOtherOpenModal(null, doc as unknown as Document)).toBe(false);
    modal.hidden = false; modal.removeAttribute('aria-modal'); expect(hasOtherOpenModal(null, doc as unknown as Document)).toBe(false);
    const native = new FakeElement(doc, 'dialog'); native.setAttribute('open', ''); doc.body.append(native);
    expect(hasOtherOpenModal(null, doc as unknown as Document)).toBe(true);
  });
});
