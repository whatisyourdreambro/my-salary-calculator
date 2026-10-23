import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import safety from '../lib/qa-safety.cjs';
const { assertLocalQaTarget, isAllowedQaRequest, launchQaBrowser, startQaDenyProxy, chromiumQaArgs } = safety;
const base = 'http://127.0.0.1:3100';

test('only loopback origins are valid QA targets', () => {
  for (const origin of [base, 'http://localhost:3000', 'http://[::1]:3100']) assert.equal(assertLocalQaTarget(origin), origin);
  for (const origin of ['https://www.moneysalary.com', 'https://preview.pages.dev', 'http://127.0.0.1.evil.test',
    'http://localhost@evil.test', 'http://user:password@localhost:3100', 'file:///tmp/x', base + '/path', base + '?x=1']) {
    assert.throws(() => assertLocalQaTarget(origin), /qa-safety/);
  }
});

test('network allowlist rejects external, telemetry, writes and encoded proxy paths', () => {
  for (const path of ['/', '/calc/samsung-bonus', '/_next/static/chunks/app.js', '/fonts/local.woff2']) {
    assert.equal(isAllowedQaRequest(base + path, base), true, path);
  }
  for (const url of ['https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', 'http://127.0.0.1:9999/',
    base + '/adgk/g/collect', base + '/gtag.js', base + '/adgk;collect', base + '/cdn-cgi/rum', base + '/api/analytics', base + '/collect', base + '/proxy',
    base + '/%61dgk/collect', base + '/foo/%252e%252e/adgk/collect', base + '/%ZZ', 'data:text/html,test']) {
    assert.equal(isAllowedQaRequest(url, base), false, url);
  }
  assert.equal(isAllowedQaRequest(base + '/api/contact', base, 'POST'), false);
});

test('HTTP-only QA blocks telemetry paths and forces manual redirects before any fetch', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options }); return new Response('', { status: 302, headers: { location: 'https://external.invalid/' } });
  });
  for (const url of [base + '/adgk/g/collect', base + '/gtag.js', 'https://www.moneysalary.com/']) {
    await assert.rejects(safety.fetchQaDocument(url, base), /HTTP QA cannot/);
  }
  assert.equal(calls.length, 0);
  const response = await safety.fetchQaDocument(base + '/calc', base, { redirect: 'follow' });
  assert.equal(response.status, 302);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.redirect, 'manual');
  assert(calls[0].options.headers.get('User-Agent').includes('MoneySalary-QA/1.0'));
});

test('owned proxy rejects HTTP and CONNECT without forwarding', async () => {
  const proxy = await startQaDenyProxy();
  try {
    const status = await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: proxy.port, path: 'http://external.invalid/ad.js' }, res => {
        res.resume(); res.on('end', () => resolve(res.statusCode));
      }); req.on('error', reject); req.end();
    });
    assert.equal(status, 403);
    const tunnel = await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port: proxy.port, method: 'CONNECT', path: 'external.invalid:443' });
      req.on('connect', (res, socket) => { socket.destroy(); resolve(res.statusCode); }); req.on('error', reject); req.end();
    });
    assert.equal(tunnel, 403);
    const args = chromiumQaArgs(base, proxy.port);
    assert(args.includes(`--proxy-server=http://127.0.0.1:${proxy.port}`));
    assert(args.includes('--proxy-bypass-list=<-loopback>;127.0.0.1:3100'));
  } finally { await proxy.close(); }
});

