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
        'http://127.0.0.1:3000/calc/samsung-bonus',
        'http://127.0.0.1:3000/civil-servant-pay-2027',
        'http://127.0.0.1:3000/guides/wage-delayed-claim-2026',
        'http://127.0.0.1:3000/home-loan',
        'http://127.0.0.1:3000/en',
        'http://127.0.0.1:3000/en/tools/loan',
      ],
      numberOfRuns: 3,
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
      },
    },
    upload: { target: 'filesystem', outputDir: 'lhci-report' },
  },
};
