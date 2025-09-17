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
