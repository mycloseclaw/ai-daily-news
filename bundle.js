/**
 * 模态框工具函数
 */

(function() {
    /**
     * 打开模态框
     * @param {string} modalId 模态框ID
     */
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    };

    /**
     * 关闭模态框
     * @param {string} modalId 模态框ID
     */
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    };

    /**
     * 切换到注册
     */
    window.switchToRegister = function() {
        closeModal('loginModal');
        openModal('registerModal');
    };

    /**
     * 切换到登录
     */
    window.switchToLogin = function() {
        closeModal('registerModal');
        openModal('loginModal');
    };

    // 点击模态框外部关闭
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
})();
/**
 * API 模块 - 负责数据请求
 */

const API = {
    // API 配置
    config: {
        newsPath: './news.json',
        cacheKey: 'ai_news_cache',
        cacheExpiry: 30 * 60 * 1000 // 30分钟缓存
    },

    /**
     * 获取新闻数据
     * @returns {Promise<Array>} 新闻数组
     */
    async fetchNews() {
        try {
            const response = await fetch(this.config.newsPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            this.setCache(data);
            return data.news || [];
        } catch (error) {
            console.warn('获取新闻失败，尝试使用缓存:', error.message);
            const cached = this.getCache();
            if (cached) return cached.news || [];
            return this.getDefaultNews();
        }
    },

    /**
     * 获取缓存的新闻
     * @returns {Object|null}
     */
    getCache() {
        try {
            const cached = localStorage.getItem(this.config.cacheKey);
            if (!cached) return null;
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp > this.config.cacheExpiry) {
                localStorage.removeItem(this.config.cacheKey);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    /**
     * 设置缓存
     * @param {Object} data 新闻数据
     */
    setCache(data) {
        try {
            localStorage.setItem(this.config.cacheKey, JSON.stringify({
                timestamp: Date.now(),
                news: data.news || []
            }));
        } catch (e) {
            console.warn('缓存设置失败:', e.message);
        }
    },

    /**
     * 获取默认新闻（降级方案）
     * @returns {Array}
     */
    getDefaultNews() {
        return [
            {
                title: "欢迎使用 AI Daily News",
                source: "系统",
                url: "#",
                summary: "暂无新闻数据，请稍后刷新页面",
                date: new Date().toISOString().split('T')[0],
                tag: "系统通知"
            }
        ];
    }
};

// 导出模块
window.API = API;
/**
 * 认证模块 - 处理用户登录/注册
 */

const Auth = {
    // 用户存储键名
    USERS_KEY: 'ai_news_users',
    CURRENT_USER_KEY: 'ai_news_current_user',

    /**
     * 获取当前登录用户
     * @returns {Object|null}
     */
    getCurrentUser() {
        try {
            const user = localStorage.getItem(this.CURRENT_USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    /**
     * 获取所有注册用户
     * @returns {Array}
     */
    getUsers() {
        try {
            const users = localStorage.getItem(this.USERS_KEY);
            return users ? JSON.parse(users) : [];
        } catch {
            return [];
        }
    },

    /**
     * 保存用户列表
     * @param {Array} users 用户数组
     */
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    /**
     * 注册新用户
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {Object} {success, message}
     */
    register(username, password) {
        if (!username || !password) {
            return { success: false, message: '用户名和密码不能为空' };
        }
        if (username.length < 3) {
            return { success: false, message: '用户名至少3个字符' };
        }
        if (password.length < 6) {
            return { success: false, message: '密码至少6个字符' };
        }

        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            return { success: false, message: '用户名已存在' };
        }

        users.push({
            username,
            password: this.hashPassword(password), // 简单哈希
            createdAt: new Date().toISOString()
        });
        this.saveUsers(users);

        return { success: true, message: '注册成功' };
    },

    /**
     * 用户登录
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {Object} {success, message, user}
     */
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return { success: false, message: '用户不存在' };
        }
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: '密码错误' };
        }

        // 保存当前用户（不保存密码）
        const currentUser = { username: user.username, createdAt: user.createdAt };
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(currentUser));

        return { success: true, message: '登录成功', user: currentUser };
    },

    /**
     * 用户登出
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },

    /**
     * 简单哈希函数（仅供演示，生产环境请使用 crypto）
     * @param {string} password 密码
     * @returns {string}
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    /**
     * 更新 UI 状态
     * @param {Function} onLogin 登录成功回调
     * @param {Function} onLogout 登出成功回调
     */
    updateUI(onLogin, onLogout) {
        const user = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userInfo = document.getElementById('userInfo');
        const usernameDisplay = document.getElementById('usernameDisplay');
        const logoutBtn = document.getElementById('logoutBtn');

        if (user) {
            // 已登录状态
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (usernameDisplay) usernameDisplay.textContent = user.username;
            if (logoutBtn) {
                logoutBtn.onclick = () => {
                    this.logout();
                    this.updateUI(onLogin, onLogout);
                    if (onLogout) onLogout();
                };
            }
        } else {
            // 未登录状态
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'none';
        }
    }
};

