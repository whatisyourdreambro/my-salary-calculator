import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
 const baseUrl = "https://www.moneysalary.com";

 return {
 rules: [
 {
 userAgent: [
 // AI 크롤러: 학습 데이터 수집 거부
 'GPTBot',
 'ChatGPT-User',
 'CCBot',
 'PerplexityBot',
 'Amazonbot',
 'AnthropicAI',
 'anthropic-ai',
 'Claude-Web',
 'ClaudeBot',
 'cohere-ai',
 'Google-Extended',
 'Bytespider',
 'ImagesiftBot',
 // SEO 분석 봇: 자원 낭비 방지
 'SemrushBot',
 'AhrefsBot',
 'MJ12bot',
 'DotBot',
 'PetalBot',
 'BLEXBot',
 'DataForSeoBot',
 'SerpstatBot',
 'MegaIndex',
 'Barkrowler',
 'ZoominfoBot',
 ],
 disallow: '/',
 },
 {
 userAgent: '*',
 allow: '/',
 disallow: ['/private/', '/api/', '/share/', '/_next/'],
 }
 ],
 sitemap: `${baseUrl}/sitemap.xml`,
 };
}