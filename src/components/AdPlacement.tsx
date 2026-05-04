"use client";

import { useEffect, useRef } from "react";

/**
 * 결과창 직하 광고 — CTR 최고 구간.
 * AdSense Auto Ads와 별도로 수동 배치하여 사용자가 결과를 본 직후의
 * 시선 종착점을 활용한다.
 */
export function ResultAd() {
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 try {
 if (ref.current && ref.current.clientHeight === 0) {
 // @ts-expect-error adsbygoogle global
 (window.adsbygoogle = window.adsbygoogle || []).push({});
 }
 } catch {
 // AdSense push errors are non-fatal
 }
 }, []);

 return (
 <div
 ref={ref}
 className="result-ad-container"
 style={{
 width: "100%",
 minHeight: "90px",
 margin: "1.5rem 0",
 display: "flex",
 justifyContent: "center",
 alignItems: "center",
 backgroundColor: "transparent",
 }}
 >
 <ins
 className="adsbygoogle"
 style={{ display: "block", width: "100%", minHeight: "90px" }}
 data-ad-client="ca-pub-2873403048341290"
 data-ad-slot="auto"
 data-ad-format="auto"
 data-full-width-responsive="true"
 />
 </div>
 );
}
