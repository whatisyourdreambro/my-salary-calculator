// src/lib/trendBriefs/text.ts
//
// 브리프 게이트용 텍스트 도구 — 가시 텍스트·n-gram 포함률·제목 토큰·최장 공통 부분 문자열·UTF-8 바이트.
// 순수 함수만(엔진·React·node: import 없음). 규칙은 rules.ts, 임계값은 types.ts.

/** 인라인 태그는 지우고(단어가 쪼개지지 않게) 블록 태그는 공백으로 — guideSpec.test.ts visibleText 와 같은 규칙 */
export function visibleText(html: string): string {
  return html
    .replace(/<\/?(?:strong|em|b|i|u|a|span|code|mark|sup|sub|small)\b[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** 태그만 지운 텍스트 길이 기준(guideSpec keeperViolations 의 text) — 공백 정규화 */
export function strippedText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/** 문자열의 UTF-8 바이트 수 */
export function utf8Bytes(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      const d = s.charCodeAt(i + 1);
      if (d >= 0xdc00 && d <= 0xdfff) {
        n += 4;
        i++;
      } else n += 3;
    } else n += 3;
  }
  return n;
}

/** n-gram 비교용 정규화 — 공백 제거·소문자 (띄어쓰기만 바꾼 재진술도 같은 조각으로 본다) */
export function normalizeForShingles(text: string): string {
  return text.replace(/\s+/g, "").toLowerCase();
}

/** 32비트 FNV-1a 해시 */
function fnv1a(s: string, start: number, len: number): number {
  let h = 0x811c9dc5;
  for (let i = start; i < start + len; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 문자 n-gram(기본 5) 조각의 32비트 해시 집합 */
export function shingles(text: string, n = 5): Set<number> {
  const s = normalizeForShingles(text);
  const out = new Set<number>();
  if (s.length < n) {
    if (s.length) out.add(fnv1a(s, 0, s.length));
    return out;
  }
  for (let i = 0; i + n <= s.length; i++) out.add(fnv1a(s, i, n));
  return out;
}

/** 포함률 = |a ∩ b| / |a| (a = 브리프 조각). a 가 비면 0. */
export function containment(a: Set<number>, b: Set<number>): number {
  if (a.size === 0) return 0;
  let hit = 0;
  a.forEach((x) => {
    if (b.has(x)) hit++;
  });
  return hit / a.size;
}

/** 8-gram 포함률 — 브리프 텍스트 조각 중 출처 스냅숏에 있는 비율 */
export function ngram8Containment(briefText: string, sourceText: string): number {
  return containment(shingles(briefText, 8), shingles(sourceText, 8));
}

/** 제목 토큰 — 문장부호·기호로 자르고 2글자 이상만, 소문자 */
export function titleTokens(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^0-9a-z가-힣ㄱ-ㆎ]+/)
    .filter((t) => t.length >= 2);
}

/** 제목 토큰 Jaccard */
export function titleJaccard(a: string, b: string): number {
  const ta = new Set(titleTokens(a));
  const tb = new Set(titleTokens(b));
  if (ta.size === 0 && tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((t) => {
    if (tb.has(t)) inter++;
  });
  return inter / (ta.size + tb.size - inter);
}

/**
 * 최장 공통 부분 문자열 길이(공백 정규화 후). O(n·m) 동적 계획 — 두 입력은 cap 자로 자르고,
 * 결과가 stopAt 이상이 되면 즉시 멈춘다(임계값만 알면 되는 게이트용 조기 종료).
 */
export function longestCommonSubstring(a: string, b: string, cap = 600, stopAt = Infinity): number {
  const x = normalizeForShingles(a).slice(0, cap);
  const y = normalizeForShingles(b).slice(0, cap);
  if (!x.length || !y.length) return 0;
  let prev = new Uint16Array(y.length + 1);
  let cur = new Uint16Array(y.length + 1);
  let best = 0;
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      if (x.charCodeAt(i - 1) === y.charCodeAt(j - 1)) {
        const v = prev[j - 1] + 1;
        cur[j] = v;
        if (v > best) {
          best = v;
          if (best >= stopAt) return best;
        }
      } else cur[j] = 0;
    }
    const t = prev;
    prev = cur;
    cur = t;
    cur.fill(0);
  }
  return best;
}

// 본문 HTML을 <h2 시작 위치에서만 분할 — GuidePageClient.tsx 의 splitContentByH2 를 글자 그대로 복제한다.
// (런타임 함수는 export 되지 않는다. trendBriefSpec.test.ts 가 원본과 같은 코드인지 정규식으로 추출해 대조한다.)
function splitContentByH2(html: string): string[] {
 const h2Pattern = /<h2[\s>]/gi;
 const indices: number[] = [];
 let match: RegExpExecArray | null;
 while ((match = h2Pattern.exec(html)) !== null) indices.push(match.index);

 // h2 2개 미만 — 분할하지 않음
 if (indices.length < 2) return [html];

 // 본문이 h2로 시작하면 그 위치는 분할점에서 제외 (빈 조각 방지)
 const candidates = indices.filter((i) => i > 0);
 if (candidates.length === 0) return [html];

 const nearest = (target: number, pool: number[]) =>
 pool.reduce((best, cur) =>
 Math.abs(cur - target) < Math.abs(best - target) ? cur : best
 );

 // 짧은 글은 2분할(중간 1곳), 긴 글은 3분할(1/3·2/3 지점)
 if (html.length < 4000 || candidates.length === 1) {
 const p = nearest(html.length / 2, candidates);
 return [html.slice(0, p), html.slice(p)];
 }

 const p1 = nearest(html.length / 3, candidates);
 const after = candidates.filter((i) => i > p1);
 if (after.length === 0) return [html.slice(0, p1), html.slice(p1)];

 const p2 = nearest((html.length * 2) / 3, after);
 return [html.slice(0, p1), html.slice(p1, p2), html.slice(p2)];
}

/** 가이드 상세 페이지가 본문을 몇 조각으로 나누는지 — 3이면 GuideMidAd(1/3)·InArticleAd(2/3) 3분할 */
export function guideSegments(html: string): string[] {
  return splitContentByH2(html);
}
