import { enGuides, categoriesEn } from "@/lib/guidesData";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: "Finance Guides for Working in Korea | Moneysalary",
 description:
  "In-depth English guides on Korean salary, semiconductor stocks, employee stock plans, taxes, and personal finance for professionals working in Korea.",
 alternates: {
  canonical: "https://www.moneysalary.com/en/guides",
  languages: {
   "ko-KR": "https://www.moneysalary.com/guides",
   "en": "https://www.moneysalary.com/en/guides",
   "x-default": "https://www.moneysalary.com/guides",
  },
 },
 openGraph: {
  title: "Finance Guides for Working in Korea | Moneysalary",
  description:
   "Samsung Electronics, SK Hynix, ESOP, ISA, and more — English guides for working professionals in Korea.",
  type: "website",
  locale: "en_US",
  url: "https://www.moneysalary.com/en/guides",
 },
};

export default function EnglishGuidesIndex() {
 const sortedGuides = [...enGuides].sort(
  (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
 );

 return (
  <main className="min-h-screen bg-canvas text-foreground pb-24">
   <section className="relative pt-28 pb-14 overflow-hidden text-center">
    <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -z-10" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
    <div className="max-w-4xl mx-auto px-4">
     <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy">
      Financial <span className="text-electric">Insight</span>
     </h1>
     <p className="text-lg sm:text-xl text-faint-blue font-medium max-w-2xl mx-auto mb-8">
      Practical, in-depth guides on working, investing, and saving in Korea.
     </p>
    </div>
   </section>

   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-wrap gap-2 mb-12">
     {categoriesEn.map((c) => (
      <span
       key={c.id}
       className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-muted-blue border border-canvas"
      >
       {c.name}
      </span>
     ))}
    </div>

    {sortedGuides.length === 0 ? (
     <div className="text-center py-32 rounded-[2rem] bg-canvas-dark/50 border border-dashed border-canvas">
      <BookOpen className="w-16 h-16 text-faint-blue mx-auto mb-4 opacity-50" />
      <h3 className="text-2xl font-bold text-muted-blue mb-2">No guides yet</h3>
      <p className="text-faint-blue mb-6">English guides are being added — check back soon.</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {sortedGuides.map((guide) => (
       <Link
        key={guide.slug}
        href={`/en/guides/${guide.slug}`}
        className="block h-full"
       >
        <div className="relative h-full flex flex-col toss-card hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300">
         <div className="p-8 flex-grow flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-6">
           <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-primary/10 text-electric-400 text-xs font-bold border border-electric/20">
            {guide.category}
           </span>
          </div>
          <h3 className="text-xl font-bold text-navy mb-3 leading-snug">
           {guide.title}
          </h3>
          <p className="text-faint-blue text-sm line-clamp-3 mb-6 flex-grow">
           {guide.description}
          </p>
          <div className="flex items-center justify-between text-xs text-faint-blue pt-6 border-t border-canvas">
           <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{new Date(guide.publishedDate).toLocaleDateString("en-US")}</span>
           </div>
           <div className="flex items-center gap-1 font-bold text-muted-blue">
            Read <ArrowRight className="w-3 h-3" />
           </div>
          </div>
         </div>
        </div>
       </Link>
      ))}
     </div>
    )}
   </div>
  </main>
 );
}
