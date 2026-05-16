import type { Metadata } from "next";

// 자체 metadata 미선언 시 부모 en/layout.tsx 의 canonical(/en)을 상속하던 버그 수정 —
// 자기 자신을 가리키는 canonical 로 교정.
export const metadata: Metadata = {
  title: "Korea Flat Tax 19% vs Progressive Tax Calculator | Moneysalary",
  description:
    "Foreign workers in Korea can elect a flat 19% income tax. Compare the flat-tax option against the standard progressive brackets and see which leaves you more net pay.",
  alternates: {
    canonical: "https://www.moneysalary.com/en/flat-tax",
    languages: {
      en: "https://www.moneysalary.com/en/flat-tax",
      "x-default": "https://www.moneysalary.com/en/flat-tax",
    },
  },
  openGraph: {
    title: "Korea Flat Tax 19% vs Progressive Tax Calculator | Moneysalary",
    description:
      "Compare Korea's 19% flat tax for foreign workers against the progressive income tax brackets.",
    type: "website",
    locale: "en_US",
    url: "https://www.moneysalary.com/en/flat-tax",
  },
};

export default function FlatTaxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
