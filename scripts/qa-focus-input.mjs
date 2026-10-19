// Maintained, local-only keyboard and input-guidance inspector. No submissions,
// publisher navigation, ad delivery, external link activation or raw CDP.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import qaSafety from './lib/qa-safety.cjs';
import { assessFocusIndicator, assessInputText, focusIndicatorBands } from './lib/qa-focus-input-assessment.mjs';

const { assertLocalQaTarget, assertQaEnvironment, launchQaBrowser, isAllowedQaRequest } = qaSafety;
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_ROUTES = ['/table/2026/monthly', '/table/2027/monthly', '/job/safety-engineer', '/job/software-engineer',
  '/calc/refinance-break-even', '/calc', '/calc/samsung-bonus', '/contact', '/calc/bonus-home-plan',
  '/fun/weekend-duty', '/fun/rank', '/fire-calculator', '/fun/what-to-buy', '/table/2026/hourly', '/home-loan'];

// Browser-side evidence collector. This function is evaluated only in a fresh
// page created by launchQaBrowser's already-isolated context.
function installCollector() {
  window.__msyFocusAudit?.disconnect();
  const paintKeys = ['backgroundColor', 'backgroundImage', 'backgroundClip', 'backgroundBlendMode', 'backgroundSize',
    'backgroundRepeat', 'backgroundPosition', 'opacity', 'filter', 'backdropFilter', 'mixBlendMode', 'webkitTextFillColor',
    'webkitTextStrokeWidth', 'maskImage', 'clipPath'];
  const indicatorKeys = ['outlineStyle', 'outlineWidth', 'outlineOffset', 'outlineColor', 'boxShadow',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRadius',
    'backgroundColor', 'color', 'appearance', 'textDecorationLine', 'textDecorationColor', 'display', 'writingMode', 'boxDecorationBreak'];
  const selector = 'a[href],button,input,textarea,select,summary,[tabindex],[contenteditable="true"]';
  const nodes = new Map(), before = new Map(), excluded = new Map(), potentialScroll = new Map();
  const expected = new Set(), everExpected = new Set(), admittedScroll = new Set(), lifecycle = [];
  const baselineRefreshes = [], attemptedBaselineWaits = new WeakSet(), reportedFocusedPending = new Set();
  let sequence = 0, revision = 0, observerDirty = false;
  const hiddenReason = el => {
    if (!el.isConnected) return 'disconnected-from-document';
    for (let details = el.closest('details:not([open])'); details; details = details.parentElement?.closest('details:not([open])')) {
      const summary = [...details.children].find(child => child.tagName === 'SUMMARY');
      if (details !== el && !summary?.contains(el)) return 'closed-details-content';
    }
    if (!el.getClientRects().length || getComputedStyle(el).visibility !== 'visible' || el.closest('[hidden],[inert],.sr-only'))
      return 'not-visually-present-in-current-state';
    return null;
  };
  const visible = el => el instanceof HTMLElement && !hiddenReason(el);
  const noVisibleShadow = cs => {
    if (cs.boxShadow === 'none') return true;
    const colors = cs.boxShadow.match(/rgba?\([^()]*\)/g);
    const residue = cs.boxShadow.replace(/rgba?\([^()]*\)/g, '').replaceAll(',', ' ').trim().split(/\s+/);
    return !!colors?.length && colors.every(color => /^rgba\([^()]+,\s*0(?:\.0+)?\)$/.test(color)) &&
      residue.every(token => token === 'inset' || /^-?(?:\d+(?:\.\d+)?|\.\d+)px$/.test(token));
  };
  const rect = r => ({ x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left });
  const id = el => { if (nodes.get(el.dataset.msyFocusQa) !== el) el.dataset.msyFocusQa = `focus-${++sequence}`; nodes.set(el.dataset.msyFocusQa, el); return el.dataset.msyFocusQa; };
  const identity = el => ({ id: id(el), tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), role: el.getAttribute('role'),
    label: (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent || el.getAttribute('name') || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    class: typeof el.className === 'string' ? el.className : '', href: el.getAttribute('href'), tabIndex: el.tabIndex });
  const finiteAnimations = el => {
    const animations = [];
    for (let node = el; node; node = node.parentElement) animations.push(...node.getAnimations());
    return [...new Set(animations)].filter(animation => (animation.playState === 'running' || animation.pending) &&
      Number.isFinite(animation.effect?.getComputedTiming().endTime));
  };
  function snapshot(el) {
    const style = getComputedStyle(el), layers = [], effects = [], clips = [];
    for (let current = el; current; current = current.parentElement) {
      const cs = getComputedStyle(current);
      layers.push(Object.fromEntries(paintKeys.map(key => [key, cs[key]])));
      effects.push({ transform: cs.transform, perspective: cs.perspective, zoom: cs.zoom });
      if (current !== el && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible')) {
        const r = current.getBoundingClientRect();
        clips.push({ x: cs.overflowX, y: cs.overflowY,
          left: r.left + current.clientLeft, top: r.top + current.clientTop,
          right: r.left + current.clientLeft + current.clientWidth, bottom: r.top + current.clientTop + current.clientHeight });
      }
    }
    const motion = finiteAnimations(el);
    return { style: Object.fromEntries(indicatorKeys.map(key => [key, style[key]])), layers, effects, clips,
      rect: rect(el.getBoundingClientRect()), fragments: [...el.getClientRects()].map(rect),
      focusVisible: el.matches(':focus-visible'), focused: document.activeElement === el,
      pendingFiniteAnimations: motion.length,
      finiteAnimationEvidence: motion.map(animation => ({ playState: animation.playState, endTime: animation.effect.getComputedTiming().endTime })) };
  }
  function inventory() {
    observerDirty = false;
    const current = new Set();
    for (const el of document.querySelectorAll(selector)) {
      if (!(el instanceof HTMLElement) || !el.closest('main')) continue;
      const key = id(el);
      let reason = null;
      if (!visible(el)) reason = hiddenReason(el);
      else if (el.matches(':disabled') || el.closest('[inert]')) reason = 'disabled-or-inert';
      else if (el.tabIndex < 0) reason = 'negative-tabindex-keyboard-arrow-or-script-navigation-out-of-scope';
      else if (el instanceof HTMLInputElement && el.type === 'radio' && el.name) {
        const group = [...document.querySelectorAll('input[type="radio"]')].filter(x => x.name === el.name && x.form === el.form && visible(x) && !x.disabled);
        const tabStop = group.find(x => x.checked) || group[0];
        if (el !== tabStop) reason = 'radio-arrow-navigation-not-tab-stop';
      }
      if (reason) { excluded.set(key, { ...identity(el), reason }); continue; }
      excluded.delete(key);
      if (!before.has(key)) before.set(key, { ...identity(el), ...snapshot(el) });
      current.add(key);
    }
    // Chromium may put scroll containers without an explicit tabindex into its
    // native Tab sequence. Capture their UNFOCUSED state in advance, but do not
    // inflate expected coverage with a guessed browser tab-stop algorithm.
    for (const el of document.querySelectorAll('main,main *')) {
      if (!(el instanceof HTMLElement) || !visible(el) || el.hasAttribute('tabindex')) continue;
      const cs = getComputedStyle(el);
      const scrollable = ['auto', 'scroll'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 ||
        ['auto', 'scroll'].includes(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
      if (!scrollable) continue;
      const key = id(el);
      if (!before.has(key) && !potentialScroll.has(key)) potentialScroll.set(key, { ...identity(el), ...snapshot(el) });
    }
    for (const key of admittedScroll) if (visible(nodes.get(key))) { current.add(key); excluded.delete(key); }
    for (const key of expected) if (!current.has(key)) {
      const el = nodes.get(key);
      lifecycle.push({ id: key, event: 'retired-from-current-keyboard-scope', revision: ++revision,
        reason: !el?.isConnected ? 'disconnected-from-document' : hiddenReason(el) || excluded.get(key)?.reason || 'no-longer-native-tab-candidate' });
    }
    for (const key of current) if (!expected.has(key)) {
      lifecycle.push({ id: key, event: everExpected.has(key) ? 'returned-to-current-keyboard-scope' : 'entered-current-keyboard-scope',
        revision: ++revision, baselineFocused: before.get(key)?.focused ?? null, origin: admittedScroll.has(key) ? 'observed-native-scroll-tab-stop' : 'explicit-control' });
      everExpected.add(key);
    }
    expected.clear(); for (const key of current) expected.add(key);
    return { controls: [...expected].map(key => before.get(key)).filter(Boolean), excluded: [...excluded.values()],
      lifecycle: [...lifecycle], baselineRefreshes: [...baselineRefreshes], everExpectedControls: [...everExpected].map(key => before.get(key)).filter(Boolean),
      potentialNativeScrollContainers: potentialScroll.size, observedNativeScrollContainers: admittedScroll.size,
      documentFocusableCount: document.querySelectorAll(selector).length };
  }
  function textRecord(el, kind, reference, pseudo = null) {
    const cs = getComputedStyle(el, pseudo), fontSizePx = parseFloat(cs.fontSize), fontWeight = Number(cs.fontWeight);
    return { ...identity(el), kind, reference, text: (pseudo ? el.getAttribute('placeholder') : el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
      foreground: cs.color, textFillColor: cs.webkitTextFillColor, textOpacity: cs.opacity, textStrokeWidth: cs.webkitTextStrokeWidth,
      fontSizePx, fontWeight, threshold: fontSizePx >= 24 || fontSizePx >= 14 * 96 / 72 && fontWeight >= 700 ? 3 : 4.5,
      rendered: pseudo ? el.matches(':placeholder-shown') : visible(el), layers: snapshot(el).layers };
  }
  function guidance() {
    const records = [], relationships = [], valueExclusions = [], seen = new Set();
    const addText = (root, kind, reference) => {
      for (const el of [root, ...root.querySelectorAll('*')]) {
        if (!(el instanceof HTMLElement) || !visible(el) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) ||
          ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const key = `${id(el)}:${kind}:${reference}`;
        if (!seen.has(key)) { seen.add(key); records.push(textRecord(el, kind, reference)); }
      }
    };
    for (const el of document.querySelectorAll('main input:not([type="hidden"]),main textarea,main select,main [role="slider"],main [role="switch"]')) {
      if (!visible(el) || el.matches(':disabled')) continue;
      const key = id(el);
      if (el.hasAttribute('placeholder')) records.push(textRecord(el, 'placeholder', key, '::placeholder'));
      const paintsValue = !(el instanceof HTMLInputElement) || ['text', 'number', 'search', 'email', 'tel', 'url', 'password', 'date', 'datetime-local', 'month', 'week', 'time'].includes(el.type);
      if (paintsValue && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
        const record = textRecord(el, 'input-value', key);
        record.text = '[local fixture value omitted]'; record.rendered = Boolean(el.value);
        records.push(record);
      } else valueExclusions.push({ control: key, type: el.getAttribute('type') || el.getAttribute('role'), reason: 'control-value-is-not-rendered-text' });
      for (const label of el.labels || []) addText(label, 'label', key);
      const refs = (el.getAttribute('aria-describedby') || '').trim().split(/\s+/).filter(Boolean);
      for (const ref of refs) {
        const found = document.getElementById(ref);
        relationships.push({ control: key, reference: ref, found: !!found, visible: found ? visible(found) : false,
          reason: !found ? 'missing-aria-describedby-target' : visible(found) ? null : 'accessible-description-not-visually-present' });
        if (found) addText(found, 'aria-describedby', key);
      }
      // Supplemental discovery, not an assertion that nearby prose is an ARIA
      // relationship. Limit to the closest small field wrapper.
      let wrapper = el.parentElement;
      for (let depth = 0; wrapper && depth < 3; depth++, wrapper = wrapper.parentElement) {
        if (wrapper.querySelectorAll('input,textarea,select,[role="slider"],[role="switch"]').length > 2) break;
        const notes = [...wrapper.querySelectorAll('p,small,[role="note"],[data-field-help]')].filter(x => !x.contains(el));
        if (notes.length) { for (const note of notes.slice(0, 12)) addText(note, 'nearby-guidance-not-aria-linked', key); break; }
      }
    }
    return { records, relationships, valueExclusions };
  }
  function active() {
    // An autofocus field starts focused. After REAL keyboard navigation leaves
    // it, capture its genuinely unfocused style; do not blur/focus synthetically.
    for (const [key, old] of before) {
      const element = nodes.get(key);
      if (old.focused && element && document.activeElement !== element)
        before.set(key, { ...identity(element), ...snapshot(element) });
    }
    const el = document.activeElement;
    if (!(el instanceof HTMLElement) || el === document.body || el === document.documentElement) return { id: null, main: false };
    const key = id(el);
    if (el.closest('main') && !before.has(key) && potentialScroll.has(key)) {
      before.set(key, potentialScroll.get(key)); admittedScroll.add(key);
      lifecycle.push({ id: key, event: 'native-scroll-tab-stop-observed', revision: ++revision,
        baselineFocused: before.get(key).focused, evidence: 'Real keyboard Tab reached the previously snapshotted scroll container.' });
      expected.add(key); everExpected.add(key);
    }
    const baseline = before.get(key);
    return { ...identity(el), main: !!el.closest('main'), before: baseline?.pendingFiniteAnimations ? null : baseline || null,
      unstableBeforeSnapshot: baseline?.pendingFiniteAnimations ? baseline : null, after: snapshot(el),
      focusVisible: el.matches(':focus-visible'), canExpandDetails: el.tagName === 'SUMMARY' && !el.parentElement.open &&
        location.pathname === '/calc/bonus-home-plan' && el.textContent.includes('가정 바꾸기'),
      canAddLifeEvent: location.pathname === '/fire-calculator' && el.tagName === 'BUTTON' &&
        el.textContent.replace(/\s+/g, ' ').trim() === '이벤트 추가' };
  }
  function geometry(bands) {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement)) return [];
    const state = snapshot(el), r = state.rect;
    const matrix = /^matrix\(([^()]*)\)$/.exec(state.effects[0].transform);
    const values = matrix?.[1].split(',').map(Number);
    // Only the element's stable uniform scale is supported by the pure helper.
    // Ancestor scale/rotation/skew/perspective are still rejected there, so its
    // ancestor clipping and backdrop boxes remain in unscaled CSS coordinates.
    const factor = values?.length === 6 && values.every(Number.isFinite) && values[0] > 0 && values[0] === values[3] &&
      values[1] === 0 && values[2] === 0 ? values[0] : 1;
    const scale = { x: factor, y: factor, source: 'self-uniform-2d' };
    const fragmented = state.fragments.length > 1;
    const fragmentSupported = fragmented && factor === 1 && state.style.display === 'inline' && state.style.writingMode === 'horizontal-tb';
    const model = !fragmented ? 'single-border-box' : fragmentSupported ? 'fragmented-inline-outer-horizontal-edges' : 'unsupported-fragmented-geometry';
    const transparentColor = value => value === 'transparent' || /^rgba\([^()]+,\s*0(?:\.0+)?\)$/.test(value);
    const pseudoPaint = ['::before', '::after'].map(pseudo => {
      const cs = getComputedStyle(el, pseudo), generated = !['none', 'normal'].includes(cs.content);
      const emptyContent = ['""', "''"].includes(cs.content);
      const borderPainted = ['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(cs[`border${side}Width`]) > 0 &&
        !['none', 'hidden'].includes(cs[`border${side}Style`]) && !transparentColor(cs[`border${side}Color`]));
      const outlinePainted = parseFloat(cs.outlineWidth) > 0 && !['none', 'hidden'].includes(cs.outlineStyle) && !transparentColor(cs.outlineColor);
      const transparent = !generated || emptyContent && cs.position === 'absolute' && transparentColor(cs.backgroundColor) && cs.backgroundImage === 'none' &&
        !borderPainted && cs.borderImageSource === 'none' && !outlinePainted && noVisibleShadow(cs) && cs.textShadow === 'none' &&
        cs.filter === 'none' && cs.backdropFilter === 'none' && cs.opacity === '1' && cs.mixBlendMode === 'normal' &&
        cs.maskImage === 'none' && cs.clipPath === 'none';
      return { pseudo, generated, transparent, content: cs.content, position: cs.position,
        backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage, boxShadow: cs.boxShadow,
        borderPainted, outlinePainted, filter: cs.filter, backdropFilter: cs.backdropFilter, opacity: cs.opacity,
        maskImage: cs.maskImage, clipPath: cs.clipPath };
    });
    return bands.map(band => {
      // Straight side strips avoid pretending rounded corners are rectangular.
      const inner = band.start * factor, outer = band.end * factor, margin = Math.min(24, Math.min(r.width, r.height) / 4);
      let strips = [
        { side: 'top', left: r.left + margin, right: r.right - margin, top: r.top - outer, bottom: r.top - inner },
        { side: 'bottom', left: r.left + margin, right: r.right - margin, top: r.bottom + inner, bottom: r.bottom + outer },
        { side: 'left', left: r.left - outer, right: r.left - inner, top: r.top + margin, bottom: r.bottom - margin },
        { side: 'right', left: r.right + inner, right: r.right + outer, top: r.top + margin, bottom: r.bottom - margin },
      ];
      if (fragmented) {
        strips = [];
        // Use only the topmost/bottommost real fragment edges. Never invent an
        // outline around the union rectangle or the blank gap between lines.
        // Vertical writing and inside fragment bands remain unassessed.
        if (fragmentSupported && band.start >= 0) {
          const top = Math.min(...state.fragments.map(f => f.top)), bottom = Math.max(...state.fragments.map(f => f.bottom));
          state.fragments.forEach((f, fragmentIndex) => {
            const inset = Math.min(24, f.width / 4);
            if (f.top === top) strips.push({ side: 'top', fragmentIndex, left: f.left + inset, right: f.right - inset, top: f.top - outer, bottom: f.top - inner });
            if (f.bottom === bottom) strips.push({ side: 'bottom', fragmentIndex, left: f.left + inset, right: f.right - inset, top: f.bottom + inner, bottom: f.bottom + outer });
          });
        }
      }
      const samples = [], remaining = [];
      for (const s of strips) {
        const clipped = { ...s, left: Math.max(0, s.left), right: Math.min(innerWidth, s.right), top: Math.max(0, s.top), bottom: Math.min(innerHeight, s.bottom) };
        for (const clip of state.clips) {
          if (clip.x !== 'visible') { clipped.left = Math.max(clipped.left, clip.left); clipped.right = Math.min(clipped.right, clip.right); }
          if (clip.y !== 'visible') { clipped.top = Math.max(clipped.top, clip.top); clipped.bottom = Math.min(clipped.bottom, clip.bottom); }
        }
        if (clipped.right - clipped.left < .5 || clipped.bottom - clipped.top < .5) continue;
        remaining.push(clipped);
        for (const t of [.2, .5, .8]) {
          const horizontal = s.side === 'top' || s.side === 'bottom';
          const x = clipped.left + (clipped.right - clipped.left) * (horizontal ? t : .5);
          const y = clipped.top + (clipped.bottom - clipped.top) * (horizontal ? .5 : t);
          let hit = document.elementFromPoint(x, y), transparentHitArea = null;
          if (band.start >= 0 && hit === el && (x < r.left || x > r.right || y < r.top || y > r.bottom) &&
            pseudoPaint.some(pseudo => pseudo.generated) && pseudoPaint.every(pseudo => pseudo.transparent)) {
            const stack = document.elementsFromPoint(x, y);
            if (stack[0] === el) {
              const underneath = stack.find(node => node !== el);
              // Skip exactly the proven transparent originating element. A
              // sibling/child/overlay beneath it is NOT skipped or accepted.
              if (underneath instanceof HTMLElement && underneath !== el && underneath.contains(el)) {
                hit = underneath;
                transparentHitArea = { skipped: 'focused-element-transparent-absolute-pseudo', pseudos: pseudoPaint };
              }
            }
          }
          const transparentChildSurface = hit && el.contains(hit) && (() => {
            for (let n = hit; n && n !== el; n = n.parentElement) {
              const cs = getComputedStyle(n);
              if (!['transparent', 'rgba(0, 0, 0, 0)'].includes(cs.backgroundColor) || cs.backgroundImage !== 'none' ||
                cs.opacity !== '1' || cs.filter !== 'none' || cs.backdropFilter !== 'none' || cs.mixBlendMode !== 'normal' ||
                cs.maskImage !== 'none' || cs.clipPath !== 'none' || !noVisibleShadow(cs)) return false;
            }
            return true;
          })();
          let modeledParentSurface = false, backdrop = null;
          if (hit instanceof HTMLElement && hit !== el && hit.contains(el)) {
            let transparentChain = true, skippedAncestors = 0;
            for (let parent = el.parentElement; parent && parent !== hit; parent = parent.parentElement) {
              const ps = getComputedStyle(parent);
              if (!['transparent', 'rgba(0, 0, 0, 0)'].includes(ps.backgroundColor) || ps.backgroundImage !== 'none' ||
                ps.opacity !== '1' || ps.filter !== 'none' || ps.backdropFilter !== 'none' || ps.mixBlendMode !== 'normal' ||
                ps.maskImage !== 'none' || ps.clipPath !== 'none' || ps.backgroundClip === 'text' || !noVisibleShadow(ps)) transparentChain = false;
              skippedAncestors++;
            }
            const parent = hit, pr = parent.getBoundingClientRect(), ps = getComputedStyle(parent);
            const inset = ps.backgroundClip === 'content-box';
            const left = pr.left + parent.clientLeft + (inset ? parseFloat(ps.paddingLeft) : 0);
            const top = pr.top + parent.clientTop + (inset ? parseFloat(ps.paddingTop) : 0);
            const right = pr.left + parent.clientLeft + parent.clientWidth - (inset ? parseFloat(ps.paddingRight) : 0);
            const bottom = pr.top + parent.clientTop + parent.clientHeight - (inset ? parseFloat(ps.paddingBottom) : 0);
            modeledParentSurface = transparentChain && x > left && x < right && y > top && y < bottom;
            backdrop = { modeled: modeledParentSurface, skippedTransparentAncestors: skippedAncestors, transparentChain,
              hitBackground: ps.backgroundColor, hitBackgroundImage: ps.backgroundImage,
              paintBox: { left, top, right, bottom }, model: 'existing-layer-chain-with-transparent-skips' };
          }
          const allowed = !!hit && (band.end <= 0
            ? el === hit || band.kind === 'outline' && transparentChildSurface
            : modeledParentSurface);
          samples.push({ x, y, side: s.side, fragmentIndex: s.fragmentIndex ?? 0, t, visible: allowed, hit: hit?.tagName.toLowerCase() || null, backdrop, transparentHitArea,
            reason: allowed ? null : band.end > 0 && hit?.contains(el) ? 'actual-backdrop-is-not-modeled-parent' : 'indicator-covered-or-hit-test-inconclusive' });
        }
      }
      return { id: band.id, model, scale, fragmentCount: state.fragments.length, visibleStripCount: remaining.length, visibleSamples: samples.filter(x => x.visible).length,
        strips: remaining, samples, viewport: { width: innerWidth, height: innerHeight },
        limitation: 'Straight-edge viewport/overflow intersections and sampled hit tests; not exhaustive pixel occlusion.' };
    });
  }
  const observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList' || record.attributeName === 'open' || record.attributeName === 'hidden')) observerDirty = true;
  });
  observer.observe(document.querySelector('main'), { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'hidden'] });
  // This refresh runs before the next real Tab, so newly rendered controls do
  // not acquire a fabricated unfocused snapshot AFTER being focused.
  const refresh = async () => {
    if (observerDirty) inventory();
    let changed = false;
    for (const map of [before, potentialScroll]) for (const [key, old] of map) {
      const el = nodes.get(key);
      if (old.focused && visible(el) && document.activeElement !== el) map.set(key, { ...identity(el), ...snapshot(el) });
    }
    const pending = [];
    for (const map of [before, potentialScroll]) for (const [key, old] of map) {
      if (map === potentialScroll && before.has(key) || !old.pendingFiniteAnimations || attemptedBaselineWaits.has(old)) continue;
      const el = nodes.get(key);
      if (!visible(el)) continue;
      if (document.activeElement === el) {
        if (!reportedFocusedPending.has(key)) baselineRefreshes.push({ id: key, accepted: false, reason: 'pending-baseline-already-focused',
          previousOpacity: old.layers.map(layer => layer.opacity), completed: false });
        reportedFocusedPending.add(key); continue;
      }
      attemptedBaselineWaits.add(old); pending.push({ key, old, map, el });
    }
    if (pending.length) {
      const started = performance.now();
      const animations = [...new Set(pending.flatMap(entry => finiteAnimations(entry.el)))];
      const completed = await Promise.race([
        Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => true),
        new Promise(resolve => setTimeout(() => resolve(false), 1500)),
      ]);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      for (const { key, old, map, el } of pending) {
        const next = visible(el) ? { ...identity(el), ...snapshot(el) } : null;
        const accepted = !!next && completed && !next.focused && !next.pendingFiniteAnimations;
        baselineRefreshes.push({ id: key, reason: 'finite-unfocused-animation-settle', accepted, completed,
          waitedMs: performance.now() - started, previousOpacity: old.layers.map(layer => layer.opacity),
          nextOpacity: next?.layers.map(layer => layer.opacity) || null, pendingBefore: old.pendingFiniteAnimations,
          pendingAfter: next?.pendingFiniteAnimations ?? null, focusedAfterWait: next?.focused ?? null });
        // Replace only with a new, genuinely UNFOCUSED observation. A timeout
        // or focus acquired during the wait retains an explicitly unavailable
        // stable baseline, never the focused after-image masquerading as before.
        if (accepted) { map.set(key, next); changed = true; }
      }
    }
    return observerDirty || changed ? inventory() : null;
  };
  window.__msyFocusAudit = { inventory, guidance, active, geometry, refresh, disconnect: () => observer.disconnect() };
  return { inventory: inventory(), guidance: guidance() };
}

