"use client";

import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";
import { useSharePageContext } from "@/hooks/useSharePageContext";

/** Personal workflows and missing pages must not inherit a public article's ad/share footer. */
export default function EnglishPageExtras() {
  const { context } = useSharePageContext();
  if (!context) return null;
  return <><PageFooterAds maxWidth="3xl" /><AutoShareSection contentType="page" locale="en" maxWidth="3xl" className="pb-16" /></>;
}
