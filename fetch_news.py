#!/usr/bin/env python3
"""
AI News Fetcher
自动抓取 AI 领域的最新资讯
"""

import json
import urllib.request
import ssl
from datetime import datetime
from typing import List, Dict

# RSS 订阅源
RSS_FEEDS = [
    {
        "name": "OpenAI Blog",
        "url": "https://openai.com/blog/rss.xml",
        "source": "OpenAI"
    },
    {
        "name": "Anthropic",
        "url": "https://www.anthropic.com/blog/rss.xml",
        "source": "Anthropic"
    },
    {
        "name": "Google AI Blog",
        "url": "https://blog.google/technology/ai/rss/",
        "source": "Google"
    },
    {
        "name": "Microsoft AI",
        "url": "https://blogs.microsoft.com/ai/feed/",
        "source": "Microsoft"
    },
    {
        "name": "Meta AI",
        "url": "https://ai.meta.com/blog/rss.xml",
        "source": "Meta"
    }
]

def fetch_rss(url: str, source: str) -> List[Dict]:
    """抓取 RSS 订阅源"""
    news = []
    try:
        # 创建 SSL 上下文
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'AI-News-Fetcher/1.0'}
        )
        
        with urllib.request.urlopen(req, timeout=10, context=context) as response:
            import xml.etree.ElementTree as ET
            content = response.read().decode('utf-8')
            root = ET.fromstring(content)
            
            # 解析 RSS
            for item in root.findall('.//item')[:3]:  # 每个源取前3条
                title = item.find('title')
                link = item.find('link')
                desc = item.find('description')
                pub_date = item.find('pubDate')
                
                if title is not None and link is not None:
                    summary = desc.text if desc is not None else ""
                    # 清理 HTML 标签
                    import re
                    summary = re.sub(r'<[^>]+>', '', summary)[:200]
                    
                    news.append({
                        "title": title.text,
                        "source": source,
                        "url": link.text,
                        "summary": summary,
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "tag": "AI"
                    })
    except Exception as e:
        print(f"Error fetching {source}: {e}")
    
    return news

def get_default_news() -> List[Dict]:
    """获取默认新闻（当 RSS 不可用时）"""
    return [
        {
            "title": "AI 领域持续快速发展",
            "source": "AI News",
            "url": "https://github.com/mycloseclaw/ai-daily-news",
            "summary": "AI 技术每天都在进步，更多精彩资讯请关注我们的更新。",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "tag": "AI"
        }
    ]

def main():
    """主函数"""
    all_news = []
    
    print("Fetching AI news...")
    
    for feed in RSS_FEEDS:
        news = fetch_rss(feed["url"], feed["source"])
        all_news.extend(news)
        print(f"  - {feed['name']}: {len(news)} articles")
    
    # 如果没有获取到任何新闻，使用默认新闻
    if not all_news:
        all_news = get_default_news()
    
    # 按日期排序
    all_news.sort(key=lambda x: x["date"], reverse=True)
    
    # 限制数量
    all_news = all_news[:30]
    
    # 生成 JSON
    data = {
        "lastUpdate": datetime.now().isoformat() + "Z",
        "news": all_news
    }
    
    # 写入文件
    with open('news.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Done! Updated {len(all_news)} news articles.")

if __name__ == "__main__":
    main()
