import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectShareSource } from '../qa-share-coverage.mjs';

test('comments and string examples are not live share components', () => {
  const source = inspectShareSource('// <ShareButtons />\nconst example = "<ShareSection />"; export default () => <p>{example}</p>;');
  assert.deepEqual(source.markers, []);
});
test('static and lazy imports are followed while JSX markers are collected', () => {
  const source = inspectShareSource('import Panel from "./Panel"; const lazy = () => import("./Later"); export default () => <ResultSharePanel><ShareButtons /></ResultSharePanel>;');
  assert.deepEqual(source.imports, ['./Panel', './Later']);
  assert.deepEqual(source.markers, ['ResultSharePanel', 'ShareButtons']);
});
test('custom native share and clipboard calls are candidates, not verified delivery', () => {
  assert.equal(inspectShareSource('navigator.share({url: "/"})').custom, true);
  assert.equal(inspectShareSource('navigator.clipboard.writeText("/")').custom, true);
  assert.equal(inspectShareSource('trackShare("copy")').custom, false);
});
