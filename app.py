from flask import Flask, render_template, request, jsonify
import requests
import json
import sqlite3
import os
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
import hashlib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
DATABASE = 'news.db'
NEWS_API_KEY = 'your_news_api_key_here'  # Replace with your actual API key
NEWS_SOURCES = [
    'reuters', 'bloomberg', 'cnn', 'the-guardian', 'bbc-news',
    'techcrunch', 'the-verge', 'arstechnica', 'wired', 'engadget'
]

# Create database if not exists
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            content TEXT,
            url TEXT UNIQUE NOT NULL,
            url_to_image TEXT,
            published_at TIMESTAMP,
            source_name TEXT,
            category TEXT,
            author TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_published_at ON news(published_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON news(category)')
    conn.commit()
    conn.close()

# Scrape news from multiple sources
def scrape_news():
    news_data = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Try multiple news sources
    sources = [
        {
            'name': 'reuters',
            'url': 'https://www.reuters.com/arc/outboundfeeds/news/rss/?outputType=json',
            'parser': 'reuters'
        },
        {
            'name': 'bbc',
            'url': 'https://feeds.bbci.co.uk/news/rss.xml',
            'parser': 'bbc'
        },
        {
            'name': 'techcrunch',
            'url': 'https://techcrunch.com/feed/',
            'parser': 'techcrunch'
        }
    ]
    
    for source in sources:
        try:
            response = requests.get(source['url'], headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'xml')
                
                if source['parser'] == 'reuters':
                    items = soup.find_all('item')[:10]  # Limit to 10 items
                    for item in items:
                        title = item.find('title').text
                        link = item.find('link').text
                        description = item.find('description').text if item.find('description') else ''
                        pub_date = datetime.strptime(item.find('pubDate').text, '%a, %d %b %Y %H:%M:%S %z')
                        
                        news_data.append({
                            'title': title,
                            'url': link,
                            'description': description,
                            'published_at': pub_date,
                            'source_name': 'Reuters',
                            'category': 'general',
                            'content': ''
                        })
                
                elif source['parser'] == 'bbc':
                    items = soup.find_all('item')[:10]
                    for item in items:
                        title = item.find('title').text
                        link = item.find('link').text
                        description = item.find('description').text if item.find('description') else ''
                        pub_date = datetime.strptime(item.find('pubDate').text, '%a, %d %b %Y %H:%M:%S %z')
                        
                        # Categorize based on URL patterns
                        category = 'general'
                        if any(term in link.lower() for term in ['sport', 'football', 'cricket', 'tennis']):
                            category = 'sports'
                        elif any(term in link.lower() for term in ['business', 'economy', 'markets']):
                            category = 'business'
                        elif any(term in link.lower() for term in ['technology', 'tech', 'science']):
                            category = 'technology'
                        elif any(term in link.lower() for term in ['health', 'medical']):
                            category = 'health'
                        elif any(term in link.lower() for term in ['entertainment', 'arts']):
                            category = 'entertainment'
                        
                        news_data.append({
                            'title': title,
                            'url': link,
                            'description': description,
                            'published_at': pub_date,
                            'source_name': 'BBC News',
                            'category': category,
                            'content': ''
                        })
                
        except Exception as e:
            print(f"Error scraping {source['name']}: {str(e)}")
            continue
    
    return news_data

# Get news from API if available
def get_news_from_api():
    news_data = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    for source in NEWS_SOURCES:
        try:
            url = f'https://newsapi.org/v2/top-headlines?sources={source}&apiKey={NEWS_API_KEY}&pageSize=20'
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    for article in data.get('articles', []):
                        news_data.append({
                            'title': article.get('title', ''),
                            'description': article.get('description', ''),
                            'content': article.get('content', ''),
                            'url': article.get('url', ''),
                            'url_to_image': article.get('urlToImage', ''),
                            'published_at': datetime.strptime(article.get('publishedAt', ''), '%Y-%m-%dT%H:%M:%SZ'),
                            'source_name': article.get('source', {}).get('name', ''),
                            'category': map_category(article.get('source', {}).get('name', '')),
                            'author': article.get('author', '')
                        })
        except Exception as e:
            print(f"Error fetching {source}: {str(e)}")
            continue
    
    return news_data

# Map source name to category
def map_category(source_name):
    categories = {
        'reuters': 'general',
        'bloomberg': 'business',
        'cnn': 'general',
        'the-guardian': 'general',
        'bbc-news': 'general',
        'techcrunch': 'technology',
        'the-verge': 'technology',
        'arstechnica': 'technology',
        'wired': 'technology',
        'engadget': 'technology'
    }
    return categories.get(source_name.lower(), 'general')

# Save news to database
def save_news_to_db(news_data):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    for news in news_data:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO news 
                (title, description, content, url, url_to_image, published_at, source_name, category, author)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                news['title'], news.get('description', ''),
                news.get('content', ''), news['url'],
                news.get('url_to_image', ''), news['published_at'],
                news['source_name'], news.get('category', 'general'),
                news.get('author', '')
            ))
        except Exception as e:
            print(f"Error saving news: {str(e)}")
    
    conn.commit()
    conn.close()

