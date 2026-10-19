import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { collectInteractionText, assessInteractionText, collectInteractionFocusedControl } from '../lib/qa-interaction-evidence.mjs';

// A synthetic DOM exercises the serialized callback without creating a browser,
// loading the application, or issuing any network requests.
const rectangle = (x = 10, y = 10, width = 100, height = 24) => ({ x, y, width, height, top: y, left: x, right: x + width, bottom: y + height });
const computed = overrides => ({ color: 'rgb(0, 0, 0)', fontSize: '16px', fontWeight: '400',
  backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none', backgroundClip: 'border-box', backgroundBlendMode: 'normal',
  backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: '0% 0%', opacity: '1', filter: 'none',
  backdropFilter: 'none', mixBlendMode: 'normal', webkitTextFillColor: 'rgb(0, 0, 0)', webkitTextStrokeWidth: '0px',
  maskImage: 'none', clipPath: 'none', textShadow: 'none', boxShadow: 'none', clip: 'auto', display: 'block', visibility: 'visible',
  width: '100px', height: '24px', position: 'static', overflow: 'visible', ...overrides });
class Element {
  constructor(tag = 'div', { text = '', style = {}, attrs = {}, classes = [], rect = rectangle(), children = [], pseudos = {}, animations = [] } = {}) {
    this.tagName = tag.toUpperCase(); this.id = attrs.id || ''; this.attrs = attrs;
    this.style = computed(style); this.classList = { contains: name => classes.includes(name) };
    this.rectangle = rect; this.pseudos = pseudos; this.animations = animations;
    this.isConnected = true; this.namespaceURI = 'http://www.w3.org/1999/xhtml';
    this.parentElement = null; this.children = children;
    this.childNodes = [...(text ? [{ nodeType: 3, textContent: text, rects: [rect] }] : []), ...children];
    for (const child of children) child.parentElement = this;
  }
  querySelectorAll() { return this.children.flatMap(child => [child, ...child.querySelectorAll('*')]); }
  hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  getBoundingClientRect() { return this.rectangle; }
  getAnimations() { return this.animations; }
  contains(el) { return el === this || this.children.some(child => child.contains(el)); }
  matches(selector) {
    if (selector === ':focus-visible') return this.attrs['data-focus-visible'] === 'true';
    if (selector === ':modal') return this.attrs['data-native-modal'] === 'true';
    return selector.includes(':disabled') && this.hasAttribute('disabled')
      && ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'OPTGROUP'].includes(this.tagName);
  }
}
function fixture(selected, { roots = [selected], activeElement = null } = {}) {
  const html = new Element('html', { style: { backgroundColor: 'rgb(255, 255, 255)' }, children: [selected] });
  const document = { querySelectorAll: () => roots, activeElement, documentElement: html, body: selected,
    createRange: () => ({ node: null, selectNodeContents(node) { this.node = node; }, getClientRects() { return this.node.rects; }, detach() {} }) };
  const context = { document, HTMLElement: Element, innerWidth: 390, innerHeight: 844,
    getComputedStyle: (el, pseudo) => pseudo ? { ...el.style, content: 'none', ...el.pseudos[pseudo] } : el.style };
  const run = (fn, input) => vm.runInNewContext(`(${fn.toString()})`, context)(input);
  return { capture: () => JSON.parse(JSON.stringify(run(collectInteractionText, { selector: '#fixture' }))),
    focused: () => JSON.parse(JSON.stringify(run(collectInteractionFocusedControl))), context };
}

test('serialized collector gathers direct text once with overlapping selected roots and preserves complete paint layers', () => {
  const child = new Element('strong', { text: 'Nested result' });
  const root = new Element('section', { text: 'Result title', children: [child] });
  const raw = fixture(root, { roots: [root, child] }).capture();
  assert.deepEqual(raw.records.map(record => record.text), ['Result title', 'Nested result']);
  assert.equal(raw.records[1].layers.length, 3);
  assert.equal(raw.records[1].layers[0].maskImage, 'none');
  assert.equal(raw.records[1].layers[0].backgroundBlendMode, 'normal');
  const assessed = assessInteractionText(raw);
  assert.equal(assessed.passed, true);
  assert.deepEqual(assessed.counts, { total: 2, passed: 2, failed: 0, unassessed: 0, excluded: 0 });
  assert.deepEqual(assessed.records[0].fragments, raw.records[0].fragments);
});

