'use client';

import { useState, useMemo } from 'react';
import { guides, categories } from '@/lib/guidesData';
import Link from 'next/link';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 9;

export default function GuidesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredGuides = useMemo(() => {
    let result = [...guides].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

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
  }, [selectedCategoryId, searchQuery]);

  const visibleGuides = filteredGuides.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGuides.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategoryId(id);
    setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on category change
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 min-h-screen">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6">
          머니샐러리 금융 가이드
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-8">
          연봉, 커리어, 투자, 부동산, 세금까지.<br className="hidden sm:block" />
          당신의 경제적 자유를 위한 100가지 필승 전략을 만나보세요.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-full leading-5 bg-background/50 backdrop-blur-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm hover:shadow-md"
            placeholder="관심있는 키워드를 검색해보세요 (예: 연봉협상, 연말정산)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map(category => (
          <motion.button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-4 py-2 text-sm sm:text-base font-bold rounded-full transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/80 ${selectedCategoryId === category.id
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-secondary/50 text-foreground border border-border hover:bg-secondary hover:scale-105'
              }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={selectedCategoryId + searchQuery} // Re-render animation on filter change
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleGuides.map(guide => (
            <motion.div key={guide.slug} variants={itemVariants} layout>
              <Link
                href={`/guides/${guide.slug}`}
                className="group block h-full"
              >
                <div className="h-full flex flex-col bg-card/50 dark:bg-card/20 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden hover:-translate-y-1 group-hover:border-primary/30">
                  <div className="p-8 flex-grow relative overflow-hidden">
                    {/* Gradient Blob for hover effect */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />

                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20">
                        {guide.category}
                      </span>
                      <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {guide.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {guide.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-5 border-t border-border/50 bg-secondary/10 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform duration-300">
                      읽기 <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-16 text-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            더 보기 ({filteredGuides.length - visibleCount}개 남음)
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredGuides.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">검색 결과가 없습니다.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}
            className="mt-4 text-primary hover:underline font-bold"
          >
            전체 목록 보기
          </button>
        </div>
      )}
    </div>
  );
}
