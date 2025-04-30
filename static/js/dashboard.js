document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }
    
    // 获取DOM元素
    const logoutBtn = document.getElementById('logout-btn');
    const navItems = document.querySelectorAll('.nav-menu li');
    const panels = document.querySelectorAll('.panel');
    const startProxyBtn = document.getElementById('start-proxy');
    const stopProxyBtn = document.getElementById('stop-proxy');
    const addUserForm = document.getElementById('add-user-form');
    const settingsForm = document.getElementById('settings-form');
    const resetStatsBtn = document.getElementById('reset-stats');
    const addPortForm = document.getElementById('add-port-form');
    const portsList = document.getElementById('ports-list');
    
    // 初始化页面
    updateProxyStatus();
    loadUsers();
    loadSettings();
    loadStats();
    loadProxyPorts();
    
    // 设置定时刷新
    setInterval(updateProxyStatus, 5000);
    setInterval(loadStats, 10000);
    setInterval(loadProxyPorts, 5000);
    
    // 监听无需认证复选框变化
    document.getElementById('no-auth-user').addEventListener('change', function() {
        const passwordInput = document.getElementById('new-password');
        if (this.checked) {
            passwordInput.disabled = true;
            passwordInput.required = false;
            passwordInput.value = '';
        } else {
            passwordInput.disabled = false;
            passwordInput.required = true;
        }
    });
    
    // 监听代理转发复选框变化
    document.getElementById('use-forward-proxy').addEventListener('change', function() {
        const remoteProxySettings = document.getElementById('remote-proxy-settings');
        if (this.checked) {
            remoteProxySettings.style.display = 'block';
        } else {
            remoteProxySettings.style.display = 'none';
        }
    });
    
    // 处理导航菜单点击
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新活动标签
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应面板
            panels.forEach(panel => {
                if (panel.id === tabId + '-panel') {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });
    
    // 处理退出登录
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
    
    // 处理启动代理服务器
    startProxyBtn.addEventListener('click', function() {
        fetch('/api/proxy/start', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProxyStatus();
            } else {
                alert('启动服务失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('启动服务请求失败:', error);
            alert('启动服务请求失败，请稍后重试');
        });
    });
    
    // 处理停止代理服务器
    stopProxyBtn.addEventListener('click', function() {
        fetch('/api/proxy/stop', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProxyStatus();
            } else {
                alert('停止服务失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('停止服务请求失败:', error);
            alert('停止服务请求失败，请稍后重试');
        });
    });
    
    // 处理添加用户
    addUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        const noAuth = document.getElementById('no-auth-user').checked;
        
        // 如果选择了"无需认证"但未填写用户名，则提示错误
        if (noAuth && !username.trim()) {
            alert('即使是无需认证的用户，也需要设置一个用户名作为标识');
            return;
        }
        
        // 如果未选择"无需认证"，但未填写密码，则提示错误
        if (!noAuth && !password.trim()) {
            alert('请输入用户密码');
            return;
        }
        
        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                username: username,
                password: noAuth ? "" : password,
                no_auth: noAuth
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 重置表单
                addUserForm.reset();
                // 刷新用户列表
                loadUsers();
            } else {
                alert('添加用户失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('添加用户请求失败:', error);
            alert('添加用户请求失败，请稍后重试');
        });
    });
    
    // 处理添加代理端口
    addPortForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const listenAddr = document.getElementById('new-port-addr').value;
        const allowAnonymous = document.getElementById('new-port-anonymous').checked;
        
        // 验证监听地址
        if (!listenAddr.trim()) {
            alert('监听地址不能为空');
            return;
        }
        
        fetch('/api/proxy/ports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                listen_addr: listenAddr,
                allow_anonymous: allowAnonymous
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 重置表单
                addPortForm.reset();
                // 刷新端口列表
                loadProxyPorts();
            } else {
                alert('添加代理端口失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('添加代理端口请求失败:', error);
            alert('添加代理端口请求失败，请稍后重试');
        });
    });
    
    // 处理保存设置
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const proxyPort = document.getElementById('proxy-port').value;
        const webPort = document.getElementById('web-port').value;
        const adminUsername = document.getElementById('admin-username').value;
        const adminPassword = document.getElementById('admin-password').value;
        const useForwardProxy = document.getElementById('use-forward-proxy').checked;
        const allowAnonymous = document.getElementById('allow-anonymous').checked;
        const remoteProxyAddr = document.getElementById('remote-proxy-addr').value;
        const remoteProxyUser = document.getElementById('remote-proxy-user').value;
        const remoteProxyPass = document.getElementById('remote-proxy-pass').value;
        
        // 如果启用转发代理但未填写代理地址，显示提示
        if (useForwardProxy && !remoteProxyAddr) {
            alert('启用代理转发时，远程代理地址不能为空');
            return;
        }
        
        fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                proxy_port: proxyPort,
                web_port: webPort,
                admin_username: adminUsername,
                admin_password: adminPassword,
                use_forward_proxy: useForwardProxy,
                allow_anonymous: allowAnonymous,
                remote_proxy_addr: remoteProxyAddr,
                remote_proxy_user: remoteProxyUser,
                remote_proxy_pass: remoteProxyPass
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('设置已保存');
                // 刷新设置
                loadSettings();
                // 刷新代理状态
                updateProxyStatus();
                // 刷新端口列表
                loadProxyPorts();
            } else {
                alert('保存设置失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('保存设置请求失败:', error);
            alert('保存设置请求失败，请稍后重试');
        });
    });
    
    // 处理重置统计
    resetStatsBtn.addEventListener('click', function() {
        if (confirm('确定要重置所有统计数据吗？')) {
            fetch('/api/stats/reset', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadStats();
                } else {
                    alert('重置统计失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('重置统计请求失败:', error);
                alert('重置统计请求失败，请稍后重试');
            });
        }
    });
    
    // 更新代理状态
    function updateProxyStatus() {
        fetch('/api/proxy/status', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const status = data.data;
                const statusElement = document.getElementById('proxy-status');
                const addressElement = document.getElementById('proxy-address');
                const startTimeElement = document.getElementById('start-time');
                const connectionCountElement = document.getElementById('connection-count');
                
                // 更新状态显示
                statusElement.textContent = status.running ? '运行中' : '已停止';
                statusElement.className = 'value status-indicator ' + (status.running ? 'running' : 'stopped');
                
                addressElement.textContent = status.address;
                
                if (status.running) {
                    startTimeElement.textContent = new Date(status.start_time).toLocaleString();
                    connectionCountElement.textContent = status.connection_count;
                    
                    // 更新按钮状态
                    startProxyBtn.disabled = true;
                    stopProxyBtn.disabled = false;
                } else {
                    startTimeElement.textContent = '-';
                    connectionCountElement.textContent = '0';
                    
                    // 更新按钮状态
                    startProxyBtn.disabled = false;
                    stopProxyBtn.disabled = true;
                }
            }
        })
        .catch(error => {
            console.error('获取代理状态失败:', error);
        });
    }
    
    // 加载用户列表
    function loadUsers() {
        fetch('/api/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const userList = document.getElementById('user-list');
                userList.innerHTML = '';
                
                data.data.forEach(user => {
                    const row = document.createElement('tr');
                    
                    const usernameCell = document.createElement('td');
                    usernameCell.textContent = user.username;
                    
                    const passwordCell = document.createElement('td');
                    passwordCell.textContent = user.no_auth ? '无需认证' : '••••••••';
                    
                    const actionCell = document.createElement('td');
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '删除';
                    deleteBtn.className = 'btn-delete';
                    deleteBtn.addEventListener('click', function() {
                        deleteUser(user.username);
                    });
                    actionCell.appendChild(deleteBtn);
                    
                    row.appendChild(usernameCell);
                    row.appendChild(passwordCell);
                    row.appendChild(actionCell);
                    
                    userList.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('获取用户列表失败:', error);
        });
    }
    
    // 删除用户
    function deleteUser(username) {
        if (confirm(`确定要删除用户 "${username}" 吗？`)) {
            fetch(`/api/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadUsers();
                } else {
                    alert('删除用户失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('删除用户请求失败:', error);
                alert('删除用户请求失败，请稍后重试');
            });
        }
    }
    
    // 加载设置
    function loadSettings() {
        fetch('/api/settings', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const settings = data.data;
                
                document.getElementById('proxy-port').value = settings.proxy_port;
                document.getElementById('web-port').value = settings.web_port;
                document.getElementById('admin-username').value = settings.admin_username;
                document.getElementById('use-forward-proxy').checked = settings.use_forward_proxy || false;
                document.getElementById('allow-anonymous').checked = settings.allow_anonymous || false;
                
                // 设置远程代理信息
                if (settings.remote_proxy_addr) {
                    document.getElementById('remote-proxy-addr').value = settings.remote_proxy_addr;
                }
                if (settings.remote_proxy_user) {
                    document.getElementById('remote-proxy-user').value = settings.remote_proxy_user;
                }
                
                // 显示/隐藏远程代理设置区域
                const remoteProxySettings = document.getElementById('remote-proxy-settings');
                remoteProxySettings.style.display = settings.use_forward_proxy ? 'block' : 'none';
            }
        })
        .catch(error => {
            console.error('获取设置失败:', error);
        });
    }
    
    // 加载统计信息
    function loadStats() {
        fetch('/api/stats', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.data;
                
                // 更新总请求数
                document.getElementById('total-requests').textContent = stats.total_requests;
                
                // 更新域名统计
                const domainStatsElement = document.getElementById('domain-stats');
                domainStatsElement.innerHTML = '';
                
                if (stats.domain_stats.length === 0) {
                    const row = document.createElement('tr');
                    const cell = document.createElement('td');
                    cell.colSpan = 3;
                    cell.textContent = '暂无数据';
                    cell.style.textAlign = 'center';
                    row.appendChild(cell);
                    domainStatsElement.appendChild(row);
                } else {
                    stats.domain_stats.forEach(domain => {
                        const row = document.createElement('tr');
                        
                        const domainCell = document.createElement('td');
                        domainCell.textContent = domain.domain;
                        
                        const countCell = document.createElement('td');
                        countCell.textContent = domain.count;
                        
                        const lastVisitCell = document.createElement('td');
                        lastVisitCell.textContent = new Date(domain.last_visit).toLocaleString();
                        
                        row.appendChild(domainCell);
                        row.appendChild(countCell);
                        row.appendChild(lastVisitCell);
                        
                        domainStatsElement.appendChild(row);
                    });
                }
            }
        })
        .catch(error => {
            console.error('获取统计信息失败:', error);
        });
    }
    
    // 加载代理端口列表
    function loadProxyPorts() {
        fetch('/api/proxy/ports', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const portsList = document.getElementById('ports-list');
                portsList.innerHTML = '';
                
                data.data.forEach(port => {
                    const row = document.createElement('tr');
                    
                    const addrCell = document.createElement('td');
                    addrCell.textContent = port.listen_addr;

                    const statusCell = document.createElement('td');
                    const statusIndicator = document.createElement('span');
                    statusIndicator.className = 'status-indicator ' + (port.running ? 'running' : 'stopped');
                    statusIndicator.textContent = port.running ? '运行中' : '已停止';
                    statusCell.appendChild(statusIndicator);

                    const connCell = document.createElement('td');
                    connCell.textContent = port.connection_count || 0;

                    const actionCell = document.createElement('td');

                    // 启动/停止按钮
                    const toggleBtn = document.createElement('button');
                    toggleBtn.className = 'btn-action ' + (port.running ? 'btn-stop' : 'btn-start');
                    toggleBtn.textContent = port.running ? '停止' : '启动';
                    toggleBtn.addEventListener('click', function() {
                        if (port.running) {
                            stopProxyPort(port.id);
                        } else {
                            startProxyPort(port.id);
                        }
                    });

                    // 编辑按钮
                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-edit';
                    editBtn.textContent = '编辑';
                    editBtn.addEventListener('click', function() {
                        // 确保传递running状态
                        port.running = port.running;
                        editProxyPort(port);
                    });

                    // 删除按钮
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-delete';
                    deleteBtn.textContent = '删除';
                    deleteBtn.addEventListener('click', function() {
                        deleteProxyPort(port.id);
                    });

                    actionCell.appendChild(toggleBtn);
                    actionCell.appendChild(editBtn);
                    actionCell.appendChild(deleteBtn);

                    row.appendChild(addrCell);
                    row.appendChild(statusCell);
                    row.appendChild(connCell);
                    row.appendChild(actionCell);

                    portsList.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('获取代理端口列表失败:', error);
        });
    }

    // 启动代理端口
    function startProxyPort(id) {
        fetch(`/api/proxy/ports/${id}/start`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadProxyPorts();
            } else {
                alert('启动代理端口失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('启动代理端口请求失败:', error);
            alert('启动代理端口请求失败，请稍后重试');
        });
    }

    // 停止代理端口
    function stopProxyPort(id) {
        fetch(`/api/proxy/ports/${id}/stop`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadProxyPorts();
            } else {
                alert('停止代理端口失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('停止代理端口请求失败:', error);
            alert('停止代理端口请求失败，请稍后重试');
        });
    }

    // 编辑代理端口
    function editProxyPort(port) {
        // 创建编辑对话框
        const dialogHTML = `
            <div class="modal-overlay port-detail-modal" id="edit-port-modal">
                <div class="modal-content">
                    <h3>管理代理端口 - ${port.listen_addr}</h3>
                    
                    <div class="port-detail-tabs">
                        <div class="port-detail-tab active" data-tab="basic">基本设置</div>
                        <div class="port-detail-tab" data-tab="users">用户管理</div>
                        <div class="port-detail-tab" data-tab="forward">代理转发</div>
                    </div>
                    
                    <div class="port-detail-panel active" id="basic-panel">
                        <div class="port-info">
                            <div class="port-info-item">
                                <div class="port-info-label">端口ID:</div>
                                <div class="port-info-value">${port.id}</div>
                            </div>
                            <div class="port-info-item">
                                <div class="port-info-label">连接数:</div>
                                <div class="port-info-value">${port.status ? port.status.connection_count : 0}</div>
                            </div>
                        </div>
                        
                        <form id="edit-port-basic-form" onsubmit="return false;">
                            <input type="hidden" id="port-id" value="${port.id}">
                            <div class="form-group">
                                <label for="edit-port-addr">监听地址 (格式: IP:端口)</label>
                                <input type="text" id="edit-port-addr" name="listen_addr" value="${port.listen_addr}" required ${port.running ? 'disabled' : ''}>
                                ${port.running ? '<p class="form-hint">代理服务运行中，无法修改监听地址。请先停止代理服务。</p>' : ''}
                            </div>
                            <div class="form-group checkbox-group">
                                <input type="checkbox" id="edit-port-enabled" name="enabled" ${port.enabled ? 'checked' : ''}>
                                <label for="edit-port-enabled">启用</label>
                            </div>
                            <div class="form-group checkbox-group">
                                <input type="checkbox" id="edit-port-anonymous" name="allow_anonymous" ${port.allow_anonymous ? 'checked' : ''}>
                                <label for="edit-port-anonymous">允许匿名访问 (不需要账号密码)</label>
                            </div>
                            <button type="button" id="save-port-basic" class="btn-save">保存基本设置</button>
                        </form>
                    </div>
                    
                    <div class="port-detail-panel" id="users-panel">
                        <h4>端口专用用户</h4>
                        <p>您可以为此端口添加专用的用户账号，这些账号只能通过此端口访问代理服务。</p>
                        
                        <table class="port-users-table">
                            <thead>
                                <tr>
                                    <th>用户名</th>
                                    <th>密码</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="port-users-list">
                                <!-- 用户列表将通过JavaScript动态生成 -->
                            </tbody>
                        </table>
                        
                        <form id="add-port-user-form" onsubmit="return false;">
                            <input type="hidden" id="port-id" value="${port.id}">
                            <h4>添加专用用户</h4>
                            <div class="form-group">
                                <label for="port-new-username">用户名</label>
                                <input type="text" id="port-new-username" name="username" required>
                            </div>
                            <div class="form-group">
                                <label for="port-new-password">密码</label>
                                <input type="password" id="port-new-password" name="password" required>
                            </div>
                            <div class="form-group checkbox-group">
                                <input type="checkbox" id="port-no-auth-user" name="no_auth">
                                <label for="port-no-auth-user">无需认证的用户（不需要账号密码）</label>
                            </div>
                            <button type="button" id="add-port-user-btn" class="btn-add">添加用户</button>
                        </form>
                    </div>
                    
                    <div class="port-detail-panel" id="forward-panel">
                        <h4>代理转发设置</h4>
                        <p>您可以将此端口的请求转发到另一个代理服务器。${port.running ? '<strong>注意：修改设置后，代理服务将自动重启以应用新设置。</strong>' : ''}</p>
                        
                        <form id="edit-port-forward-form" onsubmit="return false;">
                            <input type="hidden" id="port-id-forward" value="${port.id}">
                            <div class="form-group checkbox-group">
                                <input type="checkbox" id="port-use-forward-proxy" name="use_forward_proxy">
                                <label for="port-use-forward-proxy">启用代理转发</label>
                            </div>
                            <div id="port-forward-settings" class="disabled">
                                <div class="form-group">
                                    <label for="port-remote-proxy-addr">远程代理地址 (格式: IP:端口)</label>
                                    <input type="text" id="port-remote-proxy-addr" name="remote_proxy_addr" placeholder="例如: 160.20.18.17:3989">
                                </div>
                                <div class="form-group">
                                    <label for="port-remote-proxy-user">远程代理用户名</label>
                                    <input type="text" id="port-remote-proxy-user" name="remote_proxy_user" placeholder="例如: admin">
                                </div>
                                <div class="form-group">
                                    <label for="port-remote-proxy-pass">远程代理密码</label>
                                    <input type="password" id="port-remote-proxy-pass" name="remote_proxy_pass" placeholder="输入远程代理密码">
                                </div>
                            </div>
                            <button type="button" id="save-port-forward" class="btn-save">保存转发设置</button>
                        </form>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-cancel" id="close-port-modal">关闭</button>
                    </div>
                </div>
            </div>
        `;

        // 添加对话框到DOM
        document.body.insertAdjacentHTML('beforeend', dialogHTML);

        // 监听代理转发复选框变化
        document.getElementById('port-use-forward-proxy').addEventListener('change', function() {
            const forwardSettings = document.getElementById('port-forward-settings');
            if (this.checked) {
                forwardSettings.classList.remove('disabled');
            } else {
                forwardSettings.classList.add('disabled');
            }
        });

        // 处理关闭按钮
        document.getElementById('close-port-modal').addEventListener('click', function() {
            const modal = document.getElementById('edit-port-modal');
            modal.remove();
        });

        // 处理标签切换
        const tabs = document.querySelectorAll('.port-detail-tab');
        const panels = document.querySelectorAll('.port-detail-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');

                // 更新活动标签
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // 显示对应面板
                panels.forEach(panel => {
                    if (panel.id === tabId + '-panel') {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });

                // 如果切换到代理转发选项卡，加载转发设置
                if (tabId === 'forward') {
                    loadPortForwardSettings(port.id);
                }
            });
        });

        // 处理添加用户按钮点击
        document.getElementById('add-port-user-btn').addEventListener('click', function() {
            const portId = port.id;
            const username = document.getElementById('port-new-username').value;
            const password = document.getElementById('port-new-password').value;
            const noAuth = document.getElementById('port-no-auth-user').checked;

            // 如果选择了"无需认证"但未填写用户名，则提示错误
            if (noAuth && !username.trim()) {
                alert('即使是无需认证的用户，也需要设置一个用户名作为标识');
                return;
            }

            // 如果未选择"无需认证"，但未填写密码，则提示错误
            if (!noAuth && !password.trim()) {
                alert('请输入用户密码');
                return;
            }

            fetch(`/api/proxy/ports/${portId}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    username: username,
                    password: noAuth ? "" : password,
                    no_auth: noAuth
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 清空表单
                    document.getElementById('port-new-username').value = '';
                    document.getElementById('port-new-password').value = '';
                    document.getElementById('port-no-auth-user').checked = false;

                    // 刷新用户列表
                    loadPortUsers(portId);
                    alert('用户已添加');
                } else {
                    alert('添加用户失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('添加用户请求失败:', error);
                alert('添加用户请求失败，请稍后重试');
            });
        });

        // 处理保存基本设置按钮点击
        document.getElementById('save-port-basic').addEventListener('click', function() {
            const portId = document.getElementById('port-id').value;
            const listenAddr = document.getElementById('edit-port-addr').value;
            const enabled = document.getElementById('edit-port-enabled').checked;
            const allowAnonymous = document.getElementById('edit-port-anonymous').checked;

            // 验证监听地址
            if (!listenAddr.trim()) {
                alert('监听地址不能为空');
                return;
            }

            fetch(`/api/proxy/ports/${portId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    listen_addr: listenAddr,
                    enabled: enabled,
                    allow_anonymous: allowAnonymous
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('基本设置已保存');
                    // 刷新端口列表
                    loadProxyPorts();
                } else {
                    alert('更新代理端口失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('更新代理端口请求失败:', error);
                alert('更新代理端口请求失败，请稍后重试');
            });
        });

        // 处理保存转发设置按钮点击
        document.getElementById('save-port-forward').addEventListener('click', function() {
            const portId = document.getElementById('port-id-forward').value;
            const useForwardProxy = document.getElementById('port-use-forward-proxy').checked;
            const remoteProxyAddr = document.getElementById('port-remote-proxy-addr').value;
            const remoteProxyUser = document.getElementById('port-remote-proxy-user').value;
            const remoteProxyPass = document.getElementById('port-remote-proxy-pass').value;

            console.log("保存转发设置:", {
                portId,
                useForwardProxy,
                remoteProxyAddr,
                remoteProxyUser,
                remoteProxyPass: remoteProxyPass ? "已设置" : "未设置"
            });

            // 如果启用转发代理但未填写代理地址，显示提示
            if (useForwardProxy && !remoteProxyAddr) {
                alert('启用代理转发时，远程代理地址不能为空');
                return;
            }

            fetch(`/api/proxy/ports/${portId}/forward`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    use_forward_proxy: useForwardProxy,
                    remote_proxy_addr: remoteProxyAddr,
                    remote_proxy_user: remoteProxyUser,
                    remote_proxy_pass: remoteProxyPass
                })
            })
            .then(response => {
                console.log("响应状态:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("响应数据:", data);
                if (data.success) {
                    if (data.data && data.data.restarted) {
                        alert('代理转发设置已保存，代理服务已重启以应用新设置');
                    } else {
                        alert('代理转发设置已保存');
                    }
                    // 刷新端口列表以显示最新状态
                    loadProxyPorts();
                } else {
                    alert('更新代理转发设置失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('更新代理转发设置请求失败:', error);
                alert('更新代理转发设置请求失败，请稍后重试');
            });
        });
        
        // 监听无需认证复选框变化
        document.getElementById('port-no-auth-user').addEventListener('change', function() {
            const passwordInput = document.getElementById('port-new-password');
            if (this.checked) {
                passwordInput.disabled = true;
                passwordInput.required = false;
                passwordInput.value = '';
            } else {
                passwordInput.disabled = false;
                passwordInput.required = true;
            }
        });
        
        // 加载端口专用用户
        loadPortUsers(port.id);
        
        // 加载端口代理转发设置
        loadPortForwardSettings(port.id);
    }
    
    // 加载端口代理转发设置
    function loadPortForwardSettings(portId) {
        fetch(`/api/proxy/ports/${portId}/forward`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const settings = data.data;
                
                // 更新表单字段
                document.getElementById('port-use-forward-proxy').checked = settings.use_forward_proxy;
                
                if (settings.remote_proxy_addr) {
                    document.getElementById('port-remote-proxy-addr').value = settings.remote_proxy_addr;
                }
                
                if (settings.remote_proxy_user) {
                    document.getElementById('port-remote-proxy-user').value = settings.remote_proxy_user;
                }
                
                // 更新转发设置区域的显示状态
                const forwardSettings = document.getElementById('port-forward-settings');
                if (settings.use_forward_proxy) {
                    forwardSettings.classList.remove('disabled');
                } else {
                    forwardSettings.classList.add('disabled');
                }
            }
        })
        .catch(error => {
            console.error('获取端口代理转发设置失败:', error);
        });
    }
    
    // 加载端口专用用户
    function loadPortUsers(portId) {
        fetch(`/api/proxy/ports/${portId}/users`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const usersList = document.getElementById('port-users-list');
                usersList.innerHTML = '';
                
                if (data.data.length === 0) {
                    const row = document.createElement('tr');
                    const cell = document.createElement('td');
                    cell.colSpan = 3;
                    cell.style.textAlign = 'center';
                    cell.textContent = '暂无专用用户';
                    row.appendChild(cell);
                    usersList.appendChild(row);
                } else {
                    data.data.forEach(user => {
                        const row = document.createElement('tr');
                        
                        const usernameCell = document.createElement('td');
                        usernameCell.textContent = user.username;
                        
                        const passwordCell = document.createElement('td');
                        passwordCell.textContent = user.no_auth ? '无需密码' : '******';
                        
                        const actionCell = document.createElement('td');
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = '删除';
                        deleteBtn.className = 'btn-delete';
                        deleteBtn.addEventListener('click', function() {
                            deletePortUser(portId, user.username);
                        });
                        actionCell.appendChild(deleteBtn);
                        
                        row.appendChild(usernameCell);
                        row.appendChild(passwordCell);
                        row.appendChild(actionCell);
                        
                        usersList.appendChild(row);
                    });
                }
            }
        })
        .catch(error => {
            console.error('获取端口用户列表失败:', error);
        });
    }
    
    // 删除端口专用用户
    function deletePortUser(portId, username) {
        if (confirm(`确定要删除用户 "${username}" 吗？`)) {
            fetch(`/api/proxy/ports/${portId}/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadPortUsers(portId);
                    alert('用户已删除');
                } else {
                    alert('删除用户失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('删除用户请求失败:', error);
                alert('删除用户请求失败，请稍后重试');
            });
        }
    }
    
    // 删除代理端口
    function deleteProxyPort(id) {
        if (confirm('确定要删除此代理端口吗？')) {
            fetch(`/api/proxy/ports/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadProxyPorts();
                } else {
                    alert('删除代理端口失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('删除代理端口请求失败:', error);
                alert('删除代理端口请求失败，请稍后重试');
            });
        }
    }
});