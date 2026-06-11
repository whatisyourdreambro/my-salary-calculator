// metadata는 page.tsx의 buildPageMetadata로 일원화 (canonical 포함, JSON-LD도 page에서 제공)
export default function Layout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
