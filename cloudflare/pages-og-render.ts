// Build-time only (G2/PD-02): draws the finite set of prebuilt OG cards from the reviewed strip data.
// The Worker never imports this module or the strip data; scripts/pages-build.mjs refuses a bundle that does.
import { normalizeOgParams, ogPathKind, type OgPathKind } from '../src/lib/ogImageCache';
import { CURRENT_RATES_YEAR } from '../src/config/currentRates';
import { renderStripPng, type OgStripData } from './pages-og-strips';

type Kind = 'salary' | 'tool' | 'guide' | 'fun' | 'company' | 'report' | 'en' | 'default';
export interface OgContent { kind: Kind; title: string; net?: string; label?: string }
const PATH_KINDS: Record<OgPathKind, Kind> = { '/fun': 'fun', '/insights': 'report', '/guides': 'guide', '/salary-db': 'company' };

/** Same normalized branch priority/defaults as the Next OG handler (src/app/api/og/route.tsx). */
export function resolveOgContent(input: URLSearchParams): OgContent {
  const params = normalizeOgParams(input);
  const type = params.get('type');
  const title = params.get('title') || '연봉 실수령액 계산기';
  if (params.get('lang') === 'en') return { kind: 'en', title: params.get('title') || 'Korea Salary Calculator' };
  const salary = (amount: string) => {
    const net = params.get('net') || params.get('netPay');
    // Normalized nonnegative integers are <=100,000,000 manwon. Avoid loading ICU
    // just to insert the same Korean thousands separators.
    const format = (value: string) => {
      const digits = String(Math.round(Number(value) / 10000));
      const groups: string[] = [];
      for (let end = digits.length; end > 0; end -= 3) groups.unshift(digits.slice(Math.max(0, end - 3), end));
      return groups.join(',');
    };
    return { kind: 'salary' as const, title: `연봉 ${format(amount)}만원`,
      ...(net ? { net: `월 ${format(net)}만원` } : {}), label: `${CURRENT_RATES_YEAR} 연봉 리포트` };
  };
  if (type === 'salary') return salary(params.get('amount') || '50000000');
  if (type === 'tool' || type === 'company') return { kind: type, title: params.get('name') || title };
  if (type === 'guide' || type === 'fun' || type === 'report') return { kind: type, title };
  const amount = params.get('amount');
  if (amount) return salary(amount);
  const prefix = ogPathKind(params.get('path') || '');
  return { kind: prefix ? PATH_KINDS[prefix] : 'default', title };
}

/** One prebuilt card from hash-verified strip data (scripts/generate-pages-og.ts loads and checks it). */
export function renderPagesOg(params: URLSearchParams, strips: OgStripData): Uint8Array<ArrayBuffer> {
  return renderStripPng(resolveOgContent(params), strips);
}