// 导出模块
window.Auth = Auth;
/**
 * 新闻模块 - 负责新闻展示和搜索
 */

const NewsManager = {
    // 当前新闻数据
    currentNews: [],
    filteredNews: [],

    /**
     * 初始化新闻模块
     */
    async init() {
        await this.loadNews();
        this.setupSearch();
    },

    /**
     * 加载新闻数据
     */
    async loadNews() {
        try {
            this.showLoading(true);
            
            const news = await API.fetchNews();
            
            if (!news || !Array.isArray(news)) {
                this.showError('新闻数据格式错误');
                return;
            }
            
            this.currentNews = news;
            this.filteredNews = news;
            this.render();
        } catch (error) {
            console.error('加载新闻失败:', error);
            this.showError('加载新闻失败，请稍后重试');
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * 渲染新闻列表
     */
    render() {
        const container = document.getElementById('newsContainer');
        if (!container) return;

        if (this.filteredNews.length === 0) {
            container.innerHTML = '<div class="no-news">暂无新闻</div>';
            return;
        }

        container.innerHTML = this.filteredNews.map(news => this.createNewsCard(news)).join('');
    },

    /**
     * 创建新闻卡片 HTML
     * @param {Object} news 新闻对象
     * @returns {string}
     */
    createNewsCard(news) {
        const tags = ['大模型', 'AIGC', '开发者工具', '开源', '芯片'];
        const tag = news.tag || tags[Math.floor(Math.random() * tags.length)];
        
        return `
            <div class="news-card">
                <div class="news-tag">${tag}</div>
                <h3 class="news-title">
                    <a href="${news.url}" target="_blank" rel="noopener">${news.title}</a>
                </h3>
                <p class="news-summary">${news.summary || ''}</p>
                <div class="news-meta">
                    <span class="news-source">${news.source}</span>
                    <span class="news-date">${news.date}</span>
                </div>
            </div>
        `;
    },

    /**
     * 设置搜索功能
     */
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.filter(e.target.value);
        });
    },

    /**
     * 过滤新闻
     * @param {string} keyword 关键词
     */
    filter(keyword) {
        if (!keyword.trim()) {
            this.filteredNews = this.currentNews;
        } else {
            const lower = keyword.toLowerCase();
            this.filteredNews = this.currentNews.filter(news => 
                news.title.toLowerCase().includes(lower) ||
                (news.summary && news.summary.toLowerCase().includes(lower)) ||
                news.source.toLowerCase().includes(lower)
            );
        }
        this.render();
    },

    /**
     * 按日期筛选
     * @param {string} date 日期字符串
     */
    filterByDate(date) {
        if (!date) {
            this.filteredNews = this.currentNews;
        } else {
            this.filteredNews = this.currentNews.filter(news => 
                news.date === date
            );
        }
        this.render();
    },

    /**
     * 显示/隐藏加载状态
     * @param {boolean} show
     */
    showLoading(show) {
        const container = document.getElementById('newsContainer');
        if (!container) return;

        if (show) {
            container.innerHTML = '<div class="loading">加载中...</div>';
        }
    },

    /**
     * 显示错误信息
     * @param {string} message
     */
    showError(message) {
        const container = document.getElementById('newsContainer');
        if (container) {
            container.innerHTML = `<div class="error">${message}</div>`;
        }
    },

    /**
     * 刷新新闻
     */
    refresh() {
        localStorage.removeItem(API.config.cacheKey);
        this.loadNews();
    }
};

