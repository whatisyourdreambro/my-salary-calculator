import { MetadataRoute } from 'next';
import { guides, koGuides, enGuides } from '@/lib/guidesData';

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
 '/dashboard',
 '/home-loan',
 '/year-end-tax',
 '/fire-calculator',
 '/car-loan',
 '/mbti-salary',
 '/lotto',
 '/fortune-2026',
 '/report',
 '/tips',
 // 구버전 /table/* 4개 → 301 redirect (next.config.mjs)
 '/table/2026/annual',
 '/table/2026/monthly',
 '/table/2026/weekly',
 '/table/2026/hourly',
 '/guides',
 '/qna',
 '/glossary',
 '/about',
 '/privacy',
 '/terms',
 // Seasonal pages — 시즌 트래픽 핵심
 '/year-end-tax-2026',
 '/health-insurance-2026',
 '/year-end-tax-settlement-2026',
 '/new-employee-2026',
 // Info pages — 정보성 검색 트래픽
 '/tax-rates-2026',
 '/social-insurance-rates-2026',
 '/tax-changes-2026',
 '/year-end-tax-checklist',
 '/retirement-pension-2026',
 '/career-stages-2026',
 // Phase 3 핫 키워드 군집 시즌 페이지
 '/unemployment-benefit-2026',
 '/parental-leave-2026',
 '/salary-grade/civil-servant-2026',
 // Phase 6 신규 시즌 페이지 (부업·이직·은퇴·창업·노마드·신입)
 '/side-job-2026',
 '/career-change-2026',
 '/retirement-prep-2026',
 '/startup-founder-2026',
 '/digital-nomad-2026',
 '/first-job-2026',
 // Phase 5.4 통계 인용 페이지 (백링크 자석)
 '/stats',
 '/stats/korean-salary-distribution-2026',
 '/stats/minimum-wage-history',
 '/stats/4-insurance-rates-history',
 '/stats/income-tax-bracket-history',
 '/stats/jeonse-vs-monthly-by-year',
 // Phase 5.2 자동 갱신 콘텐츠
 '/minimum-wage-countdown',
 '/interest-rate-tracker',
 '/fx-dashboard',
 '/real-estate-pulse',
 '/salary-stats-monthly',
 // Phase 5.5 PR + 5.3 임베드 안내
 '/pr/press-kit',
 '/share/embed-codes',
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
 '/company',
 '/company/compare',
 '/company/simulator',
 // Salary DB
 '/salary-db',
 '/salary-db/submit',
 // Global Pages
 '/en',
 '/en/flat-tax',
 '/en/salary-converter',
 '/en/guides',
 '/global',
 ];

 // priority 차등화 — 크롤 예산 효율 + Google 우선 인덱싱 시그널.
 // 시즌·메인 계산기·핫 키워드 = 0.95, 인덱스 허브 = 0.9, Fun = 0.5, 그 외 = 0.8.
 const HIGH_PRIORITY_ROUTES = new Set<string>([
 '/year-end-tax',
 '/home-loan',
 '/car-loan',
 '/fire-calculator',
 '/dashboard',
 '/year-end-tax-2026',
 '/health-insurance-2026',
 '/year-end-tax-settlement-2026',
 '/new-employee-2026',
 '/tax-rates-2026',
 '/social-insurance-rates-2026',
 '/tax-changes-2026',
 '/year-end-tax-checklist',
 '/retirement-pension-2026',
 '/career-stages-2026',
 '/calc/year-end-bonus',
 '/calc/incentive-tax',
 '/calc/january-bonus',
 '/calc/year-end-bonus-tax',
 '/calc/severance-vs-pension',
 '/calc/holiday-bonus',
 '/calc/vacation-pay',
 '/calc/child-deduction',
 '/calc/jeonse-loan',
 '/calc/housing-subscription',
 '/calc/2026-year',
 // Phase 3 핫 키워드 군집
 '/unemployment-benefit-2026',
 '/parental-leave-2026',
 '/salary-grade/civil-servant-2026',
 // Phase 6 신규 시즌 페이지
 '/side-job-2026',
 '/career-change-2026',
 '/retirement-prep-2026',
 '/startup-founder-2026',
 '/digital-nomad-2026',
 '/first-job-2026',
 // Phase 5 핫 페이지
 '/stats',
 '/stats/korean-salary-distribution-2026',
 '/stats/minimum-wage-history',
 '/stats/4-insurance-rates-history',
 '/stats/income-tax-bracket-history',
 '/stats/jeonse-vs-monthly-by-year',
 '/minimum-wage-countdown',
 '/interest-rate-tracker',
 '/fx-dashboard',
 '/real-estate-pulse',
 '/salary-stats-monthly',
 '/pr/press-kit',
 '/share/embed-codes',
 ]);
 const HUB_ROUTES = new Set<string>([
 '/calc',
 '/tools',
 '/guides',
 '/qna',
 '/glossary',
 '/report',
 '/tips',
 '/company',
 '/company/compare',
 '/company/simulator',
 '/salary-db',
 '/table/2026/annual',
 '/table/2026/monthly',
 '/table/2026/weekly',
 '/table/2026/hourly',
 ]);

 const staticUrls = staticRoutes.map((route) => {
 let priority: number;
 if (route === '/') priority = 1.0;
 else if (HIGH_PRIORITY_ROUTES.has(route)) priority = 0.95;
 else if (HUB_ROUTES.has(route)) priority = 0.9;
 else if (route.startsWith('/fun/') || route === '/fun') priority = 0.5;
 else if (route === '/privacy' || route === '/terms' || route === '/about') priority = 0.4;
 else priority = 0.8;

 return {
 url: `${baseUrl}${route}`,
 lastModified: new Date(),
 changeFrequency: 'weekly' as ChangeFrequency,
 priority,
 };
 });

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
 priority: 0.75,
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
 priority: 0.75,
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

 // ── 저소득 연봉 1000만~1900만원 (50만원 단위, 알바·계약직·인턴 검색 풀) ──
 // 한국 검색에서 '연봉 1500만원 실수령액' 같은 long-tail 트래픽 큼.
 for (let i = 1000; i <= 1900; i += 50) {
 const amount = i * 10000;
 const isInteger100 = i % 100 === 0;
 salaryUrls.push({
 url: `${baseUrl}/salary/${amount}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: isInteger100 ? 0.65 : 0.5,
 });
 }

 // 20m to 100m in 0.5m increments (long-tail SEO: 3500/4250/5500만원 등)
 // priority: 인기 정수 (3000/4000/5000) = 0.9, 일반 정수 = 0.7, 0.5만원 단위 = 0.5
 const POPULAR_INTEGERS = new Set([
 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000,
 9000, 10000, 12000, 15000, 20000,
 ]);
 for (let i = 20; i <= 100; i += 0.5) {
 const amount = Math.round(i * 1000000);
 const manwon = Math.round(i * 100);
 let p: number;
 if (POPULAR_INTEGERS.has(manwon)) p = 0.9;
 else if (i % 1 === 0) p = 0.7;
 else p = 0.5;
 salaryUrls.push({
 url: `${baseUrl}/salary/${amount}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: p,
 });
 }

 // 105m to 200m in 5m increments
 for (let i = 105; i <= 200; i += 5) {
 salaryUrls.push({
 url: `${baseUrl}/salary/${i * 1000000}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: 0.5,
 });
 }

 // Special popular amounts (구간 외 인기 금액들)
 const specials = [
 24000000, 26000000, 28000000, 32000000, 35000000, 38000000, 42000000,
 45000000, 55000000, 65000000, 75000000, 85000000, 95000000,
 ];
 specials.forEach((s) => {
 salaryUrls.push({
 url: `${baseUrl}/salary/${s}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: 0.85,
 });
 });

 // 4. Company Database Pages
 const companyUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/salary-db`,
 lastModified: new Date(),
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 {
 url: `${baseUrl}/salary-db/submit`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.7,
 },
 ];

 // 100가지 계산기 동적 페이지
 const { getAllSlugs } = require('@/lib/simpleCalculators');
 const calcSlugs: string[] = getAllSlugs();
 calcSlugs.forEach((slug) => {
 companyUrls.push({
 url: `${baseUrl}/calc/${slug}`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.7,
 });
 });

 // ── Phase 2.B: 시급 환산 페이지 (~131개) ──────────────────
 // 1000원~10000원: 100원 단위 (91개)
 for (let h = 1000; h <= 10000; h += 100) {
 companyUrls.push({
 url: `${baseUrl}/hourly/${h}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: h % 1000 === 0 ? 0.6 : 0.5,
 });
 }
 // 10500원~30000원: 500원 단위 (40개)
 for (let h = 10500; h <= 30000; h += 500) {
 companyUrls.push({
 url: `${baseUrl}/hourly/${h}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: h % 5000 === 0 ? 0.6 : 0.5,
 });
 }
 companyUrls.push({
 url: `${baseUrl}/hourly`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.85,
 });

 // ── Phase 2.C: 월급 환산 페이지 (~171개) ──────────────────
 // 150만~1000만원, 5만원 단위
 for (let m = 1_500_000; m <= 10_000_000; m += 50_000) {
 const isInteger100 = (m / 10_000) % 100 === 0; // 100만원 단위
 const isInteger50 = (m / 10_000) % 50 === 0;
 companyUrls.push({
 url: `${baseUrl}/monthly/${m}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: isInteger100 ? 0.7 : isInteger50 ? 0.6 : 0.5,
 });
 }
 companyUrls.push({
 url: `${baseUrl}/monthly`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.85,
 });

 // ── Phase 2.E: 연도별 세율 페이지 (7개) ──────────────────
 for (let y = 2020; y <= 2026; y += 1) {
 companyUrls.push({
 url: `${baseUrl}/year/${y}/tax-rates`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: y === 2026 ? 0.85 : 0.55,
 });
 }
 // ── Phase 2.F: 연도×인기연봉 (20 × 7 = 140개) ────────────
 const POPULAR_YEAR_AMOUNTS = [
 30_000_000, 35_000_000, 40_000_000, 45_000_000, 50_000_000,
 55_000_000, 60_000_000, 65_000_000, 70_000_000, 75_000_000,
 80_000_000, 90_000_000, 100_000_000, 120_000_000, 150_000_000,
 25_000_000, 28_000_000, 32_000_000, 38_000_000, 42_000_000,
 ];
 for (let y = 2020; y <= 2026; y += 1) {
 POPULAR_YEAR_AMOUNTS.forEach((amount) => {
 companyUrls.push({
 url: `${baseUrl}/year/${y}/salary/${amount}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: y === 2026 ? 0.7 : 0.45,
 });
 });
 }

 // ── Phase 4.G: 지역별 생활비 (27개) ────────────────────
 const { REGION_SLUGS } = require('@/data/regionData');
 (REGION_SLUGS as string[]).forEach((slug) => {
 companyUrls.push({
 url: `${baseUrl}/region/${slug}/cost-of-living`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.7,
 });
 });

 // ── Phase 4.D: 직업별 연봉 (100개) ─────────────────────
 const { JOB_SLUGS } = require('@/data/jobSalaries');
 (JOB_SLUGS as string[]).forEach((slug) => {
 companyUrls.push({
 url: `${baseUrl}/job/${slug}/salary`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.75,
 });
 });

 // ── Phase 4.I: 회사 비교 (50쌍) ────────────────────────
 const POPULAR_COMPARE_PAIRS: [string, string][] = [
 ["samsung-electronics", "lg-electronics"],
 ["samsung-electronics", "sk-hynix"],
 ["naver", "kakao"],
 ["coupang", "baemin"],
 ["kb-financial", "shinhan-financial"],
 ["kb-financial", "hana-financial"],
 ["shinhan-financial", "hana-financial"],
 ["hyundai-motor", "kia"],
 ["lg-chem", "samsung-sdi"],
 ["samsung-biologics", "celltrion"],
 ["naver", "coupang"],
 ["kakao", "coupang"],
 ["naver", "line"],
 ["kakao", "line"],
 ["toss", "kakaobank"],
 ["naver", "toss"],
 ["kakao", "toss"],
 ["nexon", "ncsoft"],
 ["nexon", "krafton"],
 ["ncsoft", "krafton"],
 ["nexon", "smilegate"],
 ["pearl-abyss", "kakao-games"],
 ["mirae-asset", "samsung-securities"],
 ["nh-investment", "kb-securities"],
 ["samsung-life", "hanwha-life"],
 ["samsung-life", "kyobo-life"],
 ["cj-cheiljedang", "lotte-confectionery"],
 ["nongshim", "ottogi"],
 ["maeil-dairies", "namyang-dairy"],
 ["kt", "skt"],
 ["lg-uplus", "kt"],
 ["lg-uplus", "skt"],
 ["hyundai-motor", "hyundai-mobis"],
 ["kia", "hyundai-mobis"],
 ["lg-chem", "lotte-chemical"],
 ["sk-innovation", "gs-caltex"],
 ["sk-innovation", "lg-chem"],
 ["bgf-retail", "gs-retail"],
 ["lotte-shopping", "shinsegae"],
 ["korean-air", "asiana-airlines"],
 ["samsung-c-and-t", "hyundai-engineering"],
 ["gs-construction", "daewoo-construction"],
 ["amorepacific", "lg-h-h"],
 ["lf-corp", "handsome"],
 ["dunamu", "bithumb"],
 ["yanolja", "zigbang"],
 ["kurly", "29cm"],
 ["daangn", "musinsa"],
 ["samsung-electronics", "google-korea"],
 ["naver", "google-korea"],
 ];
 const { allCompanies: allCompaniesForSitemap } = require('@/data/companies');
 const companyIds = new Set((allCompaniesForSitemap as any[]).map((c) => c.id));
 POPULAR_COMPARE_PAIRS.forEach(([a, b]) => {
 if (companyIds.has(a) && companyIds.has(b)) {
 companyUrls.push({
 url: `${baseUrl}/company/vs/${a}-vs-${b}`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.6,
 });
 }
 });

 // ── Phase 4.J: 직업×회사 cross (50개) ──────────────────
 const FEATURED_JOBS_CROSS = [
 "backend-developer",
 "frontend-developer",
 "data-scientist",
 "product-manager",
 "marketing-manager",
 ];
 const FEATURED_COMPANIES_CROSS = [
 "samsung-electronics",
 "naver",
 "kakao",
 "coupang",
 "toss",
 "hyundai-motor",
 "lg-electronics",
 "kb-financial",
 "shinhan-financial",
 "amorepacific",
 ];
 const jobSlugSet = new Set((JOB_SLUGS as string[]));
 FEATURED_JOBS_CROSS.forEach((job) => {
 FEATURED_COMPANIES_CROSS.forEach((company) => {
 if (jobSlugSet.has(job) && companyIds.has(company)) {
 companyUrls.push({
 url: `${baseUrl}/job/${job}/at/${company}`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.55,
 });
 }
 });
 });

 // Individual company pages — 단일 진입점 사용
 const { allCompanies } = require('@/data/companies');

 allCompanies.forEach((company: any) => {
 companyUrls.push({
 url: `${baseUrl}/salary-db/${company.id}`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.85,
 });
 });

 return [...staticUrls, ...guideUrls, ...enGuideUrls, ...salaryUrls, ...companyUrls];
}
