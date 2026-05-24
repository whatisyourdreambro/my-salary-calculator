import { MetadataRoute } from 'next';

// 규칙 우선순위 메모:
// - 같은 path에 Allow/Disallow가 충돌하면 Google은 더 구체적인(긴) 경로 규칙을 따름
// - AdsBot-Google·Mediapartners-Google 은 일반 User-agent: * 규칙을 따르지 않으므로
//   별도 그룹으로 명시 Allow 처리 (AdSense 광고 매칭 안정성)
// - /_next/ 차단 시 Googlebot이 JS·CSS 가져오지 못해 렌더링 실패 → 본문 색인 실패
//   (과거 incident — 절대 다시 차단하지 말 것)
// - /api/og 는 OG 이미지 생성 API. 과거 Allow였으나 Googlebot이 페이지로 색인해
//   GSC "색인된 페이지" 자리를 OG URL이 가득 채우는 사고 발생(2026-05-24).
//   이제는 Disallow + route 응답 헤더 X-Robots-Tag: noindex 로 이중 차단.
//   SNS·OG 크롤러(Facebook·Twitterbot·Kakao 등)는 robots.txt를 무시하고
//   og:image meta 를 직접 가져가므로 SNS 미리보기는 정상 동작함.

export default function robots(): MetadataRoute.Robots {
 const baseUrl = "https://www.moneysalary.com";

 const corePathAllow = ['/', '/_next/'];
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
 // Applebot 포함 — 검색 크롤러는 모두 허용 (AI 크롤러도 차단 안 함).
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

 // ─── AI 크롤러: 차단하지 않음 (검색·학습 크롤러 모두 허용) ──
 // ChatGPT·Perplexity·Claude 등 AI 검색 크롤러는 AI 검색 결과에서
 // 방문자를 보내주는 유입 통로. 학습 크롤러(GPTBot 등)도 콘텐츠가
 // 공개 세법 정보라 차단 실익이 없음 → 별도 차단 그룹을 두지 않고
 // 아래 기본 그룹(User-agent: *)에 흡수되어 일반 검색봇처럼 허용.

 // ─── 3. SEO 분석 봇 차단: 서버 자원 낭비 + 경쟁사 정찰 방지 ──
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

 // ─── 4. 기타 모든 봇 기본값 ────────────────────────────────
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