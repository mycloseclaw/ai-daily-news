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
