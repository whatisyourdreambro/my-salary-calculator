import test from 'node:test';
import assert from 'node:assert/strict';
import { assessFocusIndicator, assessInputText, focusIndicatorBands, isIdentityTransform, isTranslationTransform, parseFlatShadows } from '../lib/qa-focus-input-assessment.mjs';

const white = 'rgb(255, 255, 255)', black = 'rgb(0, 0, 0)';
const style = overrides => ({ outlineStyle: 'none', outlineWidth: '0px', outlineOffset: '0px', outlineColor: black,
  boxShadow: 'none', borderTopWidth: '0px', borderRightWidth: '0px', borderBottomWidth: '0px', borderLeftWidth: '0px', ...overrides });
const layer = backgroundColor => ({ backgroundColor, backgroundImage: 'none', backgroundClip: 'border-box',
  opacity: '1', filter: 'none', backdropFilter: 'none', mixBlendMode: 'normal', webkitTextStrokeWidth: '0px' });
function evidence(after, before = {}, surface = white) {
  const old = style(before), next = style(after);
  const bands = focusIndicatorBands(old, next).bands || [];
  return { focusVisible: true, before: { style: old, focusVisible: false, layers: [layer(white), layer(surface)] },
    after: { style: next, layers: [layer(white), layer(surface)], effects: [{ transform: 'none', perspective: 'none', zoom: '1' }] },
    geometry: bands.map(b => ({ id: b.id, visibleSamples: 3, visibleStripCount: 1, samples: [{ side: 'top', t: .5, visible: true }] })) };
}

