// Public build identity only. No runtime bindings, credentials or API claims.
export const NATIVE_RELEASE_PATH = '/.well-known/moneysalary-release.json';
export const NATIVE_RELEASE_SCHEMA = 'moneysalary-native-pages-release-v1';
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const id = value => Number.isSafeInteger(value) && value > 0;

export function validateNativeRelease(value) {
  if (!exactKeys(value, ['schema', 'schemaVersion', 'mode', 'adsDisabled', 'commit', 'branch', 'buildId',
    'sourceHash', 'lockHash', 'publicConfigHash', 'sitemapSha256', 'ci', 'approval'])
    || value.schema !== NATIVE_RELEASE_SCHEMA || value.schemaVersion !== 1
    || value.mode !== 'production' || value.adsDisabled !== false || !SHA.test(value.commit)
    || value.branch !== 'codex/pages-production' || !/^[A-Za-z0-9_-]{1,128}$/.test(value.buildId)
    || ['sourceHash', 'lockHash', 'publicConfigHash', 'sitemapSha256'].some(key => !HASH.test(value[key]))
    || !exactKeys(value.ci, ['runId', 'jobId']) || !id(value.ci.runId) || !id(value.ci.jobId)
    || !exactKeys(value.approval, ['runId', 'actor']) || !id(value.approval.runId)
    || value.approval.actor !== 'whatisyourdreambro') throw new Error('Invalid native Pages release identity');
  return value;
}
