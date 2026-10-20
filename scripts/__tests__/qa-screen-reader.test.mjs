import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCommand } from '../qa-screen-reader.mjs';

test('screen-reader controller permits only fixed local scenarios and evidence labels', () => {
  assert.deepEqual(validateCommand({ id: 1, action: 'open', route: '/tools/loan' }),
    { id: 1, action: 'open', route: '/tools/loan' });
  assert.equal(validateCommand({ id: 2, action: 'checkpoint', label: 'loan-error' }).action, 'checkpoint');
  assert.equal(validateCommand({ id: 3, action: 'stop' }).action, 'stop');
  for (const route of ['https://www.moneysalary.com/', '//example.invalid/', '/adgk/', '/g/collect', '/?ads=on']) {
    assert.throws(() => validateCommand({ id: 1, action: 'open', route }), /Unapproved/);
  }
  for (const command of [{ id: 0, action: 'stop' }, { id: 1, action: 'eval', code: 'anything' },
    { id: 1, action: 'checkpoint', label: '../escape' }, { id: 1, action: 'stop', route: '/' },
    { id: 1, action: 'open', route: '/', script: 'anything' }]) {
    assert.throws(() => validateCommand(command));
  }
});
