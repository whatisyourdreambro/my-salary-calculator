import { MetadataRoute } from 'next';
import { koGuides, enGuides } from '@/lib/guidesData';
import { glossaryData, toGlossarySlug } from '@/data/glossaryData';
import { qnaData, toQnaSlug } from '@/data/qnaData';
import { jobsData } from '@/data/jobsData';
import { getStaticMonthlyAmounts } from '@/lib/monthlyStaticParams';
import { industriesData } from '@/data/industriesData';
import { regionsData } from '@/data/regionsData';
import { reportsRegistry } from '@/data/reportsRegistry';

type ChangeFrequency =
 | 'always'
 | 'hourly'
 | 'daily'
 | 'weekly'
 | 'monthly'
 | 'yearly'
 | 'never';

export default function sitemap(): MetadataRoute.Sitemap {
 const baseUrl = "https://www.moneysalary.com";

 // 1. Static Pages
 const staticRoutes = [
 '/',
 // /dashboard, /report 는 개인 localStorage 페이지(noindex) → 사이트맵 제외
 '/home-loan',
 '/year-end-tax',
 '/fire-calculator',
 '/car-loan',
 '/mbti-salary',
 '/lotto',
 '/fortune-2026',
 '/tips',
 '/guides',
 '/qna',
 '/glossary',
 // 주제별 허브(필러) 페이지 — 흩어진 계산기·도구를 주제로 묶는 내부 링크 허브
 '/hub',
 '/hub/fire',
 '/hub/invest',
 '/hub/real-estate',
 '/hub/tax-saving',
 '/hub/career',
 // 2026-07-06 신설 — /calc 고아 61종에 SSR 인바운드 링크 부여 (GSC 발견됨-미색인 해소)
 '/hub/insurance',
 '/hub/business',
 '/hub/daily-life',
 // 임베드 위젯 안내 (2026-08-17) — /widget/salary 자체는 noindex라 미등재
 '/embed',
 '/about',
 '/privacy',
 '/terms',
 // Seasonal pages — 시즌 트래픽 핵심
 '/year-end-tax-2026',
 '/health-insurance-2026',
 '/year-end-tax-settlement-2026',
 '/new-employee-2026',
 '/new-employee-salary-2026',
 '/minimum-wage-2026',
 // 2026-07-16 신설 — 2027 최저임금 의결(7/14) 직후 검색 폭발 대응
 '/minimum-wage-2027',
 '/health-checkup-2026',
 '/samsung-negotiation-2026',
 // Info pages — 정보성 검색 트래픽
 '/tax-rates-2026',
 '/social-insurance-rates-2026',
 '/tax-changes-2026',
 // 2026-07-16 신설 — 세법개정안 7월 말 발표 선점 페이지 (발표 당일 갱신)
 '/tax-reform-2026',
 '/year-end-tax-checklist',
 '/retirement-pension-2026',
 '/career-stages-2026',
 '/salary-raise-2026',
 // 100가지 계산기 인덱스
 '/calc',
 // Calc Pages
 '/calc/2026-year',
 // Season pages — 시즌별 트래픽 폭증 키워드 (11~3월)
 '/calc/year-end-bonus',
 '/calc/incentive-tax',
 '/calc/january-bonus',
 '/calc/year-end-bonus-tax',
 '/calc/severance-vs-pension',
 // V2 Season pages (additional 5)
 '/calc/holiday-bonus',
 '/calc/vacation-pay',
 '/calc/child-deduction',
 '/calc/jeonse-loan',
 '/calc/housing-subscription',
 // 회사별 성과급 계산기 — 시즌 트래픽(1월·7월 지급) + GA 데이터상 단일 페이지 폭증 검증
 '/calc/samsung-bonus',
 '/calc/sk-hynix-bonus',
 '/calc/hyundai-bonus',
 '/calc/kia-bonus',
 '/calc/lg-energy-bonus',
 '/calc/hd-hyundai-bonus',
 '/calc/naver-bonus',
 '/calc/kakao-bonus',
 '/calc/posco-bonus',
 '/calc/samsung-sdi-bonus',
 '/calc/lg-chem-bonus',
 '/calc/celltrion-bonus',
 '/calc/hyundai-rotem-bonus',
 // 성과급 계산기 확장 10종 (2026-08-15 Phase 3) — 보도값·공시 확보 회사만 신설.
 // 쿠팡·토스(정기 성과급 제도 없음)·HMM·크래프톤(최신 보도값 없음)은 의도적 제외.
 '/calc/samsung-display-bonus',
 '/calc/samsung-biologics-bonus',
 '/calc/lg-display-bonus',
 '/calc/sk-innovation-bonus',
 '/calc/s-oil-bonus',
 '/calc/gs-caltex-bonus',
 '/calc/doosan-enerbility-bonus',
 '/calc/hyundai-mobis-bonus',
 '/calc/hanwha-aerospace-bonus',
 '/calc/kepco-bonus',
 // Tools Hub + sub-tools (high SEO value: long-tail keywords)
 '/tools',
 '/tools/loan',
 '/tools/deposit',
 '/tools/finance/bonus',
 '/tools/finance/cagr',
 '/tools/finance/compound',
 '/tools/finance/freelance-tax',
 '/tools/finance/installment',
 '/tools/finance/irp',
 '/tools/finance/severance',
 '/tools/finance/stock-tax',
 '/tools/finance/vat',
 '/tools/real-estate/acquisition-tax',
 '/tools/real-estate/dsr',
 '/tools/real-estate/gift-tax',
 '/tools/real-estate/ltv',
 '/tools/date/age',
 '/tools/date/d-day',
 '/tools/date/work-days',
 '/tools/health/bmi',
 '/tools/life/dutch-pay',
 '/tools/life/fuel-cost',
 '/tools/life/subscription',
 '/tools/life/unit-converter',
 '/tools/math',
 '/tools/math/percent',
 '/tools/math/number-gen',
 // Pro Pages
 '/pro/career-planner',
 // Fun Pages
 '/fun',
 '/fun/asset-allocator',
 '/fun/escape-plan',
 '/fun/financial-mbti',
 '/fun/fortune',
 '/fun/lunch-roulette',
 // /fun/mbti-salary → /mbti-salary 301 redirect (next.config.mjs)
 '/fun/meme-coin',
 '/fun/rank',
 '/fun/reincarnation',
 '/fun/rich-dna-test',
 '/fun/salary-battle',
 '/fun/salary-rank',
 '/fun/salary-slip',
 '/fun/spending-test',
 '/fun/random-draw',
 '/fun/weekend-duty',
 '/fun/what-to-buy',
 '/fun/worldcup',
 '/fun/iq-test',
 '/fun/flappy',
 '/fun/tetris',
 // Company Pages
 // /company(→/salary-db 301)·/company/compare(noindex)는 사이트맵 제외 — 모순 신호 방지
 // /company/simulator도 제외 (2026-08-07) — 내부 링크 0건 완전 고아 상태라 사이트맵 등재가 모순 신호
 // Global Pages
 '/en',
 '/en/flat-tax',
 '/en/salary-converter',
 '/en/guides',
 '/global',
 // 복지·혜택 계산기 — 네이버 핫 키워드 전용 페이지
 '/unemployment-benefit',
 '/parental-leave',
 '/earned-income-credit',
 // 고RPM 신규 계산기(7차) — 자동차세·주휴수당
 '/auto-tax-2026',
 '/weekly-holiday-allowance-2026',
 // 고RPM 신규 계산기 추가분(7차 후속) — 종소세·부동산보유세·건보료·국민연금·적금이자
 '/income-tax-2026',
 '/property-holding-tax-2026',
 '/health-insurance-fee-2026',
 '/national-pension-estimate-2026',
 '/savings-interest-2026',
 // 연말정산 롱테일 계산기 3종 (2026-08-08) — 12~2월 시즌 선점, 고RPM 세금 주제
 '/credit-card-deduction-2026',
 '/rent-tax-credit-2026',
 '/medical-tax-credit-2026',
 // 정부 공표 데이터 페이지 3종 (2026-08-15 Phase 3) — 봉급표(1월 폭증)·기초연금·중도퇴사 연말정산
 '/civil-servant-pay-2026',
 '/basic-pension-2026',
 '/year-end-tax-mid-resign',
 // 시즌 선점 2종 (2026-08-16 3차) — 추석 상여금(9월 피크)·2027 공무원 봉급 전망(예산안~확정)
 '/chuseok-bonus-2026',
 '/civil-servant-pay-2027',
 ];

 // lastModified 기준일 — 정적 라우트 + 공식/데이터 기반 동적 URL(연봉·직업·산업·
 // 지역·용어·Q&A·환산표·비교·계산기) 공통 적용. 매 배포마다 new Date() 로 today 가
 // 찍히면 Google freshness 신호가 무의미해져 순위 변동성이 커지므로, 마지막 실질
 // 콘텐츠 업데이트 날짜를 고정해 두고 진짜 갱신 시에만 이 상수를 손으로 올린다.
 // (회사 페이지는 company.lastUpdated 우선, 값이 없을 때만 이 기준일로 폴백)
 // 2026-07-16: 2027 최저임금·세법개정안 신설 + 재산세·국민연금·대출 페이지 시즌 갱신
 const STATIC_LAST_MODIFIED = new Date("2026-07-16");
 const staticUrls = staticRoutes.map((route) => ({
 url: `${baseUrl}${route}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly' as ChangeFrequency,
 priority: route === '/' ? 1.0 : 0.8,
 }));

 // 2. Dynamic Guide Pages — 한국어 가이드 (lang === 'ko')
 // 영어 카운터파트가 있는 슬러그는 alternates로 hreflang 페어 명시
 const enSlugSet = new Set(enGuides.map((g) => g.slug));
 const guideUrls: MetadataRoute.Sitemap = koGuides.map((guide) => {
 const koUrl = `${baseUrl}/guides/${guide.slug}`;
 const enUrl = `${baseUrl}/en/guides/${guide.slug}`;
 const hasEn = enSlugSet.has(guide.slug);
 return {
 url: koUrl,
 lastModified: new Date(guide.publishedDate),
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.7,
 ...(hasEn
 ? {
 alternates: {
 languages: {
 "ko-KR": koUrl,
 "en": enUrl,
 "x-default": koUrl,
 },
 },
 }
 : {}),
 };
 });

 // 2-b. 영어 가이드 페이지 (lang === 'en')
 const koSlugSet = new Set(koGuides.map((g) => g.slug));
 const enGuideUrls: MetadataRoute.Sitemap = enGuides.map((guide) => {
 const koUrl = `${baseUrl}/guides/${guide.slug}`;
 const enUrl = `${baseUrl}/en/guides/${guide.slug}`;
 const hasKo = koSlugSet.has(guide.slug);
 return {
 url: enUrl,
 lastModified: new Date(guide.publishedDate),
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.7,
 ...(hasKo
 ? {
 alternates: {
 languages: {
 "ko-KR": koUrl,
 "en": enUrl,
 "x-default": koUrl,
 },
 },
 }
 : {}),
 };
 });

 // 3. Dynamic Salary Pages
 const salaryUrls: MetadataRoute.Sitemap = [];

 // 5m to 19.5m in 0.5m increments — 파트타임·아르바이트 연봉 검색
 for (let i = 5; i < 20; i += 0.5) {
 const amount = Math.round(i * 1000000);
 salaryUrls.push({
 url: `${baseUrl}/salary/${amount}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'yearly',
 priority: i % 1 === 0 ? 0.6 : 0.45,
 });
 }

 // 20m to 100m in 0.5m increments (long-tail SEO: 3500/4250/5500만원 등)
 for (let i = 20; i <= 100; i += 0.5) {
 const amount = Math.round(i * 1000000);
 salaryUrls.push({
 url: `${baseUrl}/salary/${amount}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'yearly',
 priority: i % 1 === 0 ? 0.7 : 0.55, // 정수형 우선
 });
 }

 // 105m to 200m in 5m increments
 for (let i = 105; i <= 200; i += 5) {
 salaryUrls.push({
 url: `${baseUrl}/salary/${i * 1000000}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'yearly',
 priority: 0.5,
 });
 }

 // (2026-08-08) 구 "Special popular amounts" 13건 제거 — 전량 20~100m 0.5m 격자에
 // 이미 포함돼 사이트맵 중복 URL 13건을 만들던 블록 (URL 전수 감사에서 실측).
 // salaryStaticParams.ts는 자체 고정 목록으로 해당 금액을 계속 정적 생성하므로 무영향.

 // 3-1. 월급 축 /monthly/{amount} (2026-08-15 Phase 3 신설) —
 // 격자는 src/lib/monthlyStaticParams.ts 와 반드시 동일 유지 (정적 생성 단일 소스).
 // "월급 300만원 실수령액" 계열 쿼리 전용 랜딩. 100만 단위 정수는 우선순위 상향.
 for (const m of getStaticMonthlyAmounts()) {
 salaryUrls.push({
 url: `${baseUrl}/monthly/${m}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'yearly',
 priority: m % 1_000_000 === 0 ? 0.65 : 0.5,
 });
 }

 // 4. Company Database Pages
 const companyUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/salary-db`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 {
 url: `${baseUrl}/salary-db/ranking`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly',
 priority: 0.8,
 },
 ];

 // 100가지 계산기 동적 페이지 — 콘텐츠 풍부(enrichment 보강)된 슬러그만 사이트맵 포함.
 // GSC "발견됨-색인 안 됨" 358개 차단(7차): thin page는 sitemap에서 제외 + page.tsx에서 noindex.
 const { allCalculators } = require('@/lib/simpleCalculators');
 (allCalculators as Array<{ slug: string; explanation?: string; faqs?: Array<unknown> }>)
 .filter((c) => c.explanation && c.faqs && c.faqs.length >= 3)
 .forEach((c) => {
 companyUrls.push({
 url: `${baseUrl}/calc/${c.slug}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'monthly',
 priority: 0.7,
 });
 });

 // Individual company pages — /salary-db/[id]로 단일화
 // (이전엔 /company/[id]도 sitemap에 있었으나 동일 정보 두 URL이라 카니발 → /salary-db/[id] 308 redirect로 통합)
 const { allCompanies } = require('@/data/companies');

 // lastModified는 회사별 실제 lastUpdated 날짜 사용 — 매 배포마다 "오늘 수정"으로
 // 찍히면 Google이 freshness 신호를 무시하므로 정직한 날짜를 넣는다.
 allCompanies.forEach((company: any) => {
 const parsed = company.lastUpdated ? new Date(company.lastUpdated) : null;
 const lastModified =
 parsed && !Number.isNaN(parsed.getTime()) ? parsed : STATIC_LAST_MODIFIED;
 companyUrls.push({
 url: `${baseUrl}/salary-db/${company.id}`,
 lastModified,
 changeFrequency: 'monthly',
 priority: 0.85,
 });
 });

 // [2026-08-10 제거] 회사 비교 413페이지(/salary-db/compare/[slug]) 사이트맵 등재 중단.
 // 전체 사이트맵 1,865 URL의 22%를 차지하면서 GSC "발견됨-색인 안 됨" 상태의
 // priority 0.6 템플릿 페이지 — 재크롤 수요만 유발해 CF Workers 일 요청 한도를
 // 압박했다. 페이지 자체는 유지되고 내부 링크로 접근 가능 — 크롤 광고만 중단.
 // (복원 시: git log에서 compareUrls 블록 참조)

 // 글로서리 동적 페이지 — 용어별 long-tail 키워드
 // 한글 슬러그는 사이트맵 프로토콜상 percent-encoding이 안전 (encodeURIComponent)
 const glossaryUrls: MetadataRoute.Sitemap = glossaryData.map((item) => ({
 url: `${baseUrl}/glossary/${encodeURIComponent(toGlossarySlug(item.title))}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'yearly',
 priority: 0.6,
 }));

 // Q&A 동적 페이지 — 질문별 long-tail
 const qnaUrls: MetadataRoute.Sitemap = qnaData.map((item) => ({
 url: `${baseUrl}/qna/${encodeURIComponent(toQnaSlug(item.question))}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'monthly',
 priority: 0.65,
 }));

 // 직업별 연봉 페이지
 const jobUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/job`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 ...jobsData.map((job) => ({
 url: `${baseUrl}/job/${job.id}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.8,
 })),
 ];

 // 산업별 연봉 페이지
 const industryUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/industry`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 ...industriesData.map((industry) => ({
 url: `${baseUrl}/industry/${industry.id}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.8,
 })),
 ];

 // 지역별 연봉 페이지
 const regionUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/region`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 ...regionsData.map((region) => ({
 url: `${baseUrl}/region/${region.id}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.8,
 })),
 ];

 // 데이터 리포트 (/insights) — 분기 발행, reportsRegistry가 단일 소스.
 // lastModified는 리포트별 실제 갱신일(updatedDate) — freshness 신호 정직 유지.
 const reportUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/insights`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'weekly',
 priority: 0.8,
 },
 ...reportsRegistry.map((report) => {
 const parsed = new Date(report.updatedDate);
 return {
 url: `${baseUrl}/insights/${report.slug}`,
 lastModified: Number.isNaN(parsed.getTime()) ? STATIC_LAST_MODIFIED : parsed,
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.85,
 };
 }),
 ];

 // 급여 환산 테이블 페이지
 const tableUrls: MetadataRoute.Sitemap = [
 '/table/2026/annual',
 '/table/2026/monthly',
 '/table/2026/weekly',
 '/table/2026/hourly',
 ].map((route) => ({
 url: `${baseUrl}${route}`,
 lastModified: STATIC_LAST_MODIFIED,
 changeFrequency: 'yearly' as ChangeFrequency,
 priority: 0.7,
 }));

 return [...staticUrls, ...guideUrls, ...enGuideUrls, ...salaryUrls, ...companyUrls, ...glossaryUrls, ...qnaUrls, ...jobUrls, ...industryUrls, ...regionUrls, ...reportUrls, ...tableUrls];
}
