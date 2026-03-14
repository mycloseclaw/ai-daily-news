// AI Daily News - Frontend Script

let allNews = [];

// 初始化主题 - 读取URL参数
function initTheme() {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    if (theme === 'light' || theme === 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// 从localStorage获取最后选择的日期
function getLastSelectedDate() {
    return localStorage.getItem('aiDailyNews_lastDate') || '';
}

// 保存选择的日期到localStorage
function saveSelectedDate(date) {
    if (date) {
        localStorage.setItem('aiDailyNews_lastDate', date);
    } else {
        localStorage.removeItem('aiDailyNews_lastDate');
    }
}

// 获取日期的前一天
function getPreviousDate(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

// 获取日期的后一天
function getNextDate(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

// 检查是否有指定日期的新闻
function hasNewsOnDate(date) {
    return allNews.some(item => item.date === date);
}

// 初始化日期选择器
function initDatePicker() {
    const datePicker = document.getElementById('datePicker');
    const todayBtn = document.getElementById('todayBtn');
    const allBtn = document.getElementById('allBtn');
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    
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
        saveSelectedDate('');
    });
    
    // Previous/Next day buttons
    prevBtn.addEventListener('click', () => {
        let currentDate = datePicker.value;
        if (!currentDate) {
            // 如果没有选择日期，从今天开始
            currentDate = today.toISOString().split('T')[0];
        }
        
        let prevDate = getPreviousDate(currentDate);
        // 找到有新闻的最近日期（最多回溯30天）
        let attempts = 0;
        while (!hasNewsOnDate(prevDate) && attempts < 30) {
            prevDate = getPreviousDate(prevDate);
            attempts++;
        }
        
        if (hasNewsOnDate(prevDate)) {
            datePicker.value = prevDate;
            handleDateChange();
        } else {
            alert('没有更早的新闻了');
        }
    });
    
    nextBtn.addEventListener('click', () => {
        let currentDate = datePicker.value;
        if (!currentDate) {
            // 如果没有选择日期，从今天开始
            currentDate = today.toISOString().split('T')[0];
        }
        
        let nextDate = getNextDate(currentDate);
        const maxDate = today.toISOString().split('T')[0];
        
        // 确保不超过今天
        if (nextDate > maxDate) {
            alert('已经是最新日期了');
            return;
        }
        
        // 找到有新闻的最近日期（最多前推30天）
        let attempts = 0;
        while (!hasNewsOnDate(nextDate) && nextDate <= maxDate && attempts < 30) {
            nextDate = getNextDate(nextDate);
            attempts++;
        }
        
        if (nextDate <= maxDate && hasNewsOnDate(nextDate)) {
            datePicker.value = nextDate;
            handleDateChange();
        } else {
            alert('没有更新的新闻了');
        }
    });
}

// 处理日期变更
function handleDateChange() {
    const datePicker = document.getElementById('datePicker');
    const selectedDate = datePicker.value;
    
    if (!selectedDate) {
        renderNews(allNews);
        updateFilterStatus('全部资讯');
        saveSelectedDate('');
        return;
    }
    
    // 筛选当天新闻
    const filteredNews = allNews.filter(item => item.date === selectedDate);
    renderNews(filteredNews);
    updateFilterStatus(selectedDate);
    saveSelectedDate(selectedDate);
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
        // 获取选中的日期，默认为今天
        const datePicker = document.getElementById('datePicker');
        const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
        
        // 从每日新闻文件加载
        const newsUrl = `news/${selectedDate}.json`;
        const response = await fetch(newsUrl);
        
        if (!response.ok) {
            throw new Error('News file not found');
        }
        
        const data = await response.json();
        
        // 保存所有新闻
        allNews = data.news;
        
        // 更新最后更新时间
        document.getElementById('lastUpdate').textContent = formatLastUpdate(data.lastUpdate);
        
        // 初始化日期选择器
        initDatePicker();
        
        // 显示当天新闻
        renderNews(allNews);
        updateFilterStatus(selectedDate);
        
    } catch (error) {
        console.error('加载新闻失败:', error);
        document.getElementById('newsGrid').innerHTML = 
            '<div class="loading">当天暂无新闻，请选择其他日期</div>';
    }
}

// 加载所有新闻（从3月1日到今天）
async function loadAllNews() {
    try {
        const today = new Date();
        const startDate = new Date('2026-03-01');
        const endDate = new Date(today.toISOString().split('T')[0]);
        
        const allNewsItems = [];
        
        // 遍历每天
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            try {
                const response = await fetch(`news/${dateStr}.json`);
                if (response.ok) {
                    const data = await response.json();
                    allNewsItems.push(...data.news);
                }
            } catch (e) {
                // 跳过找不到的文件
            }
        }
        
        allNews = allNewsItems;
        renderNews(allNews);
        
    } catch (error) {
        console.error('加载全部新闻失败:', error);
    }
}

