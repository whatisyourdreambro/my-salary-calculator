import Link from "next/link";
import { Globe, ArrowRight, BookOpen, TrendingUp, Calculator } from "lucide-react";
import { enGuides } from "@/lib/guidesData";
import { InArticleAd, GuideMidAd } from "@/components/AdPlacement";

export default function GlobalLandingPage() {
 const featuredStockGuides = enGuides.slice(0, 6);

 return (
  <main className="w-full min-h-screen bg-canvas text-foreground">
   {/* Hero */}
   <section className="relative pt-32 pb-20 overflow-hidden text-center">
    <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -z-10" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />

    <div className="relative z-10 max-w-4xl mx-auto px-4">
     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-electric/20 text-primary text-sm font-bold mb-6">
      <Globe className="w-4 h-4" />
      Working in Korea
     </div>
     <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-navy mb-6 leading-tight">
      Salary, Stocks &amp; Tax<br />Made Clear in English
     </h1>
     <p className="text-lg sm:text-xl text-faint-blue font-medium max-w-2xl mx-auto mb-10">
      Korea's #1 salary calculator now in English. Calculate net pay,
      analyze Samsung &amp; SK Hynix stocks, and master ESOP / ISA strategies.
     </p>

     <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link
       href="/en/salary-converter"
       className="px-7 py-3.5 rounded-xl bg-primary text-white font-bold text-base hover:brightness-110 transition-colors flex items-center justify-center gap-2"
      >
       <Calculator className="w-5 h-5" /> Salary Converter
      </Link>
      <Link
       href="/en/flat-tax"
       className="px-7 py-3.5 rounded-xl bg-white text-primary border-2 border-primary font-bold text-base hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
      >
       19% Flat Tax (Expats) <ArrowRight className="w-5 h-5" />
      </Link>
     </div>
    </div>
   </section>

   {/* Featured Stock Guides */}
   <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
    {/* Ad slot — top of content */}
    <div className="mb-12">
     <InArticleAd />
    </div>

    <div className="flex items-end justify-between mb-8">
     <div>
      <div className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-2">
       <TrendingUp className="w-4 h-4" /> Trending in 2026
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-navy">
       Samsung &amp; SK Hynix Stock Guides
      </h2>
     </div>
     <Link
      href="/en/guides"
      className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:underline"
     >
      All Guides <ArrowRight className="w-4 h-4" />
     </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {featuredStockGuides.map((guide) => (
      <Link
       key={guide.slug}
       href={`/en/guides/${guide.slug}`}
       className="block h-full"
      >
       <div className="relative h-full flex flex-col toss-card hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300">
        <div className="p-7 flex-grow flex flex-col">
         <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-electric/20 self-start mb-4">
          {guide.category}
         </span>
         <h3 className="text-lg font-bold text-navy mb-3 leading-snug">
          {guide.title}
         </h3>
         <p className="text-faint-blue text-sm line-clamp-3 mb-5 flex-grow">
          {guide.description}
         </p>
         <div className="flex items-center gap-1 text-xs font-bold text-primary mt-auto">
          Read <ArrowRight className="w-3 h-3" />
         </div>
        </div>
       </div>
      </Link>
     ))}
    </div>

    <div className="mt-10 text-center sm:hidden">
     <Link
      href="/en/guides"
      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
     >
      All Guides <ArrowRight className="w-4 h-4" />
     </Link>
    </div>

    {/* Ad slot — bottom of content */}
    <div className="mt-16">
     <GuideMidAd />
    </div>
   </section>

   {/* Footer CTA */}
   <section className="bg-gradient-to-br from-primary to-blue-600 py-16">
    <div className="max-w-4xl mx-auto px-4 text-center text-white">
     <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-80" />
     <h2 className="text-3xl sm:text-4xl font-black mb-4">
      Korean version is also available
     </h2>
     <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
      For 100+ calculators, 50+ Korean guides, and the full company salary database, visit the Korean version of Moneysalary.
     </p>
     <Link
      href="/"
      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary font-bold hover:bg-canvas transition-colors"
     >
      Go to Korean Site <ArrowRight className="w-5 h-5" />
     </Link>
    </div>
   </section>
  </main>
 );
}
