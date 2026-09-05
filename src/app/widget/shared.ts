// src/app/widget/shared.ts
//
// 임베드 위젯 공통 셸 (2026-08 위젯 5종 확장 시 신설).
// - 위젯은 루트 레이아웃(AdSense·GA4·카카오)을 우회하는 자가완결 HTML(Route Handler) —
//   iframe 내 광고 스크립트 실행은 AdSense 정책 리스크 (widget/salary 헤더 주석 참조).
// - CSP·캐시 헤더는 핸들러가 직접 세팅하는 것이 정본 (next-on-pages 가 config
//   headers() 를 정적 라우트에 내보내지 않는 실측 — next.config /widget/:path* 는 dev 패리티).
// - 기존 위젯 2종(salary·year-end-tax)도 CSP 상수는 이 모듈로 수렴(2026-08-26) —
//   헤더 세팅 자체는 여전히 각 핸들러가 직접 수행. 셸(widgetShell)은 신규 위젯용.
// - 임베드 호스트 계측(2026-09-05): WIDGET_REFERRER_SCRIPT 가 document.referrer 호스트를
//   CTA·brand 링크 utm_content 로 부착 — 셸 위젯 6종은 widgetShell 이, 수기 위젯 2종
//   (salary·year-end-tax)은 각 핸들러가 동일 상수를 삽입. GA4 '세션 수동 광고 콘텐츠'
//   측정기준으로 임베드 도메인 집계(R2 B2·B3 KPI). 외부 요청·CSP 변경 없음.

/** 위젯 전용 최소 CSP — frame-ancestors * 가 임베드 허용의 핵심 */
export const WIDGET_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors *; base-uri 'none'; form-action 'none'";

export const WIDGET_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": WIDGET_CSP,
  "X-Robots-Tag": "noindex, nofollow",
  // 위젯은 배포 시에만 바뀜 — 브라우저 1시간 · 엣지 1일 캐시
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
} as const;

/** widget/salary 와 동일 팔레트·컴포넌트 스타일 (라이트/다크 자동) */
export const WIDGET_STYLE = `
  :root {
    --bg: #ffffff; --card: #f4f6f9; --text: #0a1829; --sub: #5b6b82;
    --accent: #0145F2; --border: #e2e8f0;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --sub: #94a3b8;
      --accent: #5b8bff; --border: #334155;
    }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: var(--bg); }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
      "Malgun Gothic", "Segoe UI", sans-serif;
    color: var(--text); padding: 16px; font-size: 14px;
  }
  .title { font-size: 15px; font-weight: 800; margin-bottom: 12px; }
  .title span { color: var(--accent); }
  .row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  label { font-weight: 700; font-size: 13px; color: var(--sub); white-space: nowrap; }
  input[type="number"] {
    flex: 1; min-width: 0; padding: 10px 12px; font-size: 16px; font-weight: 700;
    border: 1px solid var(--border); border-radius: 10px;
    background: var(--bg); color: var(--text); outline: none;
  }
  input[type="number"]:focus { border-color: var(--accent); }
  .unit { font-weight: 700; color: var(--sub); font-size: 13px; }
  .result {
    background: var(--card); border-radius: 12px; padding: 14px 16px;
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
  }
  .result .label { font-size: 13px; font-weight: 700; color: var(--sub); }
  .result .value { font-size: 24px; font-weight: 900; color: var(--accent); }
  .result .value small { font-size: 14px; font-weight: 700; }
  .result.minor .value { font-size: 17px; }
  .note { font-size: 11px; color: var(--sub); line-height: 1.5; margin-bottom: 10px; }
  .cta {
    display: block; text-align: center; padding: 10px 12px;
    background: var(--accent); color: #fff; font-weight: 800; font-size: 13px;
    border-radius: 10px; text-decoration: none;
  }
  .brand { margin-top: 8px; text-align: center; font-size: 11px; }
  .brand a { color: var(--sub); text-decoration: none; font-weight: 700; }
`;

/**
 * 임베드 호스트 계측 IIFE — 인라인 전용(CSP script-src 'unsafe-inline' 범위, 외부 요청 0회).
 * iframe 안의 document.referrer 는 기본 referrer policy(strict-origin-when-cross-origin)에서
 * 부모 페이지 origin → hostname 을 CTA(a.cta)·brand(.brand a) 링크의 utm_content 로 부착한다.
 * - URL API(searchParams.set)로 결합 — href 에 '?' 유무와 무관하게 안전, 기존 utm 보존.
 * - referrer 비어있음(직접 열기·no-referrer 정책·프라이버시 브라우저)·파싱 실패 시 href 무변경.
 * - rel 속성은 건드리지 않는다(noopener 유지). "</script>" 문자열 포함 금지.
 */
export const WIDGET_REFERRER_SCRIPT =
  '(function(){try{var r=document.referrer;if(!r)return;var h=new URL(r).hostname;if(!h)return;' +
  'var as=document.querySelectorAll("a.cta,.brand a");for(var i=0;i<as.length;i++){try{' +
  'var u=new URL(as[i].href);u.searchParams.set("utm_content",h);as[i].href=u.href;}catch(e){}}}catch(e){}})();';

export interface WidgetShellOptions {
  /** <title> */
  title: string;
  /** body 마크업 (title p 포함) */
  bodyHtml: string;
  /** 인라인 스크립트 본문 (IIFE 권장) — "</script>" 문자열 포함 금지 */
  script: string;
  /** CTA 본편 경로 (utm 자동 부착) */
  ctaHref: string;
  ctaLabel: string;
}

export function widgetShell({ title, bodyHtml, script, ctaHref, ctaLabel }: WidgetShellOptions): string {
  const cta = `https://www.moneysalary.com${ctaHref}${ctaHref.includes("?") ? "&" : "?"}utm_source=widget&utm_medium=iframe`;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<style>${WIDGET_STYLE}</style>
</head>
<body>
${bodyHtml}
  <a class="cta" href="${cta}" target="_blank" rel="noopener">${ctaLabel}</a>
  <p class="brand"><a href="${cta}" target="_blank" rel="noopener">by 머니샐러리</a></p>
<script>
${script}
</script>
<script>${WIDGET_REFERRER_SCRIPT}</script>
</body>
</html>`;
}