test('a reset CONNECT socket closes safely and the proxy keeps denying new tunnels', async t => {
  let server;
  const createServer = http.createServer;
  t.mock.method(http, 'createServer', (...args) => {
    server = createServer(...args);
    return server;
  });
  const proxy = await startQaDenyProxy();
  let request;
  try {
    // Node detaches its HTTP-parser socket error handler for CONNECT. Inject the
    // reset there deterministically; only this loopback proxy receives traffic.
    const reset = new Promise((resolve, reject) => server.once('connect', (_request, socket) => {
      try {
        const error = Object.assign(new Error('Synthetic peer reset'), { code: 'ECONNRESET' });
        assert.doesNotThrow(() => socket.emit('error', error));
        assert.equal(socket.destroyed, true);
        resolve();
      } catch (error) { socket.destroy(); reject(error); }
    }));
    request = http.request({ host: '127.0.0.1', port: proxy.port, method: 'CONNECT', path: 'external.invalid:443' });
    request.on('error', () => {}); // The injected server-side reset may close this test client.
    request.on('connect', (_response, socket) => socket.destroy());
    request.end();
    await reset;
    const status = await new Promise((resolve, reject) => {
      const next = http.request({ host: '127.0.0.1', port: proxy.port, method: 'CONNECT', path: 'external.invalid:443' });
      next.on('connect', (response, socket) => { socket.destroy(); resolve(response.statusCode); });
      next.on('error', reject);
      next.end();
    });
    assert.equal(status, 403);
  } finally {
    request?.destroy();
    await proxy.close();
  }
});

function mocks() {
  const events = [], routes = [], pageRoutes = [];
  const context = new EventEmitter();
  Object.assign(context, { pages: () => [], serviceWorkers: () => [], request: {},
    route: async (pattern, handler) => { events.push('route'); routes.push({ pattern, handler }); },
    routeWebSocket: async () => events.push('websocket-block'), addInitScript: async () => events.push('init'),
    close: async () => events.push('context-close'),
    newPage: async () => {
      events.push('newPage');
      const page = { route: async (pattern, handler) => pageRoutes.push({ pattern, handler }), request: context.request };
      context.emit('page', page); return page;
    },
  });
  const browser = new EventEmitter();
  Object.assign(browser, { newContext: async options => { events.push('context'); context.options = options; return context; },
    close: async () => events.push('browser-close') });
  const chromium = { launch: async options => { events.push('launch'); browser.options = options; return browser; } };
  return { events, routes, pageRoutes, context, browser, chromium };
}

function route(url, status = 200, disposeError) {
  const calls = [];
  const response = { status: () => status, dispose: async () => { calls.push('dispose'); if (disposeError) throw disposeError; } };
  return { calls, request: () => ({ url: () => url, method: () => 'GET' }),
    abort: async () => calls.push('abort'),
    fetch: async options => { calls.push({ fetch: options }); return response; },
    fulfill: async () => calls.push('fulfill'),
    continue: async () => { throw new Error('Raw continue must never be reached'); },
  };
}

async function qaEnvironment(fn) {
  const names = ['NEXT_PUBLIC_ADS_DISABLED', 'MSY_QA_MODE', 'MSY_QA_PROXY_PORT', 'BASE_URL', 'MSY_QA_SCREEN_READER'];
  const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
  Object.assign(process.env, { NEXT_PUBLIC_ADS_DISABLED: '1', MSY_QA_MODE: '1' });
  delete process.env.MSY_QA_SCREEN_READER;
  try { return await fn(); }
  finally { for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; } }
}

test('visible screen-reader launch requires an exact opt-in and never changes the headless default', async () => {
  await qaEnvironment(async () => {
    assert.equal(safety.chromiumQaLaunchOptions(base, {}, 12345).headless, true);
    for (const value of [undefined, '0', 'true', 'yes']) {
      if (value === undefined) delete process.env.MSY_QA_SCREEN_READER;
      else process.env.MSY_QA_SCREEN_READER = value;
      assert.throws(() => safety.chromiumQaLaunchOptions(base, { headless: false }, 12345), /MSY_QA_SCREEN_READER=1/);
    }
    process.env.MSY_QA_SCREEN_READER = '1';
    assert.equal(safety.chromiumQaLaunchOptions(base, {}, 12345).headless, true);
    assert.equal(safety.chromiumQaLaunchOptions(base, { headless: true }, 12345).headless, true);
    const visible = safety.chromiumQaLaunchOptions(base, { headless: false }, 12345);
    assert.equal(visible.headless, false);
    assert.deepEqual(visible.args, chromiumQaArgs(base, 12345));
    for (const headless of [null, 'false', 0]) {
      assert.throws(() => safety.chromiumQaLaunchOptions(base, { headless }, 12345), /boolean/);
    }
    for (const overrides of [{ proxy: {} }, { userDataDir: 'profile' }, { ignoreDefaultArgs: true },
      { args: ['--proxy-server=direct://'] }, { args: ['--remote-debugging-port=9222'] },
      { args: ['--disable-web-security'] }, { args: ['https://external.invalid'] }]) {
      assert.throws(() => safety.chromiumQaLaunchOptions(base, { headless: false, ...overrides }, 12345), /network guard/);
    }
  });
});

