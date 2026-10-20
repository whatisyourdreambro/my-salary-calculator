import assert from 'node:assert/strict';
import test from 'node:test';
import { observeModalTransition, startModalFocusTrace } from '../qa-interaction-states.mjs';

// Inert DOM and a manually advanced clock only. No browser, focus injection,
// page renderer, real waits or network calls are used in these regressions.
async function fixture(run) {
  const saved = new Map();
  const replace = (name, value) => {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  };
  let now = 0, sequence = 0;
  const frames = new Map(), timers = new Map();
  const body = { style: { overflow: 'hidden' }, outerHTML: '<body></body>' };
  const opener = { isConnected: true, inert: true, outerHTML: '<button>Original opener</button>',
    closest() { return this.inert ? body : null; } };
  const close = { outerHTML: '<button>Close</button>' };
  const dialog = { isConnected: true, visibility: 'visible',
    getClientRects() { return this.isConnected ? [{}] : []; },
    contains(node) { return node === close; } };
  const doc = { body, activeElement: close,
    querySelectorAll() { return dialog.isConnected ? [dialog] : []; } };
  replace('document', doc);
  replace('performance', { now: () => now });
  replace('getComputedStyle', node => ({ visibility: node.visibility }));
  replace('requestAnimationFrame', callback => { const id = ++sequence; frames.set(id, callback); return id; });
  replace('cancelAnimationFrame', id => frames.delete(id));
  replace('setTimeout', (callback, delay) => { const id = ++sequence; timers.set(id, { callback, deadline: now + delay }); return id; });
  replace('clearTimeout', id => timers.delete(id));
  const advance = ms => {
    now += ms;
    const pending = [...frames.values()]; frames.clear();
    for (const callback of pending) callback(now);
    for (const [id, timer] of [...timers]) if (timer.deadline <= now) { timers.delete(id); timer.callback(); }
  };
  const restore = () => { dialog.isConnected = false; opener.inert = false; doc.activeElement = opener; body.style.overflow = ''; };
  try { await run({ doc, body, opener, close, dialog, advance, restore, frames, timers }); }
  finally {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  }
}

test('actual delayed restoration is observed once, preserving initial and final active elements', async () => fixture(async state => {
  const pending = observeModalTransition({ ...state, phase: 'closed', baselineOverflow: '' });
  state.restore(); state.advance(16);
  const result = await pending;
  assert.equal(result.passed, true); assert.equal(result.elapsedMs, 16);
  assert.equal(result.initial.activeElement, '<button>Close</button>');
  assert.equal(result.initial.exactOpenerFocused, false);
  assert.equal(result.final.activeElement, '<button>Original opener</button>');
  assert.equal(result.final.exactOpenerFocused, true);
  assert.equal(result.final.openerInert, false); assert.equal(result.final.openModalCount, 0);
  assert.equal(state.frames.size, 0); assert.equal(state.timers.size, 0);
}));

test('hidden dialog with permanently missing opener focus fails at the 1500ms deadline', async () => fixture(async state => {
  state.dialog.isConnected = false; state.opener.inert = false; state.body.style.overflow = '';
  state.doc.activeElement = state.body;
  const pending = observeModalTransition({ ...state, phase: 'closed', baselineOverflow: '' });
  state.advance(1500);
  const result = await pending;
  assert.equal(result.passed, false); assert.equal(result.elapsedMs, 1500);
  assert.equal(result.final.activeElement, '<body></body>');
  assert.equal(result.final.exactOpenerFocused, false);
  state.doc.activeElement = state.opener; state.advance(16);
  assert.equal(result.passed, false, 'Late restoration cannot rewrite the failed observation');
  assert.equal(state.frames.size, 0); assert.equal(state.timers.size, 0);
}));

test('focus alone cannot pass while the background is inert, scroll locked or the modal remains open', async () => {
  for (const fault of ['inert', 'overflow', 'modal', 'detached-opener']) await fixture(async state => {
    state.restore();
    if (fault === 'inert') state.opener.inert = true;
    if (fault === 'overflow') state.body.style.overflow = 'hidden';
    if (fault === 'modal') state.dialog.isConnected = true;
    if (fault === 'detached-opener') state.opener.isConnected = false;
    const pending = observeModalTransition({ ...state, phase: 'closed', baselineOverflow: '' });
    state.advance(1500);
    assert.equal((await pending).passed, false, fault);
  });
});

