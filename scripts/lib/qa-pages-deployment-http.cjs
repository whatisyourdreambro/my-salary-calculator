'use strict';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Shared with ESM deployment inspection scripts.
const { QA_USER_AGENT, isAllowedQaRequest } = require('./qa-safety.cjs');

const PROJECT = 'my-salary-calculator';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const COMMIT = /^[0-9a-f]{40}$/;
const DEPLOYMENT_ORIGIN = /^https:\/\/[0-9a-f]{8}\.my-salary-calculator\.pages\.dev\/?$/;
const PATH_ORIGIN = 'http://127.0.0.1';
const HEADER_NAMES = new Set(['accept', 'cache-control', 'if-none-match', 'if-modified-since', 'user-agent', 'x-moneysalary-qa-run']);
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const fail = message => { throw new Error(`[qa-pages-http] ${message}`); };

// The caller obtains this record from the authenticated deployment API. This
// helper never accesses account credentials and does not trust a pasted URL or
// a mutable branch alias. Pin all three identifiers separately from the record.
function validatePagesDeployment(record, { expectedDeploymentId, expectedCommitHash, expectedBranch, productionBranch } = {}) {
  const deployment = record?.success === true ? record.result : record;
  if (!UUID.test(expectedDeploymentId || '') || !COMMIT.test(expectedCommitHash || '')
      || typeof expectedBranch !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/.test(expectedBranch)
      || typeof productionBranch !== 'string' || !productionBranch || expectedBranch === productionBranch)
    fail('Explicit deployment UUID, full commit hash, preview branch and distinct production branch are required.');
  if (record?.success === false || !deployment || deployment.id !== expectedDeploymentId
      || deployment.project_name !== PROJECT || deployment.environment !== 'preview'
      || deployment.is_skipped !== false || deployment.deployment_trigger?.metadata?.commit_dirty !== false
      || deployment.latest_stage?.name !== 'deploy' || deployment.latest_stage?.status !== 'success'
      || deployment.deployment_trigger?.metadata?.branch !== expectedBranch
      || deployment.deployment_trigger?.metadata?.commit_hash !== expectedCommitHash)
    fail('The API record must identify the expected successful preview deployment, project, branch and commit.');
  if (typeof deployment.url !== 'string' || !DEPLOYMENT_ORIGIN.test(deployment.url))
    fail('Only the API deployment URL with one eight-hex deployment hostname is permitted.');
  if (deployment.short_id !== new URL(deployment.url).hostname.split('.')[0])
    fail('The API short deployment ID must match its deployment URL.');
  return Object.freeze({ deploymentId: expectedDeploymentId, commitHash: expectedCommitHash,
    branch: expectedBranch, origin: new URL(deployment.url).origin });
}

