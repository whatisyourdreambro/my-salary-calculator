import JsonLd from "@/components/JsonLd";
import { softwareApplicationLd } from "@/lib/structuredData";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata({ title: "Gross Korean Salary Converter: Annual and Monthly", description: "Convert gross annual KRW salary into annual and monthly USD, JPY, SGD and GBP amounts with editable exchange-rate assumptions. Taxes and living costs are excluded.", path: "/en/salary-converter" });
export default function SalaryConverterLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={softwareApplicationLd({ name: "Gross Korean salary currency converter", description: "Convert gross annual and monthly salary amounts using explicit editable currency assumptions; no overseas tax or purchasing-power calculation.", url: "/en/salary-converter", inLanguage: "en" })} />{children}</>;
}
