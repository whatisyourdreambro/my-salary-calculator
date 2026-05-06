'use client';

import { useState, useMemo } from 'react';
import { Guide, categoriesEn } from '@/lib/guidesData';
import Link from 'next/link';
import { Calendar, ArrowRight, Search, TrendingUp, Sparkles, BookOpen, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoupangBanner from '@/components/CoupangBanner';

type SortOption = "latest" | "popular" | "oldest";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ElementType }[] = [
 { id: "latest", label: "Latest", icon: Calendar },
 { id: "popular", label: "Popular", icon: Eye },
 { id: "oldest", label: "Oldest", icon: Clock },
];

function HeroGuide({ guide }: { guide: Guide }) {
 return (
 <div className="relative w-full h-[500px] mb-16 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-primary/20">
 <div className="absolute inset-0 bg-gradient-to-br from-[#0145F2] to-[#0D5BFF] z-0" />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-1000" />
 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/100/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-primary/100/30 transition-all duration-1000" />

 <div className="absolute bottom-0 left-0 w-full p-8 sm:p-12 z-20">
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
 <div className="flex items-center gap-2 mb-4">
 <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
 <Sparkles className="w-3 h-3" /> Featured
 </span>
 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
 {guide.category}
 </span>
 </div>

 <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight max-w-4xl drop-shadow-lg">
 {guide.title}
 </h2>

 <p className="text-lg text-faint-blue mb-8 max-w-2xl line-clamp-2">
 {guide.description}
 </p>

 <Link
 href={"/en/guides/" + guide.slug}
 className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105"
 >
 Read Now <ArrowRight className="w-5 h-5" />
 </Link>
 </motion.div>
 </div>
 </div>
 );
}

function GuideCard({ guide, index }: { guide: Guide; index: number }) {
 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9 }}
 transition={{ duration: 0.4, delay: index * 0.05 }}
 className="group h-full"
 >
 <Link href={"/en/guides/" + guide.slug} className="block h-full">
 <div className="relative h-full flex flex-col toss-card hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden group-hover:border-electric :border-electric transition-all duration-300">

 <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

 <div className="p-8 flex-grow flex flex-col relative z-10">
 <div className="flex items-center justify-between mb-6">
 <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-primary/10 text-electric 400 text-xs font-bold border border-electric/20">
 {guide.category}
 </span>
 {guide.views > 10000 && (
 <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
 <TrendingUp className="w-3 h-3" /> Trending
 </span>
 )}
 </div>

 <h3 className="text-xl font-bold text-navy mb-3 leading-snug group-hover:text-electric :text-electric transition-colors">
 {guide.title}
 </h3>

 <p className="text-faint-blue text-sm line-clamp-3 mb-6 flex-grow">
 {guide.description}
 </p>

 <div className="flex items-center justify-between text-xs text-faint-blue pt-6 border-t border-canvas ">
 <div className="flex items-center gap-2">
 <Calendar className="w-3 h-3" />
 <span>{new Date(guide.publishedDate).toLocaleDateString('en-US')}</span>
 </div>
 <div className="flex items-center gap-1 font-bold text-muted-blue group-hover:text-electric :text-electric transition-colors">
 Read More <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
 </div>
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 );
}

const ITEMS_PER_PAGE = 9;

