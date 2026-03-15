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
