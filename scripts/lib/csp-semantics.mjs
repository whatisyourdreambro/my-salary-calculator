// Offline CSP Level 3 source matching for tests and publication gates.
// Pure string/URL logic: it never fetches, renders or executes anything.
// Rules follow https://www.w3.org/TR/CSP3/ (directive fallback lists and source matching).
const FALLBACK = Object.freeze({
  'script-src-elem': ['script-src-elem', 'script-src', 'default-src'],
  'script-src-attr': ['script-src-attr', 'script-src', 'default-src'],
  'script-src': ['script-src', 'default-src'],
  'worker-src': ['worker-src', 'child-src', 'script-src', 'default-src'],
  'frame-src': ['frame-src', 'child-src', 'default-src'],
  'style-src-elem': ['style-src-elem', 'style-src', 'default-src'],
  'style-src-attr': ['style-src-attr', 'style-src', 'default-src'],
  // Navigation-style directives have no default-src fallback.
  'form-action': ['form-action'],
  'frame-ancestors': ['frame-ancestors'],
  'base-uri': ['base-uri'],
});
const NETWORK_SCHEMES = new Set(['http', 'https', 'ws', 'wss']);
const DEFAULT_PORTS = Object.freeze({ http: '80', https: '443', ws: '80', wss: '443' });

/** Directive name -> source list. Duplicate directives are ignored (first wins). */
export function parseCsp(policy) {
  const map = new Map();
  for (const part of String(policy).split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/).filter(Boolean);
    if (name && !map.has(name.toLowerCase())) map.set(name.toLowerCase(), sources);
  }
  return map;
}

// CSP3 scheme-part matching: expression scheme A may match URL scheme B.
function schemeMatch(a, b) {
  return a === b || (a === 'http' && b === 'https') || (a === 'ws' && ['wss', 'http', 'https'].includes(b))
    || (a === 'wss' && b === 'https');
}

function percentDecode(piece) {
  try { return decodeURIComponent(piece); } catch { return piece; }
}

// CSP3 path-part matching for a request that has not been redirected. Paths stay case-sensitive.
function pathMatches(pathPart, path) {
  if (!pathPart) return true;
  const exact = !pathPart.endsWith('/');
  const expected = pathPart.split('/');
  const actual = path.split('/');
  if (expected.length > actual.length || (exact && expected.length !== actual.length)) return false;
  if (!exact) expected.pop();
  return expected.every((piece, index) => percentDecode(piece) === percentDecode(actual[index]));
}

function sourceMatches(expression, url, self) {
  const e = expression.toLowerCase();
  const scheme = url.protocol.slice(0, -1);
  // 'self' never matches blob:, data: or other local schemes, even though
  // WHATWG URL reports a blob: URL's creator origin. Same host and port may upgrade to https/wss.
  if (e === "'self'") {
    if (!NETWORK_SCHEMES.has(scheme)) return false;
    if (url.origin === self.origin) return true;
    return url.hostname === self.hostname && url.port === self.port
      && (['https', 'wss'].includes(scheme) || (self.protocol === 'http:' && ['http', 'ws'].includes(scheme)));
  }
  if (e.startsWith("'")) return false; // keywords, nonces and hashes are not URL matches
  if (e === '*') return ['http', 'https'].includes(scheme) || scheme === self.protocol.slice(0, -1);
  const schemeOnly = /^([a-z][a-z0-9+.-]*):$/.exec(e);
  if (schemeOnly) return schemeMatch(schemeOnly[1], scheme);
  const m = /^(?:([a-z][a-z0-9+.-]*):\/\/)?(\*|\*\.[^:/]+|[^:/*]+)(?::(\d+|\*))?(\/.*)?$/i.exec(expression);
  if (!m || !NETWORK_SCHEMES.has(scheme)) return false;
  const [, sourceScheme, sourceHost, port, pathPart] = m;
  if (!schemeMatch((sourceScheme || self.protocol.slice(0, -1)).toLowerCase(), scheme)) return false;
  const host = sourceHost.toLowerCase();
  const hostname = url.hostname.toLowerCase();
  if (host !== '*' && (host.startsWith('*.') ? !hostname.endsWith(host.slice(1)) : hostname !== host)) return false;
  const actualPort = url.port || DEFAULT_PORTS[scheme];
  if (!(port === '*' || (port ? port === actualPort : actualPort === DEFAULT_PORTS[scheme]))) return false;
  return pathMatches(pathPart, url.pathname);
}

/** Effective source list for a directive after CSP fallback; null means unrestricted. */
export function effectiveSources(policy, directive) {
  const map = parseCsp(policy);
  const name = (FALLBACK[directive] || [directive, 'default-src']).find(candidate => map.has(candidate));
  return name ? map.get(name) : null;
}

export function cspAllows(policy, directive, href, { self = 'https://www.moneysalary.com' } = {}) {
  const sources = effectiveSources(policy, directive);
  if (sources === null) return true;
  const url = new URL(href);
  return sources.some(expression => sourceMatches(expression, url, new URL(self)));
}

// The three requests the publication gates have always required, now evaluated with
// CSP semantics instead of literal host spelling: explicit hosts and scheme sources
// both pass, the closed QA policy fails.
export const ORDINARY_AD_REQUESTS = Object.freeze([
  ['script-src-elem', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'],
  ['script-src-elem', 'https://www.googletagmanager.com/gtag/js'],
  ['frame-src', 'https://googleads.g.doubleclick.net/pagead/ads'],
]);
export function allowsOrdinaryAdvertising(policy) {
  return ORDINARY_AD_REQUESTS.every(([directive, href]) => cspAllows(policy, directive, href));
}
