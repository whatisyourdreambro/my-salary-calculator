import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Keep unmatched English URLs inside the English layout and recovery links.
export const runtime = "edge";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function MissingEnglishPage(): never {
  notFound();
}
