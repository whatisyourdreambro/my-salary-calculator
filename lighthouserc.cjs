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
      url: ['/', '/work-clock', '/calc/samsung-bonus', '/civil-servant-pay-2027',
        '/guides/wage-delayed-claim-2026', '/home-loan', '/en', '/en/tools/loan'].map(path => base + path),
      numberOfRuns: 3,
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
      },
    },
    upload: { target: 'filesystem', outputDir: 'lhci-report' },
  },
};
