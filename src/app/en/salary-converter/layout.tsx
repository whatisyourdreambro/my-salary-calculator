import type { Metadata } from "next";

// 자체 metadata 미선언 시 부모 en/layout.tsx 의 canonical(/en)을 상속하던 버그 수정 —
// 자기 자신을 가리키는 canonical 로 교정.
export const metadata: Metadata = {
  title: { absolute: "Korea Salary Converter — Net Pay & PPP Comparison | Moneysalary" },
  description:
    "Convert a Korean salary into net pay across Korea, the US, Japan, Singapore and the UK, with purchasing-power (PPP) adjustment to compare real living standards.",
  alternates: {
    canonical: "https://www.moneysalary.com/en/salary-converter",
    languages: {
      en: "https://www.moneysalary.com/en/salary-converter",
      "x-default": "https://www.moneysalary.com/en/salary-converter",
    },
  },
  keywords:
    "korea salary converter, korea net pay calculator, salary comparison korea us japan, ppp salary comparison, korea take home pay",
  openGraph: {
    title: "Korea Salary Converter — Net Pay & PPP Comparison | Moneysalary",
    description:
      "Compare net pay across Korea, the US, Japan, Singapore and the UK with PPP adjustment.",
    type: "website",
    locale: "en_US",
    url: "https://www.moneysalary.com/en/salary-converter",
    images: [{ url: "https://www.moneysalary.com/api/og?lang=en&title=Korea+Salary+Converter", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Korea Salary Converter — Net Pay & PPP Comparison | Moneysalary",
    description:
      "Convert a Korean salary into net pay across 5 countries with PPP adjustment.",
  },
};

export default function SalaryConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