test('readiness requires actual focus inside this dialog plus background isolation', async () => fixture(async state => {
  state.doc.activeElement = state.opener; state.opener.inert = false;
  const pending = observeModalTransition({ ...state, phase: 'ready', baselineOverflow: '' });
  state.doc.activeElement = state.close; state.opener.inert = true; state.advance(16);
  const result = await pending;
  assert.equal(result.passed, true); assert.equal(result.initial.focusInsideDialog, false);
  assert.equal(result.final.focusInsideDialog, true); assert.equal(result.final.openerInert, true);
}));

test('unprepared visible dialog cannot pass, and pre-lookup snapshots retain identity uncertainty', async () => fixture(async state => {
  state.opener.inert = false;
  const snapshot = observeModalTransition({ dialog: null, opener: state.opener, phase: 'snapshot', baselineOverflow: '' });
  assert.equal(snapshot.initial.dialogIdentityKnown, false);
  assert.equal(snapshot.initial.openModalCount, 1);
  const pending = observeModalTransition({ ...state, phase: 'ready', baselineOverflow: '' });
  state.advance(1500);
  assert.equal((await pending).passed, false);
}));

test('a same-looking replacement opener and an unbounded observation budget are rejected', async () => fixture(async state => {
  state.restore();
  state.doc.activeElement = { ...state.opener };
  const pending = observeModalTransition({ ...state, phase: 'closed', baselineOverflow: '' });
  state.advance(1500);
  assert.equal((await pending).passed, false);
  for (const timeoutMs of [0, -1, 1501, Infinity]) assert.throws(() =>
    observeModalTransition({ ...state, phase: 'closed', baselineOverflow: '', timeoutMs }));
}));

test('focus trace preserves the observed opener-to-dialog sequence without retaining input values', async () => fixture(async state => {
  const listeners = new Map();
  state.doc.addEventListener = (type, listener) => listeners.set(type, listener);
  state.doc.removeEventListener = (type, listener) => {
    assert.equal(listeners.get(type), listener); listeners.delete(type);
  };
  Object.assign(state.close, { tagName: 'INPUT', id: 'synthetic-field', value: 'private-synthetic-value' });
  Object.assign(state.opener, { tagName: 'BUTTON', id: 'synthetic-opener' });
  const recorder = startModalFocusTrace(state);
  state.doc.activeElement = state.opener;
  listeners.get('focusin')({ type: 'focusin', target: state.opener });
  state.doc.activeElement = state.close;
  listeners.get('focusin')({ type: 'focusin', target: state.close });
  state.dialog.isConnected = false; state.doc.activeElement = state.body;
  const result = recorder.stop();
  assert.equal(result.start.activeInDialog, true);
  assert.deepEqual(result.events.map(event => [event.isPinnedOpener, event.inPinnedDialog]), [[true, false], [false, true]]);
  assert.equal(result.final.dialogConnected, false); assert.equal(result.final.activeInDialog, false);
  assert.equal(result.final.activeIsOpener, false);
  assert(!JSON.stringify(result).includes('private-synthetic-value'));
  assert.equal(listeners.size, 0); assert.equal(recorder.stop(), result);
}));

test('focus trace caps events at 64 and counts excess events before removing both listeners', async () => fixture(async state => {
  const listeners = new Map();
  state.doc.addEventListener = (type, listener) => listeners.set(type, listener);
  state.doc.removeEventListener = type => listeners.delete(type);
  const recorder = startModalFocusTrace(state);
  for (let i = 0; i < 70; i++) {
    const type = i % 2 ? 'focusout' : 'focusin';
    listeners.get(type)({ type, target: state.close });
  }
  const result = recorder.stop();
  assert.equal(result.limit, 64); assert.equal(result.events.length, 64); assert.equal(result.droppedEvents, 6);
  assert.equal(listeners.size, 0);
}));
