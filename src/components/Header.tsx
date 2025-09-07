'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { name: '연봉/퇴직금 계산기', href: '/' },
  { name: '연봉 표', href: '/table/annual' },
  { name: '월급 표', href: '/table/monthly' },
  { name: '주급 표', href: '/table/weekly' },
  { name: '시급 표', href: '/table/hourly' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-signature-blue' 
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}