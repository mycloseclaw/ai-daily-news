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