test('new black outline contrasts with an actually modeled white surface', () => {
  const result = assessFocusIndicator(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' }));
  assert.equal(result.pass, true); assert(result.assessments[0].ratio > 20.99);
});
test('new white-on-white focus style is not a visible contrast pass', () => {
  assert.equal(assessFocusIndicator(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineColor: white })).pass, false);
});
test('retained black shadow plus new invisible white shadow is not a new focus cue', () => {
  const existing = `${black} 0px 0px 0px 2px`;
  const result = assessFocusIndicator(evidence({ boxShadow: `${existing}, ${white} 0px 0px 0px 4px` }, { boxShadow: existing }));
  assert.equal(result.pass, false);
  assert.equal(result.assessments.find(b => b.start === 0).changed, false);
});
test('same-color overlapping rings do not manufacture a changed band', () => {
  const before = { outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '0px' };
  const result = focusIndicatorBands(style(before), style({ boxShadow: `${black} 0px 0px 0px 2px` }));
  assert.equal(result.changed, false);
});
test('C40 requires two new >=2px bands and a shared solid backdrop', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white,
    boxShadow: `${black} 0px 0px 0px 2px` }, {}, 'rgb(128, 128, 128)');
  assert.equal(assessFocusIndicator(record).twoColor.method, 'w3c-c40-two-color-solid-backdrop');
  record.geometry[1].samples[0].side = 'bottom';
  assert.equal(assessFocusIndicator(record).twoColor, null);
});
test('C40 is not applied to a gradient even with two high-contrast colors', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white,
    boxShadow: `${black} 0px 0px 0px 2px` });
  record.after.layers[1].backgroundImage = `linear-gradient(${black}, ${white})`;
  assert.equal(assessFocusIndicator(record).twoColor, null);
  assert.equal(assessFocusIndicator(record).pass, false);
});
test('clipped indicator cannot pass on color contrast alone', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' });
  record.geometry[0].visibleSamples = 0;
  assert.equal(assessFocusIndicator(record).pass, false);
});
test('an inset outline over an unchanged border is unassessed rather than false-pass', () => {
  const borders = Object.fromEntries(['Top', 'Right', 'Bottom', 'Left'].map(x => [`border${x}Width`, '2px']));
  const result = assessFocusIndicator(evidence({ ...borders, outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '-2px' }, borders));
  assert.equal(result.pass, false); assert.equal(result.assessments[0].reason, 'inset-band-over-border-or-content-box-padding');
});
test('inset outline safely inside padding can be measured; content-box padding cannot', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '-4px' });
  assert.equal(assessFocusIndicator(record).pass, true);
  record.after.layers[0].backgroundClip = 'content-box';
  assert.equal(assessFocusIndicator(record).pass, false);
});
test('unknown shadows, auto outlines and group filters stay unassessed', () => {
  assert.equal(parseFlatShadows(`${black} 1px 0px 2px 4px`).status, 'unassessed');
  assert.equal(focusIndicatorBands(style(), style({ outlineStyle: 'auto', outlineWidth: '2px' })).status, 'unassessed');
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px' });
  record.after.layers[1].filter = 'blur(1px)';
  assert.equal(assessFocusIndicator(record).pass, false);
});
test('only mathematically identity transforms are supported', () => {
  assert.equal(isIdentityTransform('matrix(1, 0, 0, 1, 0, 0)'), true);
  assert.equal(isIdentityTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'), true);
  assert.equal(isIdentityTransform('matrix(1, 0, 0, 1, 0, 0.00001)'), false);
  assert.equal(isIdentityTransform('matrix(1,,0,1,0,0)'), false);
});
test('placeholder alpha changes ink only and hidden evidence is explicitly labeled', () => {
  const result = assessInputText({ foreground: black, textOpacity: .2, threshold: 4.5, rendered: false, layers: [layer(white)] });
  assert.equal(result.pass, false); assert.equal(result.evidenceKind, 'computed-style-not-currently-visible');
  assert.equal(result.backgroundRange.rgb[0][0], 255);
});
test('text strokes are never erased when assessing placeholder or input text', () => {
  const record = { foreground: black, threshold: 4.5, layers: [layer(white)] };
  assert.equal(assessInputText({ ...record, textStrokeWidth: '20px' }).status, 'unassessed');
  record.layers[0].webkitTextStrokeWidth = '1px';
  assert.equal(assessInputText(record).status, 'unassessed');
});
test('a gradient crossing foreground luminance does not pass from its endpoints', () => {
  const result = assessInputText({ foreground: 'rgb(128, 128, 128)', threshold: 4.5,
    layers: [{ ...layer(white), backgroundImage: `linear-gradient(${black}, ${white})` }] });
  assert.equal(result.pass, false); assert.equal(result.minContrastLowerBound, 1);
});
test('a nearly identical existing indicator color is not proof of visible focus', () => {
  const result = assessFocusIndicator(evidence({ boxShadow: 'rgb(1, 1, 1) 0px 0px 0px 2px' },
    { boxShadow: `${black} 0px 0px 0px 2px` }));
  assert.equal(result.pass, false);
  assert.equal(result.assessments[0].reason, 'existing-indicator-color-change-not-proven-visible');
});
test('multiple inline fragments cannot be replaced by an imaginary union outline', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px' });
  record.after.fragments = [{ left: 0, right: 100 }, { left: 0, right: 40 }];
  assert.equal(assessFocusIndicator(record).reason, 'fragmented-inline-focus-geometry');
});

