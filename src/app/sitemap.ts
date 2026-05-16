import { MetadataRoute } from 'next';
import { koGuides, enGuides } from '@/lib/guidesData';
import { glossaryData, toGlossarySlug } from '@/data/glossaryData';
import { qnaData, toQnaSlug } from '@/data/qnaData';
import { jobsData } from '@/data/jobsData';
import { industriesData } from '@/data/industriesData';
import { regionsData } from '@/data/regionsData';

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
 '/about',
 '/privacy',
 '/terms',
 // Seasonal pages — 시즌 트래픽 핵심
 '/year-end-tax-2026',
 '/health-insurance-2026',
 '/year-end-tax-settlement-2026',
 '/new-employee-2026',
 '/samsung-negotiation-2026',
 // Info pages — 정보성 검색 트래픽
 '/tax-rates-2026',
 '/social-insurance-rates-2026',
 '/tax-changes-2026',
 '/year-end-tax-checklist',
 '/retirement-pension-2026',
 '/career-stages-2026',
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
 // 복지·혜택 계산기 — 네이버 핫 키워드 전용 페이지
 '/unemployment-benefit',
 '/parental-leave',
 '/earned-income-credit',
 ];

 const staticUrls = staticRoutes.map((route) => ({
 url: `${baseUrl}${route}`,
 lastModified: new Date(),
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
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: i % 1 === 0 ? 0.6 : 0.45,
 });
 }

 // 20m to 100m in 0.5m increments (long-tail SEO: 3500/4250/5500만원 등)
 for (let i = 20; i <= 100; i += 0.5) {
 const amount = Math.round(i * 1000000);
 salaryUrls.push({
 url: `${baseUrl}/salary/${amount}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: i % 1 === 0 ? 0.7 : 0.55, // 정수형 우선
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

 // Special popular amounts
 const specials = [
 24000000, 26000000, 28000000, 32000000, 35000000, 38000000, 42000000,
 45000000, 55000000, 65000000, 75000000, 85000000, 95000000,
 ];
 specials.forEach((s) => {
 salaryUrls.push({
 url: `${baseUrl}/salary/${s}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: 0.7,
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

 // Individual company pages — /salary-db/[id]로 단일화
 // (이전엔 /company/[id]도 sitemap에 있었으나 동일 정보 두 URL이라 카니발 → /salary-db/[id] 308 redirect로 통합)
 const { allCompanies } = require('@/data/companies');

 allCompanies.forEach((company: any) => {
 companyUrls.push({
 url: `${baseUrl}/salary-db/${company.id}`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.85,
 });
 });

 // 글로서리 동적 페이지 — 용어별 long-tail 키워드
 const glossaryUrls: MetadataRoute.Sitemap = glossaryData.map((item) => ({
 url: `${baseUrl}/glossary/${toGlossarySlug(item.title)}`,
 lastModified: new Date(),
 changeFrequency: 'yearly',
 priority: 0.6,
 }));

 // Q&A 동적 페이지 — 질문별 long-tail
 const qnaUrls: MetadataRoute.Sitemap = qnaData.map((item) => ({
 url: `${baseUrl}/qna/${toQnaSlug(item.question)}`,
 lastModified: new Date(),
 changeFrequency: 'monthly',
 priority: 0.65,
 }));

 // 직업별 연봉 페이지
 const jobUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/job`,
 lastModified: new Date(),
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 ...jobsData.map((job) => ({
 url: `${baseUrl}/job/${job.id}`,
 lastModified: new Date(),
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.8,
 })),
 ];

 // 산업별 연봉 페이지
 const industryUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/industry`,
 lastModified: new Date(),
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 ...industriesData.map((industry) => ({
 url: `${baseUrl}/industry/${industry.id}`,
 lastModified: new Date(),
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.8,
 })),
 ];

 // 지역별 연봉 페이지
 const regionUrls: MetadataRoute.Sitemap = [
 {
 url: `${baseUrl}/region`,
 lastModified: new Date(),
 changeFrequency: 'weekly',
 priority: 0.9,
 },
 ...regionsData.map((region) => ({
 url: `${baseUrl}/region/${region.id}`,
 lastModified: new Date(),
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.8,
 })),
 ];

 // 급여 환산 테이블 페이지
 const tableUrls: MetadataRoute.Sitemap = [
 '/table/annual',
 '/table/monthly',
 '/table/weekly',
 '/table/hourly',
 '/table/2026/annual',
 '/table/2026/monthly',
 '/table/2026/weekly',
 '/table/2026/hourly',
 ].map((route) => ({
 url: `${baseUrl}${route}`,
 lastModified: new Date(),
 changeFrequency: 'yearly' as ChangeFrequency,
 priority: 0.7,
 }));

 return [...staticUrls, ...guideUrls, ...enGuideUrls, ...salaryUrls, ...companyUrls, ...glossaryUrls, ...qnaUrls, ...jobUrls, ...industryUrls, ...regionUrls, ...tableUrls];
}
