'use strict';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS API shared with QA scripts and Lighthouse config.
const http = require('node:http');

// Browser QA is a local, deliberately disconnected exercise. Do not add an
// allow-live escape hatch here: production checks use the HTTP-only health tool.
const QA_USER_AGENT = 'MoneySalary-QA/1.0';
const GUARDED = Symbol('moneysalary.qa.context');
const GUARDED_BROWSER = Symbol('moneysalary.qa.browser');
const GUARDED_PAGE = Symbol('moneysalary.qa.page');
const CREATED_CONTEXT = Symbol('moneysalary.qa.created-context');
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const DENIED_PATH = /^\/(?:adgk|cdn-cgi|pagead|ads?|adsense|analytics|gtm|gtag|ga|collect|g\/collect|j\/collect|track|tracking|beacon|proxy|api\/(?:ads?|adsense|analytics|gtm|gtag|ga|collect|track|tracking|beacon|proxy))(?:[/.;-]|$)/i;

function assertLocalQaTarget(value, name = 'BASE_URL') {
  let url;
  try { url = new URL(value); } catch { throw new Error(`[qa-safety] ${name} must be an absolute loopback URL.`); }
  if (!['http:', 'https:'].includes(url.protocol) || !LOOPBACK_HOSTS.has(url.hostname)
      || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`[qa-safety] ${name} must be a loopback HTTP(S) origin (localhost, 127.0.0.1 or [::1]); live/preview sites are forbidden.`);
  }
  return url.origin;
}

function assertQaEnvironment(env = process.env) {
  if (env.NEXT_PUBLIC_ADS_DISABLED !== '1' || env.MSY_QA_MODE !== '1') {
    throw new Error('[qa-safety] Use npm run qa:run -- <script> with a qa:dev/qa:start server. NEXT_PUBLIC_ADS_DISABLED=1 and MSY_QA_MODE=1 are required.');
  }
}

function isAllowedQaRequest(value, baseURL, method = 'GET') {
  try {
    const base = assertLocalQaTarget(baseURL);
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== base || url.username || url.password
        || !['GET', 'HEAD'].includes(method.toUpperCase())) return false;
    let path = url.pathname;
    // Catch encoded proxy paths too; malformed/ambiguous encodings fail closed.
    for (let i = 0; i < 3; i++) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
    if (/%[0-9a-f]{2}/i.test(path) || /[\\\u0000-\u001f]/.test(path)) return false;
    path = new URL(path.replace(/\/{2,}/g, '/'), base).pathname;
    return !DENIED_PATH.test(path);
  } catch { return false; }
}

function chromiumQaArgs(baseURL, proxyPort) {
  const base = new URL(assertLocalQaTarget(baseURL));
  if (!Number.isInteger(proxyPort) || proxyPort < 1 || proxyPort > 65535) {
    throw new Error('[qa-safety] A running local deny proxy is required.');
  }
  // The owned deny proxy also covers redirects, workers, sockets and browser-internal
  // requests that Playwright routing might not see. Only this local server bypasses it.
  return [
    `--proxy-server=http://127.0.0.1:${proxyPort}`,
    `--proxy-bypass-list=<-loopback>;${base.hostname}:${base.port || (base.protocol === 'https:' ? '443' : '80')}`,
    '--disable-background-networking', '--disable-component-update', '--disable-domain-reliability',
    '--disable-sync', '--no-first-run', '--disable-quic',
    '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
  ];
}

async function fetchQaDocument(value, baseURL, options = {}) {
  const base = assertLocalQaTarget(baseURL);
  if (!isAllowedQaRequest(value, base, options.method || 'GET')) {
    throw new Error('[qa-safety] HTTP QA cannot request an external origin or advertising/analytics proxy.');
  }
  const headers = new Headers(options.headers);
  if (!headers.get('User-Agent')?.includes(QA_USER_AGENT)) {
    headers.set('User-Agent', `${headers.get('User-Agent') || 'Mozilla/5.0'} ${QA_USER_AGENT}`);
  }
  // Non-rendering checks may inspect a redirect but can never follow it.
  return fetch(value, { ...options, headers, redirect: 'manual' });
}

function chromiumQaLaunchOptions(baseURL, options = {}, proxyPort) {
  assertLocalQaTarget(baseURL);
  assertQaEnvironment();
  if (options.headless !== undefined && typeof options.headless !== 'boolean') {
    throw new Error('[qa-safety] headless must be a boolean when specified.');
  }
  if (options.headless === false && process.env.MSY_QA_SCREEN_READER !== '1') {
    throw new Error('[qa-safety] A visible browser requires explicit MSY_QA_SCREEN_READER=1.');
  }
  if (options.proxy || options.ignoreDefaultArgs || options.userDataDir || options.args?.some(arg =>
    /(?:proxy|resolver|host-rules|host-resolver|remote-debugging|user-data-dir|load-extension|disable-extensions-except|webrtc|quic|no-proxy|disable-web-security)/i.test(arg)
    || !arg.startsWith('--'))) {
    throw new Error('[qa-safety] Browser options cannot replace the network guard or open an initial URL/profile.');
  }
  // Screen-reader inspection changes visibility only; all transport/context guards remain mandatory.
  return { ...options, headless: options.headless !== false, args: [...(options.args || []), ...chromiumQaArgs(baseURL, proxyPort)] };
}

