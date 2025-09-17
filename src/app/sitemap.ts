import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  const routes = [
    "/",
    "/home-loan",
    "/year-end-tax",
    "/fire-calculator", // 이 줄을 추가하세요
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