# Categorize news based on content
def categorize_news(title, description):
    text = (title + ' ' + description).lower()
    
    if any(word in text for word in ['sport', 'game', 'football', 'basketball', 'soccer', 'tennis', 'cricket']):
        return 'sports'
    elif any(word in text for word in ['business', 'economy', 'market', 'stock', 'finance', 'investment']):
        return 'business'
    elif any(word in text for word in ['science', 'tech', 'technology', 'digital', 'internet', 'software']):
        return 'technology'
    elif any(word in text for word in ['health', 'medical', 'disease', 'virus', 'covid', 'hospital']):
        return 'health'
    elif any(word in text for word in ['entertainment', 'movie', 'music', 'celebrity', 'film']):
        return 'entertainment'
    elif any(word in text for word in ['politics', 'government', 'election', 'policy', 'president']):
        return 'politics'
    else:
        return 'general'

# Refresh news data
def refresh_news():
    # Get news from API
    api_news = get_news_from_api()
    save_news_to_db(api_news)
    
    # Get news from scraping
    scraped_news = scrape_news()
    save_news_to_db(scraped_news)
    
    # Categorize any uncategorized news
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE news 
        SET category = ? 
        WHERE category = 'general' AND (title LIKE ? OR description LIKE ?)
    ''', ('sports', '%sport%', '%football%'))
    
    conn.commit()
    conn.close()

# API Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/news')
def get_news():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'newest')
    
    offset = (page - 1) * limit
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Build query
    query = "SELECT * FROM news WHERE 1=1"
    params = []
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    if search:
        query += " AND (title LIKE ? OR description LIKE ?)"
        search_pattern = f'%{search}%'
        params.extend([search_pattern, search_pattern])
    
    # Add sorting
    if sort == 'oldest':
        query += " ORDER BY published_at ASC"
    elif sort == 'popular':
        # For demo purposes, we'll use published_at
        query += " ORDER BY published_at DESC"
    else:  # newest
        query += " ORDER BY published_at DESC"
    
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    
    # Get total count
    count_query = "SELECT COUNT(*) FROM news WHERE 1=1"
    count_params = []
    
    if category:
        count_query += " AND category = ?"
        count_params.append(category)
    
    if search:
        count_query += " AND (title LIKE ? OR description LIKE ?)"
        search_pattern = f'%{search}%'
        count_params.extend([search_pattern, search_pattern])
    
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()[0]
    
    # Format results
    news_list = []
    for row in results:
        news_list.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'content': row[3],
            'url': row[4],
            'url_to_image': row[5],
            'published_at': row[6],
            'source_name': row[7],
            'category': row[8],
            'author': row[9]
        })
    
    conn.close()
    
    return jsonify({
        'news': news_list,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    })

@app.route('/api/categories')
def get_categories():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT category FROM news WHERE category IS NOT NULL')
    categories = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    # Sort categories
    category_order = ['general', 'business', 'technology', 'sports', 'health', 'entertainment', 'politics']
    sorted_categories = [cat for cat in category_order if cat in categories]
    sorted_categories.extend([cat for cat in categories if cat not in category_order])
    
    return jsonify(sorted_categories)

@app.route('/api/search')
def search_news():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    offset = (page - 1) * limit
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    search_params = [f'%{query}%', f'%{query}%', limit, offset]
    cursor.execute('''
        SELECT * FROM news WHERE title LIKE ? OR description LIKE ?
        ORDER BY published_at DESC LIMIT ? OFFSET ?
    ''', search_params)
    
    results = cursor.fetchall()
    
    cursor.execute('''
        SELECT COUNT(*) FROM news WHERE title LIKE ? OR description LIKE ?
    ''', [f'%{query}%', f'%{query}%'])
    
    total = cursor.fetchone()[0]
    conn.close()
    
    news_list = [
        {
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'content': row[3],
            'url': row[4],
            'url_to_image': row[5],
            'published_at': row[6],
            'source_name': row[7],
            'category': row[8],
            'author': row[9]
        }
        for row in results
    ]
    
    return jsonify({
        'news': news_list,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    })

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/admin/refresh')
def admin_refresh():
    refresh_news()
    return jsonify({'message': 'News refreshed successfully'})

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Start with some initial data
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM news')
    count = cursor.fetchone()[0]
    conn.close()
    
    if count == 0:
        refresh_news()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)