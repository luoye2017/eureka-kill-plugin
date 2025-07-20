// Popup script for Eureka Instance Killer

document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // 检查当前标签页是否是Eureka页面
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const url = currentTab.url;
        
        if (url && (url.includes('127.0.0.1:8761') || url.includes('localhost:8761'))) {
            statusElement.className = 'status active';
            statusText.textContent = '✅ 插件已在Eureka页面激活';
        } else {
            statusElement.className = 'status inactive';
            statusText.textContent = '❌ 请访问Eureka管理页面';
        }
    });
    
    // 刷新按钮点击事件
    refreshBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload(tabs[0].id);
            window.close();
        });
    });
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'r' || e.key === 'R') {
            refreshBtn.click();
        }
        if (e.key === 'Escape') {
            window.close();
        }
    });
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStatus') {
        const statusElement = document.getElementById('status');
        const statusText = document.getElementById('status-text');
        
        if (request.status === 'success') {
            statusElement.className = 'status active';
            statusText.textContent = '✅ ' + request.message;
        } else {
            statusElement.className = 'status inactive';
            statusText.textContent = '❌ ' + request.message;
        }
    }
});