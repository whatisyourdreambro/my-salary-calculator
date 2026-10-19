// Offline numeric fixtures only. No browser, application, network or ad code.
import assert from 'node:assert/strict';
import test from 'node:test';
import { assessGradientContrast } from '../lib/qa-contrast-gradient.mjs';

const WHITE = 'rgb(255, 255, 255)';
const BLACK = 'rgb(0, 0, 0)';
const transparent = { backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none' };
const solid = backgroundColor => ({ backgroundColor, backgroundImage: 'none' });
const gradient = (first, last, header = 'to right in srgb') => ({
  ...transparent, backgroundImage: `linear-gradient(${header}, ${first}, ${last})`,
});
const assess = (layers, foreground = WHITE, threshold = 4.5) => assessGradientContrast({ foreground, layers, threshold });

// Independent point-sampling oracle: interpolate premultiplied RGB, composite
// each actual point and compare its exact ratio with the reported box bounds.
// Samples are a regression oracle, not the evaluator's proof method.
function interpolate(first, last, t) {
  const alpha = first[3] * (1 - t) + last[3] * t;
  return [...[0, 1, 2].map(index => alpha === 0 ? 0 :
    (first[index] * first[3] * (1 - t) + last[index] * last[3] * t) / alpha), alpha];
}
function compositePoint(front, back) {
  return front.slice(0, 3).map((channel, index) => channel * front[3] + back[index] * (1 - front[3]));
}
function exactRatio(first, last) {
  const light = color => color.reduce((sum, channel, index) => {
    const linear = channel <= 10.31475 ? channel / 3294.6 : ((channel / 255 + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
  const a = light(first), b = light(last);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function assertEncloses(result, ratios) {
  assert.notEqual(result.status, 'unassessed');
  assert.equal(result.ratio, result.minContrastLowerBound);
  for (const ratio of ratios) {
    assert.ok(result.minContrastLowerBound <= ratio + 1e-9, `lower ${result.ratio} must enclose ${ratio}`);
    assert.ok(result.maxContrastUpperBound >= ratio - 1e-9, `upper ${result.maxContrastUpperBound} must enclose ${ratio}`);
  }
}

test('explicit sRGB blue gradient proves white text over every color, with stop evidence', () => {
  const result = assess([gradient('rgb(1, 69, 242)', 'rgb(29, 78, 216)'), solid(WHITE)]);
  assert.equal(result.status, 'pass');
  assert.equal(result.pass, true);
  assert.ok(result.ratio > 6);
  assert.equal(result.method, 'srgb-gradient-channel-interval');
  assert.equal(result.gradients[0].interpolationSource, 'explicit-srgb');
  assert.equal(result.canvas, 'concealed-by-opaque-background');
  assert.deepEqual(result.gradients[0].stops.map(stop => stop.color), [[1, 69, 242, 1], [29, 78, 216, 1]]);
  assert.deepEqual(result.backgroundRange.rgb, [[1, 29], [69, 78], [216, 242]]);
  assertEncloses(result, Array.from({ length: 501 }, (_, index) => exactRatio([255, 255, 255], interpolate([1, 69, 242, 1], [29, 78, 216, 1], index / 500).slice(0, 3))));
});

test('both endpoints pass but an intermediate foreground/background crossover cannot pass', () => {
  const foreground = [117, 117, 117];
  assert.ok(exactRatio(foreground, [0, 0, 0]) >= 4.5);
  assert.ok(exactRatio(foreground, [255, 255, 255]) >= 4.5);
  const result = assess([gradient(BLACK, WHITE)], 'rgb(117, 117, 117)');
  assert.equal(result.status, 'not-guaranteed');
  assert.equal(result.pass, false);
  assert.equal(result.ratio, 1);
  assertEncloses(result, [1, exactRatio(foreground, [0, 0, 0]), exactRatio(foreground, [255, 255, 255])]);
});

test('nonmonotonic mixed RGB luminance is enclosed rather than taking endpoint contrast', () => {
  const samples = Array.from({ length: 501 }, (_, index) => exactRatio([0, 0, 0], [255 * (1 - index / 500), 255 * index / 500, 0]));
  assert.ok(samples[0] > 5.1 && samples.at(-1) > 5.1);
  assert.ok(Math.min(...samples) < 5.1);
  const result = assess([gradient('rgb(255, 0, 0)', 'rgb(0, 255, 0)')], BLACK, 5.1);
  assert.equal(result.status, 'not-guaranteed');
  assertEncloses(result, samples);
});

test('white 20% and 30% child overlays include every alpha-composited gradient point', () => {
  for (const alpha of [0.2, 0.3]) {
    const result = assess([solid(`rgba(255, 255, 255, ${alpha})`), gradient('rgb(1, 69, 242)', 'rgb(29, 78, 216)')]);
    const samples = Array.from({ length: 501 }, (_, index) => {
      const base = interpolate([1, 69, 242, 1], [29, 78, 216, 1], index / 500);
      return exactRatio([255, 255, 255], compositePoint([255, 255, 255, alpha], base));
    });
    assertEncloses(result, samples);
    assert.equal(result.status, alpha === 0.2 ? 'not-guaranteed' : 'fail');
    assert.equal(result.pass, false);
    if (alpha === 0.3) assert.ok(result.maxContrastUpperBound < 4.5);
  }
});

test('lower-opacity overlays can be proved safe without assuming endpoint monotonicity', () => {
  for (const alpha of [0.1, 0.15]) {
    const result = assess([solid(`rgba(255, 255, 255, ${alpha})`), gradient('rgb(1, 69, 242)', 'rgb(29, 78, 216)')]);
    assert.equal(result.status, 'pass');
    assert.ok(result.minContrastLowerBound >= 4.5);
  }
});

test('transparent background-clip text uses gradient as foreground and its parent as background', () => {
  const first = { ...gradient('rgb(1, 69, 242)', 'rgba(1, 69, 242, 0.8)'), backgroundClip: 'text', webkitTextFillColor: 'rgba(0, 0, 0, 0)' };
  const result = assess([first, solid(WHITE)], BLACK, 3);
  assert.equal(result.status, 'pass');
  assert.equal(result.gradients[0].role, 'foreground');
  assert.deepEqual(result.backgroundRange.rgb, [[255, 255], [255, 255], [255, 255]]);
  assertEncloses(result, Array.from({ length: 101 }, (_, index) => exactRatio(
    compositePoint(interpolate([1, 69, 242, 1], [1, 69, 242, 0.8], index / 100), [255, 255, 255]), [255, 255, 255])));
  const dark = assess([first, solid('rgb(27, 29, 34)')], BLACK, 3);
  assert.equal(dark.status, 'fail');
  assert.ok(dark.maxContrastUpperBound < 3);
});

test('foreground alpha is composed with the already composited background', () => {
  const result = assess([gradient('rgba(50, 100, 200, 0.3)', 'rgba(150, 40, 20, 0.8)'), solid('rgb(245, 245, 245)')], 'rgba(0, 0, 0, 0.7)');
  assertEncloses(result, Array.from({ length: 501 }, (_, index) => {
    const back = compositePoint(interpolate([50, 100, 200, 0.3], [150, 40, 20, 0.8], index / 500), [245, 245, 245]);
    return exactRatio(compositePoint([0, 0, 0, 0.7], back), back);
  }));
});

test('a completely transparent stop cannot escape the interval after premultiplied interpolation', () => {
  const result = assess([gradient('rgba(255, 0, 0, 0)', 'rgba(0, 0, 255, 0.6)'), solid(WHITE)], BLACK);
  assertEncloses(result, Array.from({ length: 101 }, (_, index) => {
    const back = compositePoint(interpolate([255, 0, 0, 0], [0, 0, 255, 0.6], index / 100), [255, 255, 255]);
    return exactRatio([0, 0, 0], back);
  }));
});

test('opaque child conceals an unsupported ancestor image but not ancestor group effects', () => {
  const hidden = { backgroundImage: 'url(unsupported.png)', backgroundColor: 'color(display-p3 1 0 0)' };
  const result = assess([solid(BLACK), hidden]);
  assert.equal(result.status, 'pass');
  assert.equal(result.gradients.length, 0);
  assert.equal(assess([solid(BLACK), { ...hidden, opacity: '0.5' }]).reason, 'ancestor-or-text-opacity');
  assert.equal(assess([solid(BLACK), { ...hidden, filter: 'brightness(0.5)' }]).status, 'unassessed');
});

test('an opaque gradient conceals its own background and ancestor colors', () => {
  const result = assess([{ ...gradient(BLACK, 'rgb(10, 10, 10)'), backgroundColor: 'unsupported' }, { backgroundImage: 'url(hidden.png)' }]);
  assert.equal(result.status, 'pass');
  assert.equal(result.gradients.length, 1);
});

test('transparent terminal layers use an unknown canvas instead of assuming white', () => {
  const result = assess([transparent], BLACK);
  assert.equal(result.status, 'not-guaranteed');
  assert.equal(result.canvas, 'unknown-rgb-range');
  assert.deepEqual(result.backgroundRange.rgb, [[0, 255], [0, 255], [0, 255]]);
});

test('direction/angle and supported positions are retained while bounds cover the entire line', () => {
  for (const header of ['in srgb', 'to top left in srgb', 'in srgb to bottom right', '90deg in srgb', 'in srgb 0.25turn', '1.5rad in srgb', '100grad in srgb']) {
    const result = assess([gradient('rgb(0, 0, 0) -10%', 'rgb(10, 10, 10) 20px 80%', header)]);
    assert.equal(result.status, 'pass', header);
    assert.deepEqual(result.gradients[0].stops[1].positions, ['20px', '80%']);
  }
});

test('modern computed RGB and percentage alpha are supported without accepting other spaces', () => {
  const result = assess([gradient('rgb(0 0 0 / 80%)', 'rgb(10 10 10 / 1)'), solid(BLACK)], 'rgb(100% 100% 100%)');
  assert.equal(result.status, 'pass');
  assert.equal(result.gradients[0].stops[0].color[3], 0.8);
  assert.equal(assess([solid(BLACK)], 'color(display-p3 1 1 1)').status, 'unassessed');
});

test('legacy RGB computed serialization uses CSS Color 4 sRGB exception, with explicit provenance', () => {
  const pairs = [
    ['linear-gradient(to right, rgb(0, 0, 0), rgb(10, 10, 10))', 'linear-gradient(to right in srgb, rgb(0, 0, 0), rgb(10, 10, 10))'],
    ['linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0.8))', 'linear-gradient(in srgb, rgb(0, 0, 0), rgba(0, 0, 0, 0.8))'],
    ['linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgb(10, 10, 10) 100%)', 'linear-gradient(90deg in srgb, rgba(0, 0, 0, 0.8) 0%, rgb(10, 10, 10) 100%)'],
    ['linear-gradient(rgb(0 0 0 / 80%), rgb(10 10 10))', 'linear-gradient(in srgb, rgb(0 0 0 / 80%), rgb(10 10 10))'],
    ['linear-gradient(transparent, rgb(10, 10, 10))', 'linear-gradient(in srgb, transparent, rgb(10, 10, 10))'],
  ];
  for (const [serialized, explicit] of pairs) {
    const input = image => [{ ...transparent, backgroundImage: image }, solid(BLACK)];
    const legacy = assess(input(serialized)), annotated = assess(input(explicit));
    assert.equal(legacy.status, 'pass', serialized);
    assert.equal(legacy.gradients[0].interpolationSource, 'legacy-srgb-css-color-4');
    assert.equal(annotated.gradients[0].interpolationSource, 'explicit-srgb');
    assert.deepEqual(legacy.bounds, annotated.bounds);
    assert.deepEqual(legacy.backgroundRange, annotated.backgroundRange);
    assert.deepEqual(legacy.foregroundRange, annotated.foregroundRange);
    assert.deepEqual(legacy.gradients[0].stops, annotated.gradients[0].stops);
  }
});

test('legacy RGB support preserves mid-gradient crossover failure rather than promoting endpoints', () => {
  const legacy = assess([{ ...transparent, backgroundImage: 'linear-gradient(to right, rgb(0, 0, 0), rgb(255, 255, 255))' }], 'rgb(117, 117, 117)');
  assert.equal(legacy.status, 'not-guaranteed');
  assert.equal(legacy.pass, false);
  assert.equal(legacy.ratio, 1);
});

test('explicit non-sRGB interpolation and non-legacy color syntax remain unassessed', () => {
  for (const image of [
    'linear-gradient(in oklab, rgb(0, 0, 0), rgb(10, 10, 10))',
    'linear-gradient(to right in srgb-linear, rgb(0, 0, 0), rgb(10, 10, 10))',
    'linear-gradient(in hsl shorter hue, rgb(0, 0, 0), rgb(10, 10, 10))',
    'linear-gradient(color(srgb 0 0 0), rgb(10, 10, 10))',
    'linear-gradient(to right, rgb(0, 0, 0), color(srgb 0 0 0))',
    'linear-gradient(in srgb, color(srgb 0 0 0), rgb(10, 10, 10))',
    'linear-gradient(to right, oklab(0 0 0), rgb(10, 10, 10))',
    'linear-gradient(in srgb, rgb(0, 0, 0), color(display-p3 0 0 0))',
  ]) {
    const result = assess([{ ...transparent, backgroundImage: image }, solid(WHITE)]);
    assert.equal(result.status, 'unassessed');
    assert.equal(result.pass, false);
    assert.equal(result.ratio, null);
  }
});

test('invalid syntax, hints, multiple images and unsupported colors fail closed', () => {
  const images = [
    'linear-gradient(in srgb, rgb(0, 0, 0))',
    'linear-gradient(in srgb, #000, #fff)',
    'linear-gradient(in srgb, hsl(0, 0%, 0%), rgb(0, 0, 0))',
    'linear-gradient(in srgb, rgb(0, 0, 0), 50%, rgb(0, 0, 0))',
    'linear-gradient(in srgb, rgb(0, 0, 0), rgb(0, 0, 0)), linear-gradient(in srgb, rgb(0, 0, 0), rgb(0, 0, 0))',
    'linear-gradient(in srgb, rgb(0, 0, 0) calc(100% - 1px), rgb(0, 0, 0))',
    'linear-gradient(in srgb to top bottom, rgb(0, 0, 0), rgb(0, 0, 0))',
    'linear-gradient(1e999deg in srgb, rgb(0, 0, 0), rgb(0, 0, 0))',
    'linear-gradient(in srgb, rgb(0, 0, 0)10%, rgb(0, 0, 0))',
    'repeating-linear-gradient(in srgb, rgb(0, 0, 0), rgb(0, 0, 0))',
    'linear-gradient(in srgb, rgb(0, 0, 0), rgb(0, 0, 0)) trailing',
  ];
  for (const image of images) assert.equal(assess([{ ...transparent, backgroundImage: image }]).status, 'unassessed', image);
  for (const color of ['rgb(1 2 3 0.5)', 'rgba(0, 0, 0, 2)', 'rgb(256, 0, 0)', 'rgb(1%, 2, 3)', 'rgb(1,,2)', 'rgba(NaN,0,0,1)'])
    assert.equal(assess([solid(BLACK)], color).status, 'unassessed', color);
});

test('non-default filter/opacity/mask/blending and unmodelled image geometry stay unassessed', () => {
  for (const extra of [
    { opacity: '0.99' }, { filter: 'blur(1px)' }, { backdropFilter: 'blur(1px)' },
    { mixBlendMode: 'multiply' }, { backgroundBlendMode: 'screen' }, { maskImage: 'linear-gradient(black, white)' },
    { clipPath: 'circle(50%)' }, { webkitTextStrokeWidth: '1px' }, { backgroundSize: '50% 100%' },
    { backgroundRepeat: 'space' }, { backgroundRepeat: 'no-repeat', backgroundPosition: '10px 0px' },
    { backgroundClip: 'border-box, content-box' },
  ]) assert.equal(assess([{ ...gradient(BLACK, 'rgb(10, 10, 10)'), ...extra }]).status, 'unassessed', JSON.stringify(extra));
});

test('unsupported clipped text combinations cannot be confused with a solid text foreground', () => {
  const text = { ...gradient(BLACK, 'rgb(10, 10, 10)'), backgroundClip: 'text' };
  assert.equal(assess([text, solid(WHITE)]).status, 'unassessed');
  assert.equal(assess([{ ...text, backgroundColor: BLACK }, solid(WHITE)], 'transparent').status, 'unassessed');
  assert.equal(assess([transparent, text, solid(WHITE)]).status, 'unassessed');
});

test('bounds and classification are unrounded, with no permissive threshold tolerance', () => {
  const result = assess([solid(WHITE)], 'rgb(119, 119, 119)');
  assert.ok(result.ratio > 4.47 && result.ratio < 4.5);
  assert.equal(result.status, 'fail');
  assert.equal(result.pass, false);
});

test('malformed and oversized inputs are bounded and return explicit unassessed records', () => {
  for (const input of [undefined, null, 'invalid', [], {}, { foreground: BLACK, threshold: 4.5, layers: [] },
    { foreground: BLACK, threshold: 4.5, layers: Array(129).fill(transparent) },
    { foreground: BLACK, threshold: NaN, layers: [solid(WHITE)] },
    { foreground: BLACK, threshold: 4.5, layers: [null] },
    { foreground: BLACK, threshold: 4.5, layers: [{ backgroundImage: 'a'.repeat(16385) }] },
  ]) assert.equal(assessGradientContrast(input).status, 'unassessed');
});

test('deterministic multi-layer alpha fixtures enclose dense independent point samples', () => {
  let state = 123456;
  const next = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
  const randomColor = () => [Math.floor(next() * 256), Math.floor(next() * 256), Math.floor(next() * 256), next()];
  const css = color => `rgba(${color.join(', ')})`;
  for (let fixture = 0; fixture < 40; fixture++) {
    const first = randomColor(), last = randomColor(), overlay = randomColor(), foreground = randomColor(), base = randomColor();
    base[3] = 1;
    const result = assess([solid(css(overlay)), gradient(css(first), css(last)), solid(css(base))], css(foreground));
    assertEncloses(result, Array.from({ length: 101 }, (_, index) => {
      const back = compositePoint(overlay, compositePoint(interpolate(first, last, index / 100), base));
      return exactRatio(compositePoint(foreground, back), back);
    }));
  }
});