test('small translucent flat-shadow replacement cannot manufacture 3:1 change', () => {
  const record = evidence({ boxShadow: 'rgba(0, 0, 0, 0.6) 0px 0px 0px 2px' },
    { boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px' });
  const result = assessFocusIndicator(record);
  assert.equal(result.pass, false);
  assert.equal(result.assessments[0].reason, 'translucent-existing-indicator-replacement');
});

test('new opaque flat stroke over an old translucent flat ring stays unassessed', () => {
  const result = assessFocusIndicator(evidence({ boxShadow: `${black} 0px 0px 0px 2px` },
    { boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px' }));
  assert.equal(result.pass, false);
  assert.equal(result.assessments[0].reason, 'translucent-existing-indicator-replacement');
});

test('removed decorative blur is bounded on BEFORE only, independently of AFTER stroke', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' },
    { boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px' });
  const result = assessFocusIndicator(record), band = result.assessments[0];
  assert.equal(result.pass, true);
  assert.deepEqual(band.backgroundRange.rgb, [[255,255],[255,255],[255,255]]);
  assert.deepEqual(band.foregroundRange.rgb, [[0,0],[0,0],[0,0]]);
  assert(band.changeAssessment.beforeRange.rgb[0][0] < 230);
  assert.equal(band.changeAssessment.beforeRange.rgb[0][1], 255);
  assert(band.changeAssessment.bounds.lower > 16);
});

test('strong old blur and a removed blur with insufficient actual change do not pass', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' },
    { boxShadow: 'rgba(0, 0, 0, 1) 0px 1px 3px 0px' });
  assert.equal(assessFocusIndicator(record).pass, false);
  assert.equal(assessFocusIndicator(record).assessments[0].changeAssessment.bounds.lower, 1);
  record.before.layers[1] = layer(black);
  assert.equal(assessFocusIndicator(record).pass, false);
});

test('an old shadow is not still composited under the replacement opaque stroke', () => {
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white },
    { boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px' });
  const result = assessFocusIndicator(record);
  assert.equal(result.pass, false);
  assert(result.assessments[0].changeAssessment.bounds.upper < 1.3);
});

test('current blur, prior inset blur and opaque-paint evidence missing BEFORE layers remain unsupported', () => {
  assert.equal(assessFocusIndicator(evidence({ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px' })).pass, false);
  assert.equal(assessFocusIndicator(evidence({ outlineStyle: 'solid', outlineWidth: '2px' },
    { boxShadow: 'inset rgba(0, 0, 0, 0.1) 0px 1px 3px 0px' })).pass, false);
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px' },
    { boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px' });
  delete record.before.layers;
  assert.equal(assessFocusIndicator(record).assessments[0].reason, 'missing-before-paint-layers');
});

test('C40 does not bypass a previous decorative shadow or changing surface', () => {
  const after = { outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white,
    boxShadow: `${black} 0px 0px 0px 2px` };
  assert.equal(assessFocusIndicator(evidence(after, { boxShadow: 'rgba(0, 0, 0, 1) 0px 1px 3px 0px' })).twoColor, null);
  const record = evidence(after, {}, 'rgb(128, 128, 128)');
  record.before.layers[1] = layer(black);
  assert.equal(assessFocusIndicator(record).twoColor, null);
});

test('pure translated boxes keep CSS stroke widths; scale, rotation and z transforms do not', () => {
  assert.equal(isTranslationTransform('matrix(1, 0, 0, 1, 0, -9.25)'), true);
  assert.equal(isTranslationTransform('matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,4,5,0,1)'), true);
  for (const value of ['matrix(1.02,0,0,1.02,0,0)', 'matrix(0,1,-1,0,0,0)',
    'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,1)', 'matrix(1,,0,1,0,0)']) assert.equal(isTranslationTransform(value), false);
  const record = evidence({ outlineStyle: 'solid', outlineWidth: '2px' });
  record.after.effects[0].transform = 'matrix(1,0,0,1,3,4)';
  assert.equal(assessFocusIndicator(record).pass, true);
  record.after.effects[0].transform = 'matrix(1.01,0,0,1.01,0,0)';
  assert.equal(assessFocusIndicator(record).reason, 'transformed-indicator-geometry');
});

function fragmented(record) {
  record.after.fragments = [{ left: 0, right: 100, top: 0, bottom: 20 }, { left: 0, right: 40, top: 20, bottom: 40 }];
  for (const g of record.geometry) Object.assign(g, { model: 'fragmented-inline-outer-horizontal-edges', fragmentCount: 2,
    samples: [{ side: 'top', t: .5, fragmentIndex: 0, visible: true }] });
  return record;
}

test('real outer horizontal fragment edges can prove a new opaque focus stroke', () => {
  const record = fragmented(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }));
  assert.equal(assessFocusIndicator(record).pass, true);
  record.geometry[0].samples[0].side = 'left';
  assert.equal(assessFocusIndicator(record).reason, 'fragmented-inline-focus-geometry');
});

test('fragmented geometry rejects wrong counts and translucent or inset bands', () => {
  const record = fragmented(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }));
  record.geometry[0].fragmentCount = 1;
  assert.equal(assessFocusIndicator(record).pass, false);
  assert.equal(assessFocusIndicator(fragmented(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '-3px' }))).pass, false);
  assert.equal(assessFocusIndicator(fragmented(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineColor: 'rgba(0,0,0,.5)' }))).pass, false);
});

