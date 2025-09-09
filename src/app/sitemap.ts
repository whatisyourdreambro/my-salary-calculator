// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.moneysalary.com";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/table/annual`, lastModified: new Date() },
    { url: `${baseUrl}/table/monthly`, lastModified: new Date() },
    { url: `${baseUrl}/table/weekly`, lastModified: new Date() },
    { url: `${baseUrl}/table/hourly`, lastModified: new Date() },
  ];
}
