## cytlsxhr


### 介绍
- 测试网站是否检测tls，该项目tls已经 经过各种测试应该是完美的134版本tls

### 功能
- 使用浏览器转发让tls完美
- header可以自定义顺序
- 返回和请求不会有任何限制
- 保持统一会话
- 可以切换代理支持账号密码


### 准备环境
- 1.双击Chrome-bin/mini_installer.exe 
- 2.把新安装的chrome.exe的路径复制到chrome.txt


### 启动
- 1.双击 proxy.exe
- 2.双击 server-debug.exe


### 获取token和client
- 1.浏览器打开http://127.0.0.1:15090/getinfo 登入admin/admin
- 2.复制浏览器状态中浏览器列表 里面的ID 例子:be22165f-e3c3-4570-94f1-017ea57ae459
- 3.粘贴到 text.py 中的client_id key的value里面
- 4.复制浏览器创建令牌中的创建令牌 里面的token 例子:d7bed4fd-9852-430f-9d2a-695d2641bf80
- 5.粘贴到 text.py 中的token key的value里面
- 6.运行 text.py