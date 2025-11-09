'use client';

import { useState, useMemo } from 'react';
import { guides, categories } from '@/lib/guidesData';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredGuides = useMemo(() => {
    const sortedGuides = [...guides].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    if (selectedCategory === 'all') {
      return sortedGuides;
    }
    return sortedGuides.filter(guide => guide.category === selectedCategory);
  }, [selectedCategory]);

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          머니샐러리 금융 가이드
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground">
          연봉, 커리어, 투자, 부동산, 세금까지. 당신의 경제적 자유를 위한 모든 지식을 쉽고 깊이있게 알려드립니다.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 my-12">
        {categories.map(category => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.name === '전체보기' ? 'all' : category.name)}
            className={`px-4 py-2 text-sm sm:text-base font-bold rounded-full transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/80 ${
              (selectedCategory === category.name || (selectedCategory === 'all' && category.name === '전체보기'))
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-background text-foreground border border-border hover:bg-muted/50 hover:scale-105'
            }`}
            whileHover={{ y: -2 }}
          >
            {category.name}
          </motion.button>
        ))}
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredGuides.map(guide => (
          <motion.div key={guide.slug} variants={itemVariants}>
            <Link
              href={`/guides/${guide.slug}`}
              className="group block h-full"
            >
              <div className="h-full flex flex-col bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 dark:border-black/20 rounded-3xl shadow-2xl shadow-primary/5 hover:shadow-primary/20 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                <div className="p-8 flex-grow">
                  <p className="text-sm font-bold text-primary mb-3">{guide.category}</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {guide.title}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base flex-grow">
                    {guide.description}
                  </p>
                </div>
                <div className="px-8 py-5 bg-white/5 dark:bg-black/10 border-t border-white/10 dark:border-black/20 mt-auto">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-bold group-hover:gap-2 transition-all duration-300">
                            자세히 보기 <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}