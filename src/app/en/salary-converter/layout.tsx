import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

// 자체 metadata 미선언 시 부모 en/layout.tsx 의 canonical(/en)을 상속하던 버그 수정 —
// 자기 자신을 가리키는 canonical 로 교정.
export const metadata: Metadata = {
  title: { absolute: "Gross Korean Salary Converter: Annual & Monthly | Moneysalary" },
  description:
    "Convert gross annual KRW salary into annual and monthly USD, JPY, SGD and GBP amounts with editable exchange-rate assumptions. Taxes and living costs are excluded.",
  alternates: {
    canonical: "https://www.moneysalary.com/en/salary-converter",
    languages: {
      en: "https://www.moneysalary.com/en/salary-converter",
      "x-default": "https://www.moneysalary.com/en/salary-converter",
    },
  },
  keywords:
    "gross korean salary converter, annual monthly salary conversion, KRW USD JPY SGD GBP, exchange rate salary",
  openGraph: {
    title: "Gross Korean Salary Converter — Annual & Monthly | Moneysalary",
    description:
      "Convert annual gross KRW salary using your exchange rates; see annual and monthly foreign-currency amounts.",
    type: "website",
    locale: "en_US",
    url: "https://www.moneysalary.com/en/salary-converter",
    images: [{ url: "https://www.moneysalary.com/api/og?lang=en&title=Korea+Salary+Converter", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gross Korean Salary Converter — Annual & Monthly | Moneysalary",
    description:
      "Gross salary currency conversion with editable rate assumptions. No tax or living-cost adjustment.",
  },
};

export default function SalaryConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/en" },
          { name: "Salary Converter", path: "/en/salary-converter" },
        ])}
      />
      {children}
    </>
  );
}
