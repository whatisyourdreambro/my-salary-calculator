// Pure analysis of styles collected by the guarded keyboard inspector. No I/O.
// WCAG 1.4.11: 3:1 against adjacent colors (no rounding tolerance).
// C40 additionally needs two >=2px bands, >=9:1, outside on ONE solid backdrop:
// https://www.w3.org/WAI/WCAG22/Techniques/css/C40
// This is not a full Focus Appearance/obscuration or WCAG conformance audit.
import { assessGradientContrast } from './qa-contrast-gradient.mjs';

const fail = (reason, extra = {}) => ({ status: 'unassessed', pass: false, reason, ...extra });
const rgb = value => {
  if (value === 'transparent') return [0, 0, 0, 0];
  const m = /^rgba?\(([^()]*)\)$/.exec(value || '');
  if (!m || m[1].includes('%')) return null;
  const p = m[1].trim().split(/[\s,/]+/).map(Number);
  if (![3, 4].includes(p.length) || p.some(x => !Number.isFinite(x)) || p.slice(0, 3).some(x => x < 0 || x > 255)) return null;
  if (p.length === 3) p.push(1);
  return p[3] >= 0 && p[3] <= 1 ? p : null;
};
const pixels = value => /^-?(?:\d+(?:\.\d+)?|\.\d+)px$/.test(value || '') ? Number.parseFloat(value) : null;
const colorString = c => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
const transparent = { backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none', backgroundClip: 'border-box' };
const paintLayers = layers => layers.map(layer => ({ ...layer, webkitTextFillColor: 'currentcolor', webkitTextStrokeWidth: '0px' }));

export function assessInputText(record) {
  if (!record || !Array.isArray(record.layers)) return fail('missing-text-evidence');
  const color = rgb(record.textFillColor && record.textFillColor !== 'currentcolor' ? record.textFillColor : record.foreground);
  const opacity = Number(record.textOpacity ?? 1);
  if (!color || !Number.isFinite(opacity) || opacity < 0 || opacity > 1) return fail('unsupported-text-color-or-opacity');
  if (record.textStrokeWidth && !/^0(?:px)?$/.test(record.textStrokeWidth)) return fail('unsupported-text-stroke');
  if (record.layers.some(layer => layer.webkitTextStrokeWidth && !/^0(?:px)?$/.test(layer.webkitTextStrokeWidth))) return fail('unsupported-text-stroke');
  color[3] *= opacity;
  const layers = paintLayers(record.layers);
  // Pseudo-element opacity affects its ink, not the input's entire background.
  const result = assessGradientContrast({ foreground: colorString(color), layers, threshold: record.threshold });
  return { ...result, textOpacity: opacity, rendered: record.rendered !== false,
    evidenceKind: record.rendered === false ? 'computed-style-not-currently-visible' : 'visible-text' };
}

function parseShadows(value, allowDecoration = false) {
  if (!value || value === 'none') return { shadows: [] };
  if (value.length > 4096) return fail('shadow-too-long');
  const parts = []; let depth = 0, start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    if (value[i] === ')') depth--;
    if (depth < 0 || depth > 1) return fail('unsupported-shadow-syntax');
    if (!depth && value[i] === ',') { parts.push(value.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(value.slice(start).trim());
  if (depth || parts.length > 12) return fail('unsupported-shadow-syntax');
  const shadows = [];
  for (const part of parts) {
    const colors = part.match(/rgba?\([^()]*\)/g);
    if (colors?.length !== 1) return fail('unsupported-shadow-color');
    const color = rgb(colors[0]);
    const tokens = part.replace(colors[0], '').trim().split(/\s+/);
    const inset = tokens.includes('inset');
    const dimensions = tokens.filter(t => t !== 'inset').map(pixels);
    if (!color || dimensions.length < 2 || dimensions.length > 4 || dimensions.includes(null)) return fail('unsupported-shadow-syntax');
    const [x, y, blur = 0, spread = 0] = dimensions;
    if (color[3] === 0) continue;
    if (x !== 0 || y !== 0 || blur !== 0 || spread < 0) {
      if (!allowDecoration || inset || blur < 0 || Math.max(Math.abs(x), Math.abs(y), blur, Math.abs(spread)) > 128)
        return fail('blurred-offset-or-negative-shadow');
      // The old shadow's opacity at a point is unknown. Its entire [0,A]
      // interval is evaluated on the BEFORE surface, never under the new paint.
      shadows.push({ color: colors[0], inset: false, decoration: true, spread });
    } else if (spread) shadows.push({ color: colors[0], inset, spread });
  }
  return { shadows };
}

export const parseFlatShadows = value => parseShadows(value);

// Signed distance from the border box: positive outside; negative inside.
// Only uniform, zero-blur paint is modeled. Rounded corners are not used as
// visibility samples; straight-edge evidence is collected separately.
export function focusIndicatorBands(before = {}, after = {}) {
  const previous = rawBands(before, true);
  if (previous.status) return fail('unsupported-unfocused-indicator-paint', { detail: previous.reason });
  const current = rawBands(after);
  if (current.status) return current;
  const bands = current.bands;
  const edges = [...new Set([...bands, ...previous.bands].flatMap(b => [b.start, b.end, 0]))].sort((a, b) => a - b);
  const visible = [];
  const at = (list, mid) => list.filter(b => b.start < mid && b.end > mid).sort((a, b) => a.priority - b.priority);
  for (let i = 1; i < edges.length; i++) {
    const start = edges[i - 1], end = edges[i], mid = (start + end) / 2;
    const paints = at(bands, mid), oldPaints = at(previous.bands, mid);
    if (!paints.length) continue;
    const top = paints[0];
    const decorations = mid >= 0 ? previous.decorations : [];
    if (paints.length > 1 && rgb(top.color)?.[3] !== 1) return fail('overlapping-translucent-indicator');
    if (oldPaints.length > 1 && rgb(oldPaints[0].color)?.[3] !== 1) return fail('overlapping-translucent-unfocused-indicator');
    const changed = decorations.length > 0 || !oldPaints.length || JSON.stringify(rgb(oldPaints[0].color)) !== JSON.stringify(rgb(top.color));
    visible.push({ ...top, start, end, changed, previousColor: oldPaints[0]?.color || null,
      previousPaints: [...oldPaints, ...decorations].sort((a, b) => a.priority - b.priority),
      thickness: end - start, id: `band-${visible.length}` });
  }
  return { bands: visible, changed: visible.some(b => b.changed) };
}

function rawBands(after, allowDecoration = false) {
  const parsed = parseShadows(after.boxShadow, allowDecoration);
  if (parsed.status) return parsed;
  const bands = [], decorations = [];
  const outlineWidth = pixels(after.outlineWidth), outlineOffset = pixels(after.outlineOffset);
  const outlineColor = rgb(after.outlineColor);
  if (after.outlineStyle && !['none', 'solid'].includes(after.outlineStyle) && outlineWidth > 0)
    return fail('unsupported-outline-style');
  if (after.outlineStyle === 'solid' && outlineWidth > 0 && outlineColor?.[3] > 0) {
    if (outlineOffset === null || Math.abs(outlineOffset) > 32 || outlineWidth > 16) return fail('unsupported-outline-geometry');
    bands.push({ kind: 'outline', color: after.outlineColor, start: outlineOffset, end: outlineOffset + outlineWidth,
      priority: -1 });
  }
  const widths = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].map(k => pixels(after[k] || '0px'));
  for (const [index, shadow] of parsed.shadows.entries()) {
    if (shadow.decoration) { decorations.push({ ...shadow, priority: index }); continue; }
    if (shadow.spread > 32) return fail('unsupported-shadow-geometry');
    if (shadow.inset && (widths.includes(null) || new Set(widths).size !== 1)) return fail('nonuniform-inset-border');
    bands.push({ kind: shadow.inset ? 'inset-shadow' : 'outer-shadow', color: shadow.color,
      start: shadow.inset ? -widths[0] - shadow.spread : 0, end: shadow.inset ? -widths[0] : shadow.spread,
      priority: index });
  }
  return { bands, decorations };
}

function transformValues(value) {
  if (value === 'none') return [];
  const match = /^(matrix|matrix3d)\(([^()]*)\)$/.exec(value || '');
  if (!match) return null;
  const tokens = match[2].split(',').map(x => x.trim());
  if (tokens.some(x => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(x))) return null;
  const values = tokens.map(Number);
  return values.length === (match[1] === 'matrix' ? 6 : 16) && values.every(Number.isFinite) ? values : null;
}

export function isIdentityTransform(value) {
  if (value === 'none') return true;
  const values = transformValues(value);
  if (!values) return false;
  const expected = values.length === 6 ? [1, 0, 0, 1, 0, 0] : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return values.every((x, i) => x === expected[i]);
}

export function isTranslationTransform(value) {
  const values = transformValues(value);
  if (!values) return false;
  if (!values.length) return true;
  const translationIndexes = values.length === 6 ? [4, 5] : [12, 13];
  const expected = values.length === 6 ? [1, 0, 0, 1, 0, 0] : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return values.every((x, i) => translationIndexes.includes(i) || x === expected[i]);
}

function focusGeometryScale(before, after, geometry, fragmented) {
  const oldEffects = before.effects || [], newEffects = after.effects || [];
  if ([...oldEffects, ...newEffects].some(x => x.perspective !== 'none' || x.zoom !== '1') ||
    [...oldEffects.slice(1), ...newEffects.slice(1)].some(x => !isTranslationTransform(x.transform)))
    return fail('transformed-indicator-geometry');
  const oldTransform = oldEffects[0]?.transform, newTransform = newEffects[0]?.transform;
  if (oldEffects.length && !oldTransform || newEffects.length && !newTransform)
    return fail('transformed-indicator-geometry');
  if ((!oldTransform || isTranslationTransform(oldTransform)) && (!newTransform || isTranslationTransform(newTransform)))
    return { scale: 1 };
  // Only the element's unchanged, positive uniform 2D scale is supported.
  // Collector distances and clipping samples must already use that scale;
  // an unscaled union rectangle is not evidence of the painted stroke.
  const values = transformValues(newTransform);
  if (oldTransform !== newTransform || !values || values.length !== 6 || values[0] <= 0 ||
    values[0] !== values[3] || values[1] !== 0 || values[2] !== 0 || fragmented)
    return fail('transformed-indicator-geometry');
  const scale = values[0];
  if (!geometry.length || geometry.some(g => g.model !== 'single-border-box' || g.fragmentCount !== 1 ||
    g.scale?.source !== 'self-uniform-2d' || g.scale.x !== scale || g.scale.y !== scale))
    return fail('scaled-indicator-geometry-mismatch');
  return { scale };
}

function surfaceLayers(snapshot, band) {
  const layers = paintLayers(snapshot.layers);
  if (band.start >= 0) layers[0] = { ...layers[0], ...transparent };
  return layers;
}

function priorPaintLayers(paints) {
  return paints.map(paint => {
    if (!paint.decoration) return { backgroundColor: paint.color, backgroundImage: 'none' };
    const color = rgb(paint.color);
    return { ...transparent,
      backgroundImage: `linear-gradient(${colorString([color[0], color[1], color[2], 0])}, ${colorString(color)})` };
  });
}

// Independent rendered ranges: the AFTER foreground must never be composited
// over the BEFORE indicator (which is no longer present).
function renderedChange(beforeRange, afterRange) {
  if (!beforeRange?.luminance || !afterRange?.luminance) return fail('unsupported-before-after-paint');
  const [a, b] = beforeRange.luminance, [c, d] = afterRange.luminance;
  const lower = b < c ? (c + .05) / (b + .05) : d < a ? (a + .05) / (d + .05) : 1;
  const upper = Math.max((b + .05) / (c + .05), (d + .05) / (a + .05));
  const conservativeLower = Math.max(1, lower - 1e-10);
  return { status: conservativeLower >= 3 ? 'pass' : upper < 3 ? 'fail' : 'not-guaranteed',
    pass: conservativeLower >= 3, method: 'independent-before-after-rendered-ranges', threshold: 3,
    bounds: { lower: conservativeLower, upper: upper + 1e-10 }, beforeRange, afterRange };
}

const sameRect = (a, b) => ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'].every(key =>
  Number.isFinite(a?.[key]) && Number.isFinite(b?.[key]) && a[key] === b[key]);

function focusMeasurementIssue(record, geometry) {
  const consistency = record?.measurementConsistency;
  const hasSource = geometry.some(g => ['sourceId', 'sourceRect', 'sourceStyle'].some(key => key in g));
  // Older offline fixtures have no atomic-measurement fields. New observations
  // must not silently fall back to that contract when one field is missing.
  if (consistency === undefined && !hasSource) return null;
  if (!consistency || consistency.stable !== true) return 'unstable-focus-geometry';
  if (typeof record.id !== 'string' || !record.id || consistency.sourceId !== record.id ||
    consistency.matchingStyles !== true || !Number.isInteger(consistency.stableFrames) || consistency.stableFrames < 2 ||
    record.after?.pendingFiniteAnimations !== 0 || !sameRect(consistency.finalRect, record.after?.rect) ||
    geometry.some(g => g.sourceId !== record.id || !sameRect(g.sourceRect, record.after.rect) ||
      !g.sourceStyle || JSON.stringify(g.sourceStyle) !== JSON.stringify(record.after.style)))
    return 'focus-geometry-evidence-mismatch';
  return null;
}

export function assessFocusIndicator(record) {
  const { before, after, focusVisible, geometry = [] } = record || {};
  const measurementIssue = focusMeasurementIssue(record, geometry);
  if (measurementIssue) return fail(measurementIssue);
  if (!before?.style || !after?.style || !Array.isArray(after.layers)) return fail('missing-focus-evidence');
  if (!focusVisible) return fail('keyboard-focus-visible-not-matched');
  if (before.focusVisible) return fail('baseline-already-focused');
  const fragmented = after.fragments?.length > 1;
  if (fragmented && (!geometry.length || geometry.some(g => g.model !== 'fragmented-inline-outer-horizontal-edges' ||
    g.fragmentCount !== after.fragments.length || !g.samples?.every(s => ['top', 'bottom'].includes(s.side) &&
      Number.isInteger(s.fragmentIndex) && s.fragmentIndex >= 0 && s.fragmentIndex < after.fragments.length))))
    return fail('fragmented-inline-focus-geometry');
  const transform = focusGeometryScale(before, after, geometry, fragmented);
  if (transform.status) return transform;
  const parsed = focusIndicatorBands(before.style, after.style);
  if (parsed.status) return parsed;
  if (record.measurementConsistency && (geometry.length !== parsed.bands.length ||
    new Set(geometry.map(g => g.id)).size !== geometry.length ||
    parsed.bands.some(band => !geometry.some(g => g.id === band.id))))
    return fail('focus-geometry-evidence-mismatch');
  if (!parsed.changed || !parsed.bands.length) return fail('no-supported-new-focus-indicator', { bands: parsed.bands });
  const assessments = parsed.bands.map(cssBand => {
    const band = { ...cssBand, physicalThickness: cssBand.thickness * transform.scale };
    if (fragmented && (band.start < 0 || rgb(band.color)?.[3] !== 1 || !band.changed || band.previousColor))
      return { ...band, ...fail('unsupported-fragment-indicator-paint') };
    const visibility = geometry.find(g => g.id === band.id);
    if (!visibility || visibility.visibleSamples < 1 || visibility.visibleStripCount < 1)
      return { ...band, ...fail('indicator-clipped-or-obscured'), visibility };
    const border = Math.max(...['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].map(k => pixels(after.style[k] || '0px')));
    if (band.start < 0 && (band.end > -border || after.layers[0].backgroundClip === 'content-box'))
      return { ...band, ...fail('inset-band-over-border-or-content-box-padding'), visibility };
    // Preserve all group effects, but remove the element's own background when
    // evaluating an outside stroke against its parent surface.
    const layers = surfaceLayers(after, band);
    const result = assessGradientContrast({ foreground: band.color, layers, threshold: 3 });
    let changeAssessment = null;
    let beforeSurface = null;
    if (Array.isArray(before.layers)) beforeSurface = assessGradientContrast({ foreground: 'rgb(0, 0, 0)',
      threshold: 3, layers: surfaceLayers(before, band) });
    if (band.changed && band.previousPaints.length) {
      if (rgb(band.color)?.[3] !== 1 || band.previousPaints.some(p => !p.decoration && rgb(p.color)?.[3] !== 1))
        return { ...band, ...fail('translucent-existing-indicator-replacement'), visibility };
      if (!Array.isArray(before.layers)) return { ...band, ...fail('missing-before-paint-layers'), visibility };
      // A one-channel RGB change is not proof of a visible new focus state.
      // This 3:1 internal gate is deliberately stricter than AA Focus Visible;
      // do not present it as AA's normative focused/unfocused change threshold.
      const old = assessGradientContrast({ foreground: 'rgb(0, 0, 0)', threshold: 3,
        layers: [...priorPaintLayers(band.previousPaints), ...surfaceLayers(before, band)] });
      changeAssessment = renderedChange(old.backgroundRange, result.foregroundRange);
      if (!changeAssessment.pass) return { ...band, ...fail('existing-indicator-color-change-not-proven-visible'), visibility, changeAssessment };
    }
    return { ...band, ...result, visibility, changeAssessment, beforeSurfaceRange: beforeSurface?.backgroundRange || null,
      method: 'indicator-band-against-surface-interval' };
  });
  const passing = assessments.filter(x => x.pass && x.physicalThickness >= 1 && x.changed);
  let twoColor = null;
  for (const a of assessments) for (const b of assessments) {
    if (a.id >= b.id || !a.changed || !b.changed || a.start < 0 || b.start < 0 || a.physicalThickness < 2 || b.physicalThickness < 2 ||
      Math.abs(a.end - b.start) > 1e-6 && Math.abs(b.end - a.start) > 1e-6 ||
      !a.visibility?.visibleSamples || !b.visibility?.visibleSamples ||
      rgb(a.color)?.[3] !== 1 || rgb(b.color)?.[3] !== 1 || a.previousPaints.length || b.previousPaints.length) continue;
    const solid = [a, b].every(x => x.backgroundRange?.rgb.every(([lo, hi]) => Math.abs(lo - hi) < 1e-8));
    const sameSurface = solid && JSON.stringify(a.backgroundRange.rgb) === JSON.stringify(b.backgroundRange.rgb) &&
      [a, b].every(x => JSON.stringify(x.beforeSurfaceRange?.rgb) === JSON.stringify(x.backgroundRange.rgb));
    if (!sameSurface) continue;
    const colocated = a.visibility.samples?.some(x => x.visible && b.visibility.samples?.some(y => y.visible &&
      x.side === y.side && x.t === y.t && x.fragmentIndex === y.fragmentIndex));
    if (!colocated) continue;
    const mutual = assessGradientContrast({ foreground: a.color, threshold: 9,
      layers: [{ backgroundColor: b.color, backgroundImage: 'none' }] });
    if (mutual.pass) twoColor = { method: 'w3c-c40-two-color-solid-backdrop', bands: [a.id, b.id], mutual };
  }
  const pass = passing.length > 0 || !!twoColor;
  return { status: pass ? 'pass' : assessments.some(a => ['unassessed', 'not-guaranteed'].includes(a.status)) ? 'unassessed' : 'fail', pass,
    method: twoColor?.method || 'indicator-band-against-surface-interval',
    reason: pass ? null : 'no-visible-supported-indicator-band-proven-at-3-to-1', assessments, twoColor,
    passingBands: passing.map(x => x.id),
    limitation: 'Straight-edge clipping and hit-test samples; no universal focus visibility, indicator-area, pixel-occlusion, or forced-colors certification.' };
}
