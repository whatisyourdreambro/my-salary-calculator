import { spawnSync } from 'node:child_process';
import { describe, expect, it, vi } from 'vitest';
import { metadata as shareMetadata } from '@/app/share/page';

vi.mock('@/components/StaticSharePage', () => ({ default: () => null }));

// Exercise the installed Next resolver, not a source-string approximation. The
// server-only compiler marker is stubbed only inside this disposable child; all
// merge/postprocessing and tag generation run from the installed Next package.
const resolveInChild = String.raw`
const Module = require('node:module');
const originalLoad = Module._load;
global.fetch = () => { throw new Error('Network forbidden in metadata regression'); };
let accumulateMetadata;
try {
  Module._load = function(name, ...args) {
    return name === 'server-only' ? {} : originalLoad.call(this, name, ...args);
  };
  ({ accumulateMetadata } = require('next/dist/lib/metadata/resolve-metadata.js'));
} finally { Module._load = originalLoad; }
const { BasicMeta } = require('next/dist/lib/metadata/generate/basic.js');
const { OpenGraphMetadata, TwitterMetadata } = require('next/dist/lib/metadata/generate/opengraph.js');
const leaf = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
const parent = {
  metadataBase: new URL('https://metadata-fixture.invalid'),
  title: { default: 'Generic root title', template: '%s | Brand' },
  description: 'Generic description',
  openGraph: { type: 'website', title: 'Generic OG title', description: 'Generic OG description',
    url: 'https://metadata-fixture.invalid', images: [{ url: '/generic.png' }] },
  twitter: { card: 'summary_large_image', title: 'Generic Twitter title',
    description: 'Generic Twitter description', images: ['/generic.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
};
(async () => {
  const result = await accumulateMetadata('/share', [[parent, null], [null, null], [leaf, null]],
    '/share', { trailingSlash: false, isStaticMetadataRouteFile: false });
  process.stdout.write(JSON.stringify({
    title: result.title, description: result.description, openGraph: result.openGraph,
    twitter: result.twitter, robots: result.robots, alternates: result.alternates,
    basicTags: BasicMeta({ metadata: result }).filter(Boolean).map(tag => ({ type: tag.type, props: tag.props })),
    ogTags: OpenGraphMetadata({ openGraph: result.openGraph }),
    twitterTags: TwitterMetadata({ twitter: result.twitter }),
  }));
})().catch(error => { console.error(error); process.exitCode = 1; });
`;

describe('Pages share metadata ownership', () => {
  it('clears inherited generic Next tags while retaining one noindex robots tag and RSS alternates', () => {
    const child = spawnSync(process.execPath, ['-e', resolveInChild], {
      cwd: process.cwd(), input: JSON.stringify(shareMetadata), encoding: 'utf8',
      timeout: 10_000, maxBuffer: 64 * 1024, windowsHide: true,
    });
    expect(child.error).toBeUndefined();
    expect(child.status, child.stderr).toBe(0);
    const result = JSON.parse(child.stdout);
    expect(result.title.absolute).toBe('');
    expect(result.description).toBeNull();
    expect(result.openGraph).toBeNull();
    expect(result.twitter).toBeNull();
    expect(result.ogTags).toBeNull();
    expect(result.twitterTags).toBeNull();
    expect(result.basicTags).toEqual([{ type: 'meta', props: { name: 'robots', content: 'noindex, nofollow' } }]);
    expect(result.robots.googleBot).toBeNull();
    expect(result.alternates.canonical).toBeNull();
    expect(result.alternates.types['application/rss+xml']).toEqual([{ url: 'https://metadata-fixture.invalid/rss.xml' }]);
  });
});
