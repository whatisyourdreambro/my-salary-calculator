import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { NextThemesProvider } from './providers';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: '연봉/퇴직금 계산기 | Crafted by Gemini',
  description: '연봉, 월급, 퇴직금 실수령액을 가장 정확하고 빠르게 계산하세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.className} suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200">
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col items-center w-full">
            <Header />
            {children}
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}