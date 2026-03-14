// AI Daily News - Frontend Script

const NEWS_DATA_URL = 'news.json';
let allNews = [];

// 初始化日期选择器
function initDatePicker() {
    const datePicker = document.getElementById('datePicker');
    const todayBtn = document.getElementById('todayBtn');
    const allBtn = document.getElementById('allBtn');
    
    // 设置最大日期为今天
    const today = new Date();
    datePicker.max = today.toISOString().split('T')[0];
    
    // 绑定事件
    datePicker.addEventListener('change', handleDateChange);
    todayBtn.addEventListener('click', () => {
        datePicker.value = today.toISOString().split('T')[0];
        handleDateChange();
    });
    allBtn.addEventListener('click', () => {
        datePicker.value = '';
        renderNews(allNews);
        updateFilterStatus('全部资讯');
    });
}

// 处理日期变更
function handleDateChange() {
    const datePicker = document.getElementById('datePicker');
    const selectedDate = datePicker.value;
    
    if (!selectedDate) {
        renderNews(allNews);
        updateFilterStatus('全部资讯');
        return;
    }
    
    // 筛选当天新闻
    const filteredNews = allNews.filter(item => item.date === selectedDate);
    renderNews(filteredNews);
    updateFilterStatus(selectedDate);
}

// 更新筛选状态显示
function updateFilterStatus(dateInfo) {
    let statusEl = document.getElementById('filterStatus');
    if (!statusEl) {
        const dateSelector = document.querySelector('.date-selector');
        statusEl = document.createElement('p');
        statusEl.id = 'filterStatus';
        statusEl.className = 'filter-status';
        dateSelector.appendChild(statusEl);
    }
    
    if (dateInfo === '全部资讯') {
        statusEl.textContent = `📊 共 ${allNews.length} 条资讯`;
    } else {
        const count = allNews.filter(item => item.date === dateInfo).length;
        statusEl.textContent = `📊 ${dateInfo} 共 ${count} 条资讯`;
    }
}

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
        
        // 保存所有新闻
        allNews = data.news;
        
        // 更新最后更新时间
        document.getElementById('lastUpdate').textContent = formatLastUpdate(data.lastUpdate);
        
        // 初始化日期选择器
        initDatePicker();
        
        // 默认显示最新新闻（今天或最新的）
        const today = new Date().toISOString().split('T')[0];
        const todayNews = allNews.filter(item => item.date === today);
        
        if (todayNews.length > 0) {
            document.getElementById('datePicker').value = today;
            renderNews(todayNews);
            updateFilterStatus(today);
        } else {
            // 如果没有今天的新闻，显示最新的
            renderNews(allNews);
            updateFilterStatus('全部资讯');
        }
    } catch (error) {
        console.error('加载新闻失败:', error);
        document.getElementById('newsGrid').innerHTML = 
            '<div class="loading">加载失败，请稍后重试</div>';
    }
}

// 页面加载完成后获取新闻
document.addEventListener('DOMContentLoaded', loadNews);
