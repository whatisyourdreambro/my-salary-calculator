import Link from "@/components/AppLink";
import EnglishPageShell from "@/components/english/EnglishPageShell";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata({ title: "Privacy policy", description: "How Moneysalary handles browser-saved results, private messages, feedback, analytics, advertising and requests about personal data.", path: "/en/privacy" });

const sections = [
  { title: "1. Information processed", paragraphs: [
    "Calculators can be used without an account. When you choose to send a private message or page-improvement feedback, the submission information described below is collected.",
    "Private messages: message type, related page path, message text, receipt ID and time, consent and processing status. A reply email is optional and collected only when you provide it and consent. Attachments are not accepted.",
    "Page-improvement feedback: the three pilot pages (Samsung bonus calculator, 2027 civil-servant pay estimate and Samsung salary page) collect fixed page identifiers and paths, helpfulness, a selected fixed reason, receipt ID and time, consent version and processing status. These forms do not accept free text, email, calculator inputs or results, visit queries or analytics identifiers.",
    "Abuse prevention: a short-lived IP hash made using a server secret and submission counts are stored in a separate rate-limit table. Messages and fixed feedback have separate rate-limit scopes. Raw IP addresses are not stored in submission rows, and those rows are not linked to the hash. Hosting access logs may be processed separately.",
    "Access logs: the hosting provider, Cloudflare, may automatically process IP addresses, access times and browser information for security and operation.",
    "Calculator inputs, such as salary and household assumptions, are generally calculated and saved in your browser. Our custom calculator analytics events include the calculator type and usage stage, not exact amounts, amount ranges or dependent counts.",
    "Result sharing: when you choose to share a result, a link, text or image may contain inputs or results. Recipients and the external service you choose can see that content. Result-link visits and preview requests can reach the hosting server.",
    "Analytics URLs: our custom analytics events remove result-sharing tokens and calculator input queries while keeping campaign attribution. Google Analytics automatic page and link measurement operates separately and may collect visited URLs and link information according to the service settings.",
    "Advertising and analytics cookies may be provided by Google AdSense, Google Analytics 4 and Coupang Partners.",
  ] },
  { title: "2. Purposes", paragraphs: [
    "Information is used to provide and improve the service, review private messages, investigate errors, correct information, handle privacy requests and reply through an optional email address. Message text, email addresses and receipt IDs are not sent through our custom Google Analytics events or published on the site.",
    "Fixed page feedback helps decide which explanations need improvement. Feedback, reasons and receipt IDs are kept private and are not sent through our custom Google Analytics events. Public comments, participant lists and individual reply notifications are not provided for this feedback.",
    "Google Analytics 4 is used for traffic analysis, and Google AdSense for advertising, including personalized advertising. Coupang Partners tracks affiliate referrals; qualifying purchases may earn a commission without changing the purchase price.",
  ] },
  { title: "3. Retention and deletion", paragraphs: [
    "Browser localStorage data remains until you delete it. English salary snapshots are saved only by an explicit save action, in a separate versioned browser namespace from Korean calculation data. Up to 20 snapshots are supported; earlier snapshots are not automatically updated or removed to make room. English favorites use the existing browser favorites store. No account sync is provided.",
    "Private messages and fixed page feedback use a retention standard of 90 days from receipt. The operator manages deletion; expired records are excluded from the operating review list. Expired data and short-lived abuse-prevention records are cleaned up by the operator. This is not a guarantee of automatic deletion. To request deletion, provide the receipt ID. Hosting backups follow the provider’s separate policies.",
    "Cloudflare processes access and security logs to operate and secure the service. Retention depends on the enabled logging features, service configuration and applicable provider policies.",
    "Google Analytics user-level and event-level retention depends on the property’s settings. The same retention setting does not apply to aggregated reports.",
  ] },
  { title: "4. Service providers and advertising partners", paragraphs: [
    "Google LLC provides Google AdSense and Google Analytics. Coupang provides Coupang Partners. Cloudflare, Inc. provides hosting and storage for private messages and fixed page feedback. Each provider has its own privacy policy.",
    "The operator reviews submissions through authenticated administrative tools. There is no public endpoint for visitors to browse the submission list.",
  ] },
  { title: "5. Cookies and choices", paragraphs: [
    "Cookies are used to improve the experience and serve advertisements. You can block or delete cookies through your browser settings. Browser privacy settings can also restrict local saving or personalized advertising. You can manage Google advertising personalization using Google’s ad settings.",
  ] },
  { title: "6. Your requests", paragraphs: [
    "You may request access to, correction or deletion of your personal information, or restriction of its processing. You can delete browser-local data through browser settings or an available in-site reset or deletion control. Deleting one saved English result does not delete Korean calculation data.",
  ] },
  { title: "7. Operator contact and changes", paragraphs: [
    "Use the private contact form and choose Privacy request for questions about this policy or access, correction and deletion requests. Include the receipt ID when the request concerns an earlier message or fixed page feedback. Additional information may be requested only as needed to verify and process the request.",
    "Changes to this policy will be published on the policy page. Moneysalary values your privacy and states its compliance with applicable Korean information-network and privacy requirements in its Korean policy.",
  ] },
];

export default function EnglishPrivacyPage() {
  return <EnglishPageShell title="Privacy policy" description="How Moneysalary handles data when you calculate, save, share or contact the operator." breadcrumbs={[{ name: "Privacy policy", href: "/en/privacy" }]}>
    <div className="max-w-3xl space-y-6"><p className="text-sm text-muted-foreground">English version updated <time dateTime="2026-09-09">September 9, 2026</time>. This explains the same site practices as the Korean policy.</p>
      {sections.map(section => <section key={section.title} className="rounded-2xl border border-border bg-background p-5 sm:p-7"><h2 className="text-xl font-bold">{section.title}</h2><div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></section>)}
      <nav aria-label="Privacy resources" className="flex flex-wrap gap-4 text-sm"><a href="https://policies.google.com/privacy" className="inline-flex min-h-11 items-center text-primary underline">Google privacy policy</a><a href="https://www.cloudflare.com/privacypolicy/" className="inline-flex min-h-11 items-center text-primary underline">Cloudflare privacy policy</a><a href="https://partners.coupang.com" className="inline-flex min-h-11 items-center text-primary underline">Coupang Partners (Korean)</a><a href="https://adssettings.google.com" className="inline-flex min-h-11 items-center text-primary underline">Google ad settings</a></nav>
      <nav aria-label="Site policies" className="flex flex-wrap gap-4"><Link href="/en/contact?source=privacy&type=privacy" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Send a private privacy request</Link><Link href="/en/about" className="inline-flex min-h-11 items-center text-primary underline">About</Link><Link href="/en/terms" className="inline-flex min-h-11 items-center text-primary underline">Terms</Link></nav>
    </div>
  </EnglishPageShell>;
}
