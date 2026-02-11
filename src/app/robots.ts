import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://www.moneysalary.com";

    return {
        rules: [
            {
                userAgent: ['GPTBot', 'CCBot', 'PerplexityBot', 'Amazonbot', 'AnthropicAI', 'Claude-Web', 'cohere-ai'],
                disallow: '/',
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/private/', '/api/'],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}