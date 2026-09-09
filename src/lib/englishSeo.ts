import type { Metadata } from "next";
import { englishPolicyCounterpart } from "./englishSite";
import { isShareExcludedPath } from "./sharePolicy";

const ORIGIN = "https://www.moneysalary.com";

export function buildEnglishMetadata({ title, description, path, index = true }: {
  title: string; description: string; path: string; index?: boolean;
}): Metadata {
  const url = `${ORIGIN}${path}`;
  const fullTitle = title.includes("Moneysalary") ? title : `${title} | Moneysalary`;
  const image = `${ORIGIN}/api/og?lang=en&path=${encodeURIComponent(path)}&title=${encodeURIComponent(title)}`;
  const ko = englishPolicyCounterpart(path);
  const shouldIndex = index && !isShareExcludedPath(path);
  return {
    title: { absolute: fullTitle }, description, keywords: [],
    alternates: { canonical: url, languages: ko
      ? { "ko-KR": `${ORIGIN}${ko}`, en: url, "x-default": `${ORIGIN}${ko}` }
      : { en: url, "x-default": url } },
    openGraph: { title: fullTitle, description, url, type: "website", locale: "en_US", siteName: "Moneysalary", images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
    robots: { index: shouldIndex, follow: true, googleBot: { index: shouldIndex, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}
