// Next's .next directory requires its server; it is not a static website root.
// Keep production ad settings intact and avoid generating analytics/ad traffic.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Lighthouse reads a CommonJS config and shares the QA network policy.
const { assertLocalQaTarget, assertQaEnvironment, chromiumQaArgs, QA_USER_AGENT } = require('./scripts/lib/qa-safety.cjs');
assertQaEnvironment();
const base = assertLocalQaTarget(process.env.BASE_URL || 'http://127.0.0.1:3000');
const target = new URL(base);
if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1') throw new Error('Lighthouse QA must use http://127.0.0.1 and the qa:start server.');
const proxyPort = Number(process.env.MSY_QA_PROXY_PORT);
const networkArgs = chromiumQaArgs(base, proxyPort);
module.exports = {
  ci: {
    collect: {
      startServerCommand: `npm run qa:start -- --port ${target.port || 80}`,
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      url: [
        base + '/',
        base + '/work-clock',
        base + '/calc/samsung-bonus',
        base + '/civil-servant-pay-2027',
        base + '/guides/wage-delayed-claim-2026',
        base + '/home-loan',
        base + '/en',
        base + '/en/tools/loan',
        // Revenue templates (2026-09-28 audit S33): one page per dynamic template plus
        // /year-end-tax and /car-loan. 50000000 is in the salaryStaticParams grid,
        // samsung-electronics is a real companyData id, and earned-income-tax-quick has an
        // explanation + 4 FAQs, so it is indexable and the error-level is-crawlable holds.
        base + '/salary/50000000',
        base + '/salary-db/samsung-electronics',
        base + '/calc/earned-income-tax-quick',
        base + '/year-end-tax',
        base + '/car-loan',
      ],
      // Global, not per URL: 13 pages x 2 runs = 26 (was 8 x 3 = 24), inside the 30-minute job timeout.
      numberOfRuns: 2,
      settings: {
        chromeFlags: ['--no-sandbox', ...networkArgs].join(' '),
        emulatedUserAgent: `Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36 ${QA_USER_AGENT}`,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        blockedUrlPatterns: [
          '*googlesyndication.com/*',
          '*doubleclick.net/*',
          '*googletagmanager.com/*',
          '*google-analytics.com/*',
          '*cloudflareinsights.com/*',
          '*adtrafficquality.google/*',
          '*fundingchoicesmessages.google.com/*',
          '*coupang.com/*',
          '*://*/adgk*', '*://*/cdn-cgi/*', '*://*/api/*',
          '*://*/pagead/*', '*://*/ads/*', '*://*/analytics/*',
          '*://*/collect*', '*://*/g/collect*', '*://*/j/collect*',
          '*://*/gtm*', '*://*/gtag*', '*://*/track*', '*://*/beacon*', '*://*/proxy*',
        ],
      },
    },
    assert: {
      assertions: {
        'http-status-code': 'error',
        'is-crawlable': 'error',
        'document-title': 'error',
        'meta-description': 'error',
        'canonical': 'error',
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        // CWV budgets (2026-09-28 audit S33), warn-only so they never turn CI red.
        // LHCI's default aggregationMethod 'optimistic' checks a max budget against the LOWEST run,
        // so an intermittent shift like the /calc/samsung-bonus CLS runs 0.259, 0.259, 0.009
        // (playwright, docs/ad-experiments.md section 5) would pass as 0.009. CLS therefore uses 'pessimistic'
        // (highest run: warn if any run exceeds); the noisier timing metrics use 'median'.
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1, aggregationMethod: 'pessimistic' }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000, aggregationMethod: 'median' }],
        'total-blocking-time': ['warn', { maxNumericValue: 600, aggregationMethod: 'median' }],
        'dom-size': ['warn', { maxNumericValue: 4500, aggregationMethod: 'median' }],
      },
    },
    upload: { target: 'filesystem', outputDir: 'lhci-report' },
  },
};
