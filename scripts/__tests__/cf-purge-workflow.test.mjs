import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { parse } from 'yaml';

const workflow = parse(readFileSync(new URL('../../.github/workflows/cf-purge.yml', import.meta.url), 'utf8'));

test('purge is dispatch-only, defaults to Pages, and never infers a legacy Workers release tag from the selected commit', () => {
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch']);
  const inputs = workflow.on.workflow_dispatch.inputs;
  assert.equal(inputs.target.default, 'pages');
  assert.deepEqual(inputs.target.options, ['pages', 'workers']);
  const env = workflow.jobs.purge.env;
  assert.equal(env.CF_DEPLOY_TARGET, "${{ inputs.target || 'pages' }}");
  assert.equal(env.CF_RELEASE_TAG, '${{ inputs.release_tag }}');
  assert.equal(env.CF_EXPECTED_VERSION_ID, '${{ inputs.expected_version_id }}');
  assert.equal(env.CF_PAGES_COMMIT_SHA, '${{ inputs.release_sha || github.sha }}');
});

test('actual workflow validation rejects missing or malformed Workers identities before any credential or API step', () => {
  const first = workflow.jobs.purge.steps[0];
  const source = /^node --input-type=module <<'NODE'\n([\s\S]+)\nNODE\s*$/.exec(first.run)?.[1];
  assert.ok(source, 'execute the actual workflow validator with Node, no shell or network');
  const valid = { CF_DEPLOY_TARGET: 'workers', CF_RELEASE_TAG: 'release-2026-10-17-a', CF_EXPECTED_VERSION_ID: '12345678-1234-1234-1234-123456789abc' };
  const validate = overrides => spawnSync(process.execPath, ['--input-type=module'], {
    input: source, encoding: 'utf8', env: { ...valid, ...overrides }, timeout: 5000,
  });
  assert.equal(validate({}).status, 0);
  for (const overrides of [
    { CF_RELEASE_TAG: '' }, { CF_RELEASE_TAG: '  ' }, { CF_RELEASE_TAG: 'tag/invalid' },
    { CF_EXPECTED_VERSION_ID: '' }, { CF_EXPECTED_VERSION_ID: '12345678' },
    { CF_EXPECTED_VERSION_ID: `${valid.CF_EXPECTED_VERSION_ID} extra` }, { CF_DEPLOY_TARGET: 'unexpected' },
  ]) assert.notEqual(validate(overrides).status, 0, JSON.stringify(overrides));
  assert.equal(validate({ CF_DEPLOY_TARGET: 'pages', CF_RELEASE_TAG: '', CF_EXPECTED_VERSION_ID: '' }).status, 0,
    'explicit Pages rollback does not require unrelated Workers identifiers');
});