test('element and ancestor group opacity are recorded once rather than multiplied into text ink', () => {
  const child = new Element('span', { text: 'Semi-transparent result', style: { opacity: '0.6', color: 'rgba(0, 0, 0, 0.8)', webkitTextFillColor: 'rgba(0, 0, 0, 0.8)' } });
  const raw = fixture(new Element('section', { style: { opacity: '0.5' }, children: [child] })).capture();
  assert.equal(raw.records[0].textOpacity, 1);
  assert.deepEqual(raw.records[0].layers.map(layer => layer.opacity), ['0.6', '0.5', '1']);
  assert.equal(raw.records[0].foreground, 'rgba(0, 0, 0, 0.8)');
  const result = assessInteractionText(raw);
  assert.equal(result.passed, false);
  assert.equal(result.records[0].assessment.reason, 'ancestor-or-text-opacity');
  assert.equal(result.counts.unassessed, 1);
});

test('hidden and disabled text remains explicit exclusion evidence rather than a measured pass', () => {
  const rows = [
    new Element('p', { text: 'Hidden attribute', attrs: { hidden: '' }, style: { display: 'none' } }),
    new Element('p', { text: 'Display none', style: { display: 'none' } }),
    new Element('p', { text: 'Invisible', style: { visibility: 'hidden' } }),
    new Element('p', { text: 'Transparent group', style: { opacity: '0' } }),
    new Element('button', { text: 'Native disabled', attrs: { disabled: '' } }),
    new Element('div', { attrs: { 'aria-disabled': 'true' }, children: [new Element('span', { text: 'ARIA disabled descendant' })] }),
    new Element('div', { attrs: { inert: '' }, children: [new Element('span', { text: 'Inert descendant' })] }),
  ];
  const raw = fixture(new Element('section', { children: rows })).capture();
  assert.equal(raw.records.length, 0);
  assert.deepEqual(raw.excluded.map(record => record.reason), ['hidden-attribute', 'display-none', 'visibility-hidden', 'zero-group-opacity', 'disabled-control', 'aria-disabled-subtree', 'inert-subtree']);
  const assessed = assessInteractionText(raw);
  assert.equal(assessed.passed, false); assert.equal(assessed.counts.passed, 0); assert.equal(assessed.counts.excluded, 7);
});

test('computed sr-only clipping is excluded while a restored sr-only class remains measured', () => {
  const raw = fixture(new Element('section', { children: [
    new Element('span', { text: 'Screen reader description', classes: ['sr-only'], style: { width: '1px', height: '1px', position: 'absolute', overflow: 'hidden', clip: 'rect(0px, 0px, 0px, 0px)' } }),
    new Element('span', { text: 'Shown on focus', classes: ['sr-only'], style: { position: 'static', clip: 'auto', overflow: 'visible' } }),
    new Element('span', { text: 'Hidden clip path', style: { width: '1px', height: '1px', clipPath: 'inset(50%)' } }),
  ] })).capture();
  assert.deepEqual(raw.records.map(record => record.text), ['Shown on focus']);
  assert.deepEqual(raw.excluded.map(record => record.reason), ['screen-reader-only-clipped', 'screen-reader-only-clipped']);
  assert.equal(assessInteractionText(raw).counts.passed, 1);
});

test('ignored hidden attribute and static legacy clip cannot silently exclude actually rendered text', () => {
  const raw = fixture(new Element('section', { children: [
    new Element('p', { text: 'CSS overrides hidden', attrs: { hidden: '' }, style: { display: 'block' } }),
    new Element('p', { text: 'Clip not applicable to static element', style: { clip: 'rect(0px, 0px, 0px, 0px)', position: 'static' } }),
  ] })).capture();
  assert.equal(raw.excluded.length, 0); assert.equal(raw.records.length, 2);
  assert.equal(assessInteractionText(raw).records[1].assessment.status, 'unassessed');
});

