'use client';

import { useState, useMemo, useEffect } from 'react';
import { guides, categories, Guide } from '@/lib/guidesData';
import Link from 'next/link';
import { Calendar, ArrowRight, Search, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdUnit from "@/components/AdUnit";

// --- Components ---

function HeroGuide({ guide }: { guide: Guide }) {
  return (
    <div className="relative w-full h-[500px] mb-16 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-primary/20">
      {/* Background with Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

      {/* Glowing Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-1000" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-1000" />

      <div className="absolute bottom-0 left-0 w-full p-8 sm:p-12 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
              {guide.category}
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight max-w-4xl drop-shadow-lg">
            {guide.title}
          </h2>

          <p className="text-lg text-gray-300 mb-8 max-w-2xl line-clamp-2">
            {guide.description}
          </p>

          <Link
            href={`/guides/${guide.slug}`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
          >
            지금 읽기 <ArrowRight className="w-5 h-5" />
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
      <Link href={`/guides/${guide.slug}`} className="block h-full">
        <div className="relative h-full flex flex-col bg-white/[0.03] dark:bg-black/20 hover:bg-white/[0.08] dark:hover:bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group-hover:border-primary/50">

          {/* Hover Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="p-8 flex-grow flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                {guide.category}
              </span>
              {guide.views > 10000 && (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                  <TrendingUp className="w-3 h-3" /> 인기
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
              {guide.title}
            </h3>

            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
              {guide.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-6 border-t border-white/10 group-hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 " />
                <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-foreground group-hover:text-primary transition-colors">
                Read More <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// --- Main Page Component ---

const ITEMS_PER_PAGE = 9;

export default function GuidesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Sort guides by popularity (views) for the Hero section, then by date for the rest
  const sortedGuides = useMemo(() => {
    return [...guides].sort((a, b) => b.views - a.views);
  }, []);

  const featuredGuide = sortedGuides[0];

  const filteredGuides = useMemo(() => {
    let result = [...guides].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    // Exclude featured guide from the main list if no filters are active
    if (selectedCategoryId === 'all' && !searchQuery) {
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
  }, [selectedCategoryId, searchQuery, featuredGuide.slug]);

  const visibleGuides = filteredGuides.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGuides.length;

  const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);

  const handleCategoryChange = (id: string) => {
    setSelectedCategoryId(id);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-indigo-500">
                Financial Insight
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              부자가 되는 가장 확실한 지름길, 금융 지식을 탐험하세요.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group z-30">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="관심 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-12 sticky top-20 z-20 py-4 bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:static sm:bg-transparent sm:p-0">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedCategoryId === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                  : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Hero (Only show when no filters active) */}
        <AnimatePresence>
          {selectedCategoryId === 'all' && !searchQuery && (
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
          <AdUnit slotId="1234567890" format="auto" label="Guides Top Ad" />
        </div>

        {/* Guides Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {visibleGuides.map((guide, index) => (
              <GuideCard key={guide.slug} guide={guide} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {visibleGuides.length === 0 && (
          <div className="text-center py-32 rounded-[2rem] bg-secondary/20 border border-dashed border-border">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-6">다른 키워드로 검색하거나 카테고리를 변경해보세요.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              전체 목록 보기
            </button>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-20 text-center">
            <button
              onClick={handleLoadMore}
              className="group px-10 py-4 bg-secondary text-foreground rounded-2xl font-bold text-lg hover:bg-foreground hover:text-background transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              더 많은 가이드 보기
            </button>
          </div>
        )}

        {/* Ad Unit: Bottom */}
        <div className="mt-20">
          <AdUnit slotId="0987654321" format="auto" label="Guides Bottom Ad" />
        </div>
      </div>
    </main>
  );
}