function assessmentCounts(records) {
  return { total: records.length, passed: records.filter(x => x.assessment.pass).length,
    failed: records.filter(x => x.assessment.status === 'fail').length,
    unassessed: records.filter(x => !x.assessment.pass && x.assessment.status !== 'fail').length };
}

async function settleFocusedPaint(page) {
  return page.evaluate(async () => {
    const animations = [];
    for (let el = document.activeElement; el; el = el.parentElement) animations.push(...el.getAnimations());
    const finite = [...new Set(animations)].filter(a => a.playState === 'running' && Number.isFinite(a.effect?.getComputedTiming().endTime));
    const completed = await Promise.race([
      Promise.all(finite.map(a => a.finished.catch(() => {}))).then(() => true),
      new Promise(resolve => setTimeout(() => resolve(false), 1500)),
    ]);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return completed;
  });
}

async function prepareFireEvents(page) {
  const steps = ['시뮬레이션 시작', '다음 단계', '다음 단계', '이벤트 추가'];
  const evidence = [];
  for (const label of steps) {
    let found = false;
    for (let tab = 0; tab < 160; tab++) {
      await page.keyboard.press('Tab');
      const matches = await page.evaluate(label => document.activeElement?.tagName === 'BUTTON' &&
        document.activeElement.textContent.replace(/\s+/g, ' ').trim() === label, label);
      if (!matches) continue;
      await page.keyboard.press('Space');
      // The route deliberately animates entry/exit with AnimatePresence. This
      // bounded preparation does not modify animation styles or submit results.
      await page.waitForTimeout(1100);
      evidence.push({ label, keyboardTabs: tab + 1, activation: 'Space' }); found = true; break;
    }
    assert(found, `FIRE local fixture step not reached: ${label}`);
  }
  return { state: 'events-with-one-local-fixture', steps: evidence,
    excludedStates: ['intro', 'essentials', 'investment', 'result'], resultOrShareActivated: false };
}