test('closed details excludes hidden body but keeps the first summary direct text', () => {
  const raw = fixture(new Element('details', { children: [new Element('summary', { text: 'Open results' }), new Element('p', { text: 'Closed result body' })] })).capture();
  assert.deepEqual(raw.records.map(record => record.text), ['Open results']);
  assert.equal(raw.excluded[0].reason, 'closed-details-content');
});

test('generated paint and text pseudo styling stay unknown with the raw evidence retained', () => {
  const raw = fixture(new Element('section', { children: [
    new Element('p', { text: 'Pseudo overlay', pseudos: { '::before': { content: '""', backgroundColor: 'rgb(255, 255, 255)' } } }),
    new Element('p', { text: 'Different first letter', pseudos: { '::first-letter': { color: 'rgb(100, 100, 100)' } } }),
  ] })).capture();
  const assessed = assessInteractionText(raw);
  assert.equal(assessed.passed, false); assert.equal(assessed.counts.unassessed, 2);
  assert.equal(assessed.records[0].assessment.reason, 'generated-pseudo-paint');
  assert.equal(assessed.records[1].assessment.reason, 'text-pseudo-style');
  assert.deepEqual(assessed.records[0].pseudoEvidence, raw.records[0].pseudoEvidence);
});

test('pending finite animation is unknown without dropping its text or reducing opacity to ink', () => {
  const raw = fixture(new Element('p', { text: 'Fading result', animations: [{ playState: 'running', pending: false, effect: { getComputedTiming: () => ({ endTime: 200 }) } }] })).capture();
  assert.equal(raw.records[0].pendingFiniteAnimations, 1);
  assert.equal(assessInteractionText(raw).records[0].assessment.reason, 'finite-animation-in-progress');
});

test('viewport position is recorded without silently dropping below-fold CSS-rendered text', () => {
  const raw = fixture(new Element('p', { text: 'Below-fold result', rect: rectangle(10, 2000) })).capture();
  assert.equal(raw.records.length, 1); assert.equal(raw.records[0].inViewport, false);
  assert.equal(assessInteractionText(raw).passed, true);
  assert(assessInteractionText(raw).limitations.some(line => line.includes('complete glyph visibility')));
});

test('empty selectors, no text fragments and partial collection cannot produce a success', () => {
  const empty = fixture(new Element('p', { text: 'Not selected' }), { roots: [] }).capture();
  assert.equal(assessInteractionText(empty).passed, false);
  const node = new Element('p', { text: 'No fragment', rect: rectangle(0, 0, 0, 0) });
  assert.equal(fixture(node).capture().excluded[0].reason, 'no-rendered-text-fragments');
  const raw = fixture(new Element('p', { text: 'Partial success' })).capture();
  raw.issues.push('text-record-limit-exceeded');
  assert.equal(assessInteractionText(raw).passed, false);
});

test('missing paint fields, duplicated identities and malformed records fail closed', () => {
  const raw = fixture(new Element('p', { text: 'Result' })).capture();
  const missing = structuredClone(raw); delete missing.records[0].layers[0].filter;
  assert.equal(assessInteractionText(missing).counts.unassessed, 1);
  const doubled = structuredClone(raw); doubled.records.push(structuredClone(doubled.records[0]));
  assert.equal(assessInteractionText(doubled).passed, false);
  const malformed = structuredClone(raw); malformed.records = [null];
  assert.equal(assessInteractionText(malformed).counts.unassessed, 1);
  const opacity = structuredClone(raw); opacity.records[0].textOpacity = 0.5;
  assert.equal(assessInteractionText(opacity).records[0].assessment.reason, 'invalid-direct-text-evidence');
});

test('large-text threshold is derived from actual font evidence and cannot be weakened in a record', () => {
  const raw = fixture(new Element('p', { text: 'Result heading', style: { fontSize: '24px' } })).capture();
  assert.equal(raw.records[0].threshold, 3); assert.equal(assessInteractionText(raw).passed, true);
  raw.records[0].fontSizePx = 16;
  assert.equal(assessInteractionText(raw).records[0].assessment.reason, 'invalid-direct-text-evidence');
});

