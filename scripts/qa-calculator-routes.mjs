// Check the actual statically rendered calculator directory and every linked registry page.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://127.0.0.1:3100';
const headers = { 'User-Agent': 'Mozilla/5.0 Moneysalary local calculator QA' };
const ld = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
const directory = await (await fetch(base + '/calc', { headers })).text();
const collection = ld(directory).find(item => item['@type'] === 'CollectionPage');
assert(collection);
const routes = collection.mainEntity.itemListElement.map(item => new URL(item.url).pathname);
assert.equal(routes.length, 202);
assert.equal(new Set(routes).size, routes.length);
const results = [];
const sitemap = await (await fetch(base + '/sitemap.xml', { headers })).text();
for (let i = 0; i < routes.length; i += 4) {
  await Promise.all(routes.slice(i, i + 4).map(async route => {
    const response = await fetch(base + route, { headers, redirect: 'manual', signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert(html.includes(`rel="canonical" href="https://www.moneysalary.com${route}"`), `${route} canonical`);
    assert(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `${route} noindex`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${route} h1`);
    assert(sitemap.includes(`https://www.moneysalary.com${route}</loc>`), `${route} sitemap`);
    const schema = ld(html);
    assert(schema.some(item => item['@type'] === 'FAQPage' && item.mainEntity.length >= 3), `${route} FAQ`);
    const fields = [...html.matchAll(/<input\b[^>]*data-number-input="grouped"[^>]*>/g)];
    assert(fields.length > 0, `${route} initial inputs`);
    for (const [tag] of fields) {
      const value = tag.match(/\bvalue="([^"]*)"/)?.[1];
      assert(value !== undefined, `${route} missing default`);
      assert(!/^-?\d{4,}(\.\d*)?$/.test(value), `${route} ungrouped default ${value}`);
    }
    results.push({ route, status: response.status, groupedFields: fields.length, canonical: true, indexable: true, sitemap: true, faq: true });
  }));
}
await fs.mkdir('.artifacts/experience-qa', { recursive: true });
await fs.writeFile('.artifacts/experience-qa/routes.json', JSON.stringify(results.sort((a, b) => a.route.localeCompare(b.route)), null, 2));
console.log(`PASS: ${results.length} calculator routes, ${results.reduce((sum, item) => sum + item.groupedFields, 0)} grouped default fields, HTTP, canonical, FAQ and sitemap.`);
