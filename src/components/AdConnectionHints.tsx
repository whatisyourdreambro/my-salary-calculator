// Production-only connection warm-up for the AdSense origin. It restores the pagead2
// hints the root layout carried at 913bd52a7 (removed in 126f5d3fd, 2026-10-17).
// A preconnect/dns-prefetch opens a connection but sends no HTTP request and no ad
// request; LiveServices' runtime gate still decides whether the SDK loads.
// QA, ads-disabled, development and test builds render nothing. No preload, no script.
export default function AdConnectionHints() {
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ADS_DISABLED === "1" ||
      process.env.MSY_QA_MODE === "1") return null;
  return (
    <>
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
    </>
  );
}
