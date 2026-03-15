#!/usr/bin/env node
/**
 * AI News Fetcher - Node.js Version
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

const RSS_FEEDS = [
    { name: "OpenAI", url: "https://openai.com/blog/rss.xml", source: "OpenAI" },
    { name: "Anthropic", url: "https://www.anthropic.com/blog/rss.xml", source: "Anthropic" },
    { name: "Google AI", url: "https://blog.google/technology/ai/rss/", source: "Google" },
    { name: "Microsoft AI", url: "https://blogs.microsoft.com/ai/feed/", source: "Microsoft" },
    { name: "Meta AI", url: "https://ai.meta.com/blog/rss.xml", source: "Meta" }
];

function fetchURL(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, { headers: { 'User-Agent': 'AI-News-Fetcher/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseRSS(xml, source) {
    const news = [];
    const items = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    for (const item of items.slice(0, 3)) {
        const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i);
        const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/i);
        const descMatch = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i);
        
        if (titleMatch && linkMatch) {
            const title = (titleMatch[1] || titleMatch[2] || '').trim();
            const link = (linkMatch[1] || '').trim();
            let desc = (descMatch ? (descMatch[1] || descMatch[2] || '') : '').trim();
            
            // 清理 HTML
            desc = desc.replace(/<[^>]+>/g, '').substring(0, 200);
            
            news.push({
                title,
                source,
                url: link,
                summary: desc,
                date: new Date().toISOString().split('T')[0],
                tag: "AI"
            });
        }
    }
    return news;
}

async function main() {
    const allNews = [];
    
    console.log("Fetching AI news...");
    
    for (const feed of RSS_FEEDS) {
        try {
            const xml = await fetchURL(feed.url);
            const news = parseRSS(xml, feed.source);
            allNews.push(...news);
            console.log(`  - ${feed.name}: ${news.length} articles`);
        } catch (e) {
            console.log(`  - ${feed.name}: Failed (${e.message})`);
        }
    }
    
    // 如果没有新闻，使用默认
    if (allNews.length === 0) {
        allNews.push({
            title: "AI 领域持续快速发展",
            source: "AI News",
            url: "https://github.com/mycloseclaw/ai-daily-news",
            summary: "AI 技术每天都在进步，更多精彩资讯请关注我们的更新。",
            date: new Date().toISOString().split('T')[0],
            tag: "AI"
        });
    }
    
    // 按日期排序
    allNews.sort((a, b) => b.date.localeCompare(a.date));
    
    const data = {
        lastUpdate: new Date().toISOString() + "Z",
        news: allNews.slice(0, 30)
    };
    
    fs.writeFileSync('news.json', JSON.stringify(data, null, 2), 'utf8');
    console.log(`Done! Updated ${allNews.length} news articles.`);
}

main().catch(console.error);
