import SalaryRankCalculator from "@/components/calculators/SalaryRankCalculator";
import AdUnit from "@/components/AdUnit";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "???°ë´‰ ?œìœ„ ê³„ì‚°ê¸?- ?˜ëŠ” ?ìœ„ ëª?%?¼ê¹Œ? | MoneySalary",
    description: "?¬ë?ë¡?ë³´ëŠ” ?°ë´‰ ?œì—´! ???°ë´‰?€ ?€?œë?êµ??ìœ„ ëª?%?¸ì? ?•ì¸?˜ê³  ?°ì–´ë¥?ë°œê¸‰ë°›ìœ¼?¸ìš”.",
    openGraph: {
        title: "???°ë´‰ ?œìœ„ ê³„ì‚°ê¸?- ?˜ëŠ” ?ìœ„ ëª?%?¼ê¹Œ?",
        description: "?¬ë?ë¡?ë³´ëŠ” ?°ë´‰ ?œì—´! ???°ë´‰?€ ?€?œë?êµ??ìœ„ ëª?%?¸ì? ?•ì¸?˜ê³  ?°ì–´ë¥?ë°œê¸‰ë°›ìœ¼?¸ìš”.",
        images: ["/og-salary-rank.png"], // Assuming we'll add this later
    },
};

export default function SalaryRankPage() {
    return (
        <main className="w-full min-h-screen bg-zinc-950 flex flex-col items-center pt-28 px-4 pb-20 font-sans text-zinc-100">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 shadow-sm border border-zinc-800 text-yellow-400 font-medium text-sm mb-4 animate-bounce">
                    <span>?‘‘</span>
                    <span>ì§€ê¸?ê°€???«í•œ ê³„ì‚°ê¸?/span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                    ???°ë´‰?€ <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">?ìœ„ ëª?%</span>?¼ê¹Œ?
                </h1>
                <p className="text-zinc-400 text-lg">
                    ?˜ì´?€ ?°ë´‰???…ë ¥?˜ê³  ?˜ì˜ <span className="text-white font-bold">?°ë´‰ ê³„ê¸‰</span>???•ì¸?˜ì„¸??
                </p>
            </div>

            <SalaryRankCalculator />

            <div className="mt-16 w-full max-w-4xl">
                <AdUnit slotId="9998887776" format="auto" label="Salary Rank Bottom Ad" />
            </div>
        </main>
    );
}
