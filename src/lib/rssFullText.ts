// src/lib/rssFullText.ts
//
// rss.xml <content:encoded> 본문 전문 가공 (2026-09-26 NAVER-03b).
// 네이버 서치어드바이저 요청 피드는 item 에 요약이 아닌 전문을 요구한다 — 최신 가이드 N편의 본문 HTML 을
// CDATA 로 싣는다. 피드 리더·수집기는 우리 도메인 밖에서 HTML 을 읽으므로:
//   1) 상대 href/src → https://www.moneysalary.com 절대 URL
//   2) <script>·<iframe>·<style>·<object>·<embed>·<form> 태그, on* 이벤트 속성,
//      javascript:·vbscript:·data: URL 제거 (피드 리더가 실행·삽입하지 않게 — 2026-09-26 보안 리뷰 강화)
//   3) XML 1.0 에서 쓸 수 없는 제어 문자 제거 (CDATA 안이어도 문서 전체가 깨진다)
//   4) 본문 속 "]]>" 는 CDATA 를 끊고 다시 여는 표준 분할("]]]]><![CDATA[>")
// 순수 함수만 — route.ts 는 GET 외 export 를 둘 수 없어(Next 라우트 규약) 여기서 단위 테스트한다.

export const FEED_ORIGIN = "https://www.moneysalary.com";

/**
 * 본문 전문(content:encoded)을 싣는 최신 가이드 수. 50편은 피드 약 0.77MB(9/26 로컬 CF 실측 767KB)라
 * 네이버 서치어드바이저의 'RSS 파일 크기를 줄여주세요' 거부 사례(50→30편으로 해소)를 피해 30편으로 둔다.
 * route.ts 는 GET 외 export 를 둘 수 없어 테스트와 공유하려고 여기 둔다.
 */
export const FULL_TEXT_GUIDE_COUNT = 30;

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
// 내용째 지우는 태그(실행·삽입·스타일) — 짝 있는 것 먼저, 남은 단독·닫는 태그는 STRAY 로
const PAIRED_ACTIVE = /<(script|iframe|style|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
// form 은 안의 본문을 살리고 태그만 지운다
const STRAY_ACTIVE = /<\/?(?:script|iframe|style|object|embed|form)\b[^>]*>/gi;
// 여는 태그 하나(속성 값 안의 '>' 는 따옴표로 건너뜀)
const OPEN_TAG = /<[a-z][a-z0-9-]*\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
// 태그 안의 on* 이벤트 속성(따옴표·무따옴표 값)
const EVENT_ATTR = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+)/gi;
// 태그 안의 따옴표 없는 href/src 위험 스킴
const UNQUOTED_DANGEROUS_URL = /(\s(?:href|src)\s*=\s*)(?:javascript|vbscript|data):[^\s>]*/gi;
/** 실행되거나 문서를 삽입하는 URL 스킴 (앞 공백 우회 포함 — 제어 문자는 XML_INVALID_CHARS 가 먼저 지운다) */
const DANGEROUS_SCHEME = /^\s*(?:javascript|vbscript|data):/i;
// XML 1.0 Char 범위 밖(탭·LF·CR 제외 C0 제어 문자, U+FFFE·U+FFFF)
// eslint-disable-next-line no-control-regex
const XML_INVALID_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

/** 가이드 본문 HTML → 피드용 HTML (CDATA 감싸기 전) */
export function feedHtml(html: string, pageUrl: string): string {
  return html
    .replace(PAIRED_ACTIVE, "")
    .replace(STRAY_ACTIVE, "")
    .replace(OPEN_TAG, (tag) => tag.replace(EVENT_ATTR, "").replace(UNQUOTED_DANGEROUS_URL, "$1\"#\""))
    .replace(XML_INVALID_CHARS, "")
    .replace(
      URL_ATTR,
      (_m, space: string, name: string, eq: string, quote: string, value: string) =>
        `${space}${name}${eq}${quote}${DANGEROUS_SCHEME.test(value) ? "#" : absolutizeUrl(value, pageUrl)}${quote}`
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
