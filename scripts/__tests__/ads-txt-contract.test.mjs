// Static file contract only: reads the repository copies, no build, browser or network.
// ads.txt/app-ads.txt authorize the one AdSense seller account for this site. A blank or
// edited file can stop ad serving, so pin the exact record. Windows checkouts are CRLF and
// CI is LF; qa-pages-http already byte-compares dist/ads.txt with public/ads.txt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SELLER_RECORDS = ['google.com, pub-2873403048341290, DIRECT, f08c47fec0942fa0'];

for (const file of ['ads.txt', 'app-ads.txt']) {
  test(`public/${file} declares exactly the reviewed AdSense seller record`, () => {
    const text = readFileSync(new URL(`../../public/${file}`, import.meta.url), 'utf8');
    assert.deepEqual(text.split(/\r?\n/).filter(Boolean), SELLER_RECORDS);
  });
}
