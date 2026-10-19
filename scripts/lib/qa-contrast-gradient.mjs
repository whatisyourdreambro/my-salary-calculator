// Pure, bounded color-model evaluation. This module performs no I/O or rendering.
// It proves a lower bound over all gradient colors, not a pixel/location sample.
// CSS Color 4 retains gamma-encoded sRGB interpolation for legacy RGB colors
// unless another space is explicit. This exception also covers transparent.
// Browsers can omit an explicit `in srgb` when serializing these gradients.
// https://drafts.csswg.org/css-color-4/#interpolation-space
// Non-legacy colors and explicit other spaces are deliberately not supported.
// Premultiplied sRGB interpolation stays within each stop channel/alpha interval:
// https://www.w3.org/TR/css-images-3/#coloring-gradient-line
// Source-over and WCAG relative luminance are then bounded monotonically.

const METHOD = 'srgb-gradient-channel-interval';
const MAX_LAYERS = 128;
const MAX_STOPS = 64;
const MAX_IMAGE_LENGTH = 16384;
const NUMBER = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
const numberPattern = new RegExp(`^${NUMBER}$`, 'i');
const positionPattern = new RegExp(`^${NUMBER}(?:%|px)$`, 'i');
const anglePattern = new RegExp(`^${NUMBER}(?:deg|grad|rad|turn)$`, 'i');

function unsupported(reason, layerIndex = null) {
  return { status: 'unassessed', pass: false, method: METHOD, reason, layerIndex,
    ratio: null, minContrastLowerBound: null, maxContrastUpperBound: null,
    bounds: null, backgroundRange: null, foregroundRange: null, gradients: [] };
}

function parseNumber(value, scale) {
  const percentage = value.endsWith('%');
  const numeric = percentage ? value.slice(0, -1) : value;
  if (!numberPattern.test(numeric)) return null;
  const result = Number(numeric) * (percentage ? scale / 100 : 1);
  return Number.isFinite(result) && result >= 0 && result <= scale ? result : null;
}

function parseColor(input) {
  if (typeof input !== 'string' || input.length > 256) return null;
  if (input.trim().toLowerCase() === 'transparent') return [0, 0, 0, 0];
  const match = /^rgba?\(([^()]*)\)$/i.exec(input.trim());
  if (!match) return null;
  let parts;
  if (match[1].includes(',')) {
    if (match[1].includes('/')) return null;
    parts = match[1].split(',').map(part => part.trim());
  } else {
    const slash = match[1].split('/');
    if (slash.length > 2) return null;
    parts = slash[0].trim().split(/\s+/);
    if (parts.length !== 3) return null;
    if (slash.length === 2) {
      parts.push(slash[1].trim());
    }
  }
  if (parts.length !== 3 && parts.length !== 4) return null;
  // Mixed percentage/numeric channels are not legacy RGB syntax. Computed
  // numeric RGB is the primary input; percentage RGB is accepted consistently.
  if (new Set(parts.slice(0, 3).map(part => part.endsWith('%'))).size !== 1) return null;
  const rgb = parts.slice(0, 3).map(part => parseNumber(part, 255));
  const alpha = parts.length === 4 ? parseNumber(parts[3], 1) : 1;
  return rgb.every(value => value !== null) && alpha !== null ? [...rgb, alpha] : null;
}

function splitArguments(value) {
  const result = [];
  let depth = 0, start = 0;
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0 || depth > 1) return null;
    if (char === ',' && depth === 0) {
      result.push(value.slice(start, index).trim()); start = index + 1;
    }
  }
  if (depth !== 0) return null;
  result.push(value.slice(start).trim());
  return result.every(Boolean) ? result : null;
}

function parseDirection(value) {
  if (!value) return '180deg';
  if (anglePattern.test(value) && Number.isFinite(parseFloat(value))) return value;
  const words = value.toLowerCase().split(/\s+/);
  if (words.shift() !== 'to' || words.length < 1 || words.length > 2) return null;
  if (!words.every(word => ['top', 'right', 'bottom', 'left'].includes(word))) return null;
  if (words.length === 2 && (words[0] === words[1] ||
    (['top', 'bottom'].includes(words[0]) === ['top', 'bottom'].includes(words[1])))) return null;
  return `to ${words.join(' ')}`;
}

