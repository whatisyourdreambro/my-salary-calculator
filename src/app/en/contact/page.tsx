import { Suspense } from "react";
import Link from "@/components/AppLink";
import EnglishPageShell from "@/components/english/EnglishPageShell";
import ContactForm from "@/app/contact/ContactForm";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata({ title: "Private contact and corrections", description: "Report a calculation issue, request a correction or send a service proposal privately to the Moneysalary operator.", path: "/en/contact", index: false });

export default function EnglishContactPage() {
  return <EnglishPageShell title="What could we improve?" eyebrow="Private contact with the operator" description="Report a calculation issue, unclear explanation, information correction or service proposal. Messages are stored privately for the operator to review and are not published." breadcrumbs={[{ name: "Private contact", href: "/en/contact" }]}>
    <div className="max-w-2xl"><p className="rounded-xl border border-border bg-background p-4 text-sm leading-7">For calculator instructions, start with <Link href="/en/help" className="font-semibold text-primary underline">methods, sources and help</Link>. Individual tax advice and reviews of actual payslips are not provided.</p><Suspense fallback={<p role="status" className="mt-8">Preparing the contact form…</p>}><ContactForm locale="en" /></Suspense></div>
  </EnglishPageShell>;
}