// 导出模块
window.NewsManager = NewsManager;
/**
 * 留言板模块 - 处理用户留言
 */

const MessageBoard = {
    // 存储键名
    MESSAGES_KEY: 'ai_news_messages',
    MAX_MESSAGES: 100,

    /**
     * 初始化留言板
     */
    init() {
        this.setupForm();
        this.render();
    },

    /**
     * 设置表单提交
     */
    setupForm() {
        const form = document.getElementById('messageForm');
        const textarea = document.getElementById('messageText');

        if (!form || !textarea) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = textarea.value.trim();
            if (!content) return;

            // 检查登录
            const user = Auth.getCurrentUser();
            if (!user) {
                alert('请先登录');
                return;
            }

            this.addMessage(user.username, content);
            textarea.value = '';
        });
    },

    /**
     * 获取所有留言
     * @returns {Array}
     */
    getMessages() {
        try {
            const messages = localStorage.getItem(this.MESSAGES_KEY);
            return messages ? JSON.parse(messages) : [];
        } catch {
            return [];
        }
    },

    /**
     * 保存留言列表
     * @param {Array} messages
     */
    saveMessages(messages) {
        // 限制最大数量
        if (messages.length > this.MAX_MESSAGES) {
            messages = messages.slice(-this.MAX_MESSAGES);
        }
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
    },

    /**
     * 添加新留言
     * @param {string} username 用户名
     * @param {string} content 内容
     */
    addMessage(username, content) {
        const messages = this.getMessages();
        messages.push({
            id: Date.now(),
            username,
            content,
            timestamp: new Date().toISOString()
        });
        this.saveMessages(messages);
        this.render();
    },

    /**
     * 删除留言
     * @param {number} id 留言ID
     */
    deleteMessage(id) {
        const user = Auth.getCurrentUser();
        if (!user) return;

        let messages = this.getMessages();
        const message = messages.find(m => m.id === id);
        
        if (message && message.username === user.username) {
            messages = messages.filter(m => m.id !== id);
            this.saveMessages(messages);
            this.render();
        }
    },

    /**
     * 渲染留言列表
     */
    render() {
        const container = document.getElementById('messageList');
        if (!container) return;

        const messages = this.getMessages();
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="no-messages">暂无留言</div>';
            return;
        }

        const user = Auth.getCurrentUser();
        container.innerHTML = messages.map(msg => this.createMessageHTML(msg, user)).join('');
    },

    /**
     * 创建留言 HTML
     * @param {Object} message 留言对象
     * @param {Object} currentUser 当前用户
     * @returns {string}
     */
    createMessageHTML(message, currentUser) {
        const date = new Date(message.timestamp);
        const timeStr = date.toLocaleString('zh-CN');
        const canDelete = currentUser && currentUser.username === message.username;

        return `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-username">${this.escapeHTML(message.username)}</span>
                    <span class="message-time">${timeStr}</span>
                    ${canDelete ? `<button class="delete-btn" data-id="${message.id}">删除</button>` : ''}
                </div>
                <div class="message-content">${this.escapeHTML(message.content)}</div>
            </div>
        `;
    },

    /**
     * HTML 转义
     * @param {string} text
     * @returns {string}
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 导出模块
window.MessageBoard = MessageBoard;
/**
 * 主入口 - 初始化所有模块
 */

(function() {
    'use strict';

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

        console.log('✅ 初始化完成');
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

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
