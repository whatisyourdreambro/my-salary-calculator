import { MetadataRoute } from 'next';

// The rules depend only on repository data, including in native Pages exports.
export const dynamic = 'force-static';

// 규칙 우선순위 메모:
// - 같은 path에 Allow/Disallow가 충돌하면 Google은 더 구체적인(긴) 경로 규칙을 따름
// - AdsBot-Google·Mediapartners-Google 은 일반 User-agent: * 규칙을 따르지 않으므로
//   별도 그룹으로 명시 Allow 처리 (AdSense 광고 매칭 안정성)
// - /_next/ 차단 시 Googlebot이 JS·CSS 가져오지 못해 렌더링 실패 → 본문 색인 실패
//   (과거 incident — 절대 다시 차단하지 말 것)
// - /api/og 는 OG 이미지(공유 카드) 경로. 2026-05-24 Googlebot 이 이 URL 을 페이지로 색인해 GSC "색인된 페이지"
//   자리를 채운 사고 뒤 응답 헤더 X-Robots-Tag(noindex, noimageindex, nofollow — cloudflare/pages-og.ts)를 달았다.
//   2026-09-06 부터는 크롤은 모든 그룹에 허용(아래 corePathAllow 의 '/api/og')이고, 색인 거부는 그 응답 헤더만 맡는다
//   ('Disallow + 헤더' 이중 차단이 아니다 — 2026-11-13 lens-crawl-F08 정정). 헤더를 뗄지는 운영자 결정 대기(lens-crawl-F03).
//   SNS·OG 크롤러(Facebook·Twitterbot·Kakao 등)는 og:image meta 를 직접 가져가므로 SNS 미리보기는 정상 동작함.

