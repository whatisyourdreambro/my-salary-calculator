import type { Metadata } from "next";

// 자체 metadata 미선언 시 부모 en/layout.tsx 의 canonical(/en)을 상속하던 버그 수정 —
// 자기 자신을 가리키는 canonical 로 교정.
export const metadata: Metadata = {
  title: "Korea Salary Converter — Net Pay & PPP Comparison | Moneysalary",
  description:
    "Convert a Korean salary into net pay across Korea, the US, Japan, Singapore and the UK, with purchasing-power (PPP) adjustment to compare real living standards.",
  alternates: {
    canonical: "https://www.moneysalary.com/en/salary-converter",
    languages: {
      en: "https://www.moneysalary.com/en/salary-converter",
      "x-default": "https://www.moneysalary.com/en/salary-converter",
    },
  },
  openGraph: {
    title: "Korea Salary Converter — Net Pay & PPP Comparison | Moneysalary",
    description:
      "Compare net pay across Korea, the US, Japan, Singapore and the UK with PPP adjustment.",
    type: "website",
    locale: "en_US",
    url: "https://www.moneysalary.com/en/salary-converter",
  },
};

export default function SalaryConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
