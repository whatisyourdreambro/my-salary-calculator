import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";

export default function GlobalLandingPage() {
 return (
 <main className="w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />

 <div className="relative z-10 text-center max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-electric/20 text-[rgba(255,255,255,0.8)] text-sm font-bold mb-6">
 <Globe className="w-4 h-4" />
 Global Expansion
 </div>
 <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-primary/50 to-primary/80">
 MoneySalary<br />Global
 </h1>
 <p className="text-xl text-faint-blue mb-10">
 The ultimate salary intelligence platform is going global.<br />
 PPP adjustments, Global Tax Calculators, and more coming soon.
 </p>

 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link href="/" className="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-lg hover:bg-canvas-deeper transition-colors flex items-center justify-center gap-2">
 Go to KR Version <ArrowRight className="w-5 h-5" />
 </Link>
 <Link href="/en/salary-converter" className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary transition-colors flex items-center justify-center gap-2">
 Launch Converter <Globe className="w-5 h-5" />
 </Link>
 </div>
 </div>
 </main>
 );
}
