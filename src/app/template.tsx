// Let Next.js preserve history scroll and honor fragment links. A page-wide
// client effect would override both and require hydration for this static shell.
export default function Template({ children }: { children: React.ReactNode }) {
 return <div className="w-full min-w-0">{children}</div>;
}