export default function robots(): MetadataRoute.Robots {
 const baseUrl = "https://www.moneysalary.com";

 // /api/og 는 전 페이지의 og:image·Article.image 소스다(src/lib/seo.ts).
 // Disallow: /api/ 안에 묻혀 있으면 Googlebot·Googlebot-Image 가 썸네일을
 // 못 가져와 SERP 이미지·Discover·리치결과 이미지가 전부 죽는다.
 // robots.txt 는 더 긴 경로의 Allow 가 이기므로 Disallow: /api/ 와 공존한다.
 // (2026-09-06 전수검사)
 const corePathAllow = ['/', '/_next/', '/api/og'];
 // /widget/ = 임베드 iframe 전용(자가완결 HTML, X-Robots-Tag noindex 병행) —
 // 색인 대상은 안내 페이지 /embed 쪽이다.
 // /share/ 는 크롤 허용으로 되돌렸다: 페이지 자체가 metadata 에서
 // robots{index:false} 를 선언하므로 색인은 이미 막혀 있고, robots.txt 로
 // 크롤까지 막으면 (a) 카카오·페이스북·트위터 크롤러가 OG 태그를 못 읽어
 // 바이럴 공유 카드가 제목·설명·이미지 전부 빈칸이 되고, (b) noindex 메타를
 // 읽을 수 없어 URL-only 색인이 오히려 남을 수 있다.
 // /adgk/ = Cloudflare 구글 태그 게이트웨이(GA4 수집·광고 전환 핑의 1st-party 경로).
 // GSC 크롤 통계(2026-11-01, 지난 90일 8.24만 건)에서 '다른 파일 형식' 2.43만 건(GA4
 // 수집 핑)과 302 3.37천 건(전환 핑)이 전부 이 경로였다 — 구글 렌더러가 페이지를 그릴
 // 때마다 측정 요청을 보내 크롤 몫의 약 1/3을 쓰고, 새 페이지 발견 크롤은 1%였다.
 // 측정은 본문 렌더링에 필요 없으므로 크롤만 막는다. AdsBot·Mediapartners 그룹은
 // '/' 허용 그대로라 광고 매칭에는 영향이 없다.
 const corePathDisallow = ['/private/', '/api/', '/widget/', '/adgk/'];
 // ↓ 구글 크롤러(Googlebot·Googlebot-Image·Googlebot-News) 그룹에만 붙는 세 줄 (G1, 2026-11-01 근거).
 // 운영자 승인(2026-11-01 구글 개선 1번)이 '구글 크롤에서 빼기'라서 구글 그룹에만 둔다. 네이버(유입의
 // 대부분)·Bing·Daum·DuckDuckBot·Applebot·기타(*) 그룹 줄은 그대로다 — 승인 범위 밖이고, 네이버 Yeti 가
 // robots 의 '?' 패턴을 어떻게 읽는지 공개 자료도 없다(2026-11-02 통합 수정).
 // /?tab= = 홈 계산기 탭 주소(헤더 메뉴·홈 도구 카드·계산기 안내 링크·PWA 바로가기가 만든다).
 // 정적 HTML 은 홈과 같고 탭은 브라우저에서만 바뀌며 canonical 도 홈이다. GSC 크롤 통계
 // (2026-11-01)의 '새 주소 발견' 크롤 표본 894개 중 170개(19%)가 이 주소였다 — 적은 발견 몫을
 // 홈 사본에 썼다. ?tab= 을 읽는 경로는 홈뿐이라 '/*?tab=' 대신 홈 접두사만 막는다.
 // /guides?q=·/en/guides?q= = 가이드 내부 검색(글 태그·카테고리 링크, rel=nofollow). 응답은 이미
 // canonical 허브 + X-Robots-Tag 'noindex, follow' 인데 GSC 색인 보고서(10/20 크롤분)에
 // 'canonical 대체' 84건·noindex 6건으로 남았다. 크롤만 막고 noindex 헤더는 규칙을 따르지 않는
 // 봇 대비로 그대로 둔다. 허브·글·/guides/category/…·?category= 는 접두사가 달라 열려 있다.
 // 막힌 주소가 URL 만 색인되는지는 GSC '차단되었지만 색인됨'으로 확인한다. 세 줄 모두
 // AdsBot·Mediapartners 그룹에는 없어 광고 매칭에는 영향이 없다.
 const googleParamDisallow = ['/?tab=', '/guides?q=', '/en/guides?q='];

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
 // Yeti = NaverBot, Daum = KakaoBot. 네이버 세션 67.7%(GA4 2026-01-01~09-05, Daum 별도 미측정).
 // Applebot 포함 — 검색 크롤러는 모두 허용 (AI 크롤러도 차단 안 함).
 // [2026-08-10] CF Workers 일 요청 한도 대응 — Crawl-delay를 존중하는
 // 봇(Bing·Naver·Daum)은 별도 그룹으로 분리해 크롤 속도 제한.
 // Google은 Crawl-delay를 무시하므로(자체 조절) 기존 그룹 유지.
 // [2026-11-02] 구글 전용 세 줄(googleParamDisallow) 때문에 Google 그룹과 DuckDuckBot·Applebot
 // 그룹을 나눴다. 두 그룹의 나머지 규칙은 같고, DuckDuckBot·Applebot 줄은 이전과 같다.
 {
 userAgent: [
 'Googlebot',
 'Googlebot-Image',
 'Googlebot-News',
 ],
 allow: corePathAllow,
 disallow: [...corePathDisallow, ...googleParamDisallow],
 },
 {
 userAgent: [
 'DuckDuckBot',
 'Applebot',
 ],
 allow: corePathAllow,
 disallow: corePathDisallow,
 },
 {
 userAgent: 'Bingbot',
 allow: corePathAllow,
 disallow: corePathDisallow,
 crawlDelay: 10,
 },
 {
 userAgent: ['NaverBot', 'Yeti', 'Daum'],
 allow: corePathAllow,
 disallow: corePathDisallow,
 crawlDelay: 5,
 },

 // ─── AI 크롤러: 차단하지 않음 (검색·학습 크롤러 모두 허용) ──
 // ChatGPT·Perplexity·Claude 등 AI 검색 크롤러는 AI 검색 결과에서
 // 방문자를 보내주는 유입 통로. 학습 크롤러(GPTBot 등)도 콘텐츠가
 // 공개 세법 정보라 차단 실익이 없음 → 별도 차단 그룹을 두지 않고
 // 아래 기본 그룹(User-agent: *)에 흡수되어 일반 검색봇처럼 허용.
 // ★ 각주(2026-11-13 갱신, lens-crawl-F08): 운영 robots.txt(2026-11-01·11-12 실측 4,009B)는 이 파일이 만들지 않은
 // Cloudflare 관리 블록('# BEGIN Cloudflare Managed content' ~ '# END Cloudflare Managed Content')으로 시작한다 —
 // 'User-agent: *' 그룹(Content-Signal: search=yes,ai-train=no,use=reference, Allow: /) 다음에 학습·기타 크롤러
 // (GPTBot·ClaudeBot·Google-Extended·GoogleOther·Amazonbot·Applebot-Extended·CCBot·Bytespider·Baiduspider 등)의
 // Disallow: / 그룹이 오고, 그 뒤에 이 파일 출력이 붙는다. CF 대시보드 설정이며 9/24~25 실측(1,265B)에는 없었고
 // 11/1 에 다시 있었다. 표준 파서는 두 '*' 그룹을 합친다. Googlebot·Yeti·Daum·Bingbot·AdsBot·Mediapartners 는 각자
 // 그룹을 따르므로 검색·광고 크롤에는 영향이 없다. 게시 뒤 robots.txt 를 대조할 때는 '# END Cloudflare Managed Content'
 // 아래만 빌드 산출물과 비교한다. 이 파일은 AI 전용 그룹을 두지 않는다 — 그룹·crawl-delay 는 그대로
 // 둔다(AI 전용 그룹·Bingbot crawl-delay 변경은 기각 목록 — 100x 계획 §9·§10-4).

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
 // [2026-08-26] middleware.ts BAD_BOTS(403 차단)와 선언 통일 — 나머지 6종
 'Bytespider',
 'SeznamBot',
 'YandexBot',
 'ImagesiftBot',
 'MauiBot',
 'SerendeputyBot',
 ],
 disallow: '/',
 },

 // ─── 4. 기타 모든 봇 기본값 ────────────────────────────────
 // 위에 명시되지 않은 봇은 이 규칙을 따름 (일반 검색 봇과 동일 정책)
 // Crawl-delay는 best-effort — 무시하는 봇은 그대로 요청한다.
 // ※ 2026-11-13: 예전 메모의 엣지 HTML 캐시(s-maxage·CF Cache Rule)는 11/1 부터 꺼져 있다 — 그 흡수를 전제하지 않는다.
 {
 userAgent: '*',
 allow: corePathAllow,
 disallow: corePathDisallow,
 crawlDelay: 10,
 },
 ],
 sitemap: `${baseUrl}/sitemap.xml`,
 host: baseUrl,
 };
}
