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
  for (let i = 2000; i <= 10000; i += 100) {
    salaryUrls.push({
      url: `${baseUrl}/salary/${i}0000`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  }
   for (let i = 11000; i <= 20000; i += 500) {
    salaryUrls.push({
      url: `${baseUrl}/salary/${i}0000`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    });
  }

  return [...staticUrls, ...guideUrls, ...salaryUrls];
}