test('screen-reader opt-in cannot bypass QA mode, loopback or server identity before launch', async t => {
  await qaEnvironment(async () => {
    let fetches = 0;
    t.mock.method(globalThis, 'fetch', async () => { fetches++; return new Response('', { status: 200 }); });
    const m = mocks();
    await assert.rejects(launchQaBrowser(m.chromium, base, { headless: false }), /MSY_QA_SCREEN_READER=1/);
    process.env.MSY_QA_SCREEN_READER = '1';
    await assert.rejects(launchQaBrowser(m.chromium, 'https://www.moneysalary.com', { headless: false }), /loopback/);
    delete process.env.NEXT_PUBLIC_ADS_DISABLED;
    await assert.rejects(launchQaBrowser(m.chromium, base, { headless: false }), /qa:run/);
    assert.equal(fetches, 0);
    process.env.NEXT_PUBLIC_ADS_DISABLED = '1';
    await assert.rejects(launchQaBrowser(m.chromium, base, { headless: false }), /not an ads-disabled QA build/);
    assert.equal(fetches, 1);
    assert.deepEqual(m.events, []);
  });
});

test('launch refuses production, unsafe flags and missing QA marker before browser creation', async t => {
  await qaEnvironment(async () => {
    let fetches = 0;
    t.mock.method(globalThis, 'fetch', async () => { fetches++; return new Response('', { status: 200 }); });
    const m = mocks();
    await assert.rejects(launchQaBrowser(m.chromium, 'https://www.moneysalary.com'), /loopback/);
    await assert.rejects(launchQaBrowser(m.chromium, base, { args: ['--proxy-server=direct://'] }), /network guard/);
    assert.equal(fetches, 0);
    await assert.rejects(launchQaBrowser(m.chromium, base), /not an ads-disabled QA build/);
    assert.equal(fetches, 1);
    assert.deepEqual(m.events, []);
    delete process.env.NEXT_PUBLIC_ADS_DISABLED;
    await assert.rejects(launchQaBrowser(m.chromium, base), /qa:run/);
    assert.equal(fetches, 1);
  });
});

for (const headless of [true, false]) test(`context, pages, custom routes, API requests and redirects stay guarded (headless=${headless})`, async t => {
  await qaEnvironment(async () => {
    if (!headless) process.env.MSY_QA_SCREEN_READER = '1';
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      assert.equal(options.redirect, 'manual');
      return new Response('', { status: 200, headers: { 'x-moneysalary-qa': 'ads-disabled' } });
    });
    const m = mocks();
    const browser = await launchQaBrowser(m.chromium, base, { headless });
    try {
      assert.equal(m.browser.options.headless, headless);
      assert(m.browser.options.args.some(arg => /^--proxy-server=http:\/\/127\.0\.0\.1:\d+$/.test(arg)));
      const context = await browser.newContext({ userAgent: 'Existing fixture UA' });
      assert.equal(context.options.serviceWorkers, 'block');
      assert(context.options.userAgent.endsWith(' MoneySalary-QA/1.0'));
      assert.deepEqual(m.events, ['launch', 'context', 'route', 'websocket-block', 'init']);
      const page = await context.newPage();
      assert.throws(() => context.request.get('https://external.invalid'), /APIRequestContext/);
      assert.throws(() => page.request.fetch(base + '/adgk'), /APIRequestContext/);
      assert.throws(() => context.newCDPSession(page), /CDP/);
      assert.throws(() => browser.newBrowserCDPSession(), /CDP/);
      assert.throws(() => context.unrouteAll(), /cannot be removed/);
      assert.throws(() => context.routeWebSocket('**/*', () => {}), /cannot be replaced/);
      const external = route('https://pagead2.googlesyndication.com/ad.js');
      await m.routes[0].handler(external);
      assert.deepEqual(external.calls, ['abort']);
      const proxy = route(base + '/adgk/g/collect');
      await m.routes[0].handler(proxy);
      assert.deepEqual(proxy.calls, ['abort']);
      const redirect = route(base + '/redirect', 302);
      await m.routes[0].handler(redirect);
      assert.deepEqual(redirect.calls, [{ fetch: { maxRedirects: 0, maxRetries: 0 } }, 'abort', 'dispose']);
      const local = route(base + '/_next/app.js');
      await m.routes[0].handler(local);
      assert.deepEqual(local.calls, [{ fetch: { maxRedirects: 0, maxRetries: 0 } }, 'fulfill', 'dispose']);
      let customCalled = false;
      await page.route('**/*', r => { customCalled = true; return r.continue(); });
      await m.pageRoutes[0].handler(external);
      assert.equal(customCalled, false);
      await context.route('**/*', r => r.fetch({ url: 'https://external.invalid' }));
      await assert.rejects(m.routes[1].handler(route(base + '/')), /forbidden request/);
      await assert.rejects(safety.createQaContext({}, base), /local-only transport/);
      await assert.rejects(safety.installQaContext(mocks().context, base), /raw contexts/);
    } finally { await browser.close(); }
  });
});