function assertTarget(value, origin, method) {
  if (typeof value !== 'string' || value !== value.trim() || /[\\\u0000-\u0020\u007f]/.test(value)
      || value.startsWith('//') || !['GET', 'HEAD'].includes(method))
    fail('Only document GET/HEAD URLs without ambiguous whitespace or separators are permitted.');
  let url;
  try { url = new URL(value, origin); } catch { fail('Invalid deployment document URL.'); }
  if (url.origin !== origin || url.username || url.password || url.hash)
    fail('The request must stay on the single pinned deployment origin without credentials or fragments.');
  let decoded = url.pathname;
  try {
    for (let i = 0; i < 3; i++) {
      if (/%(?:2f|5c|2e)/i.test(decoded)) fail('Encoded separators and dots are not permitted.');
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch { fail('Malformed or ambiguous encoded document path.'); }
  if (/%|[\\\u0000-\u0020\u007f]/.test(decoded) || decoded.includes('//')
      || !isAllowedQaRequest(new URL(url.pathname + url.search, PATH_ORIGIN).href, PATH_ORIGIN, method))
    fail('Advertising, analytics, proxy or ambiguous paths are forbidden.');
  if (/^\/(?:_next|_msy)(?:\/|$)/i.test(decoded)
      || (/^\/api(?:\/|$)/i.test(decoded) && decoded !== '/api/og'))
    fail('Private assets, browser subresources and APIs other than the OG image are forbidden.');
  // Extensionless page/widget documents, HTML verification documents, sitemap,
  // feed and text documents only. Do not turn this into an asset downloader.
  const filename = decoded.split('/').at(-1);
  if (filename.includes('.') && !/\.(?:html|txt|xml)$/i.test(filename))
    fail('Only HTML, text/XML documents and the exact OG PNG endpoint are permitted.');
  return url.href;
}

function safeRequestOptions(options = {}) {
  if (!options || typeof options !== 'object'
      || Object.keys(options).some(key => !['method', 'headers', 'timeoutMs'].includes(key)))
    fail('Only method, public headers and a bounded timeout may be supplied.');
  const method = String(options.method || 'GET').toUpperCase();
  const timeoutMs = options.timeoutMs ?? 15000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000)
    fail('timeoutMs must be an integer from 1 through 30000.');
  const headers = new Headers(options.headers);
  for (const [name] of headers) if (!HEADER_NAMES.has(name))
    fail('Authentication, cookie, routing and other non-public request headers are forbidden.');
  const runId = headers.get('x-moneysalary-qa-run');
  if (runId !== null && !/^[A-Za-z0-9._-]{1,96}$/.test(runId)) fail('Invalid public QA run identifier.');
  headers.set('user-agent', QA_USER_AGENT);
  return { method, headers, redirect: 'manual', credentials: 'omit', signal: AbortSignal.timeout(timeoutMs) };
}

function createPagesDeploymentQaClient(record, options = {}) {
  const deployment = validatePagesDeployment(record, options);
  const fetchFn = options.fetchFn ?? globalThis.fetch;
  const maxRequests = options.maxRequests ?? 64;
  if (typeof fetchFn !== 'function' || !Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 500)
    fail('A fetch implementation and a request budget from 1 through 500 are required.');
  let attemptedRequests = 0;
  return Object.freeze({
    ...deployment,
    get attemptedRequests() { return attemptedRequests; },
    assertTarget(value, method = 'GET') { return assertTarget(value, deployment.origin, String(method).toUpperCase()); },
    async fetchDocument(value, requestOptions = {}) {
      const init = safeRequestOptions(requestOptions);
      const url = assertTarget(value, deployment.origin, init.method);
      if (attemptedRequests >= maxRequests) fail('The fixed request budget is exhausted; no automatic retry is permitted.');
      attemptedRequests++;
      // No body, browser, redirect following, credentials or automatic retry.
      return fetchFn(url, init);
    },
  });
}

// Optional bounded inspection. Returning bytes does not render HTML, execute JS,
// resolve embedded URLs, or follow a Location header. Keep saved HTML out of browsers.
async function readPagesQaBody(response, { maxBytes = 8 * 1024 * 1024, kind = 'document' } = {}) {
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 16 * 1024 * 1024
      || !['document', 'png'].includes(kind)) fail('Invalid response inspection bounds.');
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (kind === 'png' ? contentType !== 'image/png'
    : !['text/html', 'text/plain', 'text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'].includes(contentType))
    fail('The response does not have the expected document or PNG content type.');
  const declaredLength = response.headers.get('content-length');
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > maxBytes))
    fail('Response Content-Length exceeds the inspection bound or is invalid.');
  const reader = response.body?.getReader();
  const parts = [];
  let length = 0;
  if (reader) try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        void reader.cancel('QA response size limit').catch(() => {});
        fail('Response stream exceeds the inspection bound.');
      }
      parts.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
  if (kind === 'png' && PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) fail('Invalid PNG signature.');
  return bytes;
}

module.exports = { QA_USER_AGENT, validatePagesDeployment, createPagesDeploymentQaClient, readPagesQaBody };
