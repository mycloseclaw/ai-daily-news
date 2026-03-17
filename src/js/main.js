/**
     * 主入口 - 初始化所有模块
     */

(function() {
    'use strict';

    // 全局状态
    let allNews = [];
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    /**
     * 应用初始化
     */
    async function init() {
        console.log('🚀 AI Daily News 初始化中...');

        // 初始化认证模块
        initAuth();

        // 初始化日期选择器
        initDatePicker();

        // 初始化留言板
        initMessageBoard();

        // 初始化新闻模块
        await initNews();

        // 初始化回到顶部按钮
        initBackToTop();

        // 初始化主题切换
        initThemeToggle();

        // 初始化来源筛选
        initSourceFilter();

        // 初始化快捷键
        initKeyboardShortcuts();

        // 初始化搜索功能
        initSearch();

        console.log('✅ 初始化完成');
    }

    /**
     * 初始化来源筛选
     */
    function initSourceFilter() {
        const sourceFilter = document.getElementById('sourceFilter');
        if (!sourceFilter) return;

        sourceFilter.addEventListener('change', (e) => {
            filterNews(e.target.value);
        });
    }

    /**
     * 筛选新闻
     */
    function filterNews(source) {
        const filtered = source 
            ? allNews.filter(news => news.source === source)
            : allNews;
        
        renderNews(filtered);
    }

    /**
     * 搜索新闻
     */
    function searchNews(keyword) {
        if (!keyword) {
            renderNews(allNews);
            return;
        }

        const lowerKeyword = keyword.toLowerCase();
        const filtered = allNews.filter(news => 
            news.title.toLowerCase().includes(lowerKeyword) ||
            (news.summary && news.summary.toLowerCase().includes(lowerKeyword)) ||
            news.source.toLowerCase().includes(lowerKeyword)
        );
        
        renderNews(filtered, keyword);
    }

    /**
     * 高亮搜索关键词
     */
    function highlightKeyword(text, keyword) {
        if (!keyword || !text) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * 初始化快捷键
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 避免在输入框中触发
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // / 键 - 聚焦搜索
            if (e.key === '/') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }

            // T 键 - 切换主题
            if (e.key === 't' || e.key === 'T') {
                const themeBtn = document.getElementById('themeToggle');
                if (themeBtn) themeBtn.click();
            }

            // Esc 键 - 关闭模态框
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    /**
     * 切换收藏状态
     */
    function toggleFavorite(newsId) {
        const index = favorites.indexOf(newsId);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(newsId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // 更新按钮状态
        const btn = document.querySelector(`[data-favorite="${newsId}"]`);
        if (btn) {
            btn.classList.toggle('active');
        }
    }

    /**
     * 渲染新闻卡片
     * @param {Array} newsList - 新闻列表
     * @param {string} keyword - 搜索关键词（用于高亮）
     */
    function renderNews(newsList, keyword = '') {
        const container = document.getElementById('newsContainer');
        const newsCount = document.getElementById('newsCount');
        
        if (!container) return;

        // 更新统计
        if (newsCount) {
            newsCount.textContent = `共 ${newsList.length} 条新闻`;
        }

        if (!newsList || newsList.length === 0) {
            container.innerHTML = '<div class="loading">暂无新闻</div>';
            return;
        }

        container.innerHTML = newsList.map(news => `
            <article class="news-card">
                <div class="news-source">
                    <span class="source-icon">${getSourceIcon(news.source)}</span>
                    ${keyword ? highlightKeyword(news.source, keyword) : news.source}
                </div>
                <h2 class="news-title">
                    <a href="${news.url}" target="_blank" rel="noopener">${keyword ? highlightKeyword(news.title, keyword) : news.title}</a>
                </h2>
                <p class="news-summary">${keyword ? highlightKeyword(news.summary || '', keyword) : (news.summary || '')}</p>
                <div class="news-meta">
                    <div class="news-date">📅 ${formatDate(news.date)}</div>
                    <button class="news-favorite ${favorites.includes(news.id) ? 'active' : ''}" 
                            data-favorite="${news.id}" 
                            onclick="toggleFavorite('${news.id}')"
                            title="${favorites.includes(news.id) ? '取消收藏' : '收藏'}">
                        ${favorites.includes(news.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </article>
        `).join('');
    }

    /**
     * 初始化回到顶部按钮
     */
    function initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // 点击回到顶部
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * 初始化主题切换
     */
    function initThemeToggle() {
        const themeBtn = document.getElementById('themeToggle');
        if (!themeBtn) return;

        // 从 localStorage 读取主题设置
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);

        // 点击切换主题
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
        });
    }

    /**
     * 更新主题按钮图标
     */
    function updateThemeButton(theme) {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    /**
     * 获取来源图标
     */
    function getSourceIcon(source) {
        const icons = {
            'HuggingFace': '🤗',
            'OpenAI': '🧠',
            'Google AI': '🔬',
            'Meta AI': '🔵',
            'Anthropic': '🧩',
            'Microsoft': '🪟',
            'Stability AI': '🎨',
            'Midjourney': '🎭',
            'DeepMind': '💎'
        };
        return icons[source] || '📰';
    }

    /**
     * 格式化日期
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 86400000) {
                const hours = Math.floor(diff / 3600000);
                if (hours < 1) {
                    const mins = Math.floor(diff / 60000);
                    return mins < 1 ? '刚刚' : `${mins}分钟前`;
                }
                return `${hours}小时前`;
            }
            
            return date.toLocaleDateString('zh-CN', { 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return dateStr;
        }
    }

    /**
     * 初始化认证相关
     */
    function initAuth() {
        // 更新 UI 状态
        Auth.updateUI(onLoginSuccess, onLogoutSuccess);

        // 绑定登录表单
        bindLoginForm();

        // 绑定注册表单
        bindRegisterForm();
    }

    /**
     * 登录成功回调
     */
    function onLoginSuccess() {
        console.log('✅ 登录成功');
        closeModal('loginModal');
        closeModal('registerModal');
        MessageBoard.render();
    }

    /**
     * 登出成功回调
     */
    function onLogoutSuccess() {
        console.log('👋 已退出登录');
        MessageBoard.render();
    }

    /**
     * 绑定登录表单
     */
    function bindLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            const result = Auth.login(username, password);
            if (result.success) {
                alert(result.message);
                onLoginSuccess();
            } else {
                alert(result.message);
            }
        });
    }

    /**
     * 绑定注册表单
     */
    function bindRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('两次密码输入不一致');
                return;
            }

            const result = Auth.register(username, password);
            if (result.success) {
                alert(result.message + '，请登录');
                switchToLogin();
            } else {
                alert(result.message);
            }
        });
    }

    /**
     * 初始化日期选择器
     */
    function initDatePicker() {
        const dateInput = document.getElementById('datePicker');
        if (!dateInput) return;

        // 设置默认值为今天
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.max = today;

        dateInput.addEventListener('change', (e) => {
            NewsManager.filterByDate(e.target.value);
        });
    }

    /**
     * 初始化搜索功能
     */
    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // 使用防抖优化搜索
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const keyword = e.target.value.trim();
                if (NewsManager.searchNews) {
                    NewsManager.searchNews(keyword);
                }
            }, 300);
        });
    }

    /**
     * 初始化留言板
     */
    function initMessageBoard() {
        MessageBoard.init();

        // 绑定删除按钮事件（委托）
        const messageList = document.getElementById('messageList');
        if (messageList) {
            messageList.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const id = parseInt(e.target.dataset.id);
                    if (confirm('确定删除这条留言吗？')) {
                        MessageBoard.deleteMessage(id);
                    }
                }
            });
        }
    }

    /**
     * 初始化新闻模块
     */
    async function initNews() {
        await NewsManager.init();
        
        // 获取所有新闻并保存到全局变量
        if (NewsManager.getAllNews) {
            allNews = NewsManager.getAllNews();
            renderNews(allNews);
        }
    }

    /**
     * 关闭模态框
     * @param {string} modalId
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 切换到登录
     */
    function switchToLogin() {
        closeModal('registerModal');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }

    /**
     * 切换到注册
     */
    function switchToRegister() {
        closeModal('loginModal');
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
            registerModal.style.display = 'flex';
        }
    }

    // 暴露切换函数到全局
    window.switchToLogin = switchToLogin;
    window.switchToRegister = switchToRegister;
    window.toggleFavorite = toggleFavorite;
    window.getSourceIcon = getSourceIcon;
    window.formatDate = formatDate;

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
