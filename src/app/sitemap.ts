// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  // 페이지 경로를 배열로 관리하여 유지보수 용이성을 높입니다.
  const routes = [
    "/",
    "/table/annual",
    "/table/monthly",
    "/table/weekly",
    "/table/hourly",
    "/lotto",
    "/qna",
    "/qna/interim-severance-pay",
    "/qna/year-end-tax-preview",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
