document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // 检查是否已登录
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard';
        return;
    }
    
    // 处理登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // 发送登录请求
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 保存登录令牌
                localStorage.setItem('token', data.token);
                // 跳转到仪表盘
                window.location.href = '/dashboard';
            } else {
                // 显示错误信息
                errorMessage.textContent = data.message || '登录失败，请检查用户名和密码';
            }
        })
        .catch(error => {
            console.error('登录请求失败:', error);
            errorMessage.textContent = '登录请求失败，请稍后重试';
        });
    });
});