test('response disposal suppresses only the exact known target-closed cleanup error', async t => {
  await qaEnvironment(async () => {
    t.mock.method(globalThis, 'fetch', async () => new Response('', {
      status: 200, headers: { 'x-moneysalary-qa': 'ads-disabled' },
    }));
    // Synthetic classes model the bundled and unbundled Playwright identities.
    class TargetClosedError extends Error {}
    class TargetClosedError2 extends Error {}
    const message = 'apiResponse.dispose: Target page, context or browser has been closed';
    const m = mocks();
    const browser = await launchQaBrowser(m.chromium, base);
    try {
      await browser.newContext();
      const handler = m.routes[0].handler;
      for (const ErrorClass of [TargetClosedError, TargetClosedError2]) {
        for (const status of [200, 302]) {
          const local = route(base + '/fixture', status, new ErrorClass(message));
          await handler(local);
          assert.deepEqual(local.calls, [{ fetch: { maxRedirects: 0, maxRetries: 0 } }, status === 302 ? 'abort' : 'fulfill', 'dispose']);
        }
      }
      for (const failure of [new Error('Synthetic cleanup failure'), new Error(message),
        new TargetClosedError2('apiResponse.dispose: another failure'),
        new TargetClosedError2('apiRequestContext.get: Target page, context or browser has been closed')]) {
        await assert.rejects(handler(route(base + '/fixture', 200, failure)), error => error === failure);
      }
      const originalFailure = new Error('Synthetic fulfill failure');
      const failed = route(base + '/fixture', 200, new TargetClosedError2(message));
      failed.fulfill = async () => { throw originalFailure; };
      await assert.rejects(handler(failed), error => error === originalFailure, 'known cleanup closure cannot hide a request failure');
      for (const url of ['https://external.invalid/fixture', base + '/adgk/g/collect']) {
        const forbidden = route(url, 200, new TargetClosedError2(message));
        await handler(forbidden);
        assert.deepEqual(forbidden.calls, ['abort'], 'forbidden requests never fetch or dispose');
      }
    } finally { await browser.close(); }
  });
});

test('Lighthouse configuration requires the guarded wrapper and has local-only targets', async () => {
  await qaEnvironment(async () => {
    const require = createRequire(import.meta.url);
    const filename = require.resolve('../../lighthouserc.cjs');
    delete require.cache[filename];
    delete process.env.MSY_QA_PROXY_PORT;
    await assert.rejects(async () => require(filename), /deny proxy/);
    process.env.MSY_QA_PROXY_PORT = '12345';
    process.env.BASE_URL = base;
    const config = require(filename).ci.collect;
    assert(config.url.every(url => url.startsWith(base + '/')));
    assert.equal(config.startServerCommand, 'npm run qa:start -- --port 3100');
    assert(config.settings.chromeFlags.includes('--proxy-server=http://127.0.0.1:12345'));
    assert(config.settings.blockedUrlPatterns.includes('*://*/adgk*'));
    delete require.cache[filename];
    process.env.BASE_URL = 'https://www.moneysalary.com';
    assert.throws(() => require(filename), /loopback/);
    delete require.cache[filename];
  });
});
