import type { Metadata } from "next";
import StaticSharePage from "@/components/StaticSharePage";

export const metadata: Metadata = {
  // StaticSharePage owns these hoisted tags from the same model as its body.
  // Generic Flight metadata must not overwrite personalized HTML after hydration.
  title: null,
  description: null,
  openGraph: null,
  twitter: null,
  robots: { index: false, follow: false },
};

// /share/<token> is a document-only Pages route using this exported shell.
// The original dynamic sibling remains the normal Next implementation for comparison.
export default function StaticShareShell() {
  return <StaticSharePage />;
}