test('focused-control collector records semantics passively and makes no focus-appearance claim', () => {
  const button = new Element('button', { attrs: { id: 'save', role: 'tab', 'aria-selected': 'true', 'aria-label': 'Save result', 'data-focus-visible': 'true' } });
  const root = new Element('section', { children: [button] }); button.tabIndex = 0;
  const raw = fixture(root, { activeElement: button }).focused();
  assert.equal(raw.id, 'save'); assert.equal(raw.aria.selected, 'true'); assert.equal(raw.focusVisible, true);
  assert.equal(raw.label, 'Save result'); assert.equal(raw.rect.width, 100);
  assert.equal(raw.evidenceKind, 'passive-active-element-snapshot-not-focus-appearance-assessment');
});

test('only a verified native modal stops outside ancestor paint while retaining raw excluded ancestry', () => {
  const text = new Element('button', { text: 'Modal action' });
  const dialog = new Element('dialog', { attrs: { open: '', 'data-native-modal': 'true' }, style: { backgroundColor: 'rgb(255, 255, 255)' }, children: [text] });
  const ancestor = new Element('section', { style: { opacity: '0', filter: 'blur(8px)', clipPath: 'inset(50%)' }, attrs: { inert: '' },
    pseudos: { '::before': { content: '"overlay"', backgroundColor: 'rgb(0, 0, 0)' } }, children: [dialog] });
  const raw = fixture(ancestor, { roots: [dialog] }).capture();
  assert.equal(raw.excluded.length, 0); assert.equal(raw.records[0].layers.length, 2);
  assert.equal(raw.records[0].paintBoundary.kind, 'native-modal-top-layer');
  assert.equal(raw.records[0].paintBoundary.inclusiveLayerIndex, 1);
  assert.equal(raw.records[0].paintBoundary.excludedAncestorCount, 2);
  assert.equal(raw.records[0].paintBoundary.excludedAncestors[0].styles.opacity, '0');
  assert.equal(assessInteractionText(raw).passed, true);
});

test('native modal own group effects and pseudo paint are never discarded by its boundary', () => {
  for (const options of [{ style: { opacity: '0.5' } }, { pseudos: { '::before': { content: '""', backgroundColor: 'rgb(0, 0, 0)' } } }]) {
    const dialog = new Element('dialog', { ...options, attrs: { open: '', 'data-native-modal': 'true' }, children: [new Element('button', { text: 'Action', style: { backgroundColor: 'rgb(255, 255, 255)' } })] });
    const checked = assessInteractionText(fixture(dialog).capture());
    assert.equal(checked.passed, false); assert.equal(checked.counts.unassessed, 1);
  }
});

test('nonmodal dialog and custom sheet retain outside paint even behind an opaque child', () => {
  for (const [tag, attrs] of [['dialog', { open: '' }], ['div', { role: 'dialog', 'aria-modal': 'true' }]]) {
    const surface = new Element(tag, { attrs, children: [new Element('button', { text: 'Action', style: { backgroundColor: 'rgb(255, 255, 255)' } })] });
    const ancestor = new Element('section', { style: { opacity: '0.5' }, children: [surface] });
    const raw = fixture(ancestor, { roots: [surface] }).capture();
    assert.equal(raw.records[0].layers.length, 4); assert.equal(raw.records[0].paintBoundary.kind, 'document');
    assert.equal(assessInteractionText(raw).records[0].assessment.reason, 'ancestor-or-text-opacity');
  }
});

