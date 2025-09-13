// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  const routes = [
    "/",
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
    "/guides/unemployment-benefits",
    "/guides/holiday-allowance",
    "/guides/severance-tax",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
