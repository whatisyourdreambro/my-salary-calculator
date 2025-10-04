// src/app/sitemap.ts

import { MetadataRoute } from "next";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  const routes: {
    url: string;
    changeFrequency: ChangeFrequency;
    priority: number;
  }[] = [
    { url: "/", changeFrequency: "daily", priority: 1.0 },
    { url: "/dashboard", changeFrequency: "daily", priority: 0.9 },
    { url: "/home-loan", changeFrequency: "monthly", priority: 0.8 },
    { url: "/year-end-tax", changeFrequency: "monthly", priority: 0.8 },
    { url: "/fire-calculator", changeFrequency: "monthly", priority: 0.8 },
    { url: "/car-loan", changeFrequency: "monthly", priority: 0.8 },
    { url: "/table/annual", changeFrequency: "weekly", priority: 0.9 },
    { url: "/table/monthly", changeFrequency: "weekly", priority: 0.9 },
    { url: "/table/weekly", changeFrequency: "weekly", priority: 0.9 },
    { url: "/table/hourly", changeFrequency: "weekly", priority: 0.9 },
    { url: "/guides", changeFrequency: "weekly", priority: 0.9 },
    { url: "/qna", changeFrequency: "weekly", priority: 0.9 },
    { url: "/glossary", changeFrequency: "monthly", priority: 0.7 },
    {
      url: "/guides/civil-servant-salary-table",
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const guideRoutes = [
    "naver-vs-kakao",
    "samsung-vs-hynix",
    "nekarakubae-salary",
    "nurse-5yr-salary",
    "civil-servant-salary",
    "hyundai-salary",
    "salary-negotiation",
    "first-job-investment",
    "yef-2026-preview",
    "didimdol-vs-bogeumjari",
    "salary-4500",
    "bonus-tax",
    "4-day-week",
    "industry-trends-2025",
    "unemployment-benefits",
    "holiday-allowance",
    "severance-tax",
    "four-major-insurances",
    "year-end-tax-settlement",
    "minimum-wage",
    "nurse-salary",
    "road-to-100m-part1-tax",
    "road-to-100m-part2-sidejob",
    "road-to-100m-part3-invest",
  ].map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as ChangeFrequency,
    priority: 0.7,
  }));

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticRoutes, ...guideRoutes];
}
