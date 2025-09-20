// src/app/sitemap.ts

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  // 모든 페이지 경로를 명시적으로 나열합니다.
  const routes = [
    { url: "/", changeFrequency: "daily", priority: 1.0 },
    { url: "/home-loan", changeFrequency: "monthly", priority: 0.8 },
    { url: "/year-end-tax", changeFrequency: "monthly", priority: 0.8 },
    { url: "/fire-calculator", changeFrequency: "monthly", priority: 0.8 },
    { url: "/car-loan", changeFrequency: "monthly", priority: 0.8 },
    { url: "/table/annual", changeFrequency: "weekly", priority: 0.9 },
    { url: "/table/monthly", changeFrequency: "weekly", priority: 0.9 },
    { url: "/table/weekly", changeFrequency: "weekly", priority: 0.9 },
    { url: "/table/hourly", changeFrequency: "weekly", priority: 0.9 },
    { url: "/lotto", changeFrequency: "yearly", priority: 0.5 },
    { url: "/qna", changeFrequency: "weekly", priority: 0.9 },
    { url: "/qna/salary-allowance", changeFrequency: "monthly", priority: 0.8 },
    { url: "/qna/health-insurance", changeFrequency: "monthly", priority: 0.8 },
    {
      url: "/qna/interim-severance-pay",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/qna/year-end-tax-preview",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "/glossary", changeFrequency: "monthly", priority: 0.7 },
    { url: "/guides", changeFrequency: "weekly", priority: 0.9 },
    {
      url: "/guides/samsung-vs-hynix",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/nekarakubae-salary",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/nurse-5yr-salary",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/civil-servant-salary",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/hyundai-salary",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/salary-negotiation",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/first-job-investment",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/yef-2026-preview",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/didimdol-vs-bogeumjari",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "/guides/salary-4500", changeFrequency: "monthly", priority: 0.8 },
    { url: "/guides/bonus-tax", changeFrequency: "monthly", priority: 0.8 },
    { url: "/guides/4-day-week", changeFrequency: "monthly", priority: 0.8 },
    {
      url: "/guides/industry-trends-2025",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/unemployment-benefits",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/holiday-allowance",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "/guides/severance-tax", changeFrequency: "monthly", priority: 0.8 },
    {
      url: "/guides/four-major-insurances",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/year-end-tax-settlement",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "/guides/minimum-wage", changeFrequency: "monthly", priority: 0.8 },
    { url: "/guides/nurse-salary", changeFrequency: "monthly", priority: 0.8 },
    {
      url: "/guides/road-to-100m-part1-tax",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/road-to-100m-part2-sidejob",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "/guides/road-to-100m-part3-invest",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ] as const; // [수정] as const를 추가하여 타입 추론을 강화합니다.

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
