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
