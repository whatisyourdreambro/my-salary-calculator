import Link from "@/components/AppLink";
import EnglishPageShell from "@/components/english/EnglishPageShell";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata({ title: "Terms of use", description: "Terms for using Moneysalary’s free salary calculators and financial information, including limitations, corrections, copyright and advertising.", path: "/en/terms" });
const sections = [
  ["1. Purpose", "These terms describe the conditions for using the salary take-home calculators and financial information provided by Moneysalary (moneysalary.com, the site)."],
  ["2. Nature of the service", "The service provides general information. It is not tax or legal advice, an investment recommendation or advisory service, or a solicitation to purchase a loan or insurance product. Consult a qualified professional before important financial decisions."],
  ["3. Using the service", "The service is free and can be used without registering. Generating bulk traffic with automated tools, disrupting stable operation, and copying or distributing site content commercially without permission are prohibited."],
  ["4. Limitations of responsibility", "The site works to provide accurate information but does not accept responsibility for calculation errors caused by tax-law changes or incorrect inputs, financial losses resulting from use of site information, or the content and operation of external links, including tax authorities, Coupang and advertisers. Use the service at your own responsibility."],
  ["5. Company salary data, corrections and removal", "Company amounts shown in the salary database and rankings are the site’s own estimates compiled from public sources, including job advertisements, business and audit reports, media reports and public community reviews. They are not figures officially announced or confirmed by the companies. They are general reference information, not a guarantee of actual compensation or a judgment of a company’s superiority. If information is inaccurate, submit a private correction request with supporting evidence. The operator reviews whether correction or removal is needed. The site does not intend to harm the reputation of any company or person."],
  ["6. Copyright", "Moneysalary holds the copyright in its content, including calculator logic, guides and design. Non-commercial quotations are permitted with attribution to moneysalary.com. Commercial use requires a separate inquiry."],
  ["7. Advertising and affiliate links", "The site includes Google AdSense advertising and affiliate links through Coupang Partners. Qualifying purchases through affiliate links may earn the site a commission without changing the purchase price. As part of Coupang Partners activities, the site may receive commissions. The site may also include affiliate links through financial comparison or signup networks, such as LinkPrice and iLikeClick, and may receive commissions for qualifying visits or signups. A separate disclosure is shown where an affiliate link is displayed."],
  ["8. Changes to these terms", "These terms may change when required by applicable laws or service operation. Changes will be published on the terms page."],
  ["9. Disputes", "Matters not addressed in these terms follow applicable laws of the Republic of Korea and general commercial practices. If a dispute arises from using the service, the user and site will seek to resolve it through good-faith discussion."],
];

export default function EnglishTermsPage() {
  return <EnglishPageShell title="Terms of use" description="Please read these terms before using Moneysalary’s calculators, guides and reference information." breadcrumbs={[{ name: "Terms of use", href: "/en/terms" }]}>
    <div className="max-w-3xl space-y-6"><p className="text-sm text-muted-foreground">English version prepared <time dateTime="2026-09-09">September 9, 2026</time>, reflecting the site’s existing Korean terms.</p>
      {sections.map(([title, body]) => <section key={title} className="rounded-2xl border border-border bg-background p-5 sm:p-7"><h2 className="text-xl font-bold">{title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{body}</p></section>)}
      <nav aria-label="Terms resources" className="flex flex-wrap gap-4"><Link href="/en/contact?source=terms" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Private contact</Link><Link href="/en/about" className="inline-flex min-h-11 items-center text-primary underline">About</Link><Link href="/en/privacy" className="inline-flex min-h-11 items-center text-primary underline">Privacy policy</Link></nav>
    </div>
  </EnglishPageShell>;
}
