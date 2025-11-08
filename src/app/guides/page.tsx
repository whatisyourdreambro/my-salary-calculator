
'use client';

import { useState } from 'react';
import { guides, categories } from '@/lib/guidesData';
import Link from 'next/link';
import { Tag, Eye, Calendar } from 'lucide-react';

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredGuides = guides.filter(guide =>
    selectedCategory === 'all' ? true : guide.category === selectedCategory
  );

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          금융 가이드
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          연봉부터 투자, 부동산, 세금까지. 당신의 경제적 자유를 위한 모든 지식을 만나보세요.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name === '전체보기' ? 'all' : category.name)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
              (selectedCategory === category.name || (selectedCategory === 'all' && category.name === '전체보기'))
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGuides.map(guide => (
          <Link
            href={`/guides/${guide.slug}`}
            key={guide.slug}
            className="group flex flex-col bg-card rounded-2xl border border-border shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-6 flex-grow">
              <p className="text-sm font-semibold text-primary mb-2">{guide.category}</p>
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground flex-grow">
                {guide.description}
              </p>
            </div>
            <div className="px-6 py-4 bg-muted/50 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{guide.views.toLocaleString()}</span>
                    </div>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