export async function main() {
  const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3100');
  assertQaEnvironment();
  const routes = process.env.QA_ROUTES ? process.env.QA_ROUTES.split(',').map(s => s.trim()) : DEFAULT_ROUTES;
  assert(routes.length > 0 && routes.length <= 16 && new Set(routes).size === routes.length, 'Use 1–16 unique routes.');
  for (const route of routes) assert(/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(route) && isAllowedQaRequest(base + route, base), 'QA route must be a local document path.');
  const maxTabs = Number(process.env.QA_FOCUS_MAX_TABS || 512);
  assert(Number.isInteger(maxTabs) && maxTabs >= 20 && maxTabs <= 512, 'QA_FOCUS_MAX_TABS must be 20–512.');
  assert(!process.env.QA_FOCUS_FORCED_COLORS || ['0', '1'].includes(process.env.QA_FOCUS_FORCED_COLORS), 'QA_FOCUS_FORCED_COLORS must be 0 or 1.');
  const forcedColorsRequested = process.env.QA_FOCUS_FORCED_COLORS === '1';
  const output = path.join(ROOT, '.artifacts/focus-input-qa');
  await fs.mkdir(output, { recursive: true });
  const summary = { version: 1, mode: 'keyboard-focus-and-input-guidance', base, startedAt: new Date().toISOString(), passed: false,
    qaMode: 'ads-disabled-local', buildId: null,
    routes, maxTabs, report: [], forcedColors: { requested: forcedColorsRequested, samples: [],
      scope: 'Optional real-Tab samples: contact input at 390px and monthly table region at 1280px, light mode; not all controls or forced-color themes.' }, errors: [], forbiddenRequests: [], externalResponses: [],
    constraints: { keyboard: 'Real Tab; named local bonus-plan details and one FIRE life-event button may be activated with Space.',
      noProgrammaticFocus: true, noLinkActivation: true, noFormSubmission: true,
      scope: 'Visible main Tab stops, observed native scroll Tab stops and explicitly expanded local details; lifecycle changes retained separately. Not all application states or WCAG certification.',
      screenshotsPerCase: 8, screenshotMaxHeight: 500, placeholder: 'Current computed styles; populated fields are separately labeled hidden placeholders, not claimed visibly rendered.' } };
  let browser;
  try {
    const { chromium } = createRequire(import.meta.url)('playwright-core');
    browser = await launchQaBrowser(chromium, base, process.platform === 'win32' ? { channel: 'chrome' } : {});
    for (const width of [390, 1280]) for (const theme of ['light', 'dark']) for (const route of routes) {
      const item = { route, width, theme, focus: [], text: [], relationships: [], screenshots: [], traversedOutsideMain: 0, tabs: 0, errors: [] };
      summary.report.push(item);
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, serviceWorkers: 'block' });
      try {
        await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        page.on('pageerror', error => item.errors.push(error.message.slice(0, 700)));
        page.on('request', request => {
          if (!isAllowedQaRequest(request.url(), base, request.method())) {
            const url = new URL(request.url()); summary.forbiddenRequests.push({ route, method: request.method(), origin: url.origin, path: url.pathname });
          }
        });
        page.on('response', response => { if (new URL(response.url()).origin !== base) summary.externalResponses.push({ route, status: response.status() }); });
        const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
        assert.equal(response.status(), 200, 'QA document status');
        item.responseIdentity = { qa: response.headers()['x-moneysalary-qa'] || null, buildId: response.headers()['x-moneysalary-build'] || null };
        assert.equal(item.responseIdentity.qa, 'ads-disabled', 'Document QA header');
        if (summary.report.length === 1) summary.buildId = item.responseIdentity.buildId;
        assert.equal(item.responseIdentity.buildId, summary.buildId, 'Every route must use the same QA build header (null only for dev).');
        await page.locator('main').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (route === '/fire-calculator') item.localFixturePreparation = await prepareFireEvents(page);
        item.motionSettled = await page.evaluate(async () => {
          let last = null, stable = 0;
          for (let count = 0; count < 30; count++) {
            const value = [...document.querySelectorAll('main *')].filter(e => e.matches('a,button,input,textarea,select,summary,[tabindex]'))
              .map(e => { const parts = []; for (let n = e; n; n = n.parentElement) parts.push(getComputedStyle(n).transform); return parts.join('|'); }).join(';');
            stable = value === last ? stable + 1 : 0; last = value;
            if (stable >= 3) return true;
            await new Promise(resolve => setTimeout(resolve, 70));
          }
          return false;
        });
        assert(item.motionSettled, 'Focusable-element transforms did not settle within the bounded observation.');
        assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), theme === 'dark', 'Requested theme');
        assert.equal(await page.locator('#msy-ga-loader,#msy-adsense-loader,ins.adsbygoogle').count(), 0, 'QA must have no ad or analytics SDK/slot');
        const initial = await page.evaluate(installCollector);
        item.initialControlCount = initial.inventory.controls.length;
        item.documentFocusableCount = initial.inventory.documentFocusableCount;
        item.excluded = initial.inventory.excluded;
        let inventory = initial.inventory, guidance = initial.guidance;
        const visited = new Set(), screenshots = new Set(); let first = null, expanded = false, lifeEventAdded = !!item.localFixturePreparation, cycles = 0;
        for (let tab = 0; tab < maxTabs; tab++) {
          const refreshed = await page.evaluate(() => window.__msyFocusAudit.refresh());
          if (refreshed) inventory = refreshed;
          await page.keyboard.press('Tab'); item.tabs++;
          assert(await settleFocusedPaint(page), 'Finite focus animation did not finish within 1500ms.');
          const active = await page.evaluate(() => window.__msyFocusAudit.active());
          if (active.id && !first) first = active.id;
          else if (active.id === first && item.tabs > 1) {
            item.cycleCompleted = true; cycles++;
            // A complete real circuit also discovers native scroll Tab stops.
            // If new controls appeared behind us, allow one more bounded loop.
            inventory = await page.evaluate(() => window.__msyFocusAudit.inventory());
            if (inventory.controls.every(control => visited.has(control.id)) || cycles >= 2) break;
          }
          if (!active.main) { item.traversedOutsideMain++; continue; }
          if (visited.has(active.id)) continue;
          visited.add(active.id);
          const parsed = focusIndicatorBands(active.before?.style, active.after?.style);
          const geometry = await page.evaluate(bands => window.__msyFocusAudit.geometry(bands), parsed.bands || []);
          const assessment = assessFocusIndicator({ ...active, geometry });
          item.focus.push({ ...active, geometry, assessment });
          const type = active.role || active.type || active.tag;
          const priority = route.startsWith('/job/') && /^연봉/.test(active.label) ? 'job-salary-cta'
            : route.includes('/monthly') && active.role === 'region' ? 'monthly-table-region'
            : route === '/calc/samsung-bonus' && active.label === '8,000만' ? 'samsung-salary-preset'
            : route === '/calc/samsung-bonus' && active.label === '메모리' && active.class.includes('scale-[1.02]') ? 'samsung-selected-memory'
            : route === '/calc/samsung-bonus' && active.tag === 'input' && /^2028년/.test(active.label) ? 'samsung-projection-input'
            : ['slider', 'switch'].includes(active.role) ? `shared-${active.role}` : null;
          const screenshotKey = assessment.pass ? priority ? `priority-${priority}` : `representative-${type}` : `issue-${assessment.status}-${assessment.reason}-${active.class}`;
          if (item.screenshots.length < 8 && (!assessment.pass || priority || item.screenshots.filter(x => x.purpose.startsWith('representative-')).length < 3) && !screenshots.has(screenshotKey)) {
            const r = active.after.rect;
            const left = Math.max(0, r.left - 16), top = Math.max(0, r.top - 32);
            const clip = { x: left, y: top, width: Math.min(width - left, Math.max(80, r.width + 32)),
              height: Math.min(500, 900 - top, Math.max(80, Math.min(r.height, 400) + 64)) };
            if (clip.width > 0 && clip.height > 0) {
              const filename = `${route.replaceAll('/', '_')}-${theme}-${width}-${item.screenshots.length}-${active.id}.png`;
              await page.screenshot({ path: path.join(output, filename), clip, animations: 'disabled' });
              item.screenshots.push({ filename, control: active.id, purpose: screenshotKey, clip }); screenshots.add(screenshotKey);
            }
          }
          if (active.canExpandDetails && !expanded) {
            await page.keyboard.press('Space'); await page.waitForTimeout(180); expanded = true;
            const more = await page.evaluate(() => ({ inventory: window.__msyFocusAudit.inventory(), guidance: window.__msyFocusAudit.guidance() }));
            inventory = more.inventory; guidance = more.guidance;
            item.detailsExpansion = { control: active.id, method: 'keyboard-Space', expectedText: '가정 바꾸기', noNavigation: true };
          }
          if (active.canAddLifeEvent && !lifeEventAdded) {
            await page.keyboard.press('Space'); await page.waitForTimeout(180); lifeEventAdded = true;
            const more = await page.evaluate(() => ({ inventory: window.__msyFocusAudit.inventory(), guidance: window.__msyFocusAudit.guidance() }));
            inventory = more.inventory; guidance = more.guidance;
            item.lifeEventExpansion = { control: active.id, method: 'keyboard-Space', noSubmission: true, noNavigation: true };
          }
        }
        const final = await page.evaluate(() => ({ inventory: window.__msyFocusAudit.inventory(), guidance: window.__msyFocusAudit.guidance() }));
        inventory = final.inventory; guidance = final.guidance;
        item.expectedControls = inventory.controls.map(({ id, tag, type, role, label, tabIndex }) => ({ id, tag, type, role, label, tabIndex }));
        item.excluded = inventory.excluded;
        item.lifecycle = inventory.lifecycle;
        item.baselineRefreshes = inventory.baselineRefreshes;
        item.retiredUnvisited = inventory.everExpectedControls.filter(control => !visited.has(control.id) && !item.expectedControls.some(current => current.id === control.id))
          .map(({ id, tag, type, role, label }) => ({ id, tag, type, role, label,
            evidence: inventory.lifecycle.filter(event => event.id === id) }));
        item.unvisited = item.expectedControls.filter(control => !visited.has(control.id));
        item.reachedTabCap = item.tabs >= maxTabs;
        item.relationships = guidance.relationships;
        item.valueExclusions = guidance.valueExclusions;
        item.text = guidance.records.map(record => ({ ...record, assessment: assessInputText(record) }));
        item.coverage = { initialControls: item.initialControlCount, finalExpectedControls: item.expectedControls.length,
          visited: item.focus.length, unvisited: item.unvisited.length, excluded: item.excluded.length,
          retiredUnvisited: item.retiredUnvisited.length, potentialNativeScrollContainers: inventory.potentialNativeScrollContainers,
          observedNativeScrollContainers: inventory.observedNativeScrollContainers,
          focus: assessmentCounts(item.focus), text: assessmentCounts(item.text),
          visiblePlaceholder: item.text.filter(x => x.kind === 'placeholder' && x.rendered).length,
          hiddenPlaceholderStyleOnly: item.text.filter(x => x.kind === 'placeholder' && !x.rendered).length };
        item.passed = item.expectedControls.length > 0 && item.cycleCompleted && !item.reachedTabCap && !item.unvisited.length && !item.errors.length &&
          item.focus.every(x => x.assessment.pass) && item.text.every(x => x.assessment.pass) && item.relationships.every(x => x.found);
        if (forcedColorsRequested && theme === 'light' && (route === '/contact' && width === 390 || route === '/table/2026/monthly' && width === 1280)) {
          const forced = { route, width, theme, reached: false, passed: false, tabs: 0 };
          summary.forcedColors.samples.push(forced);
          await page.emulateMedia({ forcedColors: 'active' });
          assert(await page.evaluate(() => matchMedia('(forced-colors: active)').matches), 'Forced-colors emulation must be active.');
          await settleFocusedPaint(page);
          await page.evaluate(installCollector);
          for (let tab = 0; tab < maxTabs; tab++) {
            await page.evaluate(() => window.__msyFocusAudit.refresh());
            await page.keyboard.press('Tab'); forced.tabs++;
            assert(await settleFocusedPaint(page), 'Forced-colors focus animation did not settle.');
            const active = await page.evaluate(() => window.__msyFocusAudit.active());
            const target = active.main && (route === '/contact' ? active.tag === 'input' && ['text', 'email'].includes(active.type || 'text')
              : active.role === 'region' && active.class.split(/\s+/).includes('ms-focus-inset'));
            if (!target) continue;
            const parsed = focusIndicatorBands(active.before?.style, active.after?.style);
            const geometry = await page.evaluate(bands => window.__msyFocusAudit.geometry(bands), parsed.bands || []);
            forced.reached = true; forced.record = { ...active, geometry, assessment: assessFocusIndicator({ ...active, geometry }) };
            forced.passed = forced.record.assessment.pass;
            const r = active.after.rect, left = Math.max(0, r.left - 12), top = Math.max(0, r.top - 20);
            const clip = { x: left, y: top, width: Math.min(width - left, Math.max(80, r.width + 24)), height: Math.min(400, 900 - top, Math.max(80, r.height + 40)) };
            if (clip.width > 0 && clip.height > 0) {
              forced.screenshot = `${route.replaceAll('/', '_')}-forced-colors-${width}.png`;
              await page.screenshot({ path: path.join(output, forced.screenshot), clip, animations: 'disabled' });
            }
            break;
          }
        }
      } catch (error) { item.errors.push(error.message.slice(0, 1000)); item.passed = false; }
      finally { await context.close(); }
      await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary));
      console.log(`${theme} ${width} ${route}: ${item.coverage?.visited || 0} keyboard controls, ${item.coverage?.unvisited ?? 'unknown'} unvisited; ${item.passed ? 'PASS' : 'needs review'}`);
    }
    summary.passed = summary.report.length === routes.length * 4 && summary.report.every(item => item.passed) &&
      (!forcedColorsRequested || summary.forcedColors.samples.length === Number(routes.includes('/contact')) + Number(routes.includes('/table/2026/monthly')) && summary.forcedColors.samples.every(sample => sample.passed)) &&
      !summary.forbiddenRequests.length && !summary.externalResponses.length && !summary.errors.length;
  } catch (error) { summary.errors.push(error.message.slice(0, 1000)); }
  finally {
    if (browser) await browser.close();
    summary.finishedAt = new Date().toISOString();
    await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary));
  }
  if (!summary.passed) throw new Error('Focus/input inspection did not prove every scoped case; complete evidence saved before failing.');
  console.log(`PASS: ${summary.report.length} local keyboard/input cases within the recorded model and coverage; not a sitewide accessibility certification.`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url)
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
