import { enGuides } from "@/lib/guidesData";
import EnglishGuidesClient from "./EnglishGuidesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Finance Guides for Working in Korea | Moneysalary",
 description:
  "In-depth English guides on Korean salary, semiconductor stocks, employee stock plans, taxes, and personal finance for professionals working in Korea.",
 alternates: {
  canonical: "https://www.moneysalary.com/en/guides",
  languages: {
   "ko-KR": "https://www.moneysalary.com/guides",
   "en": "https://www.moneysalary.com/en/guides",
   "x-default": "https://www.moneysalary.com/guides",
  },
 },
 openGraph: {
  title: "Finance Guides for Working in Korea | Moneysalary",
  description:
   "Samsung Electronics, SK Hynix, ESOP, ISA, and more — English guides for working professionals in Korea.",
  type: "website",
  locale: "en_US",
  url: "https://www.moneysalary.com/en/guides",
 },
};

export default function EnglishGuidesIndex() {
 return <EnglishGuidesClient guides={enGuides} />;
}
