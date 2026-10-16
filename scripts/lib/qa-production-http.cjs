'use strict';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Shared by CommonJS/ESM/TypeScript maintenance scripts.
const { QA_USER_AGENT, isAllowedQaRequest } = require('./qa-safety.cjs');

const CANONICAL_PRODUCTION_ORIGIN = 'https://www.moneysalary.com';
const PATH_CHECK_ORIGIN = 'http://127.0.0.1';

// This grants only non-rendering public document requests. The browser helper
// remains loopback-only; never pass this origin to a browser launcher.
function assertProductionQaTarget(value, method = 'GET') {
  let url;
  try { url = new URL(value); } catch { throw new Error('[qa-http] An absolute canonical production URL is required.'); }
  if (url.origin !== CANONICAL_PRODUCTION_ORIGIN || url.username || url.password || url.hash
      || !['GET', 'HEAD'].includes(method.toUpperCase())) {
    throw new Error('[qa-http] Only canonical HTTPS production GET/HEAD documents without credentials or fragments are permitted.');
  }
  // Reuse the exact encoded-path/proxy deny rules without widening the browser
  // helper's origin allowlist. The input host has already been checked above.
  const pathTarget = new URL(url.pathname + url.search, PATH_CHECK_ORIGIN);
  if (!isAllowedQaRequest(pathTarget.href, PATH_CHECK_ORIGIN, method)) {
    throw new Error('[qa-http] Advertising, analytics, proxy or ambiguous paths are forbidden.');
  }
  return url.href;
}

function assertProductionQaOrigin(value = CANONICAL_PRODUCTION_ORIGIN) {
  const url = new URL(assertProductionQaTarget(value));
  if (url.pathname !== '/' || url.search) throw new Error('[qa-http] The origin must not include a path or query.');
  return url.origin;
}

async function fetchProductionQaDocument(value, { method = 'GET', headers, timeoutMs = 15000, fetchFn = globalThis.fetch } = {}) {
  const target = assertProductionQaTarget(value, method);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new Error('[qa-http] timeoutMs must be an integer from 1 to 30000.');
  }
  const safeHeaders = new Headers(headers);
  for (const name of ['authorization', 'proxy-authorization', 'cookie', 'host']) {
    if (safeHeaders.has(name)) throw new Error('[qa-http] Public QA requests cannot include authentication or host override headers.');
  }
  if (!safeHeaders.get('user-agent')?.includes(QA_USER_AGENT)) {
    safeHeaders.set('user-agent', `${safeHeaders.get('user-agent') || 'Mozilla/5.0'} ${QA_USER_AGENT}`);
  }
  // Inspect redirects as responses; following even a same-origin redirect could
  // reach a telemetry proxy before another validation pass. No retries here.
  return fetchFn(target, {
    method: method.toUpperCase(), headers: safeHeaders, redirect: 'manual',
    credentials: 'omit', signal: AbortSignal.timeout(timeoutMs),
  });
}

module.exports = { QA_USER_AGENT, CANONICAL_PRODUCTION_ORIGIN, assertProductionQaTarget, assertProductionQaOrigin, fetchProductionQaDocument };
