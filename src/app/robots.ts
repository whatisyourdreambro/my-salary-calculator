import { MetadataRoute } from 'next';

// 규칙 우선순위 메모:
// - 같은 path에 Allow/Disallow가 충돌하면 Google은 더 구체적인(긴) 경로 규칙을 따름
//   예: allow: '/api/og' + disallow: '/api/' → /api/og 는 허용, 그 외 /api/* 는 차단
// - AdsBot-Google·Mediapartners-Google 은 일반 User-agent: * 규칙을 따르지 않으므로
//   별도 그룹으로 명시 Allow 처리 (AdSense 광고 매칭 안정성)
// - /_next/ 차단 시 Googlebot이 JS·CSS 가져오지 못해 렌더링 실패 → 본문 색인 실패
//   (과거 incident — 절대 다시 차단하지 말 것)

export default function robots(): MetadataRoute.Robots {
 const baseUrl = "https://www.moneysalary.com";

 const corePathAllow = ['/', '/_next/', '/api/og'];
 const corePathDisallow = ['/private/', '/share/', '/api/'];

 return {
 rules: [
 // ─── 1. 광고 봇: AdSense 매칭에 필수 — 절대 차단 금지 ─────────
 // AdsBot-Google: 광고 페이지 품질 검수 (PMax·일반 광고 게재 결정)
 // Mediapartners-Google: AdSense 콘텐츠 기반 광고 매칭
 // 일반 User-agent: * 규칙을 무시하는 봇들이므로 별도 그룹 명시
 {
 userAgent: ['AdsBot-Google', 'AdsBot-Google-Mobile', 'Mediapartners-Google'],
 allow: '/',
 },

 // ─── 2. 핵심 검색 봇: 한국·글로벌 검색 시장 ─────────────────
 // Yeti = NaverBot, Daum = KakaoBot. 한국 트래픽의 30%+ 비중.
 // Applebot은 일반 검색용 (≠ Applebot-Extended는 AI 학습용으로 아래 차단)
 {
 userAgent: [
 'Googlebot',
 'Googlebot-Image',
 'Googlebot-News',
 'Bingbot',
 'NaverBot',
 'Yeti',
 'Daum',
 'DuckDuckBot',
 'Applebot',
 ],
 allow: corePathAllow,
 disallow: corePathDisallow,
 },

 // ─── 3. AI 크롤러 차단: 학습 데이터 수집 거부 (운영자 정책) ──
 // Applebot-Extended는 일반 Applebot과 분리된 AI 학습 전용 봇 — 차단
 {
 userAgent: [
 'GPTBot',
 'ChatGPT-User',
 'OAI-SearchBot',
 'CCBot',
 'PerplexityBot',
 'Perplexity-User',
 'Amazonbot',
 'AnthropicAI',
 'anthropic-ai',
 'Claude-Web',
 'ClaudeBot',
 'Claude-SearchBot',
 'cohere-ai',
 'Google-Extended',
 'Applebot-Extended',
 'Bytespider',
 'ImagesiftBot',
 'meta-externalagent',
 'FacebookBot',
 'Diffbot',
 'YouBot',
 'Timpibot',
 'Omgilibot',
 'omgili',
 ],
 disallow: '/',
 },

 // ─── 4. SEO 분석 봇 차단: 서버 자원 낭비 + 경쟁사 정찰 방지 ──
 {
 userAgent: [
 'SemrushBot',
 'AhrefsBot',
 'MJ12bot',
 'DotBot',
 'PetalBot',
 'BLEXBot',
 'DataForSeoBot',
 'SerpstatBot',
 'MegaIndex',
 'Barkrowler',
 'ZoominfoBot',
 'rogerbot',
 'SiteAuditBot',
 ],
 disallow: '/',
 },

 // ─── 5. 기타 모든 봇 기본값 ────────────────────────────────
 // 위에 명시되지 않은 봇은 이 규칙을 따름 (일반 검색 봇과 동일 정책)
 {
 userAgent: '*',
 allow: corePathAllow,
 disallow: corePathDisallow,
 },
 ],
 sitemap: `${baseUrl}/sitemap.xml`,
 host: baseUrl,
 };
}