// 页面加载完成后获取新闻
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuth();
    initCommentBoard();
    loadNews();
});

// 初始化认证功能
function initAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const usernameSpan = document.getElementById('username');
    
    // 检查登录状态
    const currentUser = localStorage.getItem('ai_news_user');
    if (currentUser) {
        showLoggedIn(currentUser);
    }
    
    // 注册按钮
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const username = prompt('请输入用户名:');
            if (!username) return;
            const password = prompt('请输入密码:');
            if (!password) return;
            
            registerUser(username, password);
        });
    }
    
    // 登录按钮
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = prompt('请输入用户名:');
            if (!username) return;
            const password = prompt('请输入密码:');
            if (!password) return;
            
            loginUser(username, password);
        });
    }
    
    // 退出按钮
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ai_news_user');
            showLoggedOut();
        });
    }
}

// 注册用户
function registerUser(username, password) {
    const users = JSON.parse(localStorage.getItem('ai_news_users') || '{}');
    
    if (users[username]) {
        alert('用户名已存在!');
        return;
    }
    
    // 简单密码加密（演示用，生产环境请使用后端）
    const hashed = btoa(username + ':' + password);
    users[username] = { hash: hashed, created: new Date().toISOString() };
    localStorage.setItem('ai_news_users', JSON.stringify(users));
    
    alert('注册成功!请登录');
}

// 登录用户
function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('ai_news_users') || '{}');
    const hashed = btoa(username + ':' + password);
    
    if (users[username] && users[username].hash === hashed) {
        localStorage.setItem('ai_news_user', username);
        showLoggedIn(username);
    } else {
        alert('用户名或密码错误!');
    }
}

// 显示已登录状态
function showLoggedIn(username) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const usernameSpan = document.getElementById('username');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userInfo) {
        userInfo.style.display = 'flex';
        usernameSpan.textContent = '👤 ' + username;
    }
    updateCommentBoardUI();
}

// 显示未登录状态
function showLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const commentForm = document.getElementById('commentForm');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (userInfo) userInfo.style.display = 'none';
    if (commentForm) commentForm.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
    updateCommentBoardUI();
}

// ========== 留言板功能 ==========

// 初始化留言板
function initCommentBoard() {
    const commentForm = document.getElementById('commentForm');
    const submitBtn = document.getElementById('submitComment');
    const commentInput = document.getElementById('commentInput');
    
    // 加载已有评论
    loadComments();
    
    // 提交评论
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const content = commentInput.value.trim();
            if (!content) {
                alert('请输入评论内容');
                return;
            }
            
            const username = localStorage.getItem('ai_news_user');
            if (!username) {
                alert('请先登录');
                return;
            }
            
            addComment(username, content);
            commentInput.value = '';
        });
    }
    
    // 根据登录状态显示/隐藏评论表单
    updateCommentBoardUI();
}

// 更新留言板UI
function updateCommentBoardUI() {
    const currentUser = localStorage.getItem('ai_news_user');
    const commentForm = document.getElementById('commentForm');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (currentUser) {
        if (commentForm) commentForm.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
    } else {
        if (commentForm) commentForm.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}

// 加载评论
function loadComments() {
    const comments = JSON.parse(localStorage.getItem('ai_news_comments') || '[]');
    const commentList = document.getElementById('commentList');
    
    if (!commentList) return;
    
    if (comments.length === 0) {
        commentList.innerHTML = '<p class="login-prompt">暂无评论，快来抢沙发吧~</p>';
        return;
    }
    
    // 按时间倒序排列
    comments.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    commentList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.username)}</span>
                <span class="comment-date">${formatDate(comment.created)}</span>
            </div>
            <div class="comment-content">${parseMarkdown(comment.content)}</div>
        </div>
    `).join('');
}

// 添加评论
function addComment(username, content) {
    const comments = JSON.parse(localStorage.getItem('ai_news_comments') || '[]');
    
    comments.push({
        id: Date.now(),
        username: username,
        content: content,
        created: new Date().toISOString()
    });
    
    localStorage.setItem('ai_news_comments', JSON.stringify(comments));
    loadComments();
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 简单Markdown解析
function parseMarkdown(text) {
    // 转义HTML
    text = escapeHtml(text);
    
    // 粗体 **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // 斜体 *text*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // 代码 `code`
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // 链接 [text](url)
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 换行
    text = text.replace(/\n/g, '<br>');
    
    return text;
}