// Evidence functions only. Browser collectors must be evaluated in an already
// isolated qa-safety context; importing this module performs no browser or I/O work.
import { assessInputText } from './qa-focus-input-assessment.mjs';

/** Self-contained page.evaluate callback. No navigation, focus or DOM mutation. */
export function collectInteractionText({ selector } = {}) {
  const result = { version: 1, selector, rootsMatched: 0, records: [], excluded: [], issues: [],
    visibilityScope: 'CSS-rendered direct text; viewport intersection recorded separately',
    opacityModel: 'Group opacity appears only in paint layers; direct-text ink opacity is one' };
  if (typeof selector !== 'string' || !selector.trim() || selector.length > 2048) {
    result.issues.push('invalid-selector'); return result;
  }
  let roots;
  try { roots = [...document.querySelectorAll(selector)]; }
  catch { result.issues.push('invalid-selector'); return result; }
  result.rootsMatched = roots.length;
  if (!roots.length) { result.issues.push('no-matching-roots'); return result; }
  if (roots.length > 100) { result.issues.push('root-limit-exceeded'); return result; }
  const paintKeys = ['backgroundColor', 'backgroundImage', 'backgroundClip', 'backgroundBlendMode', 'backgroundSize',
    'backgroundRepeat', 'backgroundPosition', 'opacity', 'filter', 'backdropFilter', 'mixBlendMode',
    'webkitTextFillColor', 'webkitTextStrokeWidth', 'maskImage', 'clipPath'];
  const rect = r => ({ x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left });
  const clippedToZero = value => /^rect\(\s*0(?:px)?(?:\s*,?\s+|\s*,\s*)0(?:px)?(?:\s*,?\s+|\s*,\s*)0(?:px)?(?:\s*,?\s+|\s*,\s*)0(?:px)?\s*\)$/i.test(value || '');
  const srClipped = (el, cs) => {
    const tiny = parseFloat(cs.width) <= 1 && parseFloat(cs.height) <= 1;
    return ['absolute', 'fixed'].includes(cs.position) && clippedToZero(cs.clip) || tiny && cs.clipPath === 'inset(50%)' || tiny && el.classList?.contains('sr-only')
      && ['absolute', 'fixed'].includes(cs.position) && ['hidden', 'clip'].includes(cs.overflow);
  };
  const hiddenReason = (el, chain, paintChain) => {
    if (!el.isConnected) return 'disconnected';
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) return 'non-rendered-content-element';
    if (chain.some(({ node, style }) => node.hasAttribute('hidden') && style.display === 'none')) return 'hidden-attribute';
    if (chain.some(({ style }) => style.display === 'none')) return 'display-none';
    if (chain[0].style.visibility !== 'visible') return 'visibility-hidden';
    if (paintChain.some(({ style }) => Number(style.opacity) === 0)) return 'zero-group-opacity';
    if (paintChain.some(({ node, style }) => srClipped(node, style))) return 'screen-reader-only-clipped';
    if (paintChain.some(({ node }) => node.hasAttribute('inert'))) return 'inert-subtree';
    if (chain.some(({ node }) => node.matches('button:disabled,input:disabled,textarea:disabled,select:disabled,option:disabled,optgroup:disabled'))) return 'disabled-control';
    if (chain.some(({ node }) => node.getAttribute('aria-disabled') === 'true')) return 'aria-disabled-subtree';
    for (const { node } of chain) if (node.tagName === 'DETAILS' && !node.hasAttribute('open')) {
      const summary = [...node.children].find(child => child.tagName === 'SUMMARY');
      if (node !== el && !summary?.contains(el)) return 'closed-details-content';
    }
    return null;
  };
  const seen = new Set(); let sequence = 0;
  for (const root of roots) {
    for (const el of [root, ...root.querySelectorAll('*')]) {
      if (seen.has(el)) continue; seen.add(el);
      if (seen.size > 10000) { result.issues.push('element-limit-exceeded'); return result; }
      const texts = [...el.childNodes].filter(node => node.nodeType === 3 && node.textContent.trim());
      if (!texts.length) continue;
      if (++sequence > 2000) { result.issues.push('text-record-limit-exceeded'); return result; }
      const fullText = texts.map(node => node.textContent).join(' ').replace(/\s+/g, ' ').trim();
      const identity = { id: `interaction-text-${sequence}`, tag: el.tagName.toLowerCase(), domId: el.id || null,
        text: fullText.slice(0, 512), textLength: fullText.length, textExcerptTruncated: fullText.length > 512 };
      const chain = [];
      for (let node = el; node; node = node.parentElement) {
        chain.push({ node, style: getComputedStyle(node) });
        if (chain.length > 128) { result.issues.push('paint-layer-limit-exceeded'); break; }
      }
      if (chain.length > 128) return result;
      // A verified native :modal has a separate top-layer paint root. Its own
      // effects/pseudos remain relevant; DOM ancestors still affect display:none
      // and inherited computed values, but do not composite opacity/masks over it.
      // https://www.w3.org/TR/css-position-4/#top-layer-styling
      const modalIndex = chain.findIndex(({ node }) => {
        if (node.tagName !== 'DIALOG' || !node.hasAttribute('open')) return false;
        try { return node.matches(':modal'); } catch { return false; }
      });
      const paintChain = modalIndex < 0 ? chain : chain.slice(0, modalIndex + 1);
      const paintBoundary = modalIndex < 0 ? { kind: 'document', excludedAncestorCount: 0 } : {
        kind: 'native-modal-top-layer', nativeModalMatch: true, openAttribute: true,
        tag: 'dialog', domId: chain[modalIndex].node.id || null, inclusiveLayerIndex: modalIndex,
        excludedAncestorCount: chain.length - paintChain.length,
        excludedAncestors: chain.slice(modalIndex + 1).map(({ node, style }) => ({ tag: node.tagName.toLowerCase(), domId: node.id || null,
          styles: Object.fromEntries(paintKeys.map(key => [key, style[key]])) })),
        terminalBackdrop: 'Underlying document and ::backdrop stay unknown when these layers are transparent',
      };
      const reason = hiddenReason(el, chain, paintChain);
      if (reason) { result.excluded.push({ ...identity, reason }); continue; }
      const fragments = [];
      for (const text of texts) {
        const range = document.createRange(); range.selectNodeContents(text);
        fragments.push(...[...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(rect));
        range.detach?.();
      }
      if (!fragments.length) { result.excluded.push({ ...identity, reason: 'no-rendered-text-fragments' }); continue; }
      if (fragments.length > 512) { result.issues.push('text-fragment-limit-exceeded'); return result; }
      const cs = chain[0].style, unsupported = [], pseudoEvidence = [], decorationEvidence = [];
      if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') unsupported.push('non-html-text-paint');
      for (const [layerIndex, { node, style }] of paintChain.entries()) {
        if (style.textShadow && style.textShadow !== 'none') unsupported.push('text-shadow');
        if (style.boxShadow && /\binset\b/.test(style.boxShadow)) unsupported.push('inset-box-shadow');
        if (style.clip && style.clip !== 'auto') unsupported.push('legacy-css-clip');
        if (style.display === 'contents') unsupported.push('display-contents-paint');
        decorationEvidence.push({ layerIndex, textShadow: style.textShadow, boxShadow: style.boxShadow, clip: style.clip });
        for (const pseudo of ['::before', '::after']) {
          const ps = getComputedStyle(node, pseudo);
          if (ps.content && !['none', 'normal'].includes(ps.content) && ps.display !== 'none' && ps.visibility === 'visible' && Number(ps.opacity) > 0) {
            unsupported.push('generated-pseudo-paint');
            pseudoEvidence.push({ layerIndex, pseudo, content: ps.content.slice(0, 256),
              contentTruncated: ps.content.length > 256, display: ps.display, color: ps.color,
              box: Object.fromEntries(['width', 'height', 'position', 'boxShadow', 'textShadow', 'outlineStyle', 'outlineWidth', 'outlineColor',
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderImageSource', 'transform', 'perspective',
                'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
                'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
                'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].map(key => [key, ps[key]])),
              ...Object.fromEntries(paintKeys.map(key => [key, ps[key]])) });
          }
        }
      }
      for (const pseudo of ['::first-letter', '::first-line']) {
        const ps = getComputedStyle(el, pseudo);
        const changed = ['color', 'fontSize', 'fontWeight', 'webkitTextFillColor', 'webkitTextStrokeWidth', 'textShadow']
          .filter(key => ps[key] !== cs[key]);
        if (changed.length) { unsupported.push('text-pseudo-style'); pseudoEvidence.push({ pseudo, changed,
          styles: Object.fromEntries(changed.map(key => [key, ps[key]])) }); }
      }
      const motion = new Set(paintChain.flatMap(({ node }) => typeof node.getAnimations === 'function' ? node.getAnimations() : []));
      const pendingFiniteAnimations = [...motion].filter(animation => (animation.playState === 'running' || animation.pending)
        && Number.isFinite(animation.effect?.getComputedTiming().endTime)).length;
      if (pendingFiniteAnimations) unsupported.push('finite-animation-in-progress');
      const fontSizePx = parseFloat(cs.fontSize), fontWeight = Number(cs.fontWeight);
      result.records.push({ ...identity, kind: 'interaction-direct-text', rendered: true,
        foreground: cs.color, textFillColor: cs.webkitTextFillColor, textStrokeWidth: cs.webkitTextStrokeWidth,
        // CSS opacity is a GROUP effect already in each layer, never ink alpha.
        textOpacity: 1, fontSizePx, fontWeight,
        threshold: fontSizePx >= 24 || fontSizePx >= 14 * 96 / 72 && fontWeight >= 700 ? 3 : 4.5,
        layers: paintChain.map(({ style }) => Object.fromEntries(paintKeys.map(key => [key, style[key]]))), paintBoundary,
        fragments, rect: rect(el.getBoundingClientRect()), inViewport: fragments.some(r => r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight),
        unsupported: [...new Set(unsupported)], pseudoEvidence, decorationEvidence, pendingFiniteAnimations });
    }
  }
  return result;
}

/** Only a verified native modal's empty, zero-area, unpainted pseudo is inert.
 * Keep every raw property; none of these checks generalize to opaque parents. */
function classifyPseudoPaint(pseudo, boundary, layerCount) {
  const box = pseudo?.box;
  const zero = value => typeof value === 'string' && /^0(?:px)?$/.test(value);
  const modalRoot = boundary?.kind === 'native-modal-top-layer' && boundary.nativeModalMatch === true
    && boundary.openAttribute === true && boundary.tag === 'dialog' && Number.isInteger(boundary.inclusiveLayerIndex)
    && boundary.inclusiveLayerIndex === layerCount - 1 && pseudo?.layerIndex === boundary.inclusiveLayerIndex;
  const noPaint = modalRoot && ['::before', '::after'].includes(pseudo?.pseudo) && pseudo.contentTruncated === false
    && ['""', "''"].includes(pseudo.content) && pseudo.display === 'block'
    && zero(box?.width) && zero(box?.height) && box?.position === 'static'
    && ['Top', 'Right', 'Bottom', 'Left'].every(side => zero(box?.[`border${side}Width`]) && zero(box?.[`padding${side}`]))
    && box?.borderImageSource === 'none' && box?.boxShadow === 'none' && box?.textShadow === 'none' && box?.outlineStyle === 'none'
    && box?.transform === 'none' && box?.perspective === 'none'
    && pseudo.backgroundColor === 'rgba(0, 0, 0, 0)' && pseudo.backgroundImage === 'none'
    && pseudo.backgroundBlendMode === 'normal' && pseudo.mixBlendMode === 'normal'
    && pseudo.filter === 'none' && pseudo.backdropFilter === 'none' && pseudo.maskImage === 'none' && pseudo.clipPath === 'none'
    && zero(pseudo.webkitTextStrokeWidth) && pseudo.opacity === '1';
  return { layerIndex: pseudo?.layerIndex ?? null, pseudo: pseudo?.pseudo ?? null, noPaint,
    classification: noPaint ? 'no-paint' : 'unassessed',
    exemptionReason: noPaint ? 'native-modal-empty-zero-area-pseudo-with-no-paint' : null };
}

/** Pure assessment; preserves raw records and exclusions without claiming them as passes. */
export function assessInteractionText(snapshot) {
  const issues = [...(Array.isArray(snapshot?.issues) ? snapshot.issues : ['missing-collection-issues'])];
  if (snapshot?.version !== 1 || !Array.isArray(snapshot?.records) || !Array.isArray(snapshot?.excluded)
    || !Number.isInteger(snapshot?.rootsMatched) || snapshot.rootsMatched < 1 || snapshot.rootsMatched > 100) issues.push('invalid-interaction-text-snapshot');
  const source = Array.isArray(snapshot?.records) ? snapshot.records : [];
  if (!source.length) issues.push('no-visible-direct-text-records');
  if (source.length > 2000) issues.push('text-record-limit-exceeded');
  const paintKeys = ['backgroundColor', 'backgroundImage', 'backgroundClip', 'backgroundBlendMode', 'backgroundSize',
    'backgroundRepeat', 'backgroundPosition', 'opacity', 'filter', 'backdropFilter', 'mixBlendMode',
    'webkitTextFillColor', 'webkitTextStrokeWidth', 'maskImage', 'clipPath'];
  const identities = new Set();
  const unknown = reason => ({ status: 'unassessed', pass: false, reason });
  const records = source.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return { raw: record, assessment: unknown('invalid-direct-text-evidence') };
    if (typeof record.id !== 'string' || identities.has(record.id)) issues.push('invalid-or-duplicate-text-identity');
    identities.add(record.id);
    let assessment;
    const pseudoAssessments = (Array.isArray(record.pseudoEvidence) ? record.pseudoEvidence : [])
      .map(pseudo => classifyPseudoPaint(pseudo, record.paintBoundary, record.layers?.length));
    const generatedPseudos = pseudoAssessments.filter(pseudo => ['::before', '::after'].includes(pseudo.pseudo));
    const unsupported = Array.isArray(record.unsupported) ? record.unsupported.filter(reason =>
      reason !== 'generated-pseudo-paint' || generatedPseudos.length === 0 || generatedPseudos.some(pseudo => !pseudo.noPaint)) : [];
    const threshold = record.fontSizePx >= 24 || record.fontSizePx >= 14 * 96 / 72 && record.fontWeight >= 700 ? 3 : 4.5;
    if (record.kind !== 'interaction-direct-text' || record.rendered !== true || record.textOpacity !== 1
      || typeof record.text !== 'string' || !record.text.trim() || !Number.isFinite(record.fontSizePx) || record.fontSizePx <= 0
      || !Number.isFinite(record.fontWeight) || record.fontWeight < 1 || record.threshold !== threshold
      || !Array.isArray(record.unsupported) || record.unsupported.some(reason => typeof reason !== 'string')
      || !Array.isArray(record.layers) || !record.layers.length || record.layers.length > 128
      || record.layers.some(layer => !layer || paintKeys.some(key => typeof layer[key] !== 'string'))
      || !Number.isInteger(record.pendingFiniteAnimations) || record.pendingFiniteAnimations < 0) assessment = unknown('invalid-direct-text-evidence');
    else if (record.pendingFiniteAnimations > 0) assessment = unknown('finite-animation-in-progress');
    else if (unsupported.length) assessment = unknown(unsupported[0]);
    else assessment = assessInputText(record);
    return { ...record, pseudoAssessments, assessment };
  });
  const counts = { total: records.length, passed: records.filter(record => record.assessment.pass === true).length,
    failed: records.filter(record => record.assessment.status === 'fail').length,
    unassessed: records.filter(record => !record.assessment.pass && record.assessment.status !== 'fail').length,
    excluded: Array.isArray(snapshot?.excluded) ? snapshot.excluded.length : 0 };
  return { ...snapshot, records, issues: [...new Set(issues)], counts,
    passed: issues.length === 0 && counts.total > 0 && counts.passed === counts.total,
    limitations: ['Direct text only; input values, placeholder ink and generated pseudo text are separate evidence.',
      'Viewport position is recorded; complete glyph visibility, clipping by overlapping siblings and all application states are not proved.',
      'Only an open native dialog matching :modal ends the DOM paint ancestry; its own effects remain modeled and transparent terminal backdrops remain unknown.',
      'Only its empty zero-area pseudo with explicitly absent paint is classified no-paint; the raw pseudo and exact exemption reason are retained.',
      'Non-unit group opacity is preserved once in layers and remains unassessed by the existing color model.',
      'Exclusions are not measured passes. This uses the existing mathematical assessor, not an independent pixel audit.'] };
}

/** Passive focused-control metadata; caller must provide real keyboard transitions. */
export function collectInteractionFocusedControl() {
  const el = document.activeElement;
  if (!(el instanceof HTMLElement) || el === document.body || el === document.documentElement) return null;
  const cs = getComputedStyle(el), r = el.getBoundingClientRect();
  const keys = ['outlineStyle', 'outlineWidth', 'outlineOffset', 'outlineColor', 'boxShadow',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRadius'];
  return { tag: el.tagName.toLowerCase(), id: el.id || null, role: el.getAttribute('role'), type: el.getAttribute('type'),
    name: el.getAttribute('name'), label: (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
    tabIndex: el.tabIndex, focusVisible: el.matches(':focus-visible'), disabled: el.matches(':disabled'),
    checked: 'checked' in el ? el.checked : null,
    aria: Object.fromEntries(['checked', 'selected', 'expanded', 'pressed', 'invalid', 'disabled'].map(key => [key, el.getAttribute(`aria-${key}`)])),
    rect: { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left },
    style: Object.fromEntries(keys.map(key => [key, cs[key]])), evidenceKind: 'passive-active-element-snapshot-not-focus-appearance-assessment' };
}
