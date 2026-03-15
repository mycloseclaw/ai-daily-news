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