test('C40 fragment pairs must be co-located on the same actual fragment', () => {
  const record = fragmented(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white,
    boxShadow: `${black} 0px 0px 0px 2px` }, {}, 'rgb(128,128,128)'));
  assert.equal(assessFocusIndicator(record).twoColor.method, 'w3c-c40-two-color-solid-backdrop');
  record.geometry[1].samples[0].fragmentIndex = 1;
  assert.equal(assessFocusIndicator(record).twoColor, null);
});

function scaled(record, scale = 1.02) {
  const effect = { transform: `matrix(${scale}, 0, 0, ${scale}, 0, 0)`, perspective: 'none', zoom: '1' };
  record.before.effects = [{ ...effect }]; record.after.effects = [{ ...effect }];
  record.before.fragments = [{ left: 0, top: 0, right: 100 * scale, bottom: 40 * scale }];
  record.after.fragments = record.before.fragments.map(x => ({ ...x }));
  for (const g of record.geometry) Object.assign(g, { model: 'single-border-box', fragmentCount: 1,
    scale: { x: scale, y: scale, source: 'self-uniform-2d' } });
  return record;
}

test('fixed positive self scale requires matching physical geometry and retains occlusion checks', () => {
  const record = scaled(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' }));
  let result = assessFocusIndicator(record);
  assert.equal(result.pass, true); assert.equal(result.assessments[0].physicalThickness, 2.04);
  record.geometry[0].visibleSamples = 0;
  result = assessFocusIndicator(record);
  assert.equal(result.pass, false); assert.equal(result.assessments[0].reason, 'indicator-clipped-or-obscured');
});

test('scale change, skew, rotation, reflection, ancestor scale and missing old scale remain unsupported', () => {
  for (const mutate of [r => r.before.effects[0].transform = 'matrix(1.01,0,0,1.01,0,0)',
    r => { for (const x of [r.before, r.after]) x.effects[0].transform = 'matrix(1.02,.1,0,1.02,0,0)'; },
    r => { for (const x of [r.before, r.after]) x.effects[0].transform = 'matrix(0,1,-1,0,0,0)'; },
    r => { for (const x of [r.before, r.after]) x.effects[0].transform = 'matrix(-1.02,0,0,-1.02,0,0)'; },
    r => r.after.effects.push({ transform: 'matrix(1.02,0,0,1.02,0,0)', perspective: 'none', zoom: '1' }),
    r => delete r.before.effects, r => r.after.effects[0].zoom = '1.02', r => delete r.after.effects[0].transform]) {
    const record = scaled(evidence({ outlineStyle: 'solid', outlineWidth: '2px' })); mutate(record);
    assert.equal(assessFocusIndicator(record).reason, 'transformed-indicator-geometry');
  }
});

test('uniform scale cannot reuse unscaled, mismatched or union-fragment geometry', () => {
  for (const mutate of [r => delete r.geometry[0].scale, r => r.geometry[0].scale.x = 1,
    r => r.geometry[0].scale.y = 1, r => r.geometry[0].scale.source = 'guessed',
    r => r.geometry[0].fragmentCount = 2, r => r.geometry[0].model = 'union']) {
    const record = scaled(evidence({ outlineStyle: 'solid', outlineWidth: '2px' })); mutate(record);
    assert.equal(assessFocusIndicator(record).reason, 'scaled-indicator-geometry-mismatch');
  }
  const multiple = fragmented(scaled(evidence({ outlineStyle: 'solid', outlineWidth: '2px' })));
  assert.equal(assessFocusIndicator(multiple).reason, 'transformed-indicator-geometry');
});

test('physical thickness gates use the scale instead of untransformed CSS widths', () => {
  const small = assessFocusIndicator(scaled(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }), .4));
  assert.equal(small.pass, false); assert.equal(small.assessments[0].physicalThickness, .8);
  const pair = { outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white,
    boxShadow: `${black} 0px 0px 0px 2px` };
  const reduced = assessFocusIndicator(scaled(evidence(pair, {}, 'rgb(128,128,128)'), .75));
  assert.equal(reduced.twoColor, null);
  const expanded = assessFocusIndicator(scaled(evidence(pair, {}, 'rgb(128,128,128)')));
  assert.equal(expanded.twoColor.method, 'w3c-c40-two-color-solid-backdrop');
  assert(expanded.assessments.every(x => x.physicalThickness === 2.04));
});

