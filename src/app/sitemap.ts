import { MetadataRoute } from 'next';
import { guides } from '@/lib/guidesData';

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
 // Calc Pages
 '/calc/2026-year',
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
 '/global',
 ];

 const staticUrls = staticRoutes.map((route) => ({
 url: `${baseUrl}${route}`,
 lastModified: new Date(),
 changeFrequency: 'weekly' as ChangeFrequency,
 priority: route === '/' ? 1.0 : 0.8,
 }));

 // 2. Dynamic Guide Pages
 const guideUrls = guides.map((guide) => ({
 url: `${baseUrl}/guides/${guide.slug}`,
 lastModified: new Date(guide.publishedDate),
 changeFrequency: 'monthly' as ChangeFrequency,
 priority: 0.7,
 }));

 // 3. Dynamic Salary Pages
 const salaryUrls: MetadataRoute.Sitemap = [];

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

 return [...staticUrls, ...guideUrls, ...salaryUrls, ...companyUrls];
}
