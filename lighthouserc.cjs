// Next's .next directory requires its server; it is not a static website root.
// Keep production ad settings intact and avoid generating analytics/ad traffic.
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start -- --hostname 127.0.0.1 --port 3000',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      url: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:3000/work-clock',
        'http://127.0.0.1:3000/calc/samsung-bonus',
        'http://127.0.0.1:3000/civil-servant-pay-2027',
        'http://127.0.0.1:3000/guides/wage-delayed-claim-2026',
        'http://127.0.0.1:3000/home-loan',
        'http://127.0.0.1:3000/en',
        'http://127.0.0.1:3000/en/tools/loan',
        // Revenue templates (2026-09-28 audit S33): one page per dynamic template plus
        // /year-end-tax and /car-loan. 50000000 is in the salaryStaticParams grid,
        // samsung-electronics is a real companyData id, and earned-income-tax-quick has an
        // explanation + 4 FAQs, so it is indexable and the error-level is-crawlable holds.
        'http://127.0.0.1:3000/salary/50000000',
        'http://127.0.0.1:3000/salary-db/samsung-electronics',
        'http://127.0.0.1:3000/calc/earned-income-tax-quick',
        'http://127.0.0.1:3000/year-end-tax',
        'http://127.0.0.1:3000/car-loan',
      ],
      // Global, not per URL: 13 pages x 2 runs = 26 (was 8 x 3 = 24), inside the 30-minute job timeout.
      numberOfRuns: 2,
      settings: {
        chromeFlags: '--no-sandbox',
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