async function startQaDenyProxy() {
  const sockets = new Set();
  const server = http.createServer((_request, response) => {
    response.writeHead(403, { 'Content-Type': 'text/plain', Connection: 'close' });
    response.end('External network is disabled during MoneySalary QA.');
  });
  server.on('connect', (_request, socket) => socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'));
  server.on('upgrade', (_request, socket) => socket.destroy());
  server.on('connection', socket => {
    sockets.add(socket);
    // CONNECT removes Node's HTTP-parser error listener. A peer reset must close
    // only that denied socket, not terminate the browser's network guard.
    socket.on('error', () => socket.destroy());
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return { port: server.address().port, close: () => new Promise(resolve => {
    for (const socket of sockets) socket.destroy();
    server.close(resolve);
  }) };
}

function safeRoute(route, baseURL) {
  const request = route.request();
  const permitted = overrides => isAllowedQaRequest(overrides?.url || request.url(), baseURL, overrides?.method || request.method());
  const localFetch = async (overrides = {}) => {
    if (!permitted(overrides)) throw new Error('[qa-safety] A route override attempted a forbidden request.');
    // APIRequestContext normally follows redirects; never let it reach a remote
    // destination or a local telemetry proxy before browser routing sees it.
    return route.fetch({ ...overrides, maxRedirects: 0, maxRetries: 0 });
  };
  const continueLocally = async (overrides = {}) => {
    if (!permitted(overrides)) return route.abort('blockedbyclient');
    let response;
    try {
      response = await localFetch(overrides);
      if (response.status() >= 300 && response.status() < 400) return await route.abort('blockedbyclient');
      return await route.fulfill({ response });
    } catch (error) {
      await route.abort('blockedbyclient').catch(() => {});
      throw error;
    } finally {
      if (response) try { await response.dispose(); } catch (error) {
        // Context shutdown can win the race after fulfill/abort. Suppress only
        // this known Playwright cleanup error; request failures still propagate.
        const closedDuringDispose = error instanceof Error
          && ['TargetClosedError', 'TargetClosedError2'].includes(error.constructor.name)
          && error.message === 'apiResponse.dispose: Target page, context or browser has been closed';
        if (!closedDuringDispose) throw error;
      }
    }
  };
  return new Proxy(route, {
    get(target, key) {
      if (key === 'continue') return continueLocally;
      if (key === 'fetch') return localFetch;
      if (key === 'fallback') return () => { throw new Error('[qa-safety] Route fallback can bypass the QA guard.'); };
      if (key === 'fulfill') return async options => {
        const status = options?.status ?? options?.response?.status?.() ?? 200;
        if (status >= 300 && status < 400) return route.abort('blockedbyclient');
        return route.fulfill(options);
      };
      const value = target[key];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

function guardedHandler(baseURL, handler) {
  return async (route, request = route.request()) => {
    if (!isAllowedQaRequest(request.url(), baseURL, request.method())) return route.abort('blockedbyclient');
    const wrapped = safeRoute(route, baseURL);
    return handler ? handler(wrapped, request) : wrapped.continue();
  };
}

function guardPage(page, baseURL) {
  if (page[GUARDED_PAGE]) return;
  page[GUARDED_PAGE] = true;
  const originalRoute = page.route.bind(page);
  page.route = (url, handler, options) => originalRoute(url, guardedHandler(baseURL, handler), options);
  // Page-specific websocket handlers must not replace the context socket block.
  page.routeWebSocket = () => { throw new Error('[qa-safety] QA WebSocket overrides are forbidden.'); };
}

async function installQaContext(context, baseURL) {
  const base = assertLocalQaTarget(baseURL);
  assertQaEnvironment();
  if (!context[CREATED_CONTEXT]) throw new Error('[qa-safety] Use launchQaBrowser/createQaContext; raw contexts cannot prove service-worker blocking.');
  if (context[GUARDED]) {
    if (context[GUARDED] !== base) throw new Error('[qa-safety] Context cannot switch QA origins.');
    return context;
  }
  if (context.pages().length || context.serviceWorkers?.().length) {
    throw new Error('[qa-safety] Install the guard before creating any page or service worker.');
  }
  const originalRoute = context.route.bind(context);
  await originalRoute('**/*', guardedHandler(base));
  context.route = (url, handler, options) => originalRoute(url, guardedHandler(base, handler), options);
  context.unroute = context.unrouteAll = () => { throw new Error('[qa-safety] The context network guard cannot be removed.'); };
  if (typeof context.routeWebSocket !== 'function') throw new Error('[qa-safety] Playwright with routeWebSocket support is required.');
  await context.routeWebSocket('**/*', socket => socket.close());
  context.routeWebSocket = () => { throw new Error('[qa-safety] The context WebSocket guard cannot be replaced.'); };
  await context.addInitScript(() => {
    Object.defineProperty(window, '__MSY_TEST_MODE__', { value: true, writable: false, configurable: false });
    // createQaContext also blocks workers at browser-context level.
    if (navigator.serviceWorker) Object.defineProperty(navigator.serviceWorker, 'register', {
      value: () => Promise.reject(new Error('Service workers are disabled during QA.')),
    });
  });
  for (const method of ['fetch', 'get', 'post', 'put', 'patch', 'delete', 'head']) {
    context.request[method] = () => { throw new Error('[qa-safety] Direct APIRequestContext traffic is disabled; use guarded page requests or the HTTP-only QA tools.'); };
  }
  context.newCDPSession = () => { throw new Error('[qa-safety] Raw CDP sessions can bypass the QA guard.'); };
  context.on('page', page => guardPage(page, base));
  const originalNewPage = context.newPage.bind(context);
  context.newPage = async (...args) => { const page = await originalNewPage(...args); guardPage(page, base); return page; };
  context[GUARDED] = base;
  return context;
}

async function createQaContext(browser, baseURL, options = {}) {
  const base = assertLocalQaTarget(baseURL);
  assertQaEnvironment();
  if (!browser[GUARDED_BROWSER] || browser[GUARDED_BROWSER].base !== base) {
    throw new Error('[qa-safety] Use launchQaBrowser for a browser with local-only transport.');
  }
  if (options.proxy || (options.serviceWorkers && options.serviceWorkers !== 'block')) {
    throw new Error('[qa-safety] Context proxy and service-worker overrides are forbidden.');
  }
  const createContext = browser[GUARDED_BROWSER]?.newContext || browser.newContext.bind(browser);
  const context = await createContext({ ...options, serviceWorkers: 'block',
    userAgent: `${options.userAgent || 'Mozilla/5.0 (local browser QA)'} ${QA_USER_AGENT}` });
  context[CREATED_CONTEXT] = true;
  try { return await installQaContext(context, base); }
  catch (error) { await context.close(); throw error; }
}

async function launchQaBrowser(chromium, baseURL, options = {}) {
  const base = assertLocalQaTarget(baseURL);
  // Validate supplied options before any I/O; use a placeholder only for validation.
  chromiumQaLaunchOptions(base, options, 1);
  await verifyQaServer(base);
  const proxy = await startQaDenyProxy();
  let browser;
  try { browser = await chromium.launch(chromiumQaLaunchOptions(base, options, proxy.port)); }
  catch (error) { await proxy.close(); throw error; }
  const closeBrowser = browser.close.bind(browser);
  let proxyClosed = false;
  const closeProxy = async () => { if (!proxyClosed) { proxyClosed = true; await proxy.close(); } };
  browser.close = async (...args) => { try { await closeBrowser(...args); } finally { await closeProxy(); } };
  browser.on('disconnected', () => { void closeProxy(); });
  browser[GUARDED_BROWSER] = { base, newContext: browser.newContext.bind(browser) };
  browser.newContext = options => createQaContext(browser, base, options);
  browser.newPage = () => { throw new Error('[qa-safety] Create a guarded context before its page.'); };
  browser.newBrowserCDPSession = () => { throw new Error('[qa-safety] Raw CDP sessions can bypass the QA guard.'); };
  return browser;
}

async function verifyQaServer(baseURL) {
  const base = assertLocalQaTarget(baseURL);
  assertQaEnvironment();
  const response = await fetch(base + '/', { redirect: 'manual', signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': QA_USER_AGENT } });
  try {
    if (response.status !== 200 || response.headers.get('x-moneysalary-qa') !== 'ads-disabled') {
      throw new Error('[qa-safety] Local server is not an ads-disabled QA build. Start qa:dev or qa:build + qa:start first.');
    }
  } finally { await response.body?.cancel(); }
}

module.exports = { QA_USER_AGENT, assertLocalQaTarget, assertQaEnvironment, isAllowedQaRequest, fetchQaDocument, verifyQaServer,
  chromiumQaArgs, chromiumQaLaunchOptions, startQaDenyProxy, launchQaBrowser, createQaContext, installQaContext };
