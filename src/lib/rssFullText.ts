// src/lib/rssFullText.ts
//
// rss.xml <content:encoded> 본문 전문 가공 (2026-09-26 NAVER-03b).
// 네이버 서치어드바이저 요청 피드는 item 에 요약이 아닌 전문을 요구한다 — 최신 가이드 N편의 본문 HTML 을
// CDATA 로 싣는다. 피드 리더·수집기는 우리 도메인 밖에서 HTML 을 읽으므로:
//   1) 상대 href/src → https://www.moneysalary.com 절대 URL
//   2) <script>·<iframe> 제거 (피드 리더가 실행·삽입하지 않게)
//   3) XML 1.0 에서 쓸 수 없는 제어 문자 제거 (CDATA 안이어도 문서 전체가 깨진다)
//   4) 본문 속 "]]>" 는 CDATA 를 끊고 다시 여는 표준 분할("]]]]><![CDATA[>")
// 순수 함수만 — route.ts 는 GET 외 export 를 둘 수 없어(Next 라우트 규약) 여기서 단위 테스트한다.

export const FEED_ORIGIN = "https://www.moneysalary.com";

/** 절대 URL(스킴 있음)인가 — http:, https:, mailto:, tel:, data: 등 */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** 속성값 하나를 절대 URL 로. 스킴이 있으면 그대로, 해석 불가면 원문 유지. */
export function absolutizeUrl(value: string, pageUrl: string): string {
  const v = value.trim();
  if (!v || HAS_SCHEME.test(v)) return value;
  if (v.startsWith("//")) return `https:${v}`;
  // 루트 상대 경로는 원문 바이트를 그대로 두고 오리진만 붙인다(한글 경로 재인코딩 없음)
  if (v.startsWith("/")) return `${FEED_ORIGIN}${v}`;
  try {
    return new URL(v, pageUrl).href;
  } catch {
    return value;
  }
}

// 공백 뒤의 href/src 만 — data-src 같은 다른 속성은 건드리지 않는다. 따옴표로 감싼 값만 대상.
const URL_ATTR = /(\s)(href|src)(\s*=\s*)(["'])([\s\S]*?)\4/gi;
const PAIRED_SCRIPT_IFRAME = /<(script|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const STRAY_SCRIPT_IFRAME = /<\/?(?:script|iframe)\b[^>]*>/gi;
// XML 1.0 Char 범위 밖(탭·LF·CR 제외 C0 제어 문자, U+FFFE·U+FFFF)
// eslint-disable-next-line no-control-regex
const XML_INVALID_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

/** 가이드 본문 HTML → 피드용 HTML (CDATA 감싸기 전) */
export function feedHtml(html: string, pageUrl: string): string {
  return html
    .replace(PAIRED_SCRIPT_IFRAME, "")
    .replace(STRAY_SCRIPT_IFRAME, "")
    .replace(XML_INVALID_CHARS, "")
    .replace(
      URL_ATTR,
      (_m, space: string, name: string, eq: string, quote: string, value: string) =>
        `${space}${name}${eq}${quote}${absolutizeUrl(value, pageUrl)}${quote}`
    );
}

/** 텍스트를 CDATA 섹션으로 — 본문 속 "]]>" 는 섹션을 끊고 다시 연다 */
export function cdata(text: string): string {
  return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** <content:encoded> 요소 한 개 */
export function contentEncoded(html: string, pageUrl: string): string {
  return `<content:encoded>${cdata(feedHtml(html, pageUrl))}</content:encoded>`;
}
