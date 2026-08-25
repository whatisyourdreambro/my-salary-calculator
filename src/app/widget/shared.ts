// src/app/widget/shared.ts
//
// 임베드 위젯 공통 셸 (2026-08 위젯 5종 확장 시 신설).
// - 위젯은 루트 레이아웃(AdSense·GA4·카카오)을 우회하는 자가완결 HTML(Route Handler) —
//   iframe 내 광고 스크립트 실행은 AdSense 정책 리스크 (widget/salary 헤더 주석 참조).
// - CSP·캐시 헤더는 핸들러가 직접 세팅하는 것이 정본 (next-on-pages 가 config
//   headers() 를 정적 라우트에 내보내지 않는 실측 — next.config /widget/:path* 는 dev 패리티).
// - 기존 위젯 2종(salary·year-end-tax)은 무변경 — 신규 위젯부터 이 셸 사용.

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
</body>
</html>`;
}
