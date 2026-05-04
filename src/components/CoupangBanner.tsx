"use client";

interface CoupangBannerProps {
 className?: string;
 variant?: "default" | "compact";
}

export default function CoupangBanner({ className = "", variant = "default" }: CoupangBannerProps) {
 const isCompact = variant === "compact";

 return (
 <div
 className={className}
 style={{
 width: "100%",
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 margin: isCompact ? "1rem 0" : "2rem 0",
 padding: isCompact ? "0" : "0 1rem",
 }}
 >
 <a
 href="https://link.coupang.com/a/eCfhX9"
 target="_blank"
 rel="noopener noreferrer"
 referrerPolicy="unsafe-url"
 style={{
 display: "block",
 maxWidth: "728px",
 width: "100%",
 lineHeight: 0,
 }}
 >
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src="https://ads-partners.coupang.com/banners/986008?subId=&traceId=V0-301-5f9bd61900e673c0-I986008&w=728&h=90"
 alt="쿠팡 추천 상품"
 style={{
 width: "100%",
 height: "auto",
 display: "block",
 borderRadius: "8px",
 }}
 />
 </a>
 <p
 style={{
 fontSize: "11px",
 color: "#7A9AB5",
 marginTop: "8px",
 textAlign: "center",
 lineHeight: 1.5,
 fontWeight: 500,
 maxWidth: "640px",
 }}
 >
 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
 </p>
 </div>
 );
}
