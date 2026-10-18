import { existsSync } from 'node:fs';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { analyzeHtml } from '../../../scripts/qa-page-quality.mjs';

const location = vi.hoisted(() => ({ pathname: '/en' }));
vi.mock('next/navigation', () => ({ usePathname: () => location.pathname, useSearchParams: () => new URLSearchParams(), notFound: () => { throw new Error('not-found'); } }));
vi.mock('@/components/AppLink', () => ({ default: function TestLink({ children, ...props }: { children: ReactNode }) { return createElement('a', props, children); } }));
vi.mock('@/components/AdPlacement', () => {
  const ad = (name: string) => function InertAd() { return createElement('div', { 'data-placement': name }); };
  return { HomeTopAd: ad('home'), CalcResultAd: ad('result'), GuideMidAd: ad('mid'), InArticleAd: ad('article'), MultiplexAd: ad('multiplex'), SidebarAd: ad('sidebar') };
});
vi.mock('@/components/CoupangBanner', () => ({ default: () => createElement('div', { 'data-placement': 'affiliate' }) }));
vi.mock('@/components/AutoBreadcrumb', () => ({ default: () => null }));
vi.mock('@/components/AutoShareSection', () => ({ default: () => createElement('div', { 'data-placement': 'share' }) }));
vi.mock('@/components/ShareButtons', () => ({ default: () => null }));
vi.mock('@/components/ResultSharePanel', () => ({ default: () => null }));
vi.mock('@/components/FavoritesButton', () => ({ default: () => null }));
vi.mock('@/hooks/useCalculatorMeasurement', () => ({ useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: null }) }));

import FunLayout from '@/app/fun/layout';
import EnglishHubPage from '@/components/english/EnglishHubPage';
import EnglishToolPage from '@/app/en/tools/[slug]/page';
import EnglishGuidePage from '@/app/en/guides/[slug]/page';
import EnglishGuidesPage from '@/app/en/guides/page';
import EnglishLandingPage from '@/app/en/page';
import EnglishHelpPage from '@/app/en/help/page';
import EnglishAboutPage from '@/app/en/about/page';
import FlatTaxPage from '@/app/en/flat-tax/page';
import { FUN_PAGES, FUN_RELATED_PAGES, FUN_CONTEXT_LINKS, getFunRelatedPages } from '@/lib/funRelatedPages';
import { ENGLISH_TOOLS } from '@/lib/englishTools';
import { ENGLISH_HUBS, type EnglishHubId } from '@/lib/englishHubs';
import { EN_ALL_PAGE_PATHS } from '@/lib/englishRoutes';
import { ENGLISH_TOOL_READING, ENGLISH_HUB_SECTION_LINKS } from '@/lib/englishContentLinks';
import { enGuides } from '@/lib/guidesContent';
import { ENGLISH_RELATED_GUIDES, getEnglishRelatedGuides } from '@/lib/englishRelatedGuides';

function render(node: ReactNode) {
  return '<!doctype html><html><body><main id="main-content">' + renderToStaticMarkup(createElement('div', null, node)) + '</main></body></html>';
}
function links(html: string): string[] {
  const parsed = analyzeHtml(html) as { links: { href: string; inContent: boolean; rel: string; module: string }[] };
  return parsed.links.filter(link => link.inContent && !/\bnofollow\b/i.test(link.rel) && link.module !== 'seasonal-links')
    .map(link => new URL(link.href, 'https://www.moneysalary.com').pathname);
}
function incoming(pages: Map<string, string>, target: string) {
  return [...pages].filter(([source, html]) => source !== target && links(html).includes(target)).map(([source]) => source);
}