export default function EnglishGuidesClient({ guides }: { guides: Guide[] }) {
 const [selectedCategoryId, setSelectedCategoryId] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [sortBy, setSortBy] = useState<SortOption>('latest');
 const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

 const sortedGuides = useMemo(() => {
 return [...guides].sort((a, b) => b.views - a.views);
 }, [guides]);

 const featuredGuide = sortedGuides[0];

 const filteredGuides = useMemo(() => {
 let result = [...guides];

 if (sortBy === 'latest') {
 result.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
 } else if (sortBy === 'popular') {
 result.sort((a, b) => b.views - a.views);
 } else if (sortBy === 'oldest') {
 result.sort((a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime());
 }

 if (selectedCategoryId === 'all' && !searchQuery && sortBy === 'latest' && featuredGuide) {
 result = result.filter(g => g.slug !== featuredGuide.slug);
 }

 if (selectedCategoryId !== 'all') {
 result = result.filter(guide => guide.category === selectedCategoryId);
 }

 if (searchQuery) {
 const query = searchQuery.toLowerCase();
 result = result.filter(guide =>
 guide.title.toLowerCase().includes(query) ||
 guide.description.toLowerCase().includes(query) ||
 guide.tags.some(tag => tag.toLowerCase().includes(query))
 );
 }

 return result;
 }, [guides, selectedCategoryId, searchQuery, sortBy, featuredGuide]);

 const visibleGuides = filteredGuides.slice(0, visibleCount);
 const hasMore = visibleCount < filteredGuides.length;

 const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);

 const handleCategoryChange = (id: string) => {
 setSelectedCategoryId(id);
 setVisibleCount(ITEMS_PER_PAGE);
 };

 return (
 <main className="min-h-screen bg-canvas -[#191F28] text-foreground pb-24">
 {/* Hero Section */}
 <section className="relative pt-28 pb-14 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -[#0f1623] -[#191F28] -[#1a2035] -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 /15 rounded-full blur-[120px] -z-10" />
 <div className="max-w-4xl mx-auto px-4">
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 Financial <span className="text-electric">Insight</span>
 </h1>
 <p className="text-lg sm:text-xl text-faint-blue font-medium max-w-2xl mx-auto mb-8">
 Practical, in-depth guides on working, investing, and saving in Korea.
 </p>
 <div className="relative max-w-md mx-auto">
 <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
 <Search className="h-5 w-5 text-faint-blue" />
 </div>
 <input
 type="text"
 className="toss-input pl-14"
 placeholder="Search keywords..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 </section>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Categories */}
 <div className="flex flex-wrap gap-2 mb-6 sticky top-20 z-20 py-4 bg-canvas/90 backdrop-blur-xl -mx-4 px-4 sm:static sm:bg-transparent sm:p-0">
 {categoriesEn.map(category => (
 <button
 key={category.id}
 onClick={() => handleCategoryChange(category.id)}
 className={"px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 " + (selectedCategoryId === category.id
 ? 'bg-primary !text-white shadow-lg shadow-primary-md scale-105'
 : 'bg-white hover:bg-canvas-dark text-muted-blue border border-canvas'
 )}
 >
 {category.name}
 </button>
 ))}
 </div>

 {/* Sort options */}
 <div className="flex items-center gap-2 mb-12 flex-wrap">
 <span className="text-xs font-bold text-faint-blue uppercase tracking-wider mr-2">
 Sort
 </span>
 {SORT_OPTIONS.map((option) => {
 const Icon = option.icon;
 return (
 <button
 key={option.id}
 onClick={() => setSortBy(option.id)}
 className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all " + (sortBy === option.id
 ? 'bg-electric-10 text-electric border border-electric/20'
 : 'bg-white text-muted-blue border border-canvas-200 hover:border-electric/40'
 )}
 >
 <Icon className="w-3.5 h-3.5" />
 {option.label}
 </button>
 );
 })}
 <span className="text-xs text-faint-blue ml-auto">
 Total: {filteredGuides.length}
 </span>
 </div>

 {/* Featured Hero */}
 <AnimatePresence>
 {selectedCategoryId === 'all' && !searchQuery && featuredGuide && (
 <motion.section
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="hidden md:block"
 >
 <HeroGuide guide={featuredGuide} />
 </motion.section>
 )}
 </AnimatePresence>

 {/* Ad Unit: Top */}
 <div className="mb-12">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 </div>

 {/* Guides Grid */}
 <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
 <AnimatePresence mode='popLayout'>
 {visibleGuides.map((guide, index) => (
 <GuideCard key={guide.slug} guide={guide} index={index} />
 ))}
 </AnimatePresence>
 </motion.div>

 {/* Empty State */}
 {visibleGuides.length === 0 && (
 <div className="text-center py-32 rounded-[2rem] bg-canvas-dark /50 border border-dashed border-canvas ">
 <BookOpen className="w-16 h-16 text-faint-blue mx-auto mb-4 opacity-50" />
 <h3 className="text-2xl font-bold text-muted-blue mb-2">No results</h3>
 <p className="text-faint-blue mb-6">Try a different keyword or category.</p>
 <button
 onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}
 className="toss-button-primary w-auto px-8"
 >
 Show All Guides
 </button>
 </div>
 )}

 {/* Load More */}
 {hasMore && (
 <div className="mt-20 text-center">
 <button
 onClick={handleLoadMore}
 className="toss-button-secondary w-auto px-10 py-4 text-lg"
 >
 Load More Guides
 </button>
 </div>
 )}
 </div>
 </main>
 );
}
