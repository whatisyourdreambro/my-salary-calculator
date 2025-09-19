// src/app/sitemap.ts

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  const routes = [
    "/",
    "/home-loan",
    "/year-end-tax",
    "/fire-calculator",
    "/table/annual",
    "/table/monthly",
    "/table/weekly",
    "/table/hourly",
    "/lotto",
    "/qna",
    "/qna/salary-allowance",
    "/qna/health-insurance",
    "/qna/interim-severance-pay",
    "/qna/year-end-tax-preview",
    "/glossary",
    "/guides",
    "/guides/samsung-vs-hynix",
    "/guides/nekarakubae-salary",
    "/guides/nurse-5yr-salary",
    "/guides/civil-servant-salary",
    "/guides/hyundai-salary",
    "/guides/salary-negotiation",
    "/guides/first-job-investment",
    "/guides/yef-2026-preview",
    "/guides/didimdol-vs-bogeumjari",
    "/guides/salary-4500",
    "/guides/bonus-tax",
    "/guides/4-day-week",
    "/guides/industry-trends-2025",
    "/guides/unemployment-benefits",
    "/guides/holiday-allowance",
    "/guides/severance-tax",
    "/guides/four-major-insurances",
    "/guides/year-end-tax-settlement",
    "/guides/minimum-wage",
    "/guides/nurse-salary",
    "/guides/road-to-100m-part1-tax",
    "/guides/road-to-100m-part2-sidejob",
    "/guides/road-to-100m-part3-invest",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
