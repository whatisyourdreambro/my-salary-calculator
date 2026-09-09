import EnglishPageShell from "@/components/english/EnglishPageShell";
import { buildEnglishMetadata } from "@/lib/englishSeo";
import EnglishDashboardClient from "./EnglishDashboardClient";

export const metadata = buildEnglishMetadata({ title: "My saved results and pages", description: "Reopen English salary estimates and favorite pages explicitly saved in this browser.", path: "/en/dashboard", index: false });

export default function EnglishDashboardPage() {
  return <EnglishPageShell title="My saved results and pages" description="Your saved English estimates and pages stay in this browser. Saving requires your action, and there is no account or cloud sync." breadcrumbs={[{ name: "My dashboard", href: "/en/dashboard" }]}>
    <EnglishDashboardClient />
  </EnglishPageShell>;
}
