import JsonLd from "@/components/JsonLd";
import { softwareApplicationLd } from "@/lib/structuredData";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata({ title: "Korea Flat Tax 19% vs Progressive Calculator", description: "Compare a limited Korean resident-employee income-tax model: 19% national flat tax plus local tax, progressive deductions, eligibility checks and official sources.", path: "/en/flat-tax" });
export default function FlatTaxLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={softwareApplicationLd({ name: "Korea flat tax vs progressive tax", description: "A limited resident-employee income-tax comparison with national and local tax, explicit omissions and separate eligibility checks.", url: "/en/flat-tax", inLanguage: "en" })} />{children}</>;
}