test('a constant uniform scale with fixed translation permits translated ancestors only', () => {
  const record = scaled(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }));
  for (const snapshot of [record.before, record.after]) {
    snapshot.effects[0].transform = 'matrix(1.02,0,0,1.02,7,-4)';
    snapshot.effects.push({ transform: 'matrix(1,0,0,1,-12,30)', perspective: 'none', zoom: '1' });
  }
  assert.equal(assessFocusIndicator(record).pass, true);
  record.after.effects[0].transform = 'matrix(1.02,0,0,1.02,7,-3)';
  assert.equal(assessFocusIndicator(record).reason, 'transformed-indicator-geometry');
});

function atomic(record) {
  record.id = 'focus-1';
  record.after.rect = { x: 10, y: 20, width: 100, height: 40, top: 20, right: 110, bottom: 60, left: 10 };
  record.after.pendingFiniteAnimations = 0;
  record.measurementConsistency = { stable: true, sourceId: record.id, stableFrames: 2,
    matchingStyles: true, finalRect: { ...record.after.rect } };
  for (const g of record.geometry) Object.assign(g, { sourceId: record.id, sourceRect: { ...record.after.rect },
    sourceStyle: { ...record.after.style } });
  return record;
}

test('atomic measurement binds painted styles and sampled geometry to the same element and rect', () => {
  const result = assessFocusIndicator(atomic(evidence({ outlineStyle: 'solid', outlineWidth: '2px' })));
  assert.equal(result.pass, true);
});

test('explicitly unstable observations cannot pass or become missing-baseline retry candidates', () => {
  const record = atomic(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }));
  record.measurementConsistency.stable = false;
  assert.equal(assessFocusIndicator(record).reason, 'unstable-focus-geometry');
  record.before = null;
  assert.equal(assessFocusIndicator(record).reason, 'unstable-focus-geometry');
});

test('atomic mismatched source ID, scroll position, style, frames or animation state fail closed', () => {
  for (const mutate of [r => r.geometry[0].sourceId = 'focus-2', r => r.geometry[0].sourceRect.top++,
    r => r.geometry[0].sourceStyle.outlineWidth = '4px', r => delete r.geometry[0].sourceStyle,
    r => r.measurementConsistency.sourceId = 'focus-2', r => r.measurementConsistency.finalRect.y++,
    r => r.measurementConsistency.matchingStyles = false, r => r.measurementConsistency.stableFrames = 1,
    r => r.after.pendingFiniteAnimations = 1, r => r.geometry[0].sourceRect.x = NaN]) {
    const record = atomic(evidence({ outlineStyle: 'solid', outlineWidth: '2px' })); mutate(record);
    assert.equal(assessFocusIndicator(record).reason, 'focus-geometry-evidence-mismatch');
  }
});

test('new source fields without their consistency proof cannot fall back to legacy fixtures', () => {
  const record = atomic(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }));
  delete record.measurementConsistency;
  assert.equal(assessFocusIndicator(record).reason, 'unstable-focus-geometry');
  assert.equal(assessFocusIndicator(evidence({ outlineStyle: 'solid', outlineWidth: '2px' })).pass, true);
});

test('stable atomic after evidence can preserve a genuinely absent before observation', () => {
  const record = atomic(evidence({ outlineStyle: 'solid', outlineWidth: '2px' }));
  record.before = null; record.geometry = [];
  assert.equal(assessFocusIndicator(record).reason, 'missing-focus-evidence');
});

test('atomic band evidence cannot omit or duplicate a source-matched band', () => {
  const make = () => atomic(evidence({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px', outlineColor: white,
    boxShadow: `${black} 0px 0px 0px 2px` }));
  const missing = make(); missing.geometry.pop();
  assert.equal(assessFocusIndicator(missing).reason, 'focus-geometry-evidence-mismatch');
  const duplicate = make(); duplicate.geometry[1] = { ...duplicate.geometry[0] };
  assert.equal(assessFocusIndicator(duplicate).reason, 'focus-geometry-evidence-mismatch');
});
