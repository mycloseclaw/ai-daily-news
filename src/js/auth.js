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
