// A small Pages policy layer. Documents are build artifacts, never Next server renders.
// All asset reads use the local Pages binding; user URLs never become outbound fetches.
import { NATIVE_RELEASE_PATH, validateNativeRelease } from './pages-native-release.mjs';
const ALLOWED_BOTS = /(Googlebot|AdsBot-Google|Mediapartners-Google|Google-InspectionTool|Bingbot|NaverBot|Yeti|Daum|DuckDuckBot|Applebot|FacebookExternalHit|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|KakaoTalk-scrap|ClaudeBot|PerplexityBot|GPTBot|Google-Extended|cohere-ai|anthropic-ai|Amazonbot)/i;
const BAD_BOTS = /(SemrushBot|AhrefsBot|MJ12bot|Bytespider|DotBot|PetalBot|SeznamBot|YandexBot|BLEXBot|DataForSeoBot|SerpstatBot|MegaIndex|Barkrowler|ZoominfoBot|ImagesiftBot|MauiBot|SerendeputyBot)/i;
const SUSPICIOUS_UA = /^(curl|python-requests|Go-http-client|libwww-perl|Java\/|node-fetch|axios|okhttp|aiohttp|HTTrack|wget|scrapy|httpx)/i;
const MIDDLEWARE_EXEMPT = /^\/(?:_next\/static|_next\/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|rss-companies.xml|insights\/[a-z0-9-]+\/data.csv|insights\/[a-z0-9-]+\/data.json|api\/og|opengraph-image|naver226c8e8c348e204e98efbcf23514d286.html)/;
const PRIVATE = 'private, no-store';
const ENGLISH_MISSING = '/en/page-unavailable';

