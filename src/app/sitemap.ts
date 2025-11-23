// src/app/sitemap.ts
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

  // 1. 정적 페이지 URL
  const staticRoutes = [
    '/',
    '/dashboard',
    '/home-loan',
    '/year-end-tax',
    '/fire-calculator',
    '/car-loan',
    '/mbti-salary',
    '/table/annual',
    '/table/monthly',
    '/table/weekly',
    '/table/hourly',
    '/guides',
    '/qna',
    '/glossary',
    // Fun Pages
    '/fun/escape-plan',
    '/fun/financial-mbti',
    '/fun/lunch-roulette',
    '/fun/meme-coin',
    '/fun/rank',
    '/fun/reincarnation',
    '/fun/rich-dna-test',
    '/fun/salary-slip',
    '/fun/spending-test',
    '/fun/what-to-buy',
    // Company Pages
    '/company',
    '/company/compare',
    '/company/simulator',
    // Global Pages
    '/en',
    '/en/flat-tax',
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as ChangeFrequency,
    priority: route === '/' ? 1.0 : 0.8,
  }));

  // 2. 동적 가이드 페이지 URL (guidesData.ts에서 직접 생성)
  const guideUrls = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.publishedDate),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.7,
  }));

  // 3. 동적 연봉 상세 페이지 URL
  const salaryUrls: MetadataRoute.Sitemap = [];

  // 20m to 100m in 1m increments
  for (let i = 20; i <= 100; i++) {
    salaryUrls.push({
      url: `${baseUrl}/salary/${i * 1000000}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
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
    {
      url: `${baseUrl}/battle`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Individual company pages
  // Import data directly to avoid build-time repository issues if any
  const { seedCompanies } = require('@/data/seedCompanies');
  const { globalCompanies } = require('@/data/globalCompanies');

  const allCompanies = [...seedCompanies, ...globalCompanies];

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