describe('English editorial content links in actual server markup', () => {
  const pages = new Map<string, string>();
  beforeAll(async () => {
    for (const id of Object.keys(ENGLISH_HUBS) as EnglishHubId[]) {
      location.pathname = ENGLISH_HUBS[id].path;
      pages.set(location.pathname, render(createElement(EnglishHubPage, { id })));
    }
    for (const { slug } of ENGLISH_TOOLS) {
      location.pathname = `/en/tools/${slug}`;
      pages.set(location.pathname, render(await EnglishToolPage({ params: Promise.resolve({ slug }) })));
    }
    for (const { slug } of enGuides) {
      location.pathname = `/en/guides/${slug}`;
      pages.set(location.pathname, render(await EnglishGuidePage({ params: Promise.resolve({ slug }) })));
    }
    for (const [route, Page] of [['/en', EnglishLandingPage], ['/en/help', EnglishHelpPage], ['/en/about', EnglishAboutPage],
      ['/en/flat-tax', FlatTaxPage], ['/en/guides', EnglishGuidesPage]] as const) {
      location.pathname = route; pages.set(route, render(createElement(Page)));
    }
  });

  it('keeps the checker’s navigation exclusion instead of reclassifying menus as body links', () => {
    expect(links(render(createElement('nav', null, createElement('a', { href: '/en/terms' }, 'Terms'))))).toEqual([]);
    expect(pages.get('/en/tools/bonus')).toContain('aria-label="Breadcrumb"');
    expect(pages.get('/en/tools')).toContain('aria-label="Money planning tools tools"');
  });

  it.each([
    '/en/bonus', '/en/calculators', '/en/fun', '/en/guides', '/en/salary-db', '/en/season',
    '/en/guides/loan-types-comparison-2026', '/en/guides/semiconductor-cycle-2026',
    '/en/guides/sk-hynix-employee-bonus-stock', '/en/guides/sk-hynix-stock-2026',
    ...ENGLISH_TOOLS.map(tool => `/en/tools/${tool.slug}`),
  ])('%s has contextual links from at least three distinct rendered English pages', target => {
    expect(incoming(pages, target).length, `${target}: ${incoming(pages, target).join(', ')}`).toBeGreaterThanOrEqual(3);
  });

  it('does not trade away older English guides when replacing date-biased recommendations', () => {
    for (const guide of enGuides) {
      const selected = getEnglishRelatedGuides(enGuides, guide);
      expect(selected).toHaveLength(3);
      expect(new Set(selected.map(item => item.slug)).size).toBe(3);
      expect(selected.map(item => item.slug)).not.toContain(guide.slug);
      expect(incoming(pages, `/en/guides/${guide.slug}`).length, guide.slug).toBeGreaterThanOrEqual(3);
    }
    expect(Object.keys(ENGLISH_RELATED_GUIDES).sort()).toEqual(enGuides.map(guide => guide.slug).sort());
  });

  it('links policies only from relevant source, correction, sharing and result-use explanations', () => {
    expect(incoming(pages, '/en/about')).toEqual(expect.arrayContaining(['/en', '/en/help', '/en/guides']));
    expect(incoming(pages, '/en/terms')).toEqual(expect.arrayContaining(['/en', '/en/help', '/en/about']));
    expect(incoming(pages, '/en/privacy')).toEqual(expect.arrayContaining(['/en', '/en/help', '/en/about']));
    expect(pages.get('/en/guides')).toContain('how we check sources and review corrections');
    expect(pages.get('/en')).toContain('terms on attribution and permitted use');
    for (const { tools } of Object.values(ENGLISH_TOOL_READING)) expect(tools.every(item => item.href.startsWith('/en/tools/'))).toBe(true);
  });

  it('resolves every authored destination and keeps references attached to existing hub sections', () => {
    for (const [id, sections] of Object.entries(ENGLISH_HUB_SECTION_LINKS)) {
      const titles = ENGLISH_HUBS[id as EnglishHubId].sections.map(section => section.title);
      for (const [title, items] of Object.entries(sections)) {
        expect(titles).toContain(title);
        for (const item of items) expect(EN_ALL_PAGE_PATHS).toContain(item.href);
      }
    }
    for (const [slug, reading] of Object.entries(ENGLISH_TOOL_READING)) {
      const items = [reading.context, ...reading.tools];
      expect(new Set(items.map(item => item.href)).size).toBe(items.length);
      for (const item of items) {
        expect(EN_ALL_PAGE_PATHS).toContain(item.href);
        expect(item.href).not.toBe(`/en/tools/${slug}`);
        expect(item.reason.length).toBeGreaterThan(30);
      }
      const html = pages.get(`/en/tools/${slug}`)!;
      expect(html).toContain('How this calculation works');
      expect(html).toContain('Questions about this tool');
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).not.toMatch(/[가-힣]/);
    }
  });
});

describe('Fun recommendations preserve the advertising and sharing sequence', () => {
  const rendered = new Map<string, string>();
  beforeAll(() => {
    for (const slug of Object.keys(FUN_PAGES)) {
      location.pathname = `/fun/${slug}`;
      rendered.set(location.pathname, render(createElement(FunLayout, null, createElement('h1', null, slug))));
    }
  });
  it('every activity links only to real distinct related pages and is reached by peers', () => {
    for (const [slug, items] of Object.entries(FUN_RELATED_PAGES)) {
      expect(existsSync(`src/app/fun/${slug}/page.tsx`)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(2); expect(items.length).toBeLessThanOrEqual(3);
      expect(new Set(items).size).toBe(items.length); expect(items).not.toContain(slug);
      for (const target of items) expect(existsSync(`src/app/fun/${target}/page.tsx`)).toBe(true);
      // Fortune already had two content referrals; every other weak activity had one.
      expect(incoming(rendered, `/fun/${slug}`).length, slug).toBeGreaterThanOrEqual(slug === 'fortune' ? 1 : 2);
    }
  });
  it.each(Object.keys(FUN_PAGES))('%s emits SSR recommendations strictly after existing ads and sharing', slug => {
    const html = rendered.get(`/fun/${slug}`)!;
    const markers = ['data-placement="result"', 'data-placement="affiliate"', 'data-placement="home"', 'data-placement="share"', 'data-msy-module="fun-related-pages"'];
    const positions = markers.map(marker => html.indexOf(marker));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const marker of markers) expect(html.split(marker)).toHaveLength(2);
    expect(links(html)).toEqual(getFunRelatedPages(`/fun/${slug}`).map(item => item.href));
  });
  it('adds at most one real contextual destination per activity and gives the hub three distinct body referrals', () => {
    for (const [slug, link] of Object.entries(FUN_CONTEXT_LINKS)) {
      expect(existsSync(`src/app${link.href}/page.tsx`)).toBe(true);
      expect(getFunRelatedPages(`/fun/${slug}`).filter(item => !item.href.startsWith('/fun/'))).toEqual([link]);
    }
    expect(incoming(rendered, '/fun')).toHaveLength(3);
    for (const target of ['/fortune-2026', '/lotto', '/mbti-salary', '/work-clock'])
      expect(incoming(rendered, target).length, target).toBeGreaterThanOrEqual(2);
  });
  it.each(['/fun', '/fun/unknown', '/fun/flappy/nested', '/en/fun', null])('does not create a catch-all recommendation for %s', pathname => {
    expect(getFunRelatedPages(pathname)).toEqual([]);
  });
});