function encodedPath(pathname) {
  try {
    const decoded = decodeURIComponent(pathname);
    if (/[\\\u0000-\u0020\u007f?#]/.test(decoded) || decoded.split('/').some(p => p === '.' || p === '..')) return null;
    // Encoded separators may not become a different route after validation.
    if (/%(?:2f|5c)/i.test(pathname)) return null;
    return decoded.split('/').map(encodeURIComponent).join('/');
  } catch { return null; }
}

function compileRules(rules = []) {
  return rules.map(rule => ({ ...rule, match: new RegExp(rule.regex, rule.flags || 'i') }));
}

function pairs(headers) {
  return Array.isArray(headers) ? headers.map(h => [h.key, h.value]) : Object.entries(headers || {});
}

function redirectTarget(rule, path, requestUrl) {
  const matched = rule.match.exec(path);
  if (!matched) return null;
  const params = {};
  for (const [i, key] of (rule.keys || []).entries()) params[typeof key === 'string' ? key : key.name] = matched[i + 1] || '';
  const destination = rule.destination.replace(/:([A-Za-z0-9_]+)(?:[?*+])?/g, (token, key) => Object.hasOwn(params, key) ? params[key] : token);
  const url = new URL(destination, requestUrl);
  // Next redirects retain the original query unless the destination overrides a key.
  for (const [key, value] of new URL(requestUrl).searchParams) if (!url.searchParams.has(key)) url.searchParams.append(key, value);
  return url;
}

function legacyKoreanPath(path, routes) {
  const found = /^\/(glossary|qna)\/([^/]+)$/.exec(path);
  if (!found) return null;
  const candidates = [found[2]];
  for (let i = 0; i < 2; i++) {
    try {
      const value = decodeURIComponent(candidates.at(-1));
      if (value === candidates.at(-1)) break;
      candidates.push(value);
    } catch { break; }
  }
  for (const value of [...candidates]) {
    if (!Array.from(value).every(c => c.charCodeAt(0) <= 255) || !/[\u0080-\u00ff]/.test(value)) continue;
    try { candidates.push(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(value, c => c.charCodeAt(0)))); }
    catch { /* A malformed legacy spelling is not an alias. */ }
  }
  for (const value of candidates) {
    let slug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (found[1] === 'qna') slug = slug.slice(0, 60);
    const candidate = `/${found[1]}/${encodeURIComponent(slug)}`;
    if (Object.hasOwn(routes, candidate)) return candidate;
  }
  return null;
}

/** All dependencies are injected so fixtures exercise the real routing policy offline. */
export function createPagesHandler(manifest, { dynamic, salaryRedirect, share, og } = {}) {
  if (manifest.version !== 1 && manifest.schemaVersion !== 1) throw new Error('Unsupported Pages manifest');
  const routes = manifest.routes;
  if (!routes || !Object.keys(routes).length) throw new Error('Missing Pages routes');
  const headerRules = compileRules(manifest.headers);
  const redirectRules = compileRules(manifest.redirects);
  const publicAssets = new Set(manifest.publicAssets || []);
  const nativeRelease = manifest.nativeRelease === undefined ? null : validateNativeRelease(manifest.nativeRelease);
  if (nativeRelease && (manifest.mode !== 'production' || nativeRelease.buildId !== manifest.buildId))
    throw new Error('Native release identity does not match this Pages build');

  function policyHeaders(path) {
    const headers = new Headers();
    for (const rule of headerRules) if (rule.match.test(path)) for (const [key, value] of pairs(rule.headers)) headers.set(key, value);
    if (manifest.mode === 'qa') headers.set('X-MoneySalary-QA', 'ads-disabled');
    headers.set('X-MoneySalary-Build', manifest.buildId);
    return headers;
  }
  function respond(response, path, { route, privateResponse = false, noindex = false, head = false } = {}) {
    const headers = new Headers(response.headers);
    for (const [key, value] of policyHeaders(path)) {
      if (route || !headers.has(key)) headers.set(key, value);
    }
    for (const [key, value] of pairs(route?.headers)) if (!key.toLowerCase().startsWith('x-next-')) headers.set(key, value);
    if (route?.contentType) headers.set('Content-Type', route.contentType);
    // Origin cache metadata must never turn errors or personal inputs into public documents.
    const status = route?.status || response.status;
    if (privateResponse || status >= 400 || response.headers.has('set-cookie')) {
      headers.set('Cache-Control', PRIVATE);
      headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
      headers.set('CDN-Cache-Control', 'no-store');
    }
    if (noindex) headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(head ? null : response.body, { status, headers });
  }
  function error(message, status, path, head = false) {
    return respond(new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }), path, { privateResponse: true, head });
  }
  async function asset(request, env, assetPath) {
    // Catch-all Next chunks contain literal "..." inside a filename. Reject
    // traversal segments (including encoded ones), not those ordinary names.
    if (typeof assetPath !== 'string' || !assetPath.startsWith('/') || assetPath.startsWith('//') || encodedPath(assetPath) === null || /[?#\\]/.test(assetPath)) throw new Error('Unsafe manifest asset path');
    const url = new URL(request.url);
    url.pathname = assetPath;
    url.search = '';
    return env.ASSETS.fetch(new Request(url, { method: 'GET', headers: { Accept: '*/*' } }));
  }
  async function missing(request, env, path) {
    const english = path === '/en' || path.startsWith('/en/');
    const target = manifest.notFound?.[english ? 'en' : 'ko'];
    const route = typeof target === 'string' ? (routes[target] || { asset: target }) : target;
    if (!route?.asset) return error('Not Found', 404, path, request.method === 'HEAD');
    const found = await asset(request, env, route.asset);
    if (found.status !== 200 && found.status !== 404) return error('Not Found', 404, path, request.method === 'HEAD');
    return respond(new Response(found.body, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }), path,
      { privateResponse: true, noindex: true, head: request.method === 'HEAD' });
  }

  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const head = request.method === 'HEAD';
      if (url.href.length > 8192) return error('URI Too Long', 414, '/', head);
      if (url.hostname === 'moneysalary.com') {
        url.hostname = 'www.moneysalary.com'; url.protocol = 'https:';
        return respond(new Response(null, { status: 301, headers: { Location: url.href } }), url.pathname);
      }
      const path = encodedPath(url.pathname);
      if (!path) return error('Bad Request', 400, '/', head);
      if (path === '/_msy' || path.startsWith('/_msy/')) return error('Not Found', 404, path, head);
      if (path === NATIVE_RELEASE_PATH) {
        if (!['GET', 'HEAD'].includes(request.method)) return respond(new Response(null, { status: 405,
          headers: { Allow: 'GET, HEAD' } }), path, { privateResponse: true, noindex: true });
        if (!nativeRelease || url.search || url.pathname !== NATIVE_RELEASE_PATH)
          return error('Not Found', 404, path, head);
        return respond(new Response(JSON.stringify(nativeRelease), { headers: { 'Content-Type': 'application/json; charset=utf-8' } }),
          path, { privateResponse: true, noindex: true, head });
      }
      if (path.length > 1 && path.endsWith('/')) {
        url.pathname = path.replace(/\/+$/, '');
        return respond(new Response(null, { status: 308, headers: { Location: url.href } }), path);
      }
      for (const rule of redirectRules) {
        const target = redirectTarget(rule, path, request.url);
        if (target) return respond(new Response(null, { status: rule.statusCode || (rule.permanent ? 308 : 307), headers: { Location: target.href } }), path);
      }
      if (!MIDDLEWARE_EXEMPT.test(path)) {
        const ua = request.headers.get('user-agent') || '';
        if (!ALLOWED_BOTS.test(ua) && (!ua || BAD_BOTS.test(ua) || SUSPICIOUS_UA.test(ua))) return error('Forbidden', 403, path, head);
      }
      const salaryTarget = salaryRedirect?.(path);
      const legacyTarget = legacyKoreanPath(url.pathname, routes);
      const target = salaryTarget || (legacyTarget && legacyTarget !== path ? legacyTarget : null);
      if (target) {
        url.pathname = target;
        return respond(new Response(null, { status: 308, headers: { Location: url.href } }), path);
      }
      const handled = await dynamic?.(request, env);
      if (handled) return respond(handled, path, { privateResponse: path === '/api/contact' || path === '/api/feedback', head });
      if (!['GET', 'HEAD'].includes(request.method)) return respond(new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } }), path, { privateResponse: true });
      if (path === '/api/og' && og) return respond(await og(request, env), path, { head });
      if (path.startsWith('/share/') && share) {
        if (!/^\/share\/[^/]+$/.test(path) || path.slice('/share/'.length).length > 2048) return missing(request, env, path);
        // Static-export navigation cannot represent an unbounded token route.
        // An HTML error makes Next fall back to a full document navigation.
        if (path.endsWith('.txt') || request.headers.get('rsc') === '1') return missing(request, env, path);
        const route = routes['/share'];
        if (!route) return error('Share template unavailable', 503, path, head);
        const source = await asset(request, env, route.asset);
        if (source.status !== 200) return error('Share template unavailable', 503, path, head);
        return respond(await share(request, source), path, { privateResponse: true, noindex: true, head });
      }
      const rscPath = path === '/index.txt' ? '/' : path.slice(0, -4);
      const rsc = path.endsWith('.txt') && Object.hasOwn(routes, rscPath) && routes[rscPath].rscAsset;
      const routePath = rsc ? rscPath : path;
      const route = routes[routePath];
      if (route && routePath !== ENGLISH_MISSING) {
        const found = await asset(request, env, rsc ? route.rscAsset : route.asset);
        if (found.status !== 200) return error('Static document unavailable', 503, path, head);
        const response = respond(found, routePath, { route: { ...route, contentType: rsc ? 'text/x-component; charset=utf-8' : route.contentType }, head });
        // Native export payloads have their own .txt URL; never negotiate HTML at
        // the same URL based on RSC headers, which Cloudflare does not vary on.
        if (!rsc && request.headers.get('rsc') === '1') return missing(request, env, path);
        if ((routePath === '/guides' || routePath === '/en/guides') && url.searchParams.get('q')?.trim()) {
          response.headers.set('X-Robots-Tag', 'noindex, follow');
          response.headers.set('Cache-Control', PRIVATE);
          response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
          response.headers.set('CDN-Cache-Control', 'no-store');
        }
        return response;
      }
      // Only build-listed public files are eligible. Packaging controls, source
      // maps and guessed paths never become ASSETS reads based on an extension.
      if (publicAssets.has(path)) {
        const found = await asset(request, env, path);
        if (found.status === 200) return respond(found, path, { head });
      }
      return missing(request, env, path);
    },
  };
}

