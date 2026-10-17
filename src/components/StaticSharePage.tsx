"use client";

import { useEffect, useState } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import NextActions from "@/components/NextActions";
import RelatedCalculators from "@/components/RelatedCalculators";
import ResultSharePanel from "@/components/ResultSharePanel";
import { nextActionHrefs } from "@/lib/nextActionLinks";
import {
  getPagesShareModel, PAGES_SHARE_BOOTSTRAP_ID, pagesShareTokenFromPath,
  readPagesShareBootstrap, renderShareIslandHtml,
} from "@/lib/pagesShare";

function initialModel() {
  if (typeof document === "undefined") return getPagesShareModel(null);
  return readPagesShareBootstrap(document.getElementById(PAGES_SHARE_BOOTSTRAP_ID)?.textContent ?? null, window.location.pathname);
}

/** Pages injects the opaque card and token before hydration; React never edits Flight. */
export default function StaticSharePage() {
  const [model, setModel] = useState(initialModel);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Also permits an ad-free local shell to restore a result without a Pages adapter.
    setModel(getPagesShareModel(pagesShareTokenFromPath(window.location.pathname)));
    setReady(true);
  }, []);
  const valid = ready && model.valid;
  return <>
    {/* React 19 hoists these tags. Pages rewrites the same tags, and the first
        client model reads the matching bootstrap before React hydrates them. */}
    <title>{model.metadataTitle}</title>
    <meta name="description" content={model.metadataDescription} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="머니샐러리" />
    <meta property="og:title" content={model.openGraphTitle} />
    <meta property="og:description" content={model.metadataDescription} />
    <meta property="og:url" content={model.canonicalUrl ?? "https://www.moneysalary.com"} />
    <meta property="og:image" content={model.imageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={model.openGraphTitle} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={model.openGraphTitle} />
    <meta name="twitter:description" content={model.metadataDescription} />
    <meta name="twitter:image" content={model.imageUrl} />
    <meta name="twitter:image:alt" content={model.openGraphTitle} />
    <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[70vh]">
    <div className="w-full" data-pages-share-result dangerouslySetInnerHTML={{ __html: renderShareIslandHtml(model, { reserveAd: !ready }) }} />
    {valid && <>
      <div className="w-full mt-8"><CalcResultAd /></div>
      <div className="w-full mt-4"><CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} category="salary" /></div>
      <div className="w-full mt-8"><ResultSharePanel
        resultKey={model.token}
        pageUrl="https://www.moneysalary.com/"
        pageTitle="2026 연봉 실수령액 계산기 | 머니샐러리"
        pageDescription="소득 조건을 입력해 월 수령액을 계산해 보세요."
        previewDescription={model.previewDescription}
        url={model.canonicalUrl!}
        title={model.shareTitle}
        description={model.decoded.modelLabel}
        imageUrl={model.imageUrl}
        contentType="salary_result"
      /></div>
    </>}
    <div className="w-full mt-8 space-y-6">
      <NextActions annualSalary={valid ? model.decoded.annualSalary : undefined} category="salary" />
      <RelatedCalculators currentPath="/" title="이런 계산기도 함께 보세요" exclude={nextActionHrefs("salary")} />
    </div>
    </main>
  </>;
}
