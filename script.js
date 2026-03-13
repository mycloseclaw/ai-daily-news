// AI Daily News - Frontend Script

const NEWS_DATA_URL = 'news.json';

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
        return '刚刚';
    } else if (diffHours < 24) {
        return `${diffHours} 小时前`;
    } else if (diffDays < 7) {
        return `${diffDays} 天前`;
    } else {
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// 格式化最后更新时间
function formatLastUpdate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 获取来源图标 (简单版)
function getSourceIcon(source) {
    const icons = {
        'OpenAI': '🔵',
        'Anthropic': '🟣',
        'Google': '🔷',
        'Microsoft': '🟦',
        'Meta': '🔷',
        'DeepMind': '💠',
        'Meta': '💙',
        'default': '🤖'
    };
    
    for (const key in icons) {
        if (source.toLowerCase().includes(key.toLowerCase())) {
            return icons[key];
        }
    }
    return icons['default'];
}

// 渲染新闻卡片
function renderNews(news) {
    const grid = document.getElementById('newsGrid');
    
    if (!news || news.length === 0) {
        grid.innerHTML = '<div class="loading">暂无资讯</div>';
        return;
    }

    grid.innerHTML = news.map(item => `
        <article class="news-card">
            <div class="news-source">
                <span>${getSourceIcon(item.source)}</span>
                ${item.source}
            </div>
            <h2 class="news-title">
                <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
            </h2>
            <p class="news-summary">${item.summary}</p>
            <div class="news-meta">
                <span class="news-date">📅 ${formatDate(item.date)}</span>
                ${item.tag ? `<span class="news-tag">${item.tag}</span>` : ''}
            </div>
        </article>
    `).join('');
}

// 加载新闻数据
async function loadNews() {
    try {
        const response = await fetch(NEWS_DATA_URL);
        const data = await response.json();
        
        // 更新最后更新时间
        document.getElementById('lastUpdate').textContent = formatLastUpdate(data.lastUpdate);
        
        // 渲染新闻
        renderNews(data.news);
    } catch (error) {
        console.error('加载新闻失败:', error);
        document.getElementById('newsGrid').innerHTML = 
            '<div class="loading">加载失败，请稍后重试</div>';
    }
}

// 页面加载完成后获取新闻
document.addEventListener('DOMContentLoaded', loadNews);