test('transparent native modal cannot borrow its DOM parent background, and display-none ancestry still hides it', () => {
  let dialog = new Element('dialog', { text: 'Transparent modal text', attrs: { open: '', 'data-native-modal': 'true' } });
  let raw = fixture(new Element('section', { style: { backgroundColor: 'rgb(255, 255, 255)' }, children: [dialog] }), { roots: [dialog] }).capture();
  assert.equal(raw.records[0].layers.length, 1);
  const checked = assessInteractionText(raw); assert.equal(checked.passed, false);
  assert.equal(checked.records[0].assessment.canvas, 'unknown-rgb-range');
  dialog = new Element('dialog', { text: 'Not rendered modal', attrs: { open: '', 'data-native-modal': 'true' } });
  raw = fixture(new Element('section', { style: { display: 'none' }, children: [dialog] }), { roots: [dialog] }).capture();
  assert.equal(raw.records.length, 0); assert.equal(raw.excluded[0].reason, 'display-none');
});

const unpaintedPseudo = overrides => ({ content: '""', width: '0px', height: '0px', position: 'static',
  backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none', boxShadow: 'none', textShadow: 'none',
  outlineStyle: 'none', outlineWidth: '3px', borderImageSource: 'none', transform: 'none', perspective: 'none',
  ...Object.fromEntries(['Top', 'Right', 'Bottom', 'Left'].flatMap(side => [[`border${side}Width`, '0px'], [`border${side}Style`, 'solid'], [`padding${side}`, '0px']])), ...overrides });
function modalPseudoEvidence(overrides, native = true) {
  const dialog = new Element('dialog', { attrs: { open: '', ...(native ? { 'data-native-modal': 'true' } : {}) },
    style: { backgroundColor: 'rgb(255, 255, 255)' }, pseudos: { '::before': unpaintedPseudo(overrides) },
    children: [new Element('button', { text: 'Modal action' })] });
  return fixture(dialog).capture();
}
test('native modal empty zero-area unpainted pseudo is explicitly classified without dropping raw properties', () => {
  const raw = modalPseudoEvidence({});
  const checked = assessInteractionText(raw); assert.equal(checked.passed, true);
  assert.deepEqual(checked.records[0].unsupported, ['generated-pseudo-paint']);
  assert.deepEqual(checked.records[0].pseudoEvidence, raw.records[0].pseudoEvidence);
  assert.equal(checked.records[0].pseudoAssessments[0].classification, 'no-paint');
  assert.equal(checked.records[0].pseudoAssessments[0].exemptionReason, 'native-modal-empty-zero-area-pseudo-with-no-paint');
  assert.equal(checked.records[0].pseudoEvidence[0].box.outlineWidth, '3px'); // outline-style:none draws no outline
});
test('any actual or unknown pseudo paint, area, padding, content or effect retains unassessed status', () => {
  const variations = [
    { content: '"x"' }, { width: '1px' }, { height: '1px' }, { paddingTop: '1px' }, { borderTopWidth: '1px' },
    { backgroundColor: 'rgb(255, 255, 255)' }, { backgroundImage: 'linear-gradient(white, black)' },
    { boxShadow: 'rgb(0, 0, 0) 0px 0px 0px 2px' }, { textShadow: 'rgb(0, 0, 0) 0px 0px 2px' },
    { outlineStyle: 'solid' }, { borderImageSource: 'url("synthetic.svg")' }, { filter: 'blur(1px)' },
    { backdropFilter: 'blur(1px)' }, { maskImage: 'url("synthetic.svg")' }, { clipPath: 'inset(10%)' },
    { transform: 'translateX(1px)' }, { perspective: '500px' }, { position: 'absolute' }, { display: 'list-item' },
    { opacity: '0.5' }, { mixBlendMode: 'multiply' }, { webkitTextStrokeWidth: '1px' }, { paddingLeft: undefined },
  ];
  for (const variation of variations) {
    const checked = assessInteractionText(modalPseudoEvidence(variation));
    assert.equal(checked.passed, false, JSON.stringify(variation));
    assert.equal(checked.records[0].assessment.reason, 'generated-pseudo-paint');
  }
});
test('empty unpainted pseudo is not exempt outside the actual native modal root', () => {
  assert.equal(assessInteractionText(modalPseudoEvidence({}, false)).passed, false);
  const raw = modalPseudoEvidence({}); raw.records[0].paintBoundary.nativeModalMatch = false;
  assert.equal(assessInteractionText(raw).passed, false);
});
