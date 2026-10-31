#!/usr/bin/env node
// Guard: AdSense performance statistics (RPM, CTR, CPC, impressions, clicks, coverage, Active View,
// AdSense page views, unit/format revenue) must never be written into tracked repository files.
// The AdSense Terms of Service confidentiality clause (약관 비밀유지(Confidentiality) 조항) treats them
// as Google Confidential Information; only gross payments may be disclosed. Keep raw numbers in the
// operator's private notes outside the repository.
// Prints file:line and rule id only, never the matched text. Exit 1 when anything matches.
// A line may opt out with the literal marker "adsense-figure-ok" — thresholds or definitions only
// (adsense-figure-ok 표시는 기준값·정의 줄에만), never a measured statistic.
// usd-table-row skips affiliate rows that name CPA, LinkPrice or 쿠팡 (not AdSense statistics).
// CI runs scripts/__tests__/adsense-figure-guard.test.mjs through `node --test scripts/__tests__/*.test.mjs`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF_TEST = 'scripts/__tests__/adsense-figure-guard.test.mjs';
export const MARKER = 'adsense-figure-ok';
const SCOPE = /^(docs\/|scripts\/|\.github\/|[^/]+\.md$)/;
const EXCLUDE = /(^|\/)(package-lock\.json|node_modules\/)|^vendor\//;
const TEXT = /\.(md|mdx|txt|csv|tsv|json|jsonc|ya?ml|mjs|cjs|js|ts|tsx|html)$/i;
export const AFFILIATE_ROW = /\bCPA\b|LinkPrice|링크프라이스|쿠팡|Coupang/i;
const N = String.raw`\d[\d,]*(?:\.\d+)?`;
const DEC = String.raw`\d+\.\d+`;
const BIG = String.raw`(?:\d{1,3}(?:,\d{3})+|\d{3,})`;
const UNIT = String.raw`(?:결과창|상단|가이드\s?중간|인아티클|IN_ARTICLE|수동|멀티플렉스|multiplex|display[-_ ]?\d|DISPLAY_\d|GUIDE_MID|HomeTop|앵커|사이드\s?레일|전면|인페이지|자동\s?광고|광고\s?단위|광고단위|유닛|AdSense|애드센스|ex-mux)`;
const REV = String.raw`(?:애드센스|AdSense|수익|수입|RPM|CPC|유닛|광고\s?단위|자동\s?광고|인페이지|앵커|결과창|멀티플렉스)`;
const re = (s) => new RegExp(s, 'i');
export const RULES = [
  ['rpm', re(String.raw`\b(?:RPM|eCPM)\b[^\n]{0,24}?[$₩]\s?${N}`)],
  ['cpc', re(String.raw`(?:\bCPC\b|클릭당\s?(?:수익|단가))[^\n]{0,16}?[$₩]\s?${N}`)],
  ['active-view', re(String.raw`(?:Active\s?View|\bAV\b|평균\s?가시(?:시간)?)[^\n]{0,16}?${N}\s?(?:%|초)`)],
  ['impressions-per-pv', re(String.raw`(?:노출|${UNIT})\s?/\s?PV[^\n]{0,12}?${DEC}|\*\*${DEC}\*\*\s?/PV|${DEC}\s?/PV\b|페이지뷰당\s?${DEC}`)],
  ['coverage', re(String.raw`(?=[^\n]*${UNIT})[^\n]*(?:(?:커버리지|coverage|채움률?)[^\n]{0,12}?\d+(?:\.\d+)?\s?%|(?:미매칭|매칭|광고\s?요청|요청)\s?${BIG}|요청\s?/\s?PV[^\n]{0,12}?${DEC})`)],
  ['revenue-usd', re(String.raw`${REV}[^\n]{0,40}?[$₩]\s?${N}|[$₩]\s?${N}[^\n]{0,40}?${REV}`)],
  ['revenue-krw', re(String.raw`(?:월|일)\s?수익\s?${N}\s?(?:~\s?${N})?\s?만\s?원|수익의\s?\*{0,2}${N}(?:~${N})?%`)],
  ['unit-ctr', re(String.raw`${UNIT}[^\n]{0,30}?(?:\bCTR\b|클릭률)[^\n]{0,24}?${N}\s?%|(?:\bCTR\b|클릭률)[^\n]{0,24}?${N}\s?%[^\n]{0,30}?${UNIT}`)],
  ['adsense-pageviews', re(String.raw`(?:애드센스|AdSense)[^\n]{0,12}?(?:집계\s?)?페이지뷰[^\n]{0,8}?${N}`)],
  ['per-1000-views', re(String.raw`(?:${N}|천)\s?뷰당[^\n]{0,24}?[$₩]\s?${N}|${N}\s?PV\s?당\s?[$₩]\s?${N}`)],
  ['unit-counts', re(String.raw`${UNIT}[^\n]{0,30}?${BIG}\s?(?:노출|클릭|요청)|${BIG}\s?노출[^\n]{0,20}?[$₩]\s?${N}|${N}\s?클릭[^\n]{0,20}?[$₩]\s?${N}`)],
  ['usd-table-row', re(String.raw`^\s*\|[^\n]*\$\s?${N}[^\n]*\|[^\n]*\$\s?${N}`)],
];

export function scanText(text) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!/\d/.test(line) || line.includes(MARKER)) return;
    for (const [id, rx] of RULES) {
      if (id === 'usd-table-row' && AFFILIATE_ROW.test(line)) continue;
      if (rx.test(line)) { hits.push({ line: i + 1, rule: id }); break; }
    }
  });
  return hits;
}

export function scanRepo(root = ROOT) {
  const files = execFileSync('git', ['-C', root, 'ls-files', '-z'], { maxBuffer: 1 << 28 })
    .toString('utf8').split('\0').filter(f => f && SCOPE.test(f) && TEXT.test(f) && !EXCLUDE.test(f) && f !== SELF_TEST);
  const out = [];
  for (const f of files) {
    let text; try { text = readFileSync(path.join(root, f), 'utf8'); } catch { continue; }
    for (const h of scanText(text)) out.push({ file: f, ...h });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : ROOT;
  const hits = scanRepo(root);
  for (const h of hits) console.log(`${h.file}:${h.line} [${h.rule}]`);
  if (hits.length) {
    console.error(`[adsense-figures] ${hits.length}줄이 애드센스 실적 수치(RPM·CTR·CPC·노출·클릭·커버리지·Active View·단위 수익)로 보입니다. 숫자를 방향어(상승·하락·비공개)로 바꾸고 원값은 저장소 밖 운영자 기록에만 두세요(약관 비밀유지(Confidentiality) 조항). ${MARKER} 표시는 기준값·정의 줄에만 씁니다.`);
    console.error(`[adsense-figures] ${hits.length} line(s) look like AdSense performance statistics. Replace the numbers with qualitative wording and keep raw values outside the repository (AdSense Terms confidentiality clause). Mark only threshold or definition lines with ${MARKER}.`);
    process.exitCode = 1;
  } else console.log('[adsense-figures] OK');
}
