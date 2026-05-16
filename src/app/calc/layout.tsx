import { CalcResultAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export default function CalcLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-10 space-y-6">
        <InArticleAd />
        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />
        <CalcResultAd />
      </div>
    </>
  );
}