function parseGradient(image) {
  if (typeof image !== 'string' || image.length > MAX_IMAGE_LENGTH) return { reason: 'unsupported-background-image' };
  const match = /^linear-gradient\(([\s\S]*)\)$/i.exec(image.trim());
  if (!match) return { reason: 'unsupported-background-image' };
  const argumentsList = splitArguments(match[1]);
  if (!argumentsList || argumentsList.length > MAX_STOPS + 1) return { reason: 'unsupported-gradient-syntax' };
  // An omitted header starts directly with a color stop. The legacy exception
  // is applied only AFTER every stop passes the restricted RGB/transparent
  // parser below; color(srgb ...), Lab, Oklab and other functions cannot opt in.
  let header = /^(?:rgba?\(|transparent(?:\s|$))/i.test(argumentsList[0]) ? '' : argumentsList.shift().toLowerCase();
  let interpolationSource = 'legacy-srgb-css-color-4';
  if (/(?:^|\s)in(?:\s|$)/.test(header)) {
    const interpolation = /(?:^|\s)in\s+srgb(?=\s|$)/.exec(header);
    if (!interpolation) return { reason: 'unsupported-gradient-interpolation' };
    interpolationSource = 'explicit-srgb';
    header = (header.slice(0, interpolation.index) + ' ' + header.slice(interpolation.index + interpolation[0].length)).trim();
  }
  const direction = parseDirection(header);
  if (!direction) return { reason: 'unsupported-gradient-direction' };
  if (argumentsList.length < 2 || argumentsList.length > MAX_STOPS) return { reason: 'unsupported-gradient-stop-count' };
  const stops = [];
  for (const argument of argumentsList) {
    const stop = /^(rgba?\([^()]*\)|transparent)([\s\S]*)$/i.exec(argument);
    if (!stop) return { reason: 'unsupported-gradient-color-or-hint' };
    const color = parseColor(stop[1]);
    if (!color) return { reason: 'unsupported-gradient-color' };
    if (stop[2] && !/^\s/.test(stop[2])) return { reason: 'unsupported-gradient-stop-position' };
    const positions = stop[2].trim() ? stop[2].trim().split(/\s+/) : [];
    if (positions.length > 2 || positions.some(position => !positionPattern.test(position) || !Number.isFinite(parseFloat(position))))
      return { reason: 'unsupported-gradient-stop-position' };
    stops.push({ color, positions });
  }
  return { interpolation: 'srgb', interpolationSource, direction, stops, range: colorRange(stops.map(stop => stop.color)) };
}

function colorRange(colors) {
  return { rgb: [0, 1, 2].map(index => [Math.min(...colors.map(color => color[index])), Math.max(...colors.map(color => color[index]))]),
    alpha: [Math.min(...colors.map(color => color[3])), Math.max(...colors.map(color => color[3]))] };
}

// RGB intervals are in gamma-encoded sRGB (0..255). The backdrop is opaque.
// This multilinear function has its extrema at box corners. Deliberately losing
// channel/alpha correlation widens the bounds; it cannot produce a false pass.
function composite(front, back) {
  return front.rgb.map(([frontMin, frontMax], channel) => {
    const values = [];
    for (const alpha of front.alpha) for (const color of [frontMin, frontMax]) for (const base of back[channel])
      values.push(alpha * color + (1 - alpha) * base);
    return [Math.min(...values), Math.max(...values)];
  });
}

function luminance(rgb) {
  return rgb.reduce((sum, value, index) => {
    const channel = value / 255;
    return sum + [0.2126, 0.7152, 0.0722][index] * (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  }, 0);
}

function renderedRange(rgb) {
  return { rgb, luminance: [luminance(rgb.map(channel => channel[0])), luminance(rgb.map(channel => channel[1]))] };
}

function ratioBounds(foreground, background) {
  const [frontMin, frontMax] = foreground.luminance, [backMin, backMax] = background.luminance;
  let lower = 1;
  if (frontMin > backMax) lower = (frontMin + 0.05) / (backMax + 0.05);
  else if (backMin > frontMax) lower = (backMin + 0.05) / (frontMax + 0.05);
  const upper = Math.max((frontMax + 0.05) / (backMin + 0.05), (backMax + 0.05) / (frontMin + 0.05));
  // Keep floating-point roundoff from promoting a threshold-adjacent bound.
  return { lower: Math.max(1, lower - 1e-10), upper: Math.min(21, upper + 1e-10) };
}

function effectProblem(layer) {
  if (layer.opacity !== undefined && (String(layer.opacity).trim() === '' || Number(layer.opacity) !== 1)) return 'ancestor-or-text-opacity';
  for (const property of ['filter', 'backdropFilter', 'maskImage', 'clipPath'])
    if (layer[property] !== undefined && layer[property] !== 'none') return `unsupported-${property}`;
  for (const property of ['mixBlendMode', 'backgroundBlendMode'])
    if (layer[property] !== undefined && layer[property] !== 'normal') return `unsupported-${property}`;
  if (layer.webkitTextStrokeWidth !== undefined && !/^0(?:px)?$/.test(String(layer.webkitTextStrokeWidth))) return 'unsupported-text-stroke';
  return null;
}

function imageGeometryProblem(layer) {
  if (layer.backgroundSize !== undefined && !['auto', 'auto auto'].includes(layer.backgroundSize)) return 'unsupported-background-size';
  const repeat = layer.backgroundRepeat ?? 'repeat';
  if (!['repeat', 'repeat repeat', 'no-repeat', 'no-repeat no-repeat'].includes(repeat)) return 'unsupported-background-repeat';
  // An auto-sized gradient normally fills its positioning box. A displaced,
  // nonrepeating image can leave unpainted space, which this color model cannot
  // assign to the text without geometry. Repeated full-size images have no gap.
  if (repeat.startsWith('no-repeat') && layer.backgroundPosition !== undefined &&
    !['0% 0%', '0px 0px', '0% 0px', '0px 0%'].includes(layer.backgroundPosition)) return 'unsupported-background-position';
  return null;
}

/**
 * Assess a computed-style color model without browser access.
 * `layers` run from the direct-text element through html. Missing properties
 * mean CSS initial defaults; callers must provide computed non-default effects.
 * Only full-size, single sRGB linear gradients are supported: explicit sRGB or
 * the CSS Color 4 legacy RGB/transparent exception when no space is explicit. Stop
 * positions and directions are evidence; bounds cover every segment regardless
 * of text placement. Ancestor/sibling occlusion, glyph antialiasing, pseudo
 * elements, shadows, focus outlines and full WCAG conformance are outside this
 * color model. Transparent terminal backgrounds use an unknown canvas interval.
 */
export function assessGradientContrast(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return unsupported('invalid-input');
  const { foreground, layers, threshold } = input;
  if (!Number.isFinite(threshold) || threshold < 1 || threshold > 21) return unsupported('invalid-threshold');
  if (!Array.isArray(layers) || layers.length === 0 || layers.length > MAX_LAYERS || layers.some(layer => !layer || typeof layer !== 'object' || Array.isArray(layer)))
    return unsupported('invalid-layer-chain');
  // Even an opaque child cannot conceal an ancestor's group opacity/filter.
  for (const [index, layer] of layers.entries()) {
    const problem = effectProblem(layer);
    if (problem) return unsupported(problem, index);
  }
  const textFill = layers[0].webkitTextFillColor;
  const textColor = parseColor(textFill && textFill !== 'currentcolor' ? textFill : foreground);
  if (!textColor) return unsupported('unsupported-foreground-color', 0);
  let foregroundPaint = colorRange([textColor]);
  const gradients = [], paints = [];
  let backgroundStart = 0;
  if (layers[0].backgroundClip === 'text') {
    if (textColor[3] !== 0) return unsupported('text-clipped-gradient-requires-transparent-text', 0);
    const gradient = parseGradient(layers[0].backgroundImage);
    if (gradient.reason) return unsupported(gradient.reason, 0);
    const color = parseColor(layers[0].backgroundColor ?? 'rgba(0, 0, 0, 0)');
    if (!color || color[3] !== 0) return unsupported('text-clipped-background-color', 0);
    const geometryProblem = imageGeometryProblem(layers[0]);
    if (geometryProblem) return unsupported(geometryProblem, 0);
    foregroundPaint = gradient.range;
    gradients.push({ layerIndex: 0, role: 'foreground', ...gradient });
    backgroundStart = 1;
  }
  let opaqueBackdrop = false;
  for (let index = backgroundStart; index < layers.length; index++) {
    const layer = layers[index];
    if (layer.backgroundClip === 'text') return unsupported('ancestor-text-clipped-background', index);
    if (layer.backgroundClip !== undefined && !['border-box', 'padding-box', 'content-box'].includes(layer.backgroundClip)) return unsupported('unsupported-background-clip', index);
    const image = layer.backgroundImage ?? 'none';
    if (image !== 'none') {
      const geometryProblem = imageGeometryProblem(layer);
      if (geometryProblem) return unsupported(geometryProblem, index);
      const gradient = parseGradient(image);
      if (gradient.reason) return unsupported(gradient.reason, index);
      gradients.push({ layerIndex: index, role: 'background', ...gradient });
      paints.push(gradient.range);
      if (gradient.range.alpha[0] === 1) { opaqueBackdrop = true; break; }
    }
    const color = parseColor(layer.backgroundColor ?? 'rgba(0, 0, 0, 0)');
    if (!color) return unsupported('unsupported-background-color', index);
    paints.push(colorRange([color]));
    if (color[3] === 1) { opaqueBackdrop = true; break; }
  }
  let backgroundRgb = [[0, 255], [0, 255], [0, 255]];
  for (let index = paints.length - 1; index >= 0; index--) backgroundRgb = composite(paints[index], backgroundRgb);
  const backgroundRange = renderedRange(backgroundRgb);
  const foregroundRange = renderedRange(composite(foregroundPaint, backgroundRgb));
  const { lower, upper } = ratioBounds(foregroundRange, backgroundRange);
  const status = lower >= threshold ? 'pass' : upper < threshold ? 'fail' : 'not-guaranteed';
  return { status, pass: status === 'pass', method: METHOD, threshold,
    reason: status === 'not-guaranteed' ? 'conservative-bounds-cross-threshold' : null,
    ratio: lower, minContrastLowerBound: lower, maxContrastUpperBound: upper,
    bounds: { lower, upper }, backgroundRange, foregroundRange, foregroundPaintRange: foregroundPaint,
    canvas: opaqueBackdrop ? 'concealed-by-opaque-background' : 'unknown-rgb-range', gradients };
}