export function transformShareDocument(request, response, { getModel, renderIsland }) {
  let token = '';
  try { token = decodeURIComponent(new URL(request.url).pathname.slice('/share/'.length)); } catch { /* Invalid model. */ }
  const model = getModel(token);
  const rewriter = new HTMLRewriter();
  // The inert bootstrap belongs inside React's opaque island. Inserting it before
  // the root JSON-LD script would add an unmanaged head node during hydration.
  rewriter.on('[data-pages-share-result]', { element(element) { element.setInnerContent(renderIsland(model), { html: true }); } });
  rewriter.on('title', { element(element) { element.setInnerContent(model.metadataTitle); } });
  rewriter.on('meta', { element(element) {
    const name = element.getAttribute('name') || element.getAttribute('property');
    if (name === 'description' || name === 'og:description' || name === 'twitter:description') element.setAttribute('content', model.metadataDescription);
    if (name === 'og:title' || name === 'twitter:title' || name === 'og:image:alt' || name === 'twitter:image:alt') element.setAttribute('content', model.openGraphTitle);
    if (name === 'og:url' && model.canonicalUrl) element.setAttribute('content', model.canonicalUrl);
    if ((name === 'og:image' || name === 'twitter:image') && model.imageUrl) element.setAttribute('content', model.imageUrl);
    if (name === 'robots') element.setAttribute('content', 'noindex, nofollow');
  } });
  const headers = new Headers(response.headers);
  for (const name of ['etag', 'content-length', 'content-encoding', 'last-modified']) headers.delete(name);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return rewriter.transform(new Response(response.body, { headers }));
}
