// Static file contract only: reads the tracked repository copy, no network or browser.
// Owner approval 2026-11-18 (owner-questions-2026-11-18b.md F, N2-infra-05 optional part): the tracked
// Claude settings deny WebFetch on the production hosts, as a second guard for the 2026-10-16 rule that
// agent inspections make no live ad or analytics requests (AGENTS.md). The three built-in browser entries
// removed in 07a90d81f must stay out of the allow list.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const settings = JSON.parse(readFileSync(new URL('../../.claude/settings.local.json', import.meta.url), 'utf8'));

test('.claude/settings.local.json denies WebFetch on exactly the two production hosts', () => {
  assert.deepEqual(settings.permissions.deny, [
    'WebFetch(domain:moneysalary.com)',
    'WebFetch(domain:www.moneysalary.com)',
  ]);
});

test('.claude/settings.local.json does not pre-approve the built-in browser navigation, page JavaScript or preview', () => {
  assert.ok(Array.isArray(settings.permissions.allow));
  for (const entry of ['mcp__Claude_Browser__navigate', 'mcp__Claude_Browser__javascript_tool', 'mcp__Claude_Browser__preview_start']) {
    assert.ok(!settings.permissions.allow.includes(entry), `${entry} must not be in permissions.allow`);
  }
});
