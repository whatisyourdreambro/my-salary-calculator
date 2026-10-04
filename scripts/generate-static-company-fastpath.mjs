import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

// This shortcut is deliberately tied to a reviewed middleware/header contract.
// A future routing/policy change must be reviewed before updating these hashes.
const REVIEWED_SOURCES = {
  'src/middleware.ts': '3956e9148729b9cd1ace7973f13b39202636e094fa7e2de91646b105e8e0d645',
  'next.config.mjs': '9748fc73098c610a98e6e81f093b6cc0c8e2802daf465081ba14d60822828cee',
  'public/_headers': '1d557c7148304e45660d479638048ad92bf521274f591ebfa2fa0d942f0205ab',
  'src/lib/guideDiscovery.ts': 'af6c6e67a4a322b8f87c2f814f869e8b63f33e7f0bbb05543405c352607310b2',
  'src/lib/englishRouteGuard.ts': '1f900c0a5d10be8ad031ea65015ade4a5dbba41591fcc6282d3b2ec7690f84d1',
  'src/lib/salaryRedirect.ts': 'fde632e3e949ec8309e2824cbdf6f470978b79ace9e160362b179e1fa741bae6',
  'src/lib/server/cloudflareAssets.ts': '59efff69ead1bcc20cfea5b0557aaa0bd7ff7f6d4e6a8b9916c9f446649abb9b',
};
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

export function generate(projectRoot, output = path.join(projectRoot, '.vercel/static-company-fastpath.mjs')) {
  const sources = {};
  for (const [file, expected] of Object.entries(REVIEWED_SOURCES)) {
    sources[file] = fs.readFileSync(path.join(projectRoot, file), 'utf8').replace(/\r\n/g, '\n');
    if (sha(sources[file]) !== expected) throw new Error(`Static company shortcut requires review: ${file} changed`);
  }
  const userAgents = {};
  for (const name of ['ALLOWED_BOTS', 'BAD_BOTS', 'SUSPICIOUS_UA']) {
    const match = sources['src/middleware.ts'].match(new RegExp(`const ${name} = /(.*)/([a-z]*);`));
    if (!match || match[2] !== 'i') throw new Error(`Cannot extract reviewed UA policy: ${name}`);
    userAgents[name] = { source: match[1], flags: match[2] };
    new RegExp(match[1], match[2]);
  }
  const prerender = JSON.parse(fs.readFileSync(path.join(projectRoot, '.next/prerender-manifest.json'), 'utf8'));
  const config = JSON.parse(fs.readFileSync(path.join(projectRoot, '.vercel/output/config.json'), 'utf8'));
  if (prerender.version !== 4 || config.version !== 3) throw new Error('Unsupported build manifest version');
  const redirects = config.routes.filter(route => route.status >= 300 && route.status < 400 && route.src);
  const routes = {};
  const excluded = [];
  for (const [pathname, data] of Object.entries(prerender.routes)) {
    if (data.srcRoute !== '/salary-db/[id]') continue;
    if (!/^\/salary-db\/[a-z0-9-]+$/.test(pathname)
      || data.initialRevalidateSeconds !== false
      || (data.initialStatus !== undefined && data.initialStatus !== 200)
      || data.dataRoute !== `${pathname}.rsc`
      || redirects.some(route => new RegExp(route.src).test(pathname))) {
      excluded.push(pathname);
      continue;
    }
    const initial = data.initialHeaders || {};
    if (Object.keys(initial).length !== 1 || typeof initial['x-next-cache-tags'] !== 'string') {
      throw new Error(`Unexpected static company headers: ${pathname}`);
    }
    for (const suffix of ['.html', '.rsc']) {
      if (!fs.statSync(path.join(projectRoot, '.vercel/output/static', pathname + suffix)).isFile()) {
        throw new Error(`Static company asset missing: ${pathname}${suffix}`);
      }
    }
    routes[pathname] = {
      vary: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch',
      'x-matched-path': pathname,
      'x-next-cache-tags': initial['x-next-cache-tags'],
    };
  }
  if (!Object.keys(routes).length) throw new Error('No eligible static company documents');
  const contract = {
    adapter: '@cloudflare/next-on-pages@1.13.16',
    sourceHashes: REVIEWED_SOURCES,
    userAgents,
    assetHeaders: {
      'content-type': 'text/html; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=0, must-revalidate',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-content-type-options': 'nosniff',
    },
    routes,
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `// Generated from reviewed routing policy and this build. Do not commit.\nexport const contract = ${JSON.stringify(contract)};\n`);
  return { output, count: Object.keys(routes).length, excluded, sourceHashes: REVIEWED_SOURCES, sha256: sha(fs.readFileSync(output)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  console.log(JSON.stringify(generate(path.resolve(process.argv[2] || '.'), process.argv[3] && path.resolve(process.argv[3])), null, 2));
